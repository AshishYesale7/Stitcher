
import { z } from 'zod';

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
