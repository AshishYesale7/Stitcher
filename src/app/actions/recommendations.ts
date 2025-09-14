// @ts-nocheck
'use server';

import { recommendTailors, type RecommendTailorsInput, type RecommendTailorsOutput } from '@/ai/flows/tailor-recommendation';
import { z } from 'zod';

const formSchema = z.object({
  garmentType: z.string().min(1, "Please select a garment type."),
  designDetails: z.string().min(3, "Please provide some design details."),
  customerLocation: z.string().min(3, "Please enter your location."),
});

export type FormState = {
  message: string;
  data?: RecommendTailorsOutput;
  errors?: {
    garmentType?: string[];
    designDetails?: string[];
    customerLocation?: string[];
  };
};

export async function getTailorRecommendations(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    garmentType: formData.get('garmentType'),
    designDetails: formData.get('designDetails'),
    customerLocation: formData.get('customerLocation'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check your inputs.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const results = await recommendTailors(validatedFields.data as RecommendTailorsInput);
    if (!results || results.length === 0) {
      return { message: 'No tailors found matching your criteria.', data: [] };
    }
    return { message: 'Successfully found recommendations.', data: results };
  } catch (error) {
    console.error('Error fetching tailor recommendations:', error);
    return { message: 'An unexpected error occurred on the server. Please try again later.' };
  }
}
