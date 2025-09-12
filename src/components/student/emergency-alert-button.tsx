'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { sendEmergencyAlert } from '@/lib/actions';
import { Siren } from 'lucide-react';

export function EmergencyAlertButton() {
  const { toast } = useToast();
  const { appUser } = useAuth();

  const handleAlert = async () => {
    if (!appUser) {
      toast({
        variant: 'destructive',
        title: 'Not logged in',
        description: 'You must be logged in to send an alert.',
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('studentId', appUser.uid);
    formData.append('studentName', appUser.name);
    
    const result = await sendEmergencyAlert(formData);

    if (result.success) {
      toast({
        title: 'Alert Sent',
        description: 'Help is on the way. An admin has been notified.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="flex items-center gap-2">
          <Siren className="h-4 w-4" />
          <span>Emergency Alert</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will immediately send an emergency alert to the administrators.
            Only use this in case of a genuine emergency.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAlert}>
            Yes, send alert
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
