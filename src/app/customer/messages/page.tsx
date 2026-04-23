'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import ChatPanel from '@/components/chat-panel';
import { Loader2 } from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';

export default function CustomerMessagesPage() {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isLoading, setIsLoading] = useState(!auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
        <p>Please log in to view messages.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Messages</h1>
        <p className="text-muted-foreground mt-1">Chat with your tailors in real-time.</p>
      </div>
      <ChatPanel
        userId={user.uid}
        userName={user.displayName || 'Customer'}
        userRole="customer"
      />
    </div>
  );
}
