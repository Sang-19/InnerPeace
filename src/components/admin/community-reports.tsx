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
import { Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { approveReportedMessage, rejectReportedMessage } from '@/lib/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Report {
  id: string;
  messageId: string;
  studentName: string;
  message: string;
  date: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  adminComment?: string;
}

export function CommunityReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingReports, setProcessingReports] = useState<Set<string>>(new Set());
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');
  const { toast } = useToast();
  const { appUser } = useAuth();

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
          reviewedBy: data.reviewedBy,
          reviewedAt: data.reviewedAt?.toDate(),
          adminComment: data.adminComment,
        } as Report);
      });
      setReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openDialog = (report: Report, action: 'approve' | 'reject') => {
    setSelectedReport(report);
    setDialogAction(action);
    setAdminComment('');
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedReport || !appUser) return;
    
    setProcessingReports(prev => new Set(prev).add(selectedReport.id));
    
    const formData = new FormData();
    formData.append('reportId', selectedReport.id);
    formData.append('messageId', selectedReport.messageId);
    formData.append('adminId', appUser.uid);
    formData.append('adminName', appUser.name);
    formData.append('adminComment', adminComment);
    
    try {
      const result = await approveReportedMessage(formData);
      if (result.success) {
        toast({ title: 'Report Approved', description: result.message });
        setDialogOpen(false);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to approve the report.' });
    }
    
    setProcessingReports(prev => {
      const newSet = new Set(prev);
      newSet.delete(selectedReport.id);
      return newSet;
    });
  };

  const handleReject = async () => {
    if (!selectedReport || !appUser) return;
    
    setProcessingReports(prev => new Set(prev).add(selectedReport.id));
    
    const formData = new FormData();
    formData.append('reportId', selectedReport.id);
    formData.append('adminId', appUser.uid);
    formData.append('adminName', appUser.name);
    formData.append('adminComment', adminComment);
    
    try {
      const result = await rejectReportedMessage(formData);
      if (result.success) {
        toast({ title: 'Report Rejected', description: result.message });
        setDialogOpen(false);
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to reject the report.' });
    }
    
    setProcessingReports(prev => {
      const newSet = new Set(prev);
      newSet.delete(selectedReport.id);
      return newSet;
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'approved': return 'default';
      case 'rejected': return 'secondary';
      default: return 'outline';
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
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reviewed By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell>{report.studentName}</TableCell>
              <TableCell className="max-w-md truncate">
                {report.message.length > 100 ? 
                  `${report.message.substring(0, 100)}...` : 
                  report.message}
              </TableCell>
              <TableCell>{report.date.toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(report.status)}>
                  {report.status}
                </Badge>
              </TableCell>
              <TableCell>
                {report.reviewedBy ? (
                  <div className="text-sm">
                    <div>{report.reviewedBy}</div>
                    {report.reviewedAt && (
                      <div className="text-muted-foreground text-xs">
                        {report.reviewedAt.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {report.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => openDialog(report, 'approve')}
                        size="sm"
                        variant="destructive"
                        disabled={processingReports.has(report.id)}
                      >
                        {processingReports.has(report.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <><CheckCircle className="h-4 w-4 mr-1" />Remove</>
                        )}
                      </Button>
                      <Button
                        onClick={() => openDialog(report, 'reject')}
                        size="sm"
                        variant="outline"
                        disabled={processingReports.has(report.id)}
                      >
                        {processingReports.has(report.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <><XCircle className="h-4 w-4 mr-1" />Keep</>
                        )}
                      </Button>
                    </>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Full Message Content</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-60 overflow-y-auto">
                        <p className="text-sm whitespace-pre-wrap">{report.message}</p>
                      </div>
                      {report.adminComment && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Admin Comment:</p>
                          <p className="text-sm">{report.adminComment}</p>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'approve' ? 'Remove Message' : 'Keep Message'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'approve'
                ? 'This will hide the reported message from all users. This action cannot be undone.'
                : 'This will keep the message visible and mark the report as invalid.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="py-4">
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Reported Message:</p>
                <p className="text-sm whitespace-pre-wrap">{selectedReport.message}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Admin Comment (Optional)
                </label>
                <Textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  placeholder="Add a comment explaining your decision..."
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={dialogAction === 'approve' ? handleApprove : handleReject}
              variant={dialogAction === 'approve' ? 'destructive' : 'default'}
            >
              {dialogAction === 'approve' ? 'Remove Message' : 'Keep Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
