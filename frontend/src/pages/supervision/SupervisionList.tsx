import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { examService } from '@/services/api';
import { Exam } from '@/lib/types';
import { format } from 'date-fns';

const SupervisionList: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await examService.getAll();
      // Only show scheduled exams
      const scheduledExams = data.filter(exam => exam.status === 'scheduled');
      setExams(scheduledExams);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load exams',
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
          <CardTitle>Exam Supervision</CardTitle>
          <CardDescription>Manage exam supervision duties</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Required Supervisors</TableHead>
                <TableHead>Assigned Supervisors</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>{exam.subject}</TableCell>
                  <TableCell>{format(new Date(exam.date), 'PPP')}</TableCell>
                  <TableCell>
                    {format(new Date(`2000-01-01T${exam.startTime}`), 'p')} -{' '}
                    {format(new Date(`2000-01-01T${exam.endTime}`), 'p')}
                  </TableCell>
                  <TableCell>{exam.required_supervisors || 2}</TableCell>
                  <TableCell>{exam.faculty_ids?.length || 0}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Assign Supervisors
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisionList; 