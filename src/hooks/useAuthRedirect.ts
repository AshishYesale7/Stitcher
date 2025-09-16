
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { auth, app } from '@/lib/firebase';

const db = getFirestore(app);

type UserRole = 'customer' | 'tailor';

interface UserProfile {
  role: UserRole;
  onboardingCompleted?: boolean;
}

async function getUserProfile(user: User): Promise<UserProfile | null> {
  const customerDocRef = doc(db, 'customers', user.uid);
  const customerDocSnap = await getDoc(customerDocRef);
  if (customerDocSnap.exists()) {
    return { role: 'customer', ...customerDocSnap.data() } as UserProfile;
  }

  const tailorDocRef = doc(db, 'tailors', user.uid);
  const tailorDocSnap = await getDoc(tailorDocRef);
  if (tailorDocSnap.exists()) {
    return { role: 'tailor', ...tailorDocSnap.data() } as UserProfile;
  }

  return null;
}

export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const isAuthPage = pathname.includes('/login') || pathname === '/';
    if (!isAuthPage) {
        setChecking(false);
        return;
    }

    // Immediately check if a user is already authenticated
    if (auth.currentUser) {
      handleRedirect(auth.currentUser);
      setChecking(false);
      return;
    }

    // If no user, set up the listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        handleRedirect(user);
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const handleRedirect = async (user: User) => {
    const userProfile = await getUserProfile(user);
    if (userProfile) {
        const targetDashboard = `/${userProfile.role}/dashboard`;
        if (pathname !== targetDashboard) {
            router.push(targetDashboard);
        }
    }
    // If no profile, user will stay on login/home to be handled by other logic
    // or to allow profile creation.
  };

  return checking;
}
