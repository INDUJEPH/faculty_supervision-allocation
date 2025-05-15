import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { examService, facultyService } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { Exam, Faculty } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AutoAssignSupervisors from '@/components/AssignSupervisors';

const AssignSupervisors: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedFaculty, setSelectedFaculty] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>('manual');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [examData, facultyData] = await Promise.all([
        examService.getAll(),
        facultyService.getAll()
      ]);
      setExams(examData);
      setFaculty(facultyData);
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

  const handleAssignSupervisors = async () => {
    if (!selectedExam || selectedFaculty.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select an exam and at least one supervisor',
        variant: 'destructive',
      });
      return;
    }

    try {
      // This would need a corresponding API endpoint to be implemented
      await examService.assignSupervisors(selectedExam, selectedFaculty);
      toast({
        title: 'Success',
        description: 'Supervisors assigned successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign supervisors',
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
          <CardTitle>Assign Supervisors</CardTitle>
          <CardDescription>Assign faculty members to supervise examinations</CardDescription>
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
            
            {selectedExam && (
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual">Manual Assignment</TabsTrigger>
                  <TabsTrigger value="auto">Automatic Assignment</TabsTrigger>
                </TabsList>
                
                <TabsContent value="manual">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Available Faculty</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Select</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Current Supervisions</TableHead>
                            <TableHead>Max Supervisions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {faculty.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedFaculty.includes(member.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedFaculty([...selectedFaculty, member.id]);
                                    } else {
                                      setSelectedFaculty(selectedFaculty.filter(id => id !== member.id));
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell>{member.name}</TableCell>
                              <TableCell>{member.department}</TableCell>
                              <TableCell>0</TableCell>
                              <TableCell>{member.max_supervisions}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      <Button 
                        onClick={handleAssignSupervisors}
                        disabled={!selectedExam || selectedFaculty.length === 0}
                        className="w-full mt-4"
                      >
                        Assign Supervisors
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="auto">
                  <Card>
                    <CardContent>
                      <AutoAssignSupervisors 
                        examId={selectedExam} 
                        onSuccess={() => {
                          toast({
                            title: 'Success',
                            description: 'Supervisors automatically assigned successfully',
                          });
                          loadData();
                        }} 
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignSupervisors; 