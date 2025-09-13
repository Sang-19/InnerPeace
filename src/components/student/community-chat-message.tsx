'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { CommunityMessage } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Flag, Loader2, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { reportCommunityMessage } from '@/lib/actions';
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

interface CommunityChatMessageProps {
  message: CommunityMessage;
}

export function CommunityChatMessage({ message }: CommunityChatMessageProps) {
  const { appUser } = useAuth();
  const { toast } = useToast();
  const [isReporting, setIsReporting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!message.isHarmful);
  const isMyMessage = message.senderId === appUser?.uid;

  const handleReport = async () => {
    if (!appUser) return;
    setIsReporting(true);

    const formData = new FormData();
    formData.append('messageId', message.id);
    formData.append('studentId', appUser.uid);
    formData.append('studentName', appUser.name);
    formData.append('message', message.message);
    
    const result = await reportCommunityMessage(formData);
    
    if (result.success) {
      toast({ title: 'Message Reported', description: 'Thank you for helping keep our community safe.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsReporting(false);
  };
  
  const formattedTimestamp = message.timestamp
    ? formatDistanceToNow(new Date(message.timestamp.seconds * 1000), { addSuffix: true })
    : 'just now';

  return (
    <div className={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
          isMyMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'
        } ${message.isHarmful && 'border-destructive/50 border'}`}
      >
        {message.isHarmful && (
            <div className="flex items-center justify-between gap-2 text-destructive-foreground/80 border-b border-destructive-foreground/20 pb-2 mb-2">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    <p className="text-xs font-semibold">Potentially harmful content</p>
                </div>
                <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent hover:text-inherit" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
        )}
        {isExpanded && <p className="whitespace-pre-wrap">{message.message}</p>}
        <div className={`text-xs mt-2 flex items-center justify-between gap-4 ${isMyMessage ? 'text-primary-foreground/70' : 'text-muted-foreground/70'}`}>
            <span>{formattedTimestamp}</span>
            {!isMyMessage && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-auto p-0 hover:bg-transparent hover:text-inherit">
                            <Flag className="h-3 w-3 mr-1" /> Report
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Report this message?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will flag the message for review by an administrator. Are you sure you want to report it?
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReport} disabled={isReporting}>
                            {isReporting ? <Loader2 className="animate-spin" /> : 'Yes, Report'}
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
      </div>
    </div>
  );
}
