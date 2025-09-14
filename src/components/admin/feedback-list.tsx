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

const feedback = [
  {
    id: '1',
    studentName: 'Your name',
    date: '2023-10-27',
    rating: 5,
  },
  {
    id: '2',
    studentName: 'Jane Smith',
    date: '2023-10-26',
    rating: 4,
  },
];

export function FeedbackList() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {feedback.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.studentName}</TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell>
              <Badge variant="secondary">{item.rating} Stars</Badge>
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
