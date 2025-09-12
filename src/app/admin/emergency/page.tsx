import { EmergencyAlerts } from '@/components/admin/emergency-alerts';

export default function EmergencyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Emergency Alerts</h1>
      <p className="text-muted-foreground">View and manage all emergency alerts from students.</p>
      <div className="mt-6">
        <EmergencyAlerts />
      </div>
    </div>
  );
}
