
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

/**
 * Updates a customer's profile with their onboarding data.
 * @param uid The user's UID.
 * @param data The onboarding data to save.
 */
export async function updateUserProfile(uid: string, data: any) {
    if (!uid) {
        throw new Error('User UID is required to update profile.');
    }

    // Construct address only if address fields are present
    const { house, street, city, state: st, zip, ...rest } = data;
    const profileData: Record<string, any> = { ...rest };
    
    if (house && street && city && st && zip) {
        profileData.address = `${house}, ${street}, ${city}, ${st} ${zip}`;
        profileData.house = house;
        profileData.street = street;
        profileData.city = city;
        profileData.state = st;
        profileData.zip = zip;
    }

    if (data.onboardingCompleted) {
        profileData.onboardingCompleted = true;
    }

    profileData.updatedAt = serverTimestamp();

    const userRef = doc(db, 'customers', uid);

    try {
        await setDoc(userRef, profileData, { merge: true });
        console.log(`Successfully updated profile for user ${uid}`);
    } catch(error) {
        console.error('Error updating user profile:', error);
        throw new Error('Failed to update user profile.');
    }
}

    