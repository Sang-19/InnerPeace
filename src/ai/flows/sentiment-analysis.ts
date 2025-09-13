'use server';
/**
 * @fileOverview Analyzes the sentiment of a given text.
 *
 * - analyzeSentiment - A function that analyzes the sentiment of a given text.
 * - SentimentAnalysisInput - The input type for the analyzeSentiment function.
 * - SentimentAnalysisOutput - The return type for the analyzeSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SentimentAnalysisInputSchema = z.object({
  inputText: z.string().describe('The text to analyze for sentiment.'),
});
export type SentimentAnalysisInput = z.infer<
  typeof SentimentAnalysisInputSchema
>;

const SentimentAnalysisOutputSchema = z.object({
  sentiment: z
    .enum(['Positive', 'Neutral', 'Negative'])
    .describe('The sentiment of the text.'),
});
export type SentimentAnalysisOutput = z.infer<
  typeof SentimentAnalysisOutputSchema
>;

export async function analyzeSentiment(
  input: SentimentAnalysisInput
): Promise<SentimentAnalysisOutput> {
  return sentimentAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sentimentAnalysisPrompt',
  input: {schema: SentimentAnalysisInputSchema},
  output: {schema: SentimentAnalysisOutputSchema},
  prompt: `Analyze the sentiment of the following text and classify it as "Positive", "Negative", or "Neutral".

Text: {{{inputText}}}`,
});

const sentimentAnalysisFlow = ai.defineFlow(
  {
    name: 'sentimentAnalysisFlow',
    inputSchema: SentimentAnalysisInputSchema,
    outputSchema: SentimentAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
