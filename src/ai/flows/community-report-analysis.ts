'use server';
/**
 * @fileOverview Analyzes a community report message for harmful content.
 *
 * - analyzeCommunityReport - A function that handles the community report analysis process.
 * - CommunityReportInput - The input type for the analyzeCommunityReport function.
 * - CommunityReportOutput - The return type for the analyzeCommunityReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CommunityReportInputSchema = z.object({
  message: z.string().describe('The message to analyze for harmful content.'),
});
export type CommunityReportInput = z.infer<typeof CommunityReportInputSchema>;

const CommunityReportOutputSchema = z.object({
  isHarmful: z
    .boolean()
    .describe(
      'Whether the message contains harmful content like harassment, bullying, or hate speech.'
    ),
  reason: z
    .string()
    .optional()
    .describe('A brief explanation if the content is deemed harmful.'),
});
export type CommunityReportOutput = z.infer<typeof CommunityReportOutputSchema>;

export async function analyzeCommunityReport(
  input: CommunityReportInput
): Promise<CommunityReportOutput> {
  return communityReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'communityReportPrompt',
  input: {schema: CommunityReportInputSchema},
  output: {schema: CommunityReportOutputSchema},
  prompt: `Analyze the following community message for harmful content, including but not limited to harassment, bullying, hate speech, and spam.

Message: {{{message}}}`,
});

const communityReportFlow = ai.defineFlow(
  {
    name: 'communityReportFlow',
    inputSchema: CommunityReportInputSchema,
    outputSchema: CommunityReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
