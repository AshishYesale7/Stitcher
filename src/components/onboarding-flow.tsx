
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const slide1Schema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
});

type Slide1Data = z.infer<typeof slide1Schema>;

function OnboardingSlide1({ onNext }: { onNext: (data: Slide1Data) => void }) {
  const form = useForm<Slide1Data>({
    resolver: zodResolver(slide1Schema),
    defaultValues: {
      fullName: '',
      address: '',
    },
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
                    <Input placeholder="e.g. John Doe" {...field} />
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
                    <Input placeholder="e.g. 123 Main St, Anytown" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
                <p className="text-sm text-muted-foreground">Step 1 of 3</p>
            </div>
            <Button type="submit">
              Next
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({});

  const handleSlide1Next = (data: Slide1Data) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setStep(2);
    // For now, we just log the data. We'll build the next steps soon.
    console.log('Slide 1 Data:', data);
    console.log("Moving to step 2");
  };

  return (
    <div>
      {step === 1 && <OnboardingSlide1 onNext={handleSlide1Next} />}
      {step === 2 && (
        <div className="text-center">
            <p>Step 2: Coming soon!</p>
            <Button onClick={() => setStep(1)}>Go Back</Button>
        </div>
      )}
    </div>
  );
}
