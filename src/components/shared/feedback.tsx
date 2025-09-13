'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Star } from 'lucide-react';

interface Feedback {
  id: string;
  studentName: string;
  feedback: string;
  rating: number;
  date: Date;
}

export function FeedbackList() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'feedback'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const feedbackData: Feedback[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        feedbackData.push({
          id: doc.id,
          studentName: data.studentName,
          feedback: data.feedback,
          rating: data.rating,
          date: data.date.toDate(),
        } as Feedback);
      });
      setFeedback(feedbackData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <Card key={item.id}>
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle>{item.studentName}</CardTitle>
              <div className="flex items-center gap-1 text-yellow-500">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
                {[...Array(5 - item.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5" />
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {item.date.toLocaleString()}
            </div>
          </CardHeader>
          <CardContent>
            <p>{item.feedback}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function FeedbackForm() {
  const { appUser } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser || !feedback || rating === 0) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide a rating and feedback.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        studentId: appUser.uid,
        studentName: appUser.name,
        rating,
        feedback,
        date: serverTimestamp(),
      });
      toast({ title: 'Feedback Submitted', description: 'Thank you for your feedback!' });
      setRating(0);
      setFeedback('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit feedback.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <p>Rating:</p>
            <div className="flex">
              {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                  <Star
                    key={ratingValue}
                    className={`h-6 w-6 cursor-pointer ${ratingValue <= rating ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
                    onClick={() => setRating(ratingValue)}
                  />
                );
              })}
            </div>
          </div>
          <Textarea
            placeholder="Tell us what you think..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
