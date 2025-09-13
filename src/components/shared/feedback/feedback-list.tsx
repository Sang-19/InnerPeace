'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Feedback } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function FeedbackList() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'feedback'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const feedbackData: Feedback[] = [];
      querySnapshot.forEach((doc) => {
        feedbackData.push({ ...doc.data(), id: doc.id } as Feedback);
      });
      setFeedback(feedbackData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getSentimentVariant = (sentiment: 'Positive' | 'Neutral' | 'Negative') => {
    switch (sentiment) {
      case 'Positive':
        return 'default';
      case 'Negative':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <Card key={item.id}>
          <CardHeader className="flex flex-row justify-between items-start pb-2">
            <div className="space-y-1">
                <CardTitle className="text-sm font-medium">{item.studentName}</CardTitle>
                <time className="text-xs text-muted-foreground">
                    {formatDistanceToNow(item.date, { addSuffix: true })}
                </time>
            </div>
            <Badge variant={getSentimentVariant(item.sentiment)}>{item.sentiment}</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{item.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
