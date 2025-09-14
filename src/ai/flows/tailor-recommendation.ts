'use server';

/**
 * @fileOverview Tailor recommendation AI agent.
 *
 * - recommendTailors - A function that recommends tailors based on customer preferences.
 * - RecommendTailorsInput - The input type for the recommendTailors function.
 * - RecommendTailorsOutput - The return type for the recommendTailors function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendTailorsInputSchema = z.object({
  garmentType: z.string().describe('The type of garment the customer is interested in (e.g., Shirt, Pants, Kurta, Saree).'),
  designDetails: z.string().describe('Specific design details or preferences for the garment.'),
  customerLocation: z.string().describe('The current location of the customer to prioritize nearby tailors.'),
});
export type RecommendTailorsInput = z.infer<typeof RecommendTailorsInputSchema>;

const TailorSchema = z.object({
  tailorId: z.string().describe('Unique identifier for the tailor.'),
  name: z.string().describe('Name of the tailor or tailoring shop.'),
  shopName: z.string().describe('Name of the tailoring shop.'),
  location: z.string().describe('Location of the tailor.'),
  rating: z.number().describe('Average customer rating of the tailor (out of 5).'),
  garmentSpecialties: z.array(z.string()).describe('List of garment types the tailor specializes in.'),
  designExpertise: z.array(z.string()).describe('List of design styles the tailor has expertise in.'),
  distance: z.number().describe('Distance from the customer in kilometers'),
});

const RecommendTailorsOutputSchema = z.array(TailorSchema).describe('A list of recommended tailors, sorted by relevance to the customer preferences and proximity.');
export type RecommendTailorsOutput = z.infer<typeof RecommendTailorsOutputSchema>;

export async function recommendTailors(input: RecommendTailorsInput): Promise<RecommendTailorsOutput> {
  return recommendTailorsFlow(input);
}

const tailorRecommendationPrompt = ai.definePrompt({
  name: 'tailorRecommendationPrompt',
  input: {schema: RecommendTailorsInputSchema},
  output: {schema: RecommendTailorsOutputSchema},
  prompt: `You are an expert tailor recommendation agent.

  Given the customer's preferences for garment type, design details, and location, recommend a list of tailors that best match their needs.
  Prioritize tailors who are near the customer and have high ratings.

  Garment Type: {{{garmentType}}}
  Design Details: {{{designDetails}}}
  Customer Location: {{{customerLocation}}}

  Return a JSON array of tailor objects, sorted by relevance and proximity.
  Each tailor object should include tailorId, name, shopName, location, rating, garmentSpecialties, designExpertise, and distance.
  `,
});

const recommendTailorsFlow = ai.defineFlow(
  {
    name: 'recommendTailorsFlow',
    inputSchema: RecommendTailorsInputSchema,
    outputSchema: RecommendTailorsOutputSchema,
  },
  async input => {
    const {output} = await tailorRecommendationPrompt(input);
    return output!;
  }
);
