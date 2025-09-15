
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { updateUserProfile } from '@/app/actions/user';
import { useToast } from '@/hooks/use-toast';
import MeasurementCard from '@/components/measurement-card';

type Measurement = 'Shoulder' | 'Chest' | 'Waist' | 'Hips' | 'Inseam' | 'Sleeve';
type MeasurementData = { [key in Measurement]: number };

const defaultMeasurements: MeasurementData = {
    Shoulder: 45, Chest: 98, Waist: 82, Hips: 104, Inseam: 78, Sleeve: 62
};

export default function MeasurementPage() {
    const [measurements, setMeasurements] = useState<MeasurementData>(defaultMeasurements);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<FirebaseUser | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                const userDocRef = doc(db, 'customers', firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists() && userDocSnap.data().measurements) {
                    setMeasurements(userDocSnap.data().measurements);
                }
            } else {
                router.push('/customer/login');
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    const handleMeasurementChange = (field: Measurement, value: number) => {
        setMeasurements(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
            return;
        }
        setIsSaving(true);
        try {
            await updateUserProfile(user.uid, { measurements });
            toast({
                title: 'Measurements Saved!',
                description: 'Your measurements have been updated successfully.',
            });
        } catch (error) {
            console.error("Failed to save measurements:", error);
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'There was a problem saving your measurements.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8 flex justify-center items-center">
            <Card className="w-full max-w-sm mx-auto">
                <CardHeader>
                    <CardTitle>Body Measurements</CardTitle>
                    <CardDescription>Tap on a label to adjust your measurements.</CardDescription>
                </CardHeader>
                <CardContent>
                    <MeasurementCard measurements={measurements} onMeasurementChange={handleMeasurementChange} />
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button type="button" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
