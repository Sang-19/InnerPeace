'use client';

import { FeedbackList } from "@/components/shared/feedback/feedback-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cleanupFeedbackData } from "@/lib/utils/cleanup-feedback";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2, Database } from "lucide-react";

export default function FeedbackPage() {
  const { toast } = useToast();
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  const handleCleanup = async () => {
    setIsCleaningUp(true);
    try {
      const result = await cleanupFeedbackData();
      if (result.success) {
        toast({
          title: 'Cleanup Completed',
          description: `Processed: ${result.processed}, Updated: ${result.updated}, Deleted: ${result.deleted}`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Cleanup Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Student Feedback</h1>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCleanup}
            disabled={isCleaningUp}
          >
            {isCleaningUp ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            {isCleaningUp ? 'Cleaning...' : 'Cleanup Data'}
          </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Browse through the latest feedback submitted by students.</CardDescription>
            </CardHeader>
            <CardContent>
                <FeedbackList />
            </CardContent>
        </Card>
    </div>
  );
}
