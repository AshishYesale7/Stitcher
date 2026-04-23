'use client';

import { useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, doc, setDoc, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle2, Database } from 'lucide-react';

const DEMO_TAILORS = [
  { uid: 'tailor_001', displayName: 'Rajesh Kumar', email: 'rajesh@fabrova.demo', photoURL: 'https://picsum.photos/seed/tailor1/200/200', shopName: 'Kumar Tailors', location: 'Mumbai, Maharashtra', specialties: ['Shirt', 'Suit', 'Sherwani'], rating: 4.8, bio: 'Expert in formal and traditional wear with 15 years of experience.', phoneNumber: '+919876543001' },
  { uid: 'tailor_002', displayName: 'Priya Sharma', email: 'priya@fabrova.demo', photoURL: 'https://picsum.photos/seed/tailor2/200/200', shopName: 'Priya Fashion Studio', location: 'Delhi, NCR', specialties: ['Saree', 'Blouse', 'Kurta', 'Dress'], rating: 4.9, bio: 'Specializing in bridal and designer ethnic wear.', phoneNumber: '+919876543002' },
  { uid: 'tailor_003', displayName: 'Mohammed Irfan', email: 'irfan@fabrova.demo', photoURL: 'https://picsum.photos/seed/tailor3/200/200', shopName: 'Irfan Stitching Centre', location: 'Hyderabad, Telangana', specialties: ['Kurta', 'Sherwani', 'Pants'], rating: 4.5, bio: 'Traditional Muslim wear specialist with modern touches.', phoneNumber: '+919876543003' },
  { uid: 'tailor_004', displayName: 'Anita Desai', email: 'anita@fabrova.demo', photoURL: 'https://picsum.photos/seed/tailor4/200/200', shopName: 'Anita Couture', location: 'Bangalore, Karnataka', specialties: ['Dress', 'Blouse', 'Shirt'], rating: 4.7, bio: 'Contemporary western and Indo-western fusion designs.', phoneNumber: '+919876543004' },
  { uid: 'tailor_005', displayName: 'Vikram Singh', email: 'vikram@fabrova.demo', photoURL: 'https://picsum.photos/seed/tailor5/200/200', shopName: 'Singh Royal Tailors', location: 'Jaipur, Rajasthan', specialties: ['Sherwani', 'Suit', 'Kurta'], rating: 4.6, bio: 'Royal Rajasthani craftsmanship for weddings and occasions.', phoneNumber: '+919876543005' },
];

const DEMO_CUSTOMERS = [
  { uid: 'customer_001', displayName: 'Amit Patel', email: 'amit@fabrova.demo', photoURL: 'https://picsum.photos/seed/cust1/200/200', fullName: 'Amit Patel', address: '123 MG Road, Mumbai', phoneNumber: '+919876500001', onboardingCompleted: true, gender: 'male', age: 28, height: 175, weight: 72 },
  { uid: 'customer_002', displayName: 'Sneha Reddy', email: 'sneha@fabrova.demo', photoURL: 'https://picsum.photos/seed/cust2/200/200', fullName: 'Sneha Reddy', address: '45 Jubilee Hills, Hyderabad', phoneNumber: '+919876500002', onboardingCompleted: true, gender: 'female', age: 25, height: 162, weight: 55 },
  { uid: 'customer_003', displayName: 'Rahul Gupta', email: 'rahul@fabrova.demo', photoURL: 'https://picsum.photos/seed/cust3/200/200', fullName: 'Rahul Gupta', address: '78 Connaught Place, Delhi', phoneNumber: '+919876500003', onboardingCompleted: true, gender: 'male', age: 35, height: 180, weight: 80 },
];

function daysAgo(days: number) {
  return Timestamp.fromDate(new Date(Date.now() - days * 86400000));
}

const DEMO_ORDERS = [
  { tailorId: 'tailor_001', customerId: 'customer_001', customerName: 'Amit Patel', customerEmail: 'amit@fabrova.demo', garmentType: 'Shirt', designDetails: 'Slim fit cotton shirt, blue checks', status: 'completed', amount: 1200, notes: 'Need by next week', createdAt: daysAgo(45), completedAt: daysAgo(38) },
  { tailorId: 'tailor_001', customerId: 'customer_001', customerName: 'Amit Patel', customerEmail: 'amit@fabrova.demo', garmentType: 'Suit', designDetails: 'Navy blue 3-piece suit for wedding', status: 'in_progress', amount: 8500, notes: 'Wedding on 15th', createdAt: daysAgo(10), completedAt: null },
  { tailorId: 'tailor_001', customerId: 'customer_003', customerName: 'Rahul Gupta', customerEmail: 'rahul@fabrova.demo', garmentType: 'Shirt', designDetails: 'White formal shirt, French cuffs', status: 'delivered', amount: 1500, notes: '', createdAt: daysAgo(60), completedAt: daysAgo(50) },
  { tailorId: 'tailor_002', customerId: 'customer_002', customerName: 'Sneha Reddy', customerEmail: 'sneha@fabrova.demo', garmentType: 'Saree', designDetails: 'Banarasi silk saree blouse, gold border', status: 'completed', amount: 3500, notes: 'Match the saree color', createdAt: daysAgo(30), completedAt: daysAgo(22) },
  { tailorId: 'tailor_002', customerId: 'customer_002', customerName: 'Sneha Reddy', customerEmail: 'sneha@fabrova.demo', garmentType: 'Blouse', designDetails: 'Designer blouse with mirror work', status: 'pending', amount: 2200, notes: '', createdAt: daysAgo(2), completedAt: null },
  { tailorId: 'tailor_002', customerId: 'customer_001', customerName: 'Amit Patel', customerEmail: 'amit@fabrova.demo', garmentType: 'Kurta', designDetails: 'Festive kurta with chikankari work', status: 'accepted', amount: 2800, notes: 'Diwali gift', createdAt: daysAgo(5), completedAt: null },
  { tailorId: 'tailor_003', customerId: 'customer_003', customerName: 'Rahul Gupta', customerEmail: 'rahul@fabrova.demo', garmentType: 'Sherwani', designDetails: 'Cream sherwani with gold embroidery', status: 'completed', amount: 12000, notes: 'For brothers wedding', createdAt: daysAgo(90), completedAt: daysAgo(75) },
  { tailorId: 'tailor_003', customerId: 'customer_001', customerName: 'Amit Patel', customerEmail: 'amit@fabrova.demo', garmentType: 'Kurta', designDetails: 'Simple cotton kurta, white', status: 'delivered', amount: 800, notes: '', createdAt: daysAgo(120), completedAt: daysAgo(110) },
  { tailorId: 'tailor_004', customerId: 'customer_002', customerName: 'Sneha Reddy', customerEmail: 'sneha@fabrova.demo', garmentType: 'Dress', designDetails: 'Cocktail dress, emerald green', status: 'completed', amount: 4500, notes: 'Office party', createdAt: daysAgo(20), completedAt: daysAgo(14) },
  { tailorId: 'tailor_005', customerId: 'customer_003', customerName: 'Rahul Gupta', customerEmail: 'rahul@fabrova.demo', garmentType: 'Suit', designDetails: 'Black tuxedo for New Year party', status: 'pending', amount: 9500, notes: '', createdAt: daysAgo(1), completedAt: null },
];

const DEMO_CONVERSATIONS = [
  { tailorId: 'tailor_001', customerId: 'customer_001', tailorName: 'Rajesh Kumar', customerName: 'Amit Patel',
    messages: [
      { senderId: 'customer_001', senderName: 'Amit Patel', text: 'Hi Rajesh, how is my suit coming along?' },
      { senderId: 'tailor_001', senderName: 'Rajesh Kumar', text: 'Hello Amit! The fabric has been cut and we are starting stitching today.' },
      { senderId: 'customer_001', senderName: 'Amit Patel', text: 'Great! Will it be ready by the 12th?' },
      { senderId: 'tailor_001', senderName: 'Rajesh Kumar', text: 'Yes absolutely. I will send you photos of the progress tomorrow.' },
      { senderId: 'customer_001', senderName: 'Amit Patel', text: 'Perfect, thank you!' },
    ]},
  { tailorId: 'tailor_002', customerId: 'customer_002', tailorName: 'Priya Sharma', customerName: 'Sneha Reddy',
    messages: [
      { senderId: 'customer_002', senderName: 'Sneha Reddy', text: 'Hi Priya, I loved the blouse you made last time!' },
      { senderId: 'tailor_002', senderName: 'Priya Sharma', text: 'Thank you so much Sneha! Would you like to order another one?' },
      { senderId: 'customer_002', senderName: 'Sneha Reddy', text: 'Yes! I need a designer blouse with mirror work. Can you do that?' },
      { senderId: 'tailor_002', senderName: 'Priya Sharma', text: 'Of course! Send me the saree photo and I will design something beautiful.' },
    ]},
  { tailorId: 'tailor_003', customerId: 'customer_003', tailorName: 'Mohammed Irfan', customerName: 'Rahul Gupta',
    messages: [
      { senderId: 'customer_003', senderName: 'Rahul Gupta', text: 'Irfan bhai, the sherwani was amazing. Everyone loved it!' },
      { senderId: 'tailor_003', senderName: 'Mohammed Irfan', text: 'Shukriya Rahul! It was a pleasure making it for you.' },
    ]},
];

export default function SeedPage() {
  const [status, setStatus] = useState<'idle' | 'seeding' | 'done' | 'error'>('idle');
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  const seedData = async () => {
    setStatus('seeding');
    setLog([]);
    try {
      // 1. Seed tailors
      addLog('Creating demo tailors...');
      for (const t of DEMO_TAILORS) {
        await setDoc(doc(db, 'tailors', t.uid), { ...t, role: 'tailor', createdAt: serverTimestamp(), onboardingCompleted: true });
      }
      addLog(`✅ ${DEMO_TAILORS.length} tailors created`);

      // 2. Seed customers
      addLog('Creating demo customers...');
      for (const c of DEMO_CUSTOMERS) {
        await setDoc(doc(db, 'customers', c.uid), { ...c, role: 'customer', createdAt: serverTimestamp() });
      }
      addLog(`✅ ${DEMO_CUSTOMERS.length} customers created`);

      // 3. Also seed for current logged-in user
      const currentUser = auth.currentUser;
      if (currentUser) {
        addLog(`Linking demo data to your account (${currentUser.uid})...`);
        // Create orders for the current user as a tailor
        const extraOrders = [
          { tailorId: currentUser.uid, customerId: 'customer_001', customerName: 'Amit Patel', customerEmail: 'amit@fabrova.demo', garmentType: 'Shirt', designDetails: 'White linen shirt, casual fit', status: 'completed', amount: 1400, notes: 'Summer collection', createdAt: daysAgo(25), completedAt: daysAgo(18) },
          { tailorId: currentUser.uid, customerId: 'customer_002', customerName: 'Sneha Reddy', customerEmail: 'sneha@fabrova.demo', garmentType: 'Dress', designDetails: 'Evening gown, burgundy silk', status: 'in_progress', amount: 5500, notes: 'Anniversary dinner', createdAt: daysAgo(7), completedAt: null },
          { tailorId: currentUser.uid, customerId: 'customer_003', customerName: 'Rahul Gupta', customerEmail: 'rahul@fabrova.demo', garmentType: 'Pants', designDetails: 'Formal black trousers, slim fit', status: 'pending', amount: 1800, notes: '', createdAt: daysAgo(1), completedAt: null },
          { tailorId: currentUser.uid, customerId: 'customer_001', customerName: 'Amit Patel', customerEmail: 'amit@fabrova.demo', garmentType: 'Kurta', designDetails: 'Silk kurta, navy blue', status: 'delivered', amount: 2200, notes: '', createdAt: daysAgo(50), completedAt: daysAgo(42) },
          { tailorId: currentUser.uid, customerId: 'customer_002', customerName: 'Sneha Reddy', customerEmail: 'sneha@fabrova.demo', garmentType: 'Blouse', designDetails: 'Boat neck blouse, gold zari', status: 'completed', amount: 1800, notes: '', createdAt: daysAgo(35), completedAt: daysAgo(28) },
        ];
        for (const o of extraOrders) {
          await addDoc(collection(db, 'orders'), { ...o, updatedAt: serverTimestamp(), deliveryDate: null });
        }
        addLog(`✅ 5 orders linked to your account`);

        // Create a conversation for the current user
        const convRef = doc(collection(db, 'conversations'));
        await setDoc(convRef, {
          participants: [currentUser.uid, 'customer_001'],
          tailorId: currentUser.uid, customerId: 'customer_001',
          tailorName: currentUser.displayName || 'You', customerName: 'Amit Patel',
          lastMessage: 'Looking forward to the delivery!', lastMessageAt: serverTimestamp(),
          unreadCount: { [currentUser.uid]: 1, customer_001: 0 }, createdAt: serverTimestamp(),
        });
        const msgs = [
          { senderId: 'customer_001', senderName: 'Amit Patel', text: 'Hi! I placed an order for a white linen shirt.' },
          { senderId: currentUser.uid, senderName: currentUser.displayName || 'You', text: 'Got it! I will start working on it tomorrow.' },
          { senderId: 'customer_001', senderName: 'Amit Patel', text: 'Looking forward to the delivery!' },
        ];
        for (let i = 0; i < msgs.length; i++) {
          await addDoc(collection(db, 'conversations', convRef.id, 'messages'), {
            ...msgs[i], createdAt: Timestamp.fromDate(new Date(Date.now() - (msgs.length - i) * 3600000)), read: true,
          });
        }
        addLog(`✅ 1 conversation linked to your account`);
      }

      // 4. Seed demo orders
      addLog('Creating demo orders...');
      for (const o of DEMO_ORDERS) {
        await addDoc(collection(db, 'orders'), { ...o, updatedAt: serverTimestamp(), deliveryDate: null });
      }
      addLog(`✅ ${DEMO_ORDERS.length} orders created`);

      // 5. Seed demo conversations
      addLog('Creating demo conversations...');
      for (const conv of DEMO_CONVERSATIONS) {
        const convRef = doc(collection(db, 'conversations'));
        await setDoc(convRef, {
          participants: [conv.tailorId, conv.customerId],
          tailorId: conv.tailorId, customerId: conv.customerId,
          tailorName: conv.tailorName, customerName: conv.customerName,
          lastMessage: conv.messages[conv.messages.length - 1].text,
          lastMessageAt: serverTimestamp(),
          unreadCount: { [conv.tailorId]: 0, [conv.customerId]: 0 },
          createdAt: serverTimestamp(),
        });
        for (let i = 0; i < conv.messages.length; i++) {
          await addDoc(collection(db, 'conversations', convRef.id, 'messages'), {
            ...conv.messages[i],
            createdAt: Timestamp.fromDate(new Date(Date.now() - (conv.messages.length - i) * 3600000)),
            read: true,
          });
        }
      }
      addLog(`✅ ${DEMO_CONVERSATIONS.length} conversations with messages created`);

      setStatus('done');
      addLog('🎉 All demo data seeded successfully!');
    } catch (err: any) {
      console.error(err);
      addLog(`❌ Error: ${err.message}`);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg rounded-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Seed Demo Data</CardTitle>
          <CardDescription>Populate Firebase with demo tailors, customers, orders, and conversations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={seedData} disabled={status === 'seeding'} className="w-full rounded-full h-12 text-base" size="lg">
            {status === 'seeding' ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Seeding...</> :
             status === 'done' ? <><CheckCircle2 className="mr-2 h-5 w-5" /> Seed Again</> :
             <><Database className="mr-2 h-5 w-5" /> Seed Database</>}
          </Button>
          {log.length > 0 && (
            <div className="bg-muted rounded-xl p-4 max-h-64 overflow-y-auto space-y-1">
              {log.map((l, i) => <p key={i} className="text-sm font-mono">{l}</p>)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
