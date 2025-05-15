import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { examService } from '@/services/api';
import { Exam } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';

const ExamSchedule: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const formatTime = (timeString: string) => {
    try {
      if (!timeString) return 'N/A';
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'p'); // Format as localized time (e.g., "1:30 PM")
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Time';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      return format(parseISO(dateString), 'PPP'); // Format as "May 25th, 2023"
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await examService.getAll();
      // Sort exams by date and time
      const sortedExams = data.sort((a, b) => {
        try {
          const dateA = parseISO(`${a.date}T${a.startTime || '00:00'}`);
          const dateB = parseISO(`${b.date}T${b.startTime || '00:00'}`);
          return dateA.getTime() - dateB.getTime();
        } catch (error) {
          console.error('Error sorting exams:', error);
          return 0;
        }
      });
      setExams(sortedExams);
    } catch (error) {
      console.error('Failed to load exams:', error);
      toast({
        title: 'Error',
        description: 'Failed to load exam schedule',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Exam Schedule</CardTitle>
          <CardDescription>View and manage upcoming examinations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>{exam.subject}</TableCell>
                  <TableCell>{formatDate(exam.date)}</TableCell>
                  <TableCell>
                    {exam.startTime && exam.endTime ? 
                      `${formatTime(exam.startTime)} - ${formatTime(exam.endTime)}` : 
                      'N/A'}
                  </TableCell>
                  <TableCell className="capitalize">{exam.exam_type || 'regular'}</TableCell>
                  <TableCell>{exam.semester || 'N/A'}</TableCell>
                  <TableCell className="capitalize">{exam.status || 'scheduled'}</TableCell>
                  <TableCell>
                    <Link to={`/exams/${exam.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {exams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                    No exams scheduled
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamSchedule;