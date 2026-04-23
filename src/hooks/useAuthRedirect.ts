
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

async function getUserProfile(user: User, preferredRole?: UserRole): Promise<UserProfile | null> {
  // Check preferred role first to avoid wrong redirects
  const checks: UserRole[] = preferredRole === 'tailor'
    ? ['tailor', 'customer']
    : ['customer', 'tailor'];

  for (const role of checks) {
    const col = role === 'customer' ? 'customers' : 'tailors';
    const snap = await getDoc(doc(db, col, user.uid));
    if (snap.exists()) {
      return { role, ...snap.data() } as UserProfile;
    }
  }
  return null;
}

export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  // Determine which role this login page is for
  const getPreferredRole = (): UserRole | undefined => {
    if (pathname.includes('/tailor')) return 'tailor';
    if (pathname.includes('/customer')) return 'customer';
    return undefined;
  };

  useEffect(() => {
    const isAuthPage = pathname.includes('/login');
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
    const preferredRole = getPreferredRole();
    const userProfile = await getUserProfile(user, preferredRole);
    if (userProfile) {
        // If on a specific login page, redirect to that role's dashboard
        const role = preferredRole && userProfile.role !== preferredRole
          ? preferredRole  // Stay with the page's intended role
          : userProfile.role;
        const targetDashboard = `/${role}/dashboard`;
        if (pathname !== targetDashboard) {
            router.push(targetDashboard);
        }
    }
    // If no profile, user will stay on login/home to be handled by other logic
    // or to allow profile creation.
  };

  return checking;
}
