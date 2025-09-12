import { FeedbackList } from '@/components/admin/feedback-list';

export default function FeedbackPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Feedback</h1>
      <p className="text-muted-foreground">View and manage all user feedback.</p>
      <div className="mt-6">
        <FeedbackList />
      </div>
    </div>
  );
}
