'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send, ShieldAlert, ShieldCheck } from 'lucide-react';
import { CommunityMessage } from '@/lib/types';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { sendCommunityMessage } from '@/lib/actions';
import { CommunityChatMessage } from '@/components/student/community-chat-message';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CommunityPage() {
  const { appUser } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'community-chat'), orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: CommunityMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Show all messages except those hidden by admin approval
        // This includes 'visible', 'reported' (still visible until admin review)
        // But excludes 'hidden' (admin-approved for removal)
        if (data.status !== 'hidden') {
           msgs.push({ id: doc.id, ...data } as CommunityMessage);
        }
      });
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
        setTimeout(() => {
            if (scrollAreaRef.current) {
                scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
            }
        }, 100);
    }
  }, [messages]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !appUser) return;
    
    setSending(true);
    const formData = new FormData();
    formData.append('senderId', appUser.uid);
    formData.append('message', newMessage);

    const result = await sendCommunityMessage(formData);
    
    if (result.error) {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    } else {
      setNewMessage('');
      if (result.warning) {
        toast({ title: 'A friendly reminder', description: result.success });
      }
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh_-_10rem)]">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Community Space</CardTitle>
          <CardDescription>A safe and anonymous space to share and connect.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
            <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>You are anonymous</AlertTitle>
                <AlertDescription>
                    Your name and identity are not shared in this chat. Please be respectful and supportive.
                </AlertDescription>
            </Alert>
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                messages.map((msg) => (
                  <CommunityChatMessage key={msg.id} message={msg} />
                ))
              )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Share your thoughts anonymously..."
              disabled={sending}
            />
            <Button type="submit" disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
