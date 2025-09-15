
'use server';

import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { onboardingSchema, type OnboardingData } from '@/lib/schemas/onboarding';

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
