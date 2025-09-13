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
import { Loader2, MapPin, Check, Mail, Phone } from 'lucide-react';
import { AppUser } from '@/lib/types';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { resolveEmergencyAlert } from '@/lib/actions';
import Link from 'next/link';

interface Alert {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  timestamp: Date;
  locationLink?: string;
  status: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export function EmergencyAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingIds, setResolvingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { appUser } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'alerts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const alertsData: Alert[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        alertsData.push({
          id: doc.id,
          studentId: data.studentId,
          studentName: data.studentName,
          studentEmail: data.studentEmail,
          timestamp: data.timestamp.toDate(),
          locationLink: data.locationLink,
          status: data.status || 'pending',
          resolvedAt: data.resolvedAt?.toDate(),
          resolvedBy: data.resolvedBy,
        } as Alert);
      });
      setAlerts(alertsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleResolveAlert = async (alertId: string) => {
    if (!appUser) return;

    setResolvingIds(prev => new Set(prev).add(alertId));

    const formData = new FormData();
    formData.append('alertId', alertId);
    formData.append('adminId', appUser.uid);
    formData.append('adminName', appUser.name);

    try {
      const result = await resolveEmergencyAlert(formData);
      if (result.success) {
        toast({
          title: 'Alert Resolved',
          description: 'Emergency alert has been marked as resolved.',
        });
      } else {
        throw new Error(result.error || 'Failed to resolve alert');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to resolve alert. Please try again.',
      });
    } finally {
      setResolvingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(alertId);
        return newSet;
      });
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
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No emergency alerts at this time.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Student Email</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id} className={alert.status === 'resolved' ? 'opacity-60' : ''}>
                <TableCell className="font-medium">{alert.studentName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${alert.studentEmail}`} className="text-blue-600 hover:underline">
                      {alert.studentEmail}
                    </a>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{alert.timestamp.toLocaleDateString()}</div>
                    <div className="text-muted-foreground">{alert.timestamp.toLocaleTimeString()}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {alert.locationLink ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={alert.locationLink} target="_blank" rel="noopener noreferrer">
                        <MapPin className="mr-2 h-4 w-4" /> View Location
                      </Link>
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">Not provided</span>
                  )}
                </TableCell>
                <TableCell>
                  {alert.status === 'resolved' ? (
                    <div className="space-y-1">
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <Check className="mr-1 h-3 w-3" /> Resolved
                      </Badge>
                      {alert.resolvedBy && (
                        <div className="text-xs text-muted-foreground">
                          by {alert.resolvedBy}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Badge variant="destructive">Needs Action</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {alert.status !== 'resolved' && (
                      <Button
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id)}
                        disabled={resolvingIds.has(alert.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {resolvingIds.has(alert.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="mr-1 h-4 w-4" />
                            Resolve
                          </>
                        )}
                      </Button>
                    )}
                    <Button asChild variant="outline" size="sm">
                      <a href={`tel:${alert.studentEmail}`}>
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
