'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

const reports = [
  {
    id: '1',
    studentName: 'John Doe',
    date: '2023-10-27',
    status: 'Pending',
  },
  {
    id: '2',
    studentName: 'Jane Smith',
    date: '2023-10-26',
    status: 'Resolved',
  },
];

export function ReportList() {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'destructive';
      case 'Resolved':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>{report.studentName}</TableCell>
            <TableCell>{report.date}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(report.status)}>{report.status}</Badge>
            </TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
