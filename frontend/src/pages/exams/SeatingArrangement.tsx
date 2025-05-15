import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { seatingService, examService } from '@/services/api';
import { SeatingArrangement as SeatingArrangementType, Exam } from '@/lib/types';

const SeatingArrangement: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [seatingArrangements, setSeatingArrangements] = useState<SeatingArrangementType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      loadSeatingArrangements(selectedExam);
    }
  }, [selectedExam]);

  const loadExams = async () => {
    try {
      const data = await examService.getAll();
      // Only show scheduled exams
      const scheduledExams = data.filter(exam => exam.status === 'scheduled');
      setExams(scheduledExams);
      if (scheduledExams.length > 0) {
        setSelectedExam(scheduledExams[0].id);
      }
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

  const loadSeatingArrangements = async (examId: string) => {
    try {
      const data = await seatingService.getByExamId(examId);
      setSeatingArrangements(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load seating arrangements',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Seating Arrangements</CardTitle>
          <CardDescription>View and manage exam seating arrangements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              {exams.map((exam) => (
                <Button
                  key={exam.id}
                  variant={selectedExam === exam.id ? 'default' : 'outline'}
                  onClick={() => setSelectedExam(exam.id)}
                >
                  {exam.subject}
                </Button>
              ))}
            </div>

            {selectedExam && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seat Number</TableHead>
                    <TableHead>Row</TableHead>
                    <TableHead>Column</TableHead>
                    <TableHead>Special Needs</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seatingArrangements.map((arrangement) => (
                    <TableRow key={arrangement.id}>
                      <TableCell>{arrangement.seat_number}</TableCell>
                      <TableCell>{arrangement.row}</TableCell>
                      <TableCell>{arrangement.column}</TableCell>
                      <TableCell>
                        {arrangement.is_special_needs_seating ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeatingArrangement; 