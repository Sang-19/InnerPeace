import { SettingsForm } from '@/components/admin/settings-form';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground">Manage your admin account and application settings.</p>
      <div className="mt-6">
        <SettingsForm />
      </div>
    </div>
  );
}
