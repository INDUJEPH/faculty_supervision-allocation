import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { examService } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Exam } from '@/lib/types';

interface ExamResult {
  student_id: string;
  student_name: string;
  roll_number: string;
  marks: number;
  status: 'pass' | 'fail';
  remarks?: string;
}

const ManageResults: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      loadResults();
    }
  }, [selectedExam]);

  const loadExams = async () => {
    try {
      const data = await examService.getAll();
      setExams(data);
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

  const loadResults = async () => {
    try {
      const data = await examService.getResults(selectedExam);
      setResults(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load results',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateResult = async (studentId: string, marks: number, status: 'pass' | 'fail') => {
    try {
      await examService.addResults(selectedExam, [{
        student_id: studentId,
        marks,
        status,
      }]);
      await loadResults();
      toast({
        title: 'Success',
        description: 'Result updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update result',
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
          <CardTitle>Manage Results</CardTitle>
          <CardDescription>View and update examination results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger>
                <SelectValue placeholder="Select exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.subject} - {exam.date}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedExam && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result) => (
                        <TableRow key={result.student_id}>
                          <TableCell>{result.roll_number}</TableCell>
                          <TableCell>{result.student_name}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={result.marks}
                              onChange={(e) => {
                                const marks = parseInt(e.target.value);
                                handleUpdateResult(
                                  result.student_id,
                                  marks,
                                  marks >= 40 ? 'pass' : 'fail'
                                );
                              }}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <span className={result.status === 'pass' ? 'text-green-600' : 'text-red-600'}>
                              {result.status.toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateResult(result.student_id, result.marks, result.status)}
                            >
                              Update
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageResults; 