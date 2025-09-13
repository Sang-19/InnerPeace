import { FeedbackForm } from "@/components/shared/feedback/feedback-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FeedbackPage() {
  return (
    <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Submit Feedback</h1>
        <Card>
            <CardHeader>
                <CardTitle>Share Your Thoughts</CardTitle>
                <CardDescription>Your feedback is important to us. Let us know how we can improve.</CardDescription>
            </CardHeader>
            <CardContent>
                <FeedbackForm />
            </CardContent>
        </Card>
    </div>
  );
}
