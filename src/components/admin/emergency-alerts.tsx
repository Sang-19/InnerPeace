
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { EmergencyAlert } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, User } from 'lucide-react';

export function EmergencyAlerts() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'alerts'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as EmergencyAlert[];
      setAlerts(alertsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-muted-foreground">No new alerts.</p>
        ) : (
          <ul className="space-y-4">
            {alerts.map((alert) => (
              <li key={alert.id} className="rounded-lg bg-destructive/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-semibold">{alert.studentName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(alert.date.seconds * 1000).toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{alert.message}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
