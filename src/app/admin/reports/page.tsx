import { ReportList } from '@/components/admin/report-list';

export default function ReportsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="text-muted-foreground">View and manage all user-generated reports.</p>
      <div className="mt-6">
        <ReportList />
      </div>
    </div>
  );
}
