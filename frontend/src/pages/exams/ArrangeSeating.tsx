import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { examService, classroomService, seatingService } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Exam, Classroom } from '@/lib/types';

const ArrangeSeating: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedClassrooms, setSelectedClassrooms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [examData, classroomData] = await Promise.all([
        examService.getAll(),
        classroomService.getAll()
      ]);
      setExams(examData);
      setClassrooms(classroomData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArrangeSeating = async () => {
    if (!selectedExam || selectedClassrooms.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select an exam and at least one classroom',
        variant: 'destructive',
      });
      return;
    }

    try {
      const classroomAssignments = selectedClassrooms.map(classroomId => ({
        classroom_id: classroomId,
        student_assignments: [] // This would be populated with actual student assignments
      }));

      await seatingService.create(selectedExam, classroomAssignments);
      toast({
        title: 'Success',
        description: 'Seating arrangement created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create seating arrangement',
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
          <CardTitle>Arrange Seating</CardTitle>
          <CardDescription>Create seating arrangements for examinations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Classrooms</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Select</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Building</TableHead>
                      <TableHead>Floor</TableHead>
                      <TableHead>Capacity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classrooms.map((classroom) => (
                      <TableRow key={classroom.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedClassrooms.includes(classroom.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedClassrooms([...selectedClassrooms, classroom.id]);
                              } else {
                                setSelectedClassrooms(selectedClassrooms.filter(id => id !== classroom.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>{classroom.name}</TableCell>
                        <TableCell>{classroom.building}</TableCell>
                        <TableCell>{classroom.floor}</TableCell>
                        <TableCell>{classroom.capacity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Button 
              onClick={handleArrangeSeating}
              disabled={!selectedExam || selectedClassrooms.length === 0}
              className="w-full"
            >
              Create Seating Arrangement
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArrangeSeating; 