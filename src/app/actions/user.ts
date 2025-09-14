'use server';

import { doc, setDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import type { User } from 'firebase/auth';

const db = getFirestore(app);

type UserRole = 'customer' | 'tailor';

/**
 * Creates a user profile document in Firestore.
 * @param user The Firebase Auth user object.
 * @param role The role of the user ('customer' or 'tailor').
 */
export async function createUserProfile(user: User, role: UserRole) {
  if (!user) {
    throw new Error('User object is required.');
  }
  if (!role) {
    throw new Error('User role is required.');
  }

  const collectionName = role === 'customer' ? 'customers' : 'tailors';
  const userRef = doc(db, collectionName, user.uid);

  try {
    // Use setDoc with merge: true to create or update without overwriting
    // if the document already exists from a different sign-in method.
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      createdAt: serverTimestamp(),
      role: role,
    }, { merge: true });

    console.log(`User profile created/updated for ${user.uid} in ${collectionName}`);
  } catch (error) {
    console.error('Error creating user profile:', error);
    // Depending on requirements, you might want to throw the error
    // to be handled by the calling function.
    throw new Error('Failed to create user profile.');
  }
}
