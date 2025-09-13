'use client';

import { useState } from 'react';
import { Mood } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useToast } from '@/hooks/use-toast';

const moods: Mood[] = ['Happy', 'Sad', 'Anxious', 'Angry', 'Neutral'];

export function MoodTracker() {
  const { appUser } = useAuth();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitMood = async () => {
    if (!selectedMood || !appUser) return;

    setIsSubmitting(true);
    try {
      // Add to mood-logs collection
      await addDoc(collection(db, 'mood-logs'), {
        userId: appUser.uid,
        mood: selectedMood,
        date: serverTimestamp(),
      });

      // Update the latest mood on the user's document
      const userRef = doc(db, 'users', appUser.uid);
      await updateDoc(userRef, {
        latestMood: {
          mood: selectedMood,
          date: serverTimestamp(),
        },
      });

      toast({ title: 'Mood Submitted', description: `You've selected ${selectedMood}.` });
      setSelectedMood(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit mood.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-center gap-4 mb-4">
        {moods.map((mood) => (
          <Button
            key={mood}
            variant={selectedMood === mood ? 'default' : 'outline'}
            onClick={() => setSelectedMood(mood)}
          >
            {mood}
          </Button>
        ))}
      </div>
      <Button
        onClick={submitMood}
        disabled={!selectedMood || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Mood'}
      </Button>
    </div>
  );
}
