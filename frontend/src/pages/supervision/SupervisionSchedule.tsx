import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { examService, facultyService } from '@/services/api';
import { Exam, Faculty } from '@/lib/types';
import { format } from 'date-fns';

const SupervisionSchedule: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [facultyData, examData] = await Promise.all([
        facultyService.getAll(),
        examService.getAll(),
      ]);

      // Filter faculty who can supervise
      const supervisors = facultyData.filter(f => !f.is_exam_coordinator);
      setFaculty(supervisors);

      // Filter scheduled exams
      const scheduledExams = examData.filter(e => e.status === 'scheduled');
      setExams(scheduledExams);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load supervision schedule',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Supervision Schedule</CardTitle>
          <CardDescription>View and manage faculty supervision schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Faculty Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Supervision Count</TableHead>
                <TableHead>Last Supervision</TableHead>
                <TableHead>Next Supervision</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculty.map((f) => {
                const facultyExams = exams.filter(e => e.faculty_ids?.includes(f.id));
                const nextExam = facultyExams
                  .filter(e => new Date(e.date) > new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

                return (
                  <TableRow key={f.id}>
                    <TableCell>{f.name}</TableCell>
                    <TableCell>{f.department}</TableCell>
                    <TableCell>{f.supervision_count_this_month || 0}</TableCell>
                    <TableCell>
                      {f.last_supervision_date
                        ? format(new Date(f.last_supervision_date), 'PPP')
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {nextExam
                        ? format(new Date(nextExam.date), 'PPP')
                        : 'Not Scheduled'}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Schedule
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisionSchedule; 