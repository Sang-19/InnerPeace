'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { analyzeSentiment } from '@/ai/flows/sentiment-analysis';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const feedbackSchema = z.object({
  message: z.string().min(10, 'Feedback must be at least 10 characters long.'),
});

export function FeedbackForm() {
  const { appUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
        message: "",
    }
  });

  const onSubmit = async (values: z.infer<typeof feedbackSchema>) => {
    if (!appUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit feedback.' });
        return;
    }

    setIsSubmitting(true);
    try {
      const sentimentAnalysis = await analyzeSentiment({ inputText: values.message });
      
      await addDoc(collection(db, 'feedback'), {
        studentId: appUser.uid,
        studentName: appUser.name,
        message: values.message,
        date: serverTimestamp(),
        sentiment: sentimentAnalysis.sentiment,
      });

      toast({ title: 'Feedback Submitted', description: 'Thank you for your valuable feedback!' });
      form.reset();
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit feedback.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Feedback</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your thoughts, suggestions, or concerns..."
                  className="resize-none"
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
        </form>
    </Form>
  );
}
