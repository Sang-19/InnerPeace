'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Feedback } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Helper function to map rating to sentiment for backward compatibility
const mapRatingToSentiment = (rating: number): 'Positive' | 'Neutral' | 'Negative' => {
  if (rating >= 4) return 'Positive';
  if (rating <= 2) return 'Negative';
  return 'Neutral';
};

export function FeedbackList() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'feedback'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const feedbackData: Feedback[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        try {
          // Safely convert Firebase Timestamp to Date
          let convertedDate: Date;
          if (data.date && typeof data.date.toDate === 'function') {
            // Firebase Timestamp object
            convertedDate = data.date.toDate();
          } else if (data.date instanceof Date) {
            // Already a Date object
            convertedDate = data.date;
          } else if (data.date) {
            // Try to parse as date string or number
            convertedDate = new Date(data.date);
          } else {
            // Fallback to current date if no date provided
            convertedDate = new Date();
            console.warn('Feedback document missing date field:', doc.id);
          }

          // Validate the date
          if (isNaN(convertedDate.getTime())) {
            console.warn('Invalid date in feedback document:', doc.id, data.date);
            convertedDate = new Date(); // Use current date as fallback
          }

          // Handle both new format (message + sentiment) and old format (feedback + rating)
          const message = data.message || data.feedback || 'No message';
          const sentiment = data.sentiment || (data.rating ? mapRatingToSentiment(data.rating) : 'Neutral');
          
          feedbackData.push({
            id: doc.id,
            studentId: data.studentId || 'unknown',
            studentName: data.studentName || 'Anonymous',
            message: message,
            date: convertedDate,
            sentiment: sentiment,
            // Include original fields for compatibility
            rating: data.rating,
            feedback: data.feedback
          } as Feedback);
        } catch (error) {
          console.error('Error processing feedback document:', doc.id, error);
          // Skip this document if there's an error
        }
      });
      
      console.log('Loaded feedback data:', feedbackData);
      console.log('Sample feedback items for debugging:', feedbackData.slice(0, 3).map(item => ({
        id: item.id,
        hasMessage: !!item.message,
        hasFeedback: !!item.feedback,
        hasRating: !!item.rating,
        hasSentiment: !!item.sentiment,
        dateType: typeof item.date,
        dateValue: item.date,
        isValidDate: !isNaN(item.date?.getTime())
      })));
      setFeedback(feedbackData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching feedback:', error);
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

  const formatSafeDate = (date: Date): string => {
    try {
      if (!date || isNaN(date.getTime())) {
        return 'Unknown time';
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Invalid date';
    }
  };

  if (feedback.length === 0 && !loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No feedback submitted yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => {
        if (!item || !item.id) {
          console.warn('Invalid feedback item:', item);
          return null;
        }

        return (
          <Card key={item.id}>
            <CardHeader className="flex flex-row justify-between items-start pb-2">
              <div className="space-y-1">
                  <CardTitle className="text-sm font-medium">{item.studentName || 'Anonymous'}</CardTitle>
                  <time className="text-xs text-muted-foreground">
                      {formatSafeDate(item.date)}
                  </time>
                  {item.rating && (
                    <div className="text-xs text-muted-foreground">
                      Rating: {item.rating}/5 ⭐
                    </div>
                  )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={getSentimentVariant(item.sentiment)}>{item.sentiment}</Badge>
                {item.rating && (
                  <span className="text-xs text-muted-foreground">{item.rating} stars</span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.message || 'No message provided'}</p>
            </CardContent>
          </Card>
        );
      }).filter(Boolean)}
    </div>
  );
}
