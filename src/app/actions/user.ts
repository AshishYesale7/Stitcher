'use server';

import { doc, setDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

const db = getFirestore(app);

type UserRole = 'customer' | 'tailor';

type UserProfilePayload = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
};

/**
 * Creates or updates a user profile document in Firestore.
 * @param userData The user's profile data.
 * @param role The role of the user ('customer' or 'tailor').
 */
export async function createUserProfile(userData: UserProfilePayload, role: UserRole) {
  if (!userData.uid) {
    throw new Error('User UID is required.');
  }
  if (!role) {
    throw new Error('User role is required.');
  }

  const collectionName = role === 'customer' ? 'customers' : 'tailors';
  const userRef = doc(db, collectionName, userData.uid);

  try {
    // Use setDoc with merge: true to create or update without overwriting
    // if the document already exists from a different sign-in method.
    await setDoc(userRef, {
      uid: userData.uid,
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL,
      phoneNumber: userData.phoneNumber,
      createdAt: serverTimestamp(),
      role: role,
    }, { merge: true });

    console.log(`User profile created/updated for ${userData.uid} in ${collectionName}`);
  } catch (error) {
    console.error('Error creating user profile:', error);
    // Depending on requirements, you might want to throw the error
    // to be handled by the calling function.
    throw new Error('Failed to create user profile.');
  }
}
