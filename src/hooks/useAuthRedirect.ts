
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { auth, app } from '@/lib/firebase';

const db = getFirestore(app);

async function getUserRole(user: User): Promise<'customer' | 'tailor' | null> {
  const customerDocRef = doc(db, 'customers', user.uid);
  const customerDocSnap = await getDoc(customerDocRef);
  if (customerDocSnap.exists()) {
    return 'customer';
  }

  const tailorDocRef = doc(db, 'tailors', user.uid);
  const tailorDocSnap = await getDoc(tailorDocRef);
  if (tailorDocSnap.exists()) {
    return 'tailor';
  }

  return null;
}

export function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await getUserRole(user);
        if (role) {
          router.push(`/${role}/dashboard`);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);
}
