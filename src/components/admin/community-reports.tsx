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
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  messageId: string;
  studentName: string;
  message: string;
  date: Date;
  status: string;
}

export function CommunityReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'community-reports'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsData: Report[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reportsData.push({
          id: doc.id,
          messageId: data.messageId,
          studentName: data.studentName,
          message: data.message,
          date: data.date.toDate(),
          status: data.status,
        } as Report);
      });
      setReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleResolve = async (reportId: string) => {
    const reportRef = doc(db, 'community-reports', reportId);
    try {
      await updateDoc(reportRef, { status: 'resolved' });
      toast({ title: 'Report Resolved', description: 'The report has been marked as resolved.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to resolve the report.' });
    }
  };

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
          <TableHead>Message</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>{report.studentName}</TableCell>
            <TableCell>{report.message}</TableCell>
            <TableCell>{report.date.toLocaleString()}</TableCell>
            <TableCell>
              <Badge variant={report.status === 'pending' ? 'destructive' : 'default'}>
                {report.status}
              </Badge>
            </TableCell>
            <TableCell>
              {report.status === 'pending' && (
                <Button onClick={() => handleResolve(report.id)} size="sm">
                  Mark as Resolved
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
