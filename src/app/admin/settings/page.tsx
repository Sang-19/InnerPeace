import { SettingsForm } from '@/components/admin/settings-form';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your admin account and application settings.</p>
      </div>
      <Separator />

      <SettingsForm />

      <Card>
        <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the app.</CardDescription>
        </CardHeader>
        <CardContent>
            <ThemeToggle />
        </CardContent>
      </Card>
    </div>
  );
}
