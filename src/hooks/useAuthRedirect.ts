
'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userProfile = await getUserProfile(user);
        if (userProfile) {
          if (!userProfile.onboardingCompleted) {
             if (pathname !== '/onboarding') {
              router.push('/onboarding');
            }
          } else {
            const targetDashboard = `/${userProfile.role}/dashboard`;
            if (pathname !== targetDashboard) {
               router.push(targetDashboard);
            }
          }
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);
}
