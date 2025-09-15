
'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import OnboardingFlow from '@/components/onboarding-flow';
import DashboardCards from '@/components/dashboard-cards';

interface UserProfile {
  uid: string;
  onboardingCompleted: boolean;
}

export default function CustomerDashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'customers', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserProfile({
            uid: firebaseUser.uid,
            onboardingCompleted: data.onboardingCompleted || false,
          });
        } else {
          // If the profile doesn't exist, it means they haven't completed onboarding.
          // We can create a basic profile here.
          const newUserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            createdAt: new Date(),
            onboardingCompleted: false,
          };
          await setDoc(userDocRef, newUserProfile);
          setUserProfile({
            uid: firebaseUser.uid,
            onboardingCompleted: false,
          });
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!userProfile) {
    // This can happen briefly on logout or if there's an error.
    // A redirect is handled by useAuthRedirect hook, but this is a fallback.
    return (
      <div className="flex h-screen items-center justify-center">
        <p>You need to be logged in to view this page.</p>
      </div>
    );
  }
  
  const handleOnboardingComplete = () => {
    setUserProfile(prev => prev ? { ...prev, onboardingCompleted: true } : null);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {userProfile.onboardingCompleted ? <DashboardCards /> : <OnboardingFlow onOnboardingComplete={handleOnboardingComplete} />}
    </div>
  );
}
