'use client';

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  Timestamp,
  getDocs,
  getDoc,
  limit,
  writeBatch,
  increment,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  tailorId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  garmentType: string;
  designDetails: string;
  status: OrderStatus;
  amount: number;
  measurements?: Record<string, number>;
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt: Timestamp | null;
  deliveryDate: Timestamp | null;
}

export interface Conversation {
  id: string;
  participants: string[];
  tailorId: string;
  customerId: string;
  tailorName: string;
  customerName: string;
  lastMessage: string;
  lastMessageAt: Timestamp;
  unreadCount: Record<string, number>;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Timestamp;
  read: boolean;
}

export interface CustomerSummary {
  customerId: string;
  customerName: string;
  customerEmail: string;
  photoURL?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: Timestamp;
  orders: Order[];
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export function subscribeToOrders(
  tailorId: string,
  callback: (orders: Order[]) => void
) {
  const q = query(
    collection(db, 'orders'),
    where('tailorId', '==', tailorId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Order[];
    callback(orders);
  });
}

export async function createOrder(orderData: {
  tailorId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  garmentType: string;
  designDetails: string;
  amount: number;
  notes: string;
  deliveryDate?: Date;
}) {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...orderData,
    status: 'pending' as OrderStatus,
    measurements: {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null,
    deliveryDate: orderData.deliveryDate
      ? Timestamp.fromDate(orderData.deliveryDate)
      : null,
  });
  return docRef.id;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  const orderRef = doc(db, 'orders', orderId);
  const updateData: Record<string, any> = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (status === 'completed' || status === 'delivered') {
    updateData.completedAt = serverTimestamp();
  }
  await updateDoc(orderRef, updateData);
}

// ─── Conversations ───────────────────────────────────────────────────────────

export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
) {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations: Conversation[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Conversation[];
    callback(conversations);
  });
}

export async function createConversation(
  tailorId: string,
  customerId: string,
  tailorName: string,
  customerName: string
): Promise<string> {
  // Check if conversation already exists
  const q = query(
    collection(db, 'conversations'),
    where('tailorId', '==', tailorId),
    where('customerId', '==', customerId)
  );
  const existing = await getDocs(q);
  if (!existing.empty) {
    return existing.docs[0].id;
  }

  const docRef = await addDoc(collection(db, 'conversations'), {
    participants: [tailorId, customerId],
    tailorId,
    customerId,
    tailorName,
    customerName,
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    unreadCount: { [tailorId]: 0, [customerId]: 0 },
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ─── Messages ────────────────────────────────────────────────────────────────

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
) {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    callback(messages);
  });
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string,
  recipientId: string
) {
  const batch = writeBatch(db);

  // Add message to subcollection
  const messageRef = doc(
    collection(db, 'conversations', conversationId, 'messages')
  );
  batch.set(messageRef, {
    senderId,
    senderName,
    text,
    createdAt: serverTimestamp(),
    read: false,
  });

  // Update conversation metadata
  const convRef = doc(db, 'conversations', conversationId);
  batch.update(convRef, {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    [`unreadCount.${recipientId}`]: increment(1),
  });

  await batch.commit();
}

export async function markMessagesAsRead(
  conversationId: string,
  userId: string
) {
  const convRef = doc(db, 'conversations', conversationId);
  await updateDoc(convRef, {
    [`unreadCount.${userId}`]: 0,
  });
}

// ─── Customers (derived from orders) ─────────────────────────────────────────

export async function getCustomersForTailor(
  tailorId: string
): Promise<CustomerSummary[]> {
  const q = query(
    collection(db, 'orders'),
    where('tailorId', '==', tailorId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  const orders: Order[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[];

  // Group by customerId
  const customerMap = new Map<string, CustomerSummary>();
  for (const order of orders) {
    const existing = customerMap.get(order.customerId);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += order.amount || 0;
      existing.orders.push(order);
      if (
        order.createdAt &&
        (!existing.lastOrderDate ||
          order.createdAt.toMillis() > existing.lastOrderDate.toMillis())
      ) {
        existing.lastOrderDate = order.createdAt;
      }
    } else {
      customerMap.set(order.customerId, {
        customerId: order.customerId,
        customerName: order.customerName || 'Unknown',
        customerEmail: order.customerEmail || '',
        totalOrders: 1,
        totalSpent: order.amount || 0,
        lastOrderDate: order.createdAt,
        orders: [order],
      });
    }
  }

  // Fetch profile photos
  for (const [uid, summary] of customerMap) {
    try {
      const customerDoc = await getDoc(doc(db, 'customers', uid));
      if (customerDoc.exists()) {
        summary.photoURL = customerDoc.data().photoURL;
      }
    } catch {
      // ignore
    }
  }

  return Array.from(customerMap.values());
}

// ─── Tailor Profiles ─────────────────────────────────────────────────────────

export interface TailorProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  shopName: string;
  location: string;
  specialties: string[];
  rating: number;
  bio: string;
  phoneNumber?: string;
}

export async function getAllTailors(excludeUid?: string): Promise<TailorProfile[]> {
  const q = query(collection(db, 'tailors'), where('role', '==', 'tailor'));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => ({ uid: d.id, ...d.data() }) as TailorProfile)
    .filter((t) => t.uid !== excludeUid);
}

// ─── Customer Orders ─────────────────────────────────────────────────────────

export function subscribeToCustomerOrders(
  customerId: string,
  callback: (orders: Order[]) => void
) {
  const q = query(
    collection(db, 'orders'),
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Order[];
    callback(orders);
  });
}

// ─── Reviews & Ratings ───────────────────────────────────────────────────────

export interface Review {
  id: string;
  tailorId: string;
  customerId: string;
  customerName: string;
  customerPhotoURL?: string;
  rating: number;
  text: string;
  thumbsUp: number;
  thumbsUpBy: string[]; // UIDs who thumbed up
  createdAt: Timestamp;
}

export function subscribeToReviews(
  tailorId: string,
  callback: (reviews: Review[]) => void
) {
  const q = query(
    collection(db, 'reviews'),
    where('tailorId', '==', tailorId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const reviews: Review[] = snapshot.docs.map((d) => ({
      id: d.id,
      thumbsUp: 0,
      thumbsUpBy: [],
      ...d.data(),
    })) as Review[];
    callback(reviews);
  });
}

export async function addReview(reviewData: {
  tailorId: string;
  customerId: string;
  customerName: string;
  customerPhotoURL?: string;
  rating: number;
  text: string;
}) {
  // Add the review
  await addDoc(collection(db, 'reviews'), {
    ...reviewData,
    thumbsUp: 0,
    thumbsUpBy: [],
    createdAt: serverTimestamp(),
  });

  // Update tailor's aggregate rating
  const reviewsQuery = query(
    collection(db, 'reviews'),
    where('tailorId', '==', reviewData.tailorId)
  );
  const snapshot = await getDocs(reviewsQuery);
  const ratings = snapshot.docs.map((d) => d.data().rating as number);
  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

  const tailorRef = doc(db, 'tailors', reviewData.tailorId);
  await updateDoc(tailorRef, { rating: Math.round(avgRating * 10) / 10 });
}

export async function toggleThumbsUp(reviewId: string, userId: string) {
  const reviewRef = doc(db, 'reviews', reviewId);
  const reviewSnap = await getDoc(reviewRef);
  if (!reviewSnap.exists()) return;

  const data = reviewSnap.data();
  const thumbsUpBy: string[] = data.thumbsUpBy || [];

  if (thumbsUpBy.includes(userId)) {
    // Remove thumbs up
    await updateDoc(reviewRef, {
      thumbsUp: increment(-1),
      thumbsUpBy: thumbsUpBy.filter((uid) => uid !== userId),
    });
  } else {
    // Add thumbs up
    await updateDoc(reviewRef, {
      thumbsUp: increment(1),
      thumbsUpBy: [...thumbsUpBy, userId],
    });
  }
}
