
'use client';

import OnboardingFlow from '@/components/onboarding-flow';
import DashboardCards from '@/components/dashboard-cards';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

export default function CustomerDashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(auth.currentUser);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);
                const userDocRef = doc(db, 'customers', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists() && userDocSnap.data().onboardingCompleted) {
                    setOnboardingCompleted(true);
                } else {
                    setOnboardingCompleted(false);
                }
            } else {
                setUser(null);
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
    
    if (!user) {
        return (
          <div className="flex h-screen items-center justify-center">
            <p>You need to be logged in to view this page.</p>
          </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {onboardingCompleted ? <DashboardCards /> : <OnboardingFlow />}
        </div>
    );
}
