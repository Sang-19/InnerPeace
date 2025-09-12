'use server';

/**
 * @fileOverview Generates personalized daily support questions for students using GenAI.
 *
 * - generatePersonalizedQuestion - A function that generates a personalized support question.
 * - PersonalizedQuestionInput - The input type for the generatePersonalizedQuestion function.
 * - PersonalizedQuestionOutput - The return type for the generatePersonalizedQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedQuestionInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
  mood: z.string().describe('The current mood of the student (e.g., Happy, Neutral, Sad, Anxious, Angry).'),
});
export type PersonalizedQuestionInput = z.infer<typeof PersonalizedQuestionInputSchema>;

const PersonalizedQuestionOutputSchema = z.object({
  question: z.string().describe('A personalized support question for the student.'),
});
export type PersonalizedQuestionOutput = z.infer<typeof PersonalizedQuestionOutputSchema>;

export async function generatePersonalizedQuestion(input: PersonalizedQuestionInput): Promise<PersonalizedQuestionOutput> {
  return personalizedQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedQuestionPrompt',
  input: {schema: PersonalizedQuestionInputSchema},
  output: {schema: PersonalizedQuestionOutputSchema},
  prompt: `You are a mental health support assistant. Your goal is to provide a single personalized support question to the student based on their name and current mood.

Student Name: {{{studentName}}}
Current Mood: {{{mood}}}

Personalized Support Question:`, 
});

const personalizedQuestionFlow = ai.defineFlow(
  {
    name: 'personalizedQuestionFlow',
    inputSchema: PersonalizedQuestionInputSchema,
    outputSchema: PersonalizedQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
