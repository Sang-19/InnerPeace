import { CommunityReports } from '@/components/admin/community-reports';

export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Community Reports</h1>
      <p className="text-muted-foreground">Review and manage reports from the community chat.</p>
      <div className="mt-6">
        <CommunityReports />
      </div>
    </div>
  );
}
