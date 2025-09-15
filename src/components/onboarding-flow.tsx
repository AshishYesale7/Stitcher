
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { updateUserProfile } from '@/app/actions/user';
import { useToast } from '@/hooks/use-toast';
import MeasurementCard from './measurement-card';


// --- Slide 1: Basic Information ---
const slide1Schema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
});
type Slide1Data = z.infer<typeof slide1Schema>;

function OnboardingSlide1({ onNext, defaultValues }: { onNext: (data: Slide1Data) => void; defaultValues: Partial<Slide1Data> }) {
  const form = useForm<Slide1Data>({
    resolver: zodResolver(slide1Schema),
    defaultValues,
  });

  const onSubmit: SubmitHandler<Slide1Data> = (data) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full max-w-sm mx-auto">
          <CardHeader>
            <CardTitle>Welcome to Stitcher</CardTitle>
            <CardDescription>Let's get your profile set up in a few quick steps.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <h3 className="font-semibold">Basic Information</h3>
                <p className="text-sm text-muted-foreground">Let's get to know you.</p>
            </div>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. John Doe" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 123 Main St, Anytown" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">Step 1 of 3</p>
            <Button type="submit">
              Next
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

// --- Slide 2: Physical Attributes ---
const slide2Schema = z.object({
    gender: z.enum(['male', 'female', 'other'], { required_error: 'Please select a gender.' }),
    age: z.coerce.number().min(10, { message: 'You must be at least 10 years old.' }).max(120),
    height: z.coerce.number().min(100, { message: 'Height must be at least 100cm.' }),
    weight: z.coerce.number().min(30, { message: 'Weight must be at least 30kg.' }),
});
type Slide2Data = z.infer<typeof slide2Schema>;

function OnboardingSlide2({ onNext, onBack, defaultValues }: { onNext: (data: Slide2Data) => void; onBack: () => void; defaultValues: Partial<Slide2Data>}) {
    const form = useForm<Slide2Data>({
        resolver: zodResolver(slide2Schema),
        defaultValues,
    });

    const onSubmit: SubmitHandler<Slide2Data> = (data) => {
        onNext(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="w-full max-w-sm mx-auto">
                    <CardHeader>
                        <CardTitle>Physical Attributes</CardTitle>
                        <CardDescription>This helps us recommend the perfect fit for you.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>Gender</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex space-x-4"
                                    >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="male" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Male</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="female" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Female</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="other" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Other</FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="25" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="height"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Height (cm)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="175" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Weight (kg)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="70" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button type="button" variant="ghost" onClick={onBack}>Back</Button>
                        <p className="text-sm text-muted-foreground">Step 2 of 3</p>
                        <Button type="submit">Next</Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
}

// --- Slide 3: Measurements ---
type Measurement = 'Shoulder' | 'Chest' | 'Waist' | 'Hips' | 'Inseam' | 'Sleeve';
type MeasurementData = { [key in Measurement]: number };

const slide3Schema = z.object({
    measurements: z.object({
        Shoulder: z.number(),
        Chest: z.number(),
        Waist: z.number(),
        Hips: z.number(),
        Inseam: z.number(),
        Sleeve: z.number(),
    })
});

type Slide3Data = z.infer<typeof slide3Schema>;


function OnboardingSlide3({ onFinish, onBack, defaultValues }: { onFinish: (data: Slide3Data) => void; onBack: () => void; defaultValues: Partial<Slide3Data>}) {
    const [measurements, setMeasurements] = useState<MeasurementData>(
        defaultValues.measurements || {
            Shoulder: 45, Chest: 98, Waist: 82, Hips: 104, Inseam: 78, Sleeve: 62
        }
    );
    const [isSaving, setIsSaving] = useState(false);

    const handleMeasurementChange = (field: Measurement, value: number) => {
        setMeasurements(prev => ({ ...prev, [field]: value }));
    };

    const handleFinishClick = () => {
        setIsSaving(true);
        onFinish({ measurements });
    };

    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader>
                <CardTitle>Body Measurements</CardTitle>
                <CardDescription>Tap on a label to adjust your measurements.</CardDescription>
            </CardHeader>
            <CardContent>
                <MeasurementCard measurements={measurements} onMeasurementChange={handleMeasurementChange} />
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button type="button" variant="ghost" onClick={onBack} disabled={isSaving}>Back</Button>
                <p className="text-sm text-muted-foreground">Step 3 of 3</p>
                <Button type="button" onClick={handleFinishClick} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Finish
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<Partial<Slide1Data & Slide2Data & Slide3Data>>({});
  const router = useRouter();
  const { toast } = useToast();

  const handleSlide1Next = (data: Slide1Data) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleSlide2Next = (data: Slide2Data) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleSlide3Finish = async (data: Slide3Data) => {
      const finalData = { ...onboardingData, ...data };
      const user = auth.currentUser;

      if (!user) {
          toast({
              variant: 'destructive',
              title: 'Error',
              description: 'You must be logged in to save your profile.',
          });
          return;
      }
      
      try {
        await updateUserProfile(user.uid, finalData);
        toast({
            title: 'Profile Saved!',
            description: "Your onboarding is complete. Welcome to Stitcher!",
        });
        router.push('/customer/dashboard');
        router.refresh(); // Forces a refresh to re-evaluate the dashboard page
      } catch (error) {
        console.error("Failed to save onboarding data:", error);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: 'There was a problem saving your profile. Please try again.',
        });
      }
  };


  const handleBack = () => {
    setStep(prev => prev - 1);
  }

  switch (step) {
    case 1:
        return <OnboardingSlide1 onNext={handleSlide1Next} defaultValues={onboardingData} />;
    case 2:
        return <OnboardingSlide2 onNext={handleSlide2Next} onBack={handleBack} defaultValues={onboardingData} />;
    case 3:
        return <OnboardingSlide3 onFinish={handleSlide3Finish} onBack={handleBack} defaultValues={onboardingData} />;
    default:
        return <OnboardingSlide1 onNext={handleSlide1Next} defaultValues={onboardingData} />;
  }
}
