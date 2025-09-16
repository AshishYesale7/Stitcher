
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { updateUserProfile } from '@/app/actions/user';
import { useToast } from '@/hooks/use-toast';
import MeasurementCard from '@/components/measurement-card';

type Measurement = 'Shoulder' | 'Chest' | 'Waist' | 'Hips' | 'Inseam' | 'Sleeve';
type MeasurementUnit = 'cm' | 'inch';
type MeasurementData = { [key in Measurement]: number };

const defaultMeasurementsCm: MeasurementData = {
    Shoulder: 45, Chest: 98, Waist: 82, Hips: 104, Inseam: 78, Sleeve: 62
};

export default function MeasurementPage() {
    const [measurements, setMeasurements] = useState<MeasurementData>(defaultMeasurementsCm);
    const [unit, setUnit] = useState<MeasurementUnit>('cm');
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
                if (userDocSnap.exists()) {
                    const data = userDocSnap.data();
                    if (data.measurements) {
                        setMeasurements(data.measurements);
                    }
                    if (data.measurementUnit) {
                        setUnit(data.measurementUnit);
                    }
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
    
    const handleUnitChange = (newUnit: MeasurementUnit) => {
        if (newUnit === unit) return;

        const conversionFactor = newUnit === 'inch' ? (1 / 2.54) : 2.54;
        
        const convertedMeasurements = Object.fromEntries(
            Object.entries(measurements).map(([key, value]) => [
                key,
                Math.round((value * conversionFactor) * 10) / 10
            ])
        ) as MeasurementData;
        
        setMeasurements(convertedMeasurements);
        setUnit(newUnit);
    };

    const handleSave = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
            return;
        }
        setIsSaving(true);
        try {
            await updateUserProfile(user.uid, { measurements, measurementUnit: unit });
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
                     <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Body Measurements</CardTitle>
                            <CardDescription>Tap on a label to adjust.</CardDescription>
                        </div>
                        <RadioGroup
                            defaultValue={unit}
                            onValueChange={(val) => handleUnitChange(val as MeasurementUnit)}
                            className="flex items-center space-x-2"
                            >
                            <div className="flex items-center space-x-1 space-y-0">
                                <RadioGroupItem value="cm" id="cm" />
                                <Label htmlFor="cm" className="font-normal text-xs">cm</Label>
                            </div>
                            <div className="flex items-center space-x-1 space-y-0">
                                <RadioGroupItem value="inch" id="inch" />
                                <Label htmlFor="inch" className="font-normal text-xs">inch</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </CardHeader>
                <CardContent>
                    <MeasurementCard measurements={measurements} onMeasurementChange={handleMeasurementChange} unit={unit} />
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
