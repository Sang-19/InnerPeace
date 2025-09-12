'use server';

/**
 * @fileOverview Scans community/chat messages for harmful or abusive content using generative AI.
 *
 * - analyzeCommunityReport - A function that analyzes community reports.
 * - AnalyzeCommunityReportInput - The input type for the analyzeCommunityReport function.
 * - AnalyzeCommunityReportOutput - The return type for the analyzeCommunityReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCommunityReportInputSchema = z.object({
  message: z.string().describe('The community message to analyze.'),
});
export type AnalyzeCommunityReportInput = z.infer<
  typeof AnalyzeCommunityReportInputSchema
>;

const AnalyzeCommunityReportOutputSchema = z.object({
  isHarmful: z
    .boolean()
    .describe('Whether the message is considered harmful or abusive.'),
  reason: z
    .string()
    .describe('The reason why the message is considered harmful.'),
});
export type AnalyzeCommunityReportOutput = z.infer<
  typeof AnalyzeCommunityReportOutputSchema
>;

export async function analyzeCommunityReport(
  input: AnalyzeCommunityReportInput
): Promise<AnalyzeCommunityReportOutput> {
  return analyzeCommunityReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'communityReportAnalysisPrompt',
  input: {schema: AnalyzeCommunityReportInputSchema},
  output: {schema: AnalyzeCommunityReportOutputSchema},
  prompt: `You are an AI assistant specializing in identifying harmful or abusive content in community messages.

  Analyze the following message and determine if it is harmful or abusive. Provide a reason for your determination.

  Message: {{{message}}}
  \n\
  Respond in JSON format with 'isHarmful' set to true if the message is harmful and 'reason' explaining why. If not harmful, set 'isHarmful' to false and provide a short explanation.
  `,
});

const analyzeCommunityReportFlow = ai.defineFlow(
  {
    name: 'analyzeCommunityReportFlow',
    inputSchema: AnalyzeCommunityReportInputSchema,
    outputSchema: AnalyzeCommunityReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
