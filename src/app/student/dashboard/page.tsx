import { MoodTracker } from "@/components/student/mood-tracker";
import { EmergencyAlertButton } from "@/components/student/emergency-alert-button";
import { WeeklyMoodGraph } from "@/components/student/weekly-mood-graph";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, HeartPulse, MessageSquare } from "lucide-react";
import Link from "next/link";
import { MindfulBreathing } from "@/components/student/mindful-breathing";

export default function StudentDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Your Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your daily overview.</p>
        </div>
        <EmergencyAlertButton />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Mood</CardTitle>
              <CardDescription>A visualization of your mood throughout the week.</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyMoodGraph />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Mindful Peace Game</CardTitle>
              <CardDescription>A simple exercise to calm your mind.</CardDescription>
            </CardHeader>
            <CardContent>
              <MindfulBreathing />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
           <Card>
            <CardHeader>
              <CardTitle>Daily Check-in</CardTitle>
              <CardDescription>How are you feeling today?</CardDescription>
            </CardHeader>
            <CardContent>
              <MoodTracker />
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Link href="/student/journal">
                <Button variant="outline" className="w-full justify-start">
                  <Book className="mr-2 h-4 w-4" />
                  Write in Journal
                </Button>
              </Link>
              <Link href="/student/relaxation">
                <Button variant="outline" className="w-full justify-start">
                  <HeartPulse className="mr-2 h-4 w-4" />
                  Relaxation Exercises
                </Button>
              </Link>
              <Link href="/student/feedback">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Submit Feedback
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
