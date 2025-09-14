import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and app preferences.</p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue="Your name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="email@domain" disabled />
          </div>
           <div className="grid gap-2">
            <Label htmlFor="contact">Emergency Contact (Phone)</Label>
            <Input id="contact" type="tel" placeholder="Enter phone number" />
          </div>
          <Button>Update Profile</Button>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Choose how you want to be notified.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="daily-reminder" className="text-base">Daily Check-in Reminders</Label>
              <p className="text-sm text-muted-foreground">Receive a push notification to log your mood daily.</p>
            </div>
            <Switch id="daily-reminder" defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
                <Label htmlFor="community-notifs" className="text-base">Community Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified about new messages in the community space.</p>
            </div>
            <Switch id="community-notifs" />
          </div>
        </CardContent>
      </Card>
      
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
