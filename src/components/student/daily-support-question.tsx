'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { generatePersonalizedQuestion, PersonalizedQuestionInput } from '@/ai/flows/personalized-support-questions';
import { Loader2 } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

export function DailySupportQuestion() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const { appUser } = useAuth();

  useEffect(() => {
    async function fetchQuestion() {
      if (appUser) {
        try {
          // In a real app, mood would be dynamic
          const input: PersonalizedQuestionInput = { studentName: appUser.name, mood: 'Neutral' };
          const result = await generatePersonalizedQuestion(input);
          setQuestion(result.question);
        } catch (error) {
          setQuestion('What is one thing you are grateful for today?');
        } finally {
          setLoading(false);
        }
      }
    }

    fetchQuestion();
  }, [appUser]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>A Moment for You</CardTitle>
        <CardDescription>Take a moment to reflect on your day.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Generating your daily question...</p>
          </div>
        ) : (
          <p className="font-semibold">{question}</p>
        )}
        <Textarea placeholder="Write your thoughts here... (private to you)" />
        <Button>Save Reflection</Button>
      </CardContent>
    </Card>
  );
}
