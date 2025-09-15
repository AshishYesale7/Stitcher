
'use client';

import DashboardCards from '@/components/dashboard-cards';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';

export default function CustomerDashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(auth.currentUser);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
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
            <DashboardCards />
        </div>
    );
}
