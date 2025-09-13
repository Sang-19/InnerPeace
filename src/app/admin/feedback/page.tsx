import { FeedbackList } from "@/components/shared/feedback/feedback-list";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeedbackPage() {
  return (
    <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Student Feedback</h1>
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
