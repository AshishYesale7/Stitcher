
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const slide1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  address: z.string().min(5, 'Please enter a valid address.'),
  phone: z.string().optional(),
  email: z.string().email('Please enter a valid email.').optional(),
});

const slide2Schema = z.object({
  gender: z.enum(['male', 'female', 'other']),
  height: z.coerce.number().min(1, "Height is required."),
  weight: z.coerce.number().min(1, "Weight is required."),
  age: z.coerce.number().min(1, "Age is required."),
});

const slide3Schema = z.object({
  chest: z.coerce.number().min(1),
  waist: z.coerce.number().min(1),
  hips: z.coerce.number().min(1),
  inseam: z.coerce.number().min(1),
  measurementUnit: z.enum(['cm', 'inch', 'meter']),
});

const formSchema = slide1Schema.merge(slide2Schema).merge(slide3Schema);
type OnboardingFormData = z.infer<typeof formSchema>;

type UserRole = 'customer' | 'tailor';

function OnboardingSlide1() {
  const { control, formState: { errors } } = useFormContext<OnboardingFormData>();
  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Let's get to know you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Controller name="name" control={control} render={({ field }) => <Input id="name" placeholder="John Doe" {...field} />} />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Controller name="address" control={control} render={({ field }) => <Input id="address" placeholder="123 Main St, Anytown, USA" {...field} />} />
          {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
        </div>
      </CardContent>
    </div>
  );
}

function OnboardingSlide2() {
  const { control, formState: { errors } } = useFormContext<OnboardingFormData>();
  return (
    <div className="space-y-4">
      <CardHeader>
        <CardTitle>Physical Attributes</CardTitle>
        <CardDescription>This helps us find the perfect fit for you.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
        </div>
        <div>
          <Label htmlFor="age">Age</Label>
          <Controller name="age" control={control} render={({ field }) => <Input id="age" type="number" placeholder="25" {...field} />} />
          {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
        </div>
        <div>
          <Label htmlFor="height">Height (cm)</Label>
          <Controller name="height" control={control} render={({ field }) => <Input id="height" type="number" placeholder="175" {...field} />} />
          {errors.height && <p className="text-sm text-destructive">{errors.height.message}</p>}
        </div>
        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Controller name="weight" control={control} render={({ field }) => <Input id="weight" type="number" placeholder="70" {...field} />} />
          {errors.weight && <p className="text-sm text-destructive">{errors.weight.message}</p>}
        </div>
      </CardContent>
    </div>
  );
}

function OnboardingSlide3() {
    const { control, formState: { errors } } = useFormContext<OnboardingFormData>();
    return (
        <div className="space-y-4">
            <CardHeader>
                <CardTitle>Body Measurements</CardTitle>
                <CardDescription>Use the guide to enter your measurements.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative aspect-square w-full max-w-sm mx-auto">
                    <Image src="https://picsum.photos/seed/body/600/600" alt="Body measurement guide" layout="fill" objectFit="contain" data-ai-hint="body illustration" />
                </div>
                <div className="space-y-4">
                    <div>
                        <Label>Unit</Label>
                         <Controller
                            name="measurementUnit"
                            control={control}
                            render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value || 'cm'}>
                                <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                <SelectItem value="cm">Centimeters (cm)</SelectItem>
                                <SelectItem value="inch">Inches (in)</SelectItem>
                                <SelectItem value="meter">Meters (m)</SelectItem>
                                </SelectContent>
                            </Select>
                            )}
                        />
                    </div>
                     <div>
                        <Label htmlFor="chest">Chest</Label>
                        <Controller name="chest" control={control} render={({ field }) => <Input id="chest" type="number" placeholder="98" {...field} />} />
                        {errors.chest && <p className="text-sm text-destructive">{errors.chest.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="waist">Waist</Label>
                        <Controller name="waist" control={control} render={({ field }) => <Input id="waist" type="number" placeholder="82" {...field} />} />
                        {errors.waist && <p className="text-sm text-destructive">{errors.waist.message}</p>}
                    </div>
                     <div>
                        <Label htmlFor="hips">Hips</Label>
                        <Controller name="hips" control={control} render={({ field }) => <Input id="hips" type="number" placeholder="100" {...field} />} />
                        {errors.hips && <p className="text-sm text-destructive">{errors.hips.message}</p>}
                    </div>
                     <div>
                        <Label htmlFor="inseam">Inseam</Label>
                        <Controller name="inseam" control={control} render={({ field }) => <Input id="inseam" type="number" placeholder="80" {...field} />} />
                        {errors.inseam && <p className="text-sm text-destructive">{errors.inseam.message}</p>}
                    </div>
                </div>
            </CardContent>
        </div>
    );
}


export default function OnboardingPage() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const defaultFormValues: OnboardingFormData = {
    name: '',
    address: '',
    phone: '',
    email: '',
    gender: 'male',
    age: 0,
    height: 0,
    weight: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    inseam: 0,
    measurementUnit: 'cm',
  };

  const methods = useForm<OnboardingFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues
  });
  
  const { handleSubmit, trigger, reset } = methods;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const customerDoc = await getDoc(doc(db, 'customers', firebaseUser.uid));
        if (customerDoc.exists()) {
          setUserRole('customer');
          const data = customerDoc.data();
          if (data.onboardingCompleted) {
            router.push('/customer/dashboard');
          } else {
             reset({ ...defaultFormValues, ...data, name: firebaseUser.displayName || '', email: firebaseUser.email || '', phone: firebaseUser.phoneNumber || '' });
          }
          setCount(3);
        } else {
          const tailorDoc = await getDoc(doc(db, 'tailors', firebaseUser.uid));
          if (tailorDoc.exists()) {
            setUserRole('tailor');
             const data = tailorDoc.data();
             if (data.onboardingCompleted) {
                router.push('/tailor/dashboard');
             } else {
                reset({ ...defaultFormValues, ...data, name: firebaseUser.displayName || '', email: firebaseUser.email || '', phone: firebaseUser.phoneNumber || '' });
             }
            setCount(1);
          } else {
             router.push('/');
          }
        }
      } else {
        router.push('/');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, reset]);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on('select', () => setCurrent(api.selectedScrollSnap() + 1));
  }, [api]);

  const slides = [<OnboardingSlide1 />, <OnboardingSlide2 />, <OnboardingSlide3 />];
  const customerSlides = slides;
  const tailorSlides = [slides[0]];

  const handleNext = useCallback(async () => {
    let fieldsToValidate: (keyof OnboardingFormData)[] | undefined;
    if (userRole === 'customer') {
        if (current === 1) fieldsToValidate = ['name', 'address'];
        if (current === 2) fieldsToValidate = ['gender', 'age', 'height', 'weight'];
        if (current === 3) fieldsToValidate = ['chest', 'waist', 'hips', 'inseam', 'measurementUnit'];
    }
    if (userRole === 'tailor') {
        if (current === 1) fieldsToValidate = ['name', 'address'];
    }
    
    const isValid = fieldsToValidate ? await trigger(fieldsToValidate) : true;
    
    if (isValid) {
        if (current < (userRole === 'customer' ? customerSlides.length : tailorSlides.length)) {
            api?.scrollNext();
        } else {
            handleSubmit(onSubmit)();
        }
    }
  }, [api, current, trigger, handleSubmit, userRole, customerSlides.length, tailorSlides.length]);
  
  const onSubmit = async (data: OnboardingFormData) => {
    if (!user || !userRole) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not found.' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const collectionName = userRole === 'customer' ? 'customers' : 'tailors';
      const userDocRef = doc(db, collectionName, user.uid);
      
      const profileData: Partial<OnboardingFormData> & { onboardingCompleted: boolean, updatedAt: any, displayName?: string, email?: string, phoneNumber?: string } = {
          onboardingCompleted: true,
          updatedAt: serverTimestamp()
      };

      Object.assign(profileData, data);

      if(data.name) {
        profileData.displayName = data.name;
      }
      
      await setDoc(userDocRef, profileData, { merge: true });
      
      toast({ title: 'Success', description: 'Your profile has been updated.' });
      router.push(`/${userRole}/dashboard`);

    } catch (error) {
      console.error("Failed to save onboarding data:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save your profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (isLoading || !userRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }
  
  const currentSlides = userRole === 'customer' ? customerSlides : tailorSlides;

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl">
          <Card>
            <Carousel setApi={setApi} className="w-full" opts={{ watchDrag: false, loop: false, align: "start" }} >
              <CarouselContent>
                {currentSlides.map((slide, index) => (
                  <CarouselItem key={index}>{slide}</CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <div className="flex items-center justify-between p-6">
                <p className="text-sm text-muted-foreground">
                    Step {current} of {currentSlides.length}
                </p>
                <div className="flex gap-2">
                    {current > 1 && (
                        <Button variant="outline" onClick={() => api?.scrollPrev()} disabled={isSubmitting}>
                            Back
                        </Button>
                    )}
                    <Button onClick={handleNext} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {current === currentSlides.length ? 'Finish' : 'Next'}
                    </Button>
                </div>
            </div>
          </Card>
        </div>
      </div>
    </FormProvider>
  );
}

    