'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { Users, ShieldAlert, MessageSquareWarning } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DashboardStats() {
  const [studentCount, setStudentCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);

  useEffect(() => {
    // Listen for student count
    const studentQuery = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubscribeStudents = onSnapshot(studentQuery, (snapshot) => {
      setStudentCount(snapshot.size);
    });

    // Listen for pending alerts
    const alertQuery = query(collection(db, 'alerts'), where('status', '==', 'pending'));
    const unsubscribeAlerts = onSnapshot(alertQuery, (snapshot) => {
      setAlertCount(snapshot.size);
    });

    // Listen for pending reports
    const reportQuery = query(collection(db, 'community-reports'), where('status', '==', 'pending'));
    const unsubscribeReports = onSnapshot(reportQuery, (snapshot) => {
      setReportCount(snapshot.size);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeAlerts();
      unsubscribeReports();
    };
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{studentCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Alerts</CardTitle>
          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{alertCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
          <MessageSquareWarning className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{reportCount}</div>
        </CardContent>
      </Card>
    </div>
  );
}
