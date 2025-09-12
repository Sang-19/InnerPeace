import { StudentList } from '@/components/admin/student-list';

export default function StudentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Students</h1>
      <p className="text-muted-foreground">View and manage all registered students.</p>
      <div className="mt-6">
        <StudentList />
      </div>
    </div>
  );
}
