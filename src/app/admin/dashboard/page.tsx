import { DashboardStats } from "@/components/admin/dashboard-stats";
import { StudentList } from "@/components/admin/student-list";
import { EmergencyAlerts } from "@/components/admin/emergency-alerts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardStats />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
            <CardDescription>An overview of recently registered students.</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentList />
          </CardContent>
        </Card>
        <Card className="lg:col-span-1">
           <CardHeader>
            <CardTitle>Recent Emergency Alerts</CardTitle>
            <CardDescription>An overview of recent emergency alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <EmergencyAlerts />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
