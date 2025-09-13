// A 24/7 AI chatbot that uses the Gemini API to provide mental health support, suggest relaxation techniques, answer questions, and offer motivational tips.
'use server';
/**
 * @fileOverview An AI chatbot to provide mental health support to students.
 *
 * - aiChatbotAssistance - A function that provides mental health support to students.
 * - AIChatbotAssistanceInput - The input type for the aiChatbotAssistance function.
 * - AIChatbotAssistanceOutput - The return type for the aiChatbotAssistance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatbotAssistanceInputSchema = z.object({
  message: z.string().describe('The message from the student.'),
});
export type AIChatbotAssistanceInput = z.infer<typeof AIChatbotAssistanceInputSchema>;

const AIChatbotAssistanceOutputSchema = z.object({
  response: z.string().describe('The response from the AI chatbot.'),
});
export type AIChatbotAssistanceOutput = z.infer<typeof AIChatbotAssistanceOutputSchema>;

export async function aiChatbotAssistance(input: AIChatbotAssistanceInput): Promise<AIChatbotAssistanceOutput> {
  return aiChatbotAssistanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatbotAssistancePrompt',
  input: {schema: AIChatbotAssistanceInputSchema},
  output: {schema: AIChatbotAssistanceOutputSchema},
  prompt: `You are a mental health support chatbot for college students. Your goal is to provide support, suggest relaxation techniques, answer questions, and offer motivational tips.  If a student indicates they are having an emergency, suggest they contact their emergency contact. If they don't know who that is, suggest they contact the emergency helpline.

Student message: {{{message}}}`,
});

const aiChatbotAssistanceFlow = ai.defineFlow(
  {
    name: 'aiChatbotAssistanceFlow',
    inputSchema: AIChatbotAssistanceInputSchema,
    outputSchema: AIChatbotAssistanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

// Book name correction schemas
const BookNameCorrectionInputSchema = z.object({
  bookQuery: z.string().describe('The book name or query from the user.'),
});
export type BookNameCorrectionInput = z.infer<typeof BookNameCorrectionInputSchema>;

const BookNameCorrectionOutputSchema = z.object({
  correctedName: z.string().describe('The corrected, exact book name.'),
});
export type BookNameCorrectionOutput = z.infer<typeof BookNameCorrectionOutputSchema>;

// Gemini prompt for correction
const bookNameCorrectionPrompt = ai.definePrompt({
  name: 'bookNameCorrectionPrompt',
  input: { schema: BookNameCorrectionInputSchema },
  output: { schema: BookNameCorrectionOutputSchema },
  prompt: `You are a helpful assistant. Given a possibly misspelled book name, return the exact correct book title. Only return the corrected book name.

User query: {{{bookQuery}}}`,
});

// Correction flow
export async function correctBookName(input: BookNameCorrectionInput): Promise<BookNameCorrectionOutput> {
  const { output } = await bookNameCorrectionPrompt(input);
  return output!;
}
