'use server';

/**
 * @fileOverview Provides a price suggestion for a car listing based on its details.
 *
 * - suggestPrice - A function that suggests a price for a car listing.
 * - SuggestPriceInput - The input type for the suggestPrice function.
 * - SuggestPriceOutput - The return type for the suggestPrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPriceInputSchema = z.object({
  make: z.string().describe('The make of the car.'),
  model: z.string().describe('The model of the car.'),
  year: z.number().describe('The year the car was manufactured.'),
  mileage: z.number().describe('The mileage of the car.'),
  condition: z
    .string()
    .describe(
      'The condition of the car (e.g., excellent, good, fair, poor).' + ' Please be specific.'
    ),
  additionalDetails: z
    .string()
    .optional()
    .describe('Any additional details about the car.'),
});
export type SuggestPriceInput = z.infer<typeof SuggestPriceInputSchema>;

const SuggestPriceOutputSchema = z.object({
  suggestedPrice: z
    .number()
    .describe('The suggested listing price for the car, in US dollars.'),
  reasoning: z.string().describe('The reasoning behind the suggested price.'),
});
export type SuggestPriceOutput = z.infer<typeof SuggestPriceOutputSchema>;

export async function suggestPrice(input: SuggestPriceInput): Promise<SuggestPriceOutput> {
  return suggestPriceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPricePrompt',
  input: {schema: SuggestPriceInputSchema},
  output: {schema: SuggestPriceOutputSchema},
  prompt: `You are an expert car appraiser. Given the details of a car, you will suggest a competitive listing price.

  Make: {{{make}}}
  Model: {{{model}}}
  Year: {{{year}}}
  Mileage: {{{mileage}}}
  Condition: {{{condition}}}
  Additional Details: {{{additionalDetails}}}

  Suggest a listing price and explain your reasoning. The suggested price should be in US dollars.
  `,
});

const suggestPriceFlow = ai.defineFlow(
  {
    name: 'suggestPriceFlow',
    inputSchema: SuggestPriceInputSchema,
    outputSchema: SuggestPriceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
