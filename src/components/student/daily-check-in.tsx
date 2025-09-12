'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mood } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { submitMood } from '@/lib/actions';

const moods: { name: Mood; emoji: string }[] = [
  { name: 'Happy', emoji: '😄' },
  { name: 'Neutral', emoji: '😐' },
  { name: 'Sad', emoji: '😔' },
  { name: 'Anxious', emoji: '😟' },
  { name: 'Angry', emoji: '😠' },
];

export function DailyCheckIn() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const { appUser } = useAuth();
  const { toast } = useToast();
  
  const handleSubmit = async () => {
    if (!selectedMood || !appUser) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please select a mood and ensure you are logged in.",
        });
        return;
    }

    const formData = new FormData();
    formData.append('userId', appUser.uid);
    formData.append('mood', selectedMood);

    const result = await submitMood(formData);

    if (result.success) {
        toast({
            title: "Mood logged!",
            description: "Thanks for checking in. Your mood has been recorded.",
        });
        setSelectedMood(null);
    } else {
        toast({
            variant: "destructive",
            title: "Submission failed",
            description: result.error,
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Check-in</CardTitle>
        <CardDescription>How are you feeling today?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {moods.map((mood) => (
            <Button
              key={mood.name}
              variant={selectedMood === mood.name ? 'default' : 'outline'}
              size="icon"
              className="h-14 w-14 text-2xl"
              onClick={() => setSelectedMood(mood.name)}
            >
              {mood.emoji}
              <span className="sr-only">{mood.name}</span>
            </Button>
          ))}
        </div>
        <Button className="w-full" onClick={handleSubmit} disabled={!selectedMood}>
          Submit Mood
        </Button>
      </CardContent>
    </Card>
  );
}
