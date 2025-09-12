'use server';

/**
 * @fileOverview Generates a personalized daily support quiz for students using GenAI.
 *
 * - generatePersonalizedQuestion - A function that generates a personalized support quiz.
 * - PersonalizedQuestionInput - The input type for the generatePersonalizedQuestion function.
 * - PersonalizedQuestionOutput - The return type for the generatePersonalizedQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedQuestionInputSchema = z.object({
  studentName: z.string().describe('The name of the student.'),
});
export type PersonalizedQuestionInput = z.infer<typeof PersonalizedQuestionInputSchema>;

const QuizQuestionSchema = z.object({
    question: z.string(),
    options: z.array(z.object({
        text: z.string(),
        mood: z.enum(['Happy', 'Neutral', 'Sad', 'Anxious', 'Angry']),
    })).length(4),
});

const PersonalizedQuestionOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).max(3).describe('A short quiz of up to 3 questions.'),
});
export type PersonalizedQuestionOutput = z.infer<typeof PersonalizedQuestionOutputSchema>;

export async function generatePersonalizedQuestion(input: PersonalizedQuestionInput): Promise<PersonalizedQuestionOutput> {
  return personalizedQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedQuestionPrompt',
  input: {schema: PersonalizedQuestionInputSchema},
  output: {schema: PersonalizedQuestionOutputSchema},
  prompt: `You are a mental health support assistant. Your goal is to generate a short, personalized daily quiz for a student to help them reflect on their feelings. The quiz should have a maximum of 3 multiple-choice questions. Each question must have exactly 4 options, and each option must be tied to one of the following moods: 'Happy', 'Neutral', 'Sad', 'Anxious', 'Angry'.

It is critical that the 'mood' field for each option is ONLY one of the five allowed values.

Student Name: {{{studentName}}}

Generate the quiz questions and options.`,
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
