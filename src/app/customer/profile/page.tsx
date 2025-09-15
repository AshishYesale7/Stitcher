
'use client';

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Star, MessageSquare, MoreVertical, User, Mail, Phone, MapPin, Edit, Save, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { auth, db } from "@/lib/firebase";
import type { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { OnboardingData } from "@/lib/schemas/onboarding";

type UserProfile = OnboardingData & {
    uid: string;
    email: string;
    avatarUrl: string;
    role: string;
};


function MeasurementSlider({ label, value, unit, onValueChange, disabled }: { label: string, value: number, unit: string, onValueChange: (value: number[]) => void, disabled: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-sm font-semibold text-primary">{value} {unit}</span>
      </div>
      <Slider
        value={[value]}
        max={label === 'Height' ? 220 : (label === 'Weight' ? 150 : 150)}
        min={label === 'Height' ? 120 : (label === 'Weight' ? 40 : 50)}
        step={1}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </div>
  );
}

export default function CustomerProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'customers', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUser({
            uid: firebaseUser.uid,
            fullName: data.fullName || data.displayName || 'New User',
            address: data.address || '',
            gender: data.gender || 'Other',
            age: data.age || 0,
            height: data.height || 175,
            weight: data.weight || 70,
            measurementUnit: data.measurementUnit || 'cm',
            chest: data.chest || 98,
            waist: data.waist || 82,
            hips: data.hips || 104,
            inseam: data.inseam || 78,
            email: data.email || firebaseUser.email || '',
            avatarUrl: data.photoURL || firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
            role: 'Fashion Enthusiast',
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMeasurementChange = (field: keyof UserProfile) => (value: number[]) => {
      if (user) {
        setUser(prev => ({ ...prev!, [field]: value[0] }));
      }
  };
  
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (user) {
        setUser(prev => ({...prev!, [id]: value}));
    }
  }

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
        const { uid, email, avatarUrl, role, ...profileData } = user;
        const userDocRef = doc(db, 'customers', uid);
        await setDoc(userDocRef, profileData, { merge: true });
        setIsEditing(false);
        toast({ title: "Success", description: "Your profile has been updated." });
    } catch(error) {
        console.error("Error saving profile:", error);
        toast({ variant: 'destructive', title: "Error", description: "Failed to save profile." });
    } finally {
        setIsSaving(false);
    }
  }

  const friends = [
    { name: "Jacob Lennon", time: "2 min ago", avatar: "https://picsum.photos/seed/friend1/40/40" },
    { name: "Didier Mailly", time: "5 min ago", avatar: "https://picsum.photos/seed/friend2/40/40" },
    { name: "Miguel Cunha Ferreira", time: "7 min ago", avatar: "https://picsum.photos/seed/friend3/40/40" },
    { name: "Eric Yuriev", time: "12 min ago", avatar: "https://picsum.photos/seed/friend4/40/40" },
  ];

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    )
  }

  if (!user) {
     return (
        <div className="flex justify-center items-center min-h-screen">
            <p>Please log in to view your profile.</p>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-48 md:h-56 bg-gradient-to-r from-red-500 to-purple-600 p-4 flex items-end rounded-b-2xl shadow-lg">
        <div className="flex items-center gap-4">
          <Avatar className="w-24 h-24 border-4 border-background">
            <AvatarImage src={user.avatarUrl} alt={user.fullName} data-ai-hint="person" />
            <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.fullName}</h1>
            <p className="text-sm text-white/80">{user.role}</p>
          </div>
        </div>
        <Button size="icon" className="absolute -bottom-6 right-6 rounded-full h-12 w-12 bg-red-500 hover:bg-red-600 shadow-md">
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add</span>
        </Button>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue="about" className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
            <TabsTrigger value="friends">Friend List</TabsTrigger>
            <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
          </TabsList>
          <TabsContent value="about" className="mt-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>About {user.fullName.split(' ')[0]}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => isEditing ? handleSave() : setIsEditing(true)} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />)}
                            <span className="sr-only">{isEditing ? "Save" : "Edit"}</span>
                        </Button>
                    </div>
                    <CardDescription>Your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                            <Label htmlFor="fullName" className="text-xs text-muted-foreground">Name</Label>
                            <Input id="fullName" value={user.fullName} readOnly={!isEditing} onChange={handleUserChange} className="border-0 px-0 h-auto focus-visible:ring-0 read-only:bg-transparent" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                            <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
                            <Input id="email" value={user.email} readOnly className="border-0 px-0 h-auto focus-visible:ring-0 read-only:bg-transparent" />
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                            <Label htmlFor="phone" className="text-xs text-muted-foreground">Phone</Label>
                            <Input id="phone" value={auth.currentUser?.phoneNumber || "Not available"} readOnly className="border-0 px-0 h-auto focus-visible:ring-0 read-only:bg-transparent" />
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                            <Label htmlFor="address" className="text-xs text-muted-foreground">Address</Label>
                            <Input id="address" value={user.address} readOnly={!isEditing} onChange={handleUserChange} className="border-0 px-0 h-auto focus-visible:ring-0 read-only:bg-transparent" />
                        </div>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="measurements" className="mt-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Body Measurements</CardTitle>
                         <Button variant="ghost" size="icon" onClick={() => isEditing ? handleSave() : setIsEditing(true)} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />)}
                            <span className="sr-only">{isEditing ? "Save" : "Edit"}</span>
                        </Button>
                    </div>
                    <CardDescription>Keep your measurements up to date for a perfect fit.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <MeasurementSlider label="Height" value={user.height} unit="cm" onValueChange={handleMeasurementChange('height')} disabled={!isEditing} />
                   <MeasurementSlider label="Weight" value={user.weight} unit="kg" onValueChange={handleMeasurementChange('weight')} disabled={!isEditing}/>
                   <MeasurementSlider label="Chest" value={user.chest} unit={user.measurementUnit} onValueChange={handleMeasurementChange('chest')} disabled={!isEditing}/>
                   <MeasurementSlider label="Waist" value={user.waist} unit={user.measurementUnit} onValueChange={handleMeasurementChange('waist')} disabled={!isEditing}/>
                   <MeasurementSlider label="Hips" value={user.hips} unit={user.measurementUnit} onValueChange={handleMeasurementChange('hips')} disabled={!isEditing}/>
                   <MeasurementSlider label="Inseam" value={user.inseam} unit={user.measurementUnit} onValueChange={handleMeasurementChange('inseam')} disabled={!isEditing}/>
                   <div className="pt-4 flex justify-end">
                       <Button onClick={handleSave} disabled={isSaving || !isEditing}>
                           {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>} 
                           Save Measurements
                       </Button>
                   </div>
                </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="friends" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold p-4">Recently added friends</h3>
                  <ul className="divide-y divide-border">
                    {friends.map((friend, index) => (
                      <li key={index} className="flex items-center justify-between p-4 hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={friend.avatar} alt={friend.name} data-ai-hint="person portrait" />
                            <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{friend.name}</p>
                            <p className="text-xs text-muted-foreground">{friend.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="top-rated">
             <Card>
                <CardContent className="p-6">
                    <p>Top Rated content coming soon.</p>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
