'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Loader2 } from 'lucide-react';
import { AppUser } from '@/lib/types';

interface Alert {
  id: string;
  studentName: string;
  studentEmail: string;
  timestamp: Date;
}

export function EmergencyAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'alerts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const alertsData: Alert[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        alertsData.push({
          id: doc.id,
          studentName: data.studentName,
          studentEmail: data.studentEmail,
          timestamp: data.timestamp.toDate(),
        } as Alert);
      });
      setAlerts(alertsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student Name</TableHead>
          <TableHead>Student Email</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.map((alert) => (
          <TableRow key={alert.id}>
            <TableCell>{alert.studentName}</TableCell>
            <TableCell>{alert.studentEmail}</TableCell>
            <TableCell>{alert.timestamp.toLocaleString()}</TableCell>
            <TableCell>
              <Badge variant="destructive">Needs Action</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
