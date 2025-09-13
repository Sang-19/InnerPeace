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
import { useState } from 'react';

export function EmergencyAlertButton() {
  const { toast } = useToast();
  const { appUser } = useAuth();
  const [isSending, setIsSending] = useState(false);

  const handleAlert = () => {
    if (!appUser) {
      console.error('EmergencyAlert: User not logged in');
      toast({
        variant: 'destructive',
        title: 'Not logged in',
        description: 'You must be logged in to send an alert.',
      });
      return;
    }

    console.log('EmergencyAlert: Starting alert process for user:', appUser.uid);
    setIsSending(true);

    if (!navigator.geolocation) {
      console.error('EmergencyAlert: Geolocation not supported');
      toast({ variant: 'destructive', title: 'Location Error', description: 'Geolocation is not supported by your browser.' });
      setIsSending(false);
      return;
    }

    console.log('EmergencyAlert: Getting user location...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
            const { latitude, longitude } = position.coords;
            const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
            
            console.log('EmergencyAlert: Location obtained, sending alert...');
    
            const formData = new FormData();
            formData.append('studentId', appUser.uid);
            formData.append('studentName', appUser.name);
            formData.append('studentEmail', appUser.email || 'N/A');
            formData.append('locationLink', locationLink);
            
            const result = await sendEmergencyAlert(formData);
            
            console.log('EmergencyAlert: Server response:', result);
    
            if (result.success) {
              console.log('EmergencyAlert: Alert sent successfully');
              toast({
                title: 'Emergency Alert Sent',
                description: 'Help is on the way. Campus security and administrators have been notified.',
                variant: 'default',
              });
            } else {
              throw new Error(result.error || 'Failed to send alert');
            }
        } catch (error) {
            console.error('EmergencyAlert: Error sending emergency alert:', error);
            toast({
              variant: 'destructive',
              title: 'Error',
              description: error instanceof Error ? error.message : 'Failed to send emergency alert. Please try again or contact support immediately.',
            });
        } finally {
            setIsSending(false);
        }
      },
      (error) => {
        console.error('EmergencyAlert: Location error:', error);
        toast({ 
          variant: 'destructive', 
          title: 'Location Error', 
          description: `Unable to retrieve your location: ${error.message}. Please ensure location services are enabled.` 
        });
        setIsSending(false);
      }
    );
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
            This will immediately send an emergency alert to the administrators and request your current location.
            Only use this in case of a genuine emergency.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleAlert} disabled={isSending}>
            {isSending ? 'Sending...' : 'Yes, send alert'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}