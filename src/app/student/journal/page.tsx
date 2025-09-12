'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { addJournalEntry } from '@/lib/actions';
import { JournalEntry } from '@/lib/types';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Book } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function JournalPage() {
  const { appUser } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (appUser) {
      const q = query(collection(db, `users/${appUser.uid}/journalEntries`), orderBy('date', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userEntries: JournalEntry[] = [];
        snapshot.forEach((doc) => {
          userEntries.push({ id: doc.id, ...doc.data() } as JournalEntry);
        });
        setEntries(userEntries);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [appUser]);

  const handleSubmit = async () => {
    if (content.trim() === '' || !appUser) return;
    setSubmitting(true);
    const formData = new FormData();
    formData.append('userId', appUser.uid);
    formData.append('content', content);
    
    const result = await addJournalEntry(formData);
    if (result.success) {
      toast({ title: 'Success', description: 'Journal entry saved.' });
      setContent('');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Personal Journal</CardTitle>
          <CardDescription>A private space for your thoughts and reflections.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's on your mind today?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Entry
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Past Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : entries.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-6">
                {entries.map((entry) => (
                  <div key={entry.id} className="p-4 rounded-lg border bg-card">
                    <p className="text-sm text-muted-foreground mb-2">
                      {entry.date ? format(new Date(entry.date.seconds * 1000), 'MMMM d, yyyy') : 'Just now'}
                    </p>
                    <p className="whitespace-pre-wrap">{entry.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <Book className="mx-auto h-12 w-12" />
              <p className="mt-4">You haven't written any journal entries yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
