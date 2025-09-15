
'use server';

import { z } from 'zod';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

export const onboardingSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
  address: z.string().min(5, 'Address must be at least 5 characters.'),
  gender: z.enum(['Male', 'Female', 'Other']),
  age: z.coerce.number().min(1, 'Age is required.'),
  height: z.coerce.number().min(1, 'Height is required.'),
  weight: z.coerce.number().min(1, 'Weight is required.'),
  measurementUnit: z.enum(['cm', 'in']),
  chest: z.coerce.number().min(1, 'Chest measurement is required.'),
  waist: z.coerce.number().min(1, 'Waist measurement is required.'),
  hips: z.coerce.number().min(1, 'Hips measurement is required.'),
  inseam: z.coerce.number().min(1, 'Inseam measurement is required.'),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[] | undefined>;
};

export async function saveOnboardingData(
  data: OnboardingData
): Promise<FormState> {
  const user = auth.currentUser;
  if (!user) {
    return {
      success: false,
      message: 'You must be logged in to save your profile.',
    };
  }

  const validatedFields = onboardingSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const userDocRef = doc(db, 'customers', user.uid);
    await setDoc(
      userDocRef,
      {
        ...validatedFields.data,
        onboardingCompleted: true,
      },
      { merge: true }
    );
    
    // Revalidate the dashboard path to trigger a re-render
    revalidatePath('/customer/dashboard');

    return {
      success: true,
      message: 'Your profile has been set up successfully!',
    };
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
