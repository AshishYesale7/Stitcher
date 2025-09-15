
'use client';

import { useState } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { saveOnboardingData, onboardingSchema, type OnboardingData } from '@/app/actions/onboarding';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface OnboardingFlowProps {
    onOnboardingComplete: () => void;
}

export default function OnboardingFlow({ onOnboardingComplete }: OnboardingFlowProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const methods = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      fullName: '',
      address: '',
      gender: 'Other',
      age: 0,
      height: 0,
      weight: 0,
      measurementUnit: 'cm',
      chest: 0,
      waist: 0,
      hips: 0,
      inseam: 0,
    },
  });

  const { control, trigger, getValues } = methods;

  const slides = [
    {
      title: 'Basic Information',
      description: "Let's get to know you.",
      fields: ['fullName', 'address'],
      component: OnboardingSlide1,
    },
    {
      title: 'Physical Attributes',
      description: 'This helps us find the perfect fit for you.',
      fields: ['gender', 'age', 'height', 'weight'],
      component: OnboardingSlide2,
    },
    {
      title: 'Body Measurements',
      description: 'Enter your measurements for a perfect fit.',
      fields: ['measurementUnit', 'chest', 'waist', 'hips', 'inseam'],
      component: OnboardingSlide3,
    },
  ];

  const handleNext = async () => {
    const fieldsToValidate = slides[current].fields as (keyof OnboardingData)[];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      api?.scrollNext();
      setCurrent(current + 1);
    }
  };

  const handlePrev = () => {
    api?.scrollPrev();
    setCurrent(current - 1);
  };

  const handleSubmit = async () => {
    const fieldsToValidate = slides[current].fields as (keyof OnboardingData)[];
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      setIsSubmitting(true);
      const result = await saveOnboardingData(getValues());
      setIsSubmitting(false);

      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        onOnboardingComplete();
      } else {
        toast({
          variant: 'destructive',
          title: 'Oops! Something went wrong.',
          description: result.message,
        });
      }
    }
  };
  
  const progressValue = ((current + 1) / slides.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold font-headline">Welcome to Stitcher</h1>
        <p className="text-muted-foreground">Let's get your profile set up in a few quick steps.</p>
      </div>

      <Carousel setApi={setApi} className="w-full">
        <FormProvider {...methods}>
          <form onSubmit={(e) => e.preventDefault()}>
            <CarouselContent>
              {slides.map((slide, index) => (
                <CarouselItem key={index}>
                  <slide.component />
                </CarouselItem>
              ))}
            </CarouselContent>
          </form>
        </FormProvider>

        <div className="mt-8">
            <Progress value={progressValue} className="mb-4" />
             <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handlePrev} disabled={current === 0}>
                    Back
                </Button>
                <p className="text-sm text-muted-foreground">
                    Step {current + 1} of {slides.length}
                </p>
                {current < slides.length - 1 ? (
                    <Button onClick={handleNext}>Next</Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Finish
                    </Button>
                )}
            </div>
        </div>
      </Carousel>
    </div>
  );
}


function OnboardingSlide1() {
  const { control } = useFormContext();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>Let's get to know you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 123 Main St, Anytown, USA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

function OnboardingSlide2() {
  const { control } = useFormContext();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Physical Attributes</CardTitle>
        <CardDescription>This helps us find the perfect fit for you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={control}
          name="gender"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Gender</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Male" />
                    </FormControl>
                    <FormLabel className="font-normal">Male</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Female" />
                    </FormControl>
                    <FormLabel className="font-normal">Female</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Other" />
                    </FormControl>
                    <FormLabel className="font-normal">Other</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField control={control} name="age" render={({ field }) => (
                <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="25" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={control} name="height" render={({ field }) => (
                <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" placeholder="175" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={control} name="weight" render={({ field }) => (
                <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" placeholder="70" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )}/>
        </div>
      </CardContent>
    </Card>
  );
}

function OnboardingSlide3() {
    const { control } = useFormContext();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Body Measurements</CardTitle>
                <CardDescription>Enter your measurements for a perfect fit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={control}
                    name="measurementUnit"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex items-center space-x-4"
                            >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="cm" /></FormControl>
                                <FormLabel className="font-normal">Centimeters (cm)</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl><RadioGroupItem value="in" /></FormControl>
                                <FormLabel className="font-normal">Inches (in)</FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={control} name="chest" render={({ field }) => (
                        <FormItem><FormLabel>Chest</FormLabel><FormControl><Input type="number" placeholder="98" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={control} name="waist" render={({ field }) => (
                        <FormItem><FormLabel>Waist</FormLabel><FormControl><Input type="number" placeholder="82" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={control} name="hips" render={({ field }) => (
                        <FormItem><FormLabel>Hips</FormLabel><FormControl><Input type="number" placeholder="100" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={control} name="inseam" render={({ field }) => (
                        <FormItem><FormLabel>Inseam</FormLabel><FormControl><Input type="number" placeholder="78" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
            </CardContent>
        </Card>
    )
}
