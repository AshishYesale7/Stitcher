
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronsUpDown, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { updateUserProfile } from '@/app/actions/user';
import { useToast } from '@/hooks/use-toast';
import MeasurementCard from './measurement-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { countries, type Country } from '@/lib/countries';


// --- Slide 1: Basic Information ---
const slide1Schema = z.object({
  fullName: z.string().min(3, { message: 'Full name must be at least 3 characters.' }),
  house: z.string().min(1, { message: 'Please enter a house number.' }),
  street: z.string().min(3, { message: 'Street must be at least 3 characters.' }),
  city: z.string().min(3, { message: 'City must be at least 3 characters.' }),
  state: z.string().min(2, { message: 'State/Province must be at least 2 characters.' }),
  zip: z.string().min(4, { message: 'Please enter a valid ZIP/PIN code.' }),
  phoneNumber: z.string().min(10, { message: 'Please enter a valid 10-digit phone number.' }).regex(/^\d{10}$/, { message: 'Phone number must be 10 digits.'}),
});
type Slide1Data = z.infer<typeof slide1Schema>;

function OnboardingSlide1({ onNext, defaultValues }: { onNext: (data: Slide1Data, fullPhoneNumber: string) => void; defaultValues: Partial<Slide1Data> }) {
  const form = useForm<Slide1Data>({
    resolver: zodResolver(slide1Schema),
    defaultValues,
  });
  
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === 'IN')!
  );

  useEffect(() => {
    // Set default country to India if not already set.
    if (!selectedCountry) {
        setSelectedCountry(countries.find(c => c.code === 'IN')!);
    }
  }, [selectedCountry]);


  const onSubmit: SubmitHandler<Slide1Data> = (data) => {
    const fullPhoneNumber = `${selectedCountry.dial_code}${data.phoneNumber}`;
    onNext(data, fullPhoneNumber);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Welcome to Fabrova</CardTitle>
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
            <div className="flex flex-col sm:flex-row gap-4">
                 <FormField
                  control={form.control}
                  name="house"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>House No.</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. #123" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Street</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Main St" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <div className="flex flex-col sm:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Anytown" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. California" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>ZIP / PIN Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 90210" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             </div>
             <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <div className="flex items-center">
                     <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className="w-[130px] justify-between rounded-r-none border-r-0"
                            >
                                <span className="truncate">{selectedCountry.flag} {selectedCountry.dial_code}</span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                            <Command>
                                <CommandInput placeholder="Search country..." />
                                <CommandList>
                                    <CommandEmpty>No country found.</CommandEmpty>
                                    <CommandGroup>
                                        {countries.map((country) => (
                                            <CommandItem
                                                key={country.code}
                                                value={`${country.name} (${country.dial_code})`}
                                                onSelect={() => {
                                                    setSelectedCountry(country);
                                                    setPopoverOpen(false);
                                                }}
                                            >
                                                {country.flag} {country.name} ({country.dial_code})
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormControl>
                        <Input
                            type="tel"
                            placeholder="9876543210"
                            className="rounded-l-none"
                            {...field}
                            value={field.value ?? ''}
                        />
                    </FormControl>
                  </div>
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
    age: z.coerce.number().positive({ message: "Please enter a valid age." }),
    height: z.coerce.number().positive({ message: "Height must be a positive number." }),
    heightUnit: z.enum(['cm', 'm', 'ft']),
    weight: z.coerce.number().positive({ message: "Weight must be a positive number." }),
    weightUnit: z.enum(['kg', 'lbs']),
});
type Slide2Data = z.infer<typeof slide2Schema>;

function OnboardingSlide2({ onNext, onBack, defaultValues }: { onNext: (data: Slide2Data) => void; onBack: () => void; defaultValues: Partial<Slide2Data>}) {
    const form = useForm<Slide2Data>({
        resolver: zodResolver(slide2Schema),
        defaultValues: {
            ...defaultValues,
            heightUnit: defaultValues.heightUnit || 'cm',
            weightUnit: defaultValues.weightUnit || 'kg',
        },
    });

    const heightUnit = form.watch('heightUnit');
    const weightUnit = form.watch('weightUnit');

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
                        <div className="space-y-2">
                             <FormLabel>Height</FormLabel>
                             <div className="flex gap-2">
                                <FormField
                                    control={form.control}
                                    name="height"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                        <FormControl>
                                            <Input type="number" step="any" placeholder={heightUnit === 'cm' ? '175' : heightUnit === 'm' ? '1.75' : '5.9'} {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="heightUnit"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormControl>
                                                <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex h-10 items-center space-x-2 rounded-md border border-input px-3"
                                                >
                                                    <FormItem className="flex items-center space-x-1 space-y-0">
                                                        <FormControl><RadioGroupItem value="cm" /></FormControl>
                                                        <FormLabel htmlFor="cm" className="font-normal text-xs">cm</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-1 space-y-0">
                                                        <FormControl><RadioGroupItem value="m" /></FormControl>
                                                        <FormLabel htmlFor="m" className="font-normal text-xs">m</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-1 space-y-0">
                                                        <FormControl><RadioGroupItem value="ft" /></FormControl>
                                                        <FormLabel htmlFor="ft" className="font-normal text-xs">ft</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             </div>
                        </div>

                         <div className="space-y-2">
                             <FormLabel>Weight</FormLabel>
                             <div className="flex gap-2">
                                <FormField
                                    control={form.control}
                                    name="weight"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                        <FormControl>
                                            <Input type="number" step="any" placeholder={weightUnit === 'kg' ? '70' : '154'} {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={form.control}
                                    name="weightUnit"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormControl>
                                                <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex h-10 items-center space-x-2 rounded-md border border-input px-3"
                                                >
                                                    <FormItem className="flex items-center space-x-1 space-y-0">
                                                        <FormControl><RadioGroupItem value="kg" /></FormControl>
                                                        <FormLabel htmlFor="kg" className="font-normal text-xs">kg</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-1 space-y-0">
                                                        <FormControl><RadioGroupItem value="lbs" /></FormControl>
                                                        <FormLabel htmlFor="lbs" className="font-normal text-xs">lbs</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             </div>
                        </div>
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
type MeasurementUnit = 'cm' | 'inch';
type MeasurementData = { [key in Measurement]: number };

const slide3Schema = z.object({
    measurements: z.object({
        Shoulder: z.number(),
        Chest: z.number(),
        Waist: z.number(),
        Hips: z.number(),
        Inseam: z.number(),
        Sleeve: z.number(),
    }),
    measurementUnit: z.enum(['cm', 'inch']),
});

type Slide3Data = z.infer<typeof slide3Schema>;


function OnboardingSlide3({ onFinish, onBack, defaultValues }: { onFinish: (data: Slide3Data) => void; onBack: () => void; defaultValues: Partial<Slide3Data>}) {
    const [isSaving, setIsSaving] = useState(false);
    const [measurements, setMeasurements] = useState<MeasurementData>(defaultValues.measurements || {
        Shoulder: 45, Chest: 98, Waist: 82, Hips: 104, Inseam: 78, Sleeve: 62
    });
    const [unit, setUnit] = useState<MeasurementUnit>(defaultValues.measurementUnit || 'cm');

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

    const handleFinishClick = () => {
        setIsSaving(true);
        onFinish({ measurements, measurementUnit: unit });
    };

    return (
        <Card className="w-full max-w-sm mx-auto flex flex-col min-h-[600px]">
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
            <CardContent className="flex-1 flex items-center">
                <MeasurementCard 
                    measurements={measurements}
                    onMeasurementChange={handleMeasurementChange}
                    unit={unit}
                />
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button type="button" variant="ghost" onClick={onBack} disabled={isSaving}>Back</Button>
                <p className="text-sm text-muted-foreground">Step 3 of 3</p>
                <Button type="button" onClick={handleFinishClick} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Finish
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<Partial<Slide1Data & Slide2Data & Slide3Data & { phoneNumber: string }>>({});
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const handleSlide1Next = (data: Slide1Data, fullPhoneNumber: string) => {
    setOnboardingData(prev => ({ ...prev, ...data, phoneNumber: fullPhoneNumber }));
    setStep(2);
  };

  const handleSlide2Next = (data: Slide2Data) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleSlide3Finish = async (data: Slide3Data) => {
      setIsSaving(true);
      const finalData = { ...onboardingData, ...data, onboardingCompleted: true };

      const user = auth.currentUser;

      if (!user) {
          toast({
              variant: 'destructive',
              title: 'Error',
              description: 'You must be logged in to save your profile.',
          });
          setIsSaving(false);
          return;
      }
      
      try {
        await updateUserProfile(user.uid, finalData);
        toast({
            title: 'Profile Saved!',
            description: "Your onboarding is complete. Welcome to Fabrova!",
        });
        // We need to reload to force the dashboard to re-evaluate the onboarding status
        window.location.reload();
      } catch (error) {
        console.error("Failed to save onboarding data:", error);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: 'There was a problem saving your profile. Please try again.',
        });
      } finally {
        setIsSaving(false);
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

    