'use client';

import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Leaf, Wind, Walk, Eye } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import relaxationData from '@/lib/relaxation-guides.json';
import type { RelaxationGuide } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

export default function RelaxationPage() {
  const allGuides: RelaxationGuide[] = relaxationData.guides;
  const [activeTab, setActiveTab] = useState('all');

  const getIcon = (type: RelaxationGuide['type']) => {
    switch (type) {
      case 'breathing':
        return <Wind className="h-5 w-5 text-primary" />;
      case 'meditation':
        return <Leaf className="h-5 w-5 text-primary" />;
      case 'yoga':
        return <Leaf className="h-5 w-5 text-primary" />; // Using Leaf for yoga too
      case 'grounding':
        return <Eye className="h-5 w-5 text-primary" />;
      case 'walking':
        return <Walk className="h-5 w-5 text-primary" />;
      default:
        return null;
    }
  };

  const filteredGuides = activeTab === 'all' 
    ? allGuides 
    : allGuides.filter(guide => guide.type === activeTab);
  
  const guideCategories = ['all', ...Array.from(new Set(allGuides.map(g => g.type)))];

  return (
    <div className="space-y-6">
       <Card className="bg-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle>Find Your Calm</CardTitle>
          <CardDescription>
            Explore these guided exercises to relax your mind and body.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-4">
          {guideCategories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">{category}</TabsTrigger>
          ))}
        </TabsList>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {filteredGuides.map((guide) => {
              const guideImage = PlaceHolderImages.find((p) => p.id === guide.imageId);
              return (
                <Card key={guide.id} className="overflow-hidden">
                  {guideImage && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={guideImage.imageUrl}
                        alt={guide.title}
                        fill
                        className="object-cover"
                        data-ai-hint={guideImage.imageHint}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {getIcon(guide.type)}
                      <CardTitle>{guide.title}</CardTitle>
                    </div>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-4">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{guide.duration} minutes</span>
                    </div>
                    <Accordion type="single" collapsible>
                      <AccordionItem value="steps">
                        <AccordionTrigger>Show Steps</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-decimal list-inside space-y-2 pl-2">
                            {guide.steps.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>
      </Tabs>
    </div>
  );
}
