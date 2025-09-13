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
    if (!selectedMood || !appUser) {
      console.error('MoodTracker: Cannot submit - missing data:', {
        selectedMood,
        appUser: !!appUser
      });
      return;
    }

    console.log('MoodTracker: Submitting mood:', selectedMood, 'for user:', appUser.uid);
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('userId', appUser.uid);
    formData.append('mood', selectedMood);
    
    try {
      const result = await submitMood(formData);
      
      if (result.success) {
        console.log('MoodTracker: Mood submitted successfully');
        toast({ title: 'Mood Submitted', description: `You've selected ${selectedMood}.` });
        setSelectedMood(null);
      } else {
        console.error('MoodTracker: Mood submission failed:', result.error);
        toast({ 
          variant: 'destructive', 
          title: 'Error', 
          description: result.error || 'Failed to submit mood.' 
        });
      }
    } catch (error) {
      console.error('MoodTracker: Unexpected error during mood submission:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: 'An unexpected error occurred. Please try again.' 
      });
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
