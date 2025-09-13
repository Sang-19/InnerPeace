'use client';

import { useState } from 'react';
import { Mood } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { submitMood } from '@/lib/actions';
import { Loader2 } from 'lucide-react';

const moods: { mood: Mood, emoji: string }[] = [
    { mood: 'Happy', emoji: '😊' },
    { mood: 'Sad', emoji: '😢' },
    { mood: 'Anxious', emoji: '😟' },
    { mood: 'Angry', emoji: '😡' },
    { mood: 'Neutral', emoji: '😐' },
];

export function MoodTracker() {
  const { appUser } = useAuth();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitMood = async () => {
    if (!selectedMood || !appUser) return;

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('userId', appUser.uid);
    formData.append('mood', selectedMood);
    
    const result = await submitMood(formData);
    
    if (result.success) {
      toast({ title: 'Mood Submitted', description: `You've selected ${selectedMood}.` });
      setSelectedMood(null);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit mood.' });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-around gap-2">
        {moods.map(({ mood, emoji }) => (
          <Button
            key={mood}
            variant={selectedMood === mood ? 'default' : 'outline'}
            size="icon"
            className="text-2xl h-12 w-12 rounded-full"
            onClick={() => setSelectedMood(mood)}
            aria-label={mood}
          >
            {emoji}
          </Button>
        ))}
      </div>
      <Button
        onClick={handleSubmitMood}
        disabled={!selectedMood || isSubmitting}
        className="w-full"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Mood
      </Button>
    </div>
  );
}
