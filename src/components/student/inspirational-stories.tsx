'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import storiesData from '@/lib/inspirational-stories.json';
import { BookOpen } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  content: string;
}

export function InspirationalStories() {
  const stories: Story[] = storiesData.stories;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inspirational Stories</CardTitle>
        <CardDescription>Read some stories to find comfort and inspiration.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {stories.map((story) => (
            <AccordionItem value={story.id} key={story.id}>
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-left">{story.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="whitespace-pre-wrap pl-2 text-muted-foreground">{story.content}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
