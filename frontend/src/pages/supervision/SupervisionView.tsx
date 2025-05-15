import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { examService, facultyService } from '@/services/api';
import { Exam, Faculty } from '@/lib/types';
import { format } from 'date-fns';

const SupervisionView: React.FC = () => {
  const { id } = useParams();
  const [exam, setExam] = useState<Exam | null>(null);
  const [supervisors, setSupervisors] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadExam(id);
    }
  }, [id]);

  const loadExam = async (examId: string) => {
    try {
      const examData = await examService.getById(examId);
      setExam(examData);

      // Load supervisor details
      if (examData.faculty_ids?.length) {
        const supervisorPromises = examData.faculty_ids.map(fid => 
          facultyService.getById(fid)
        );
        const supervisorData = await Promise.all(supervisorPromises);
        setSupervisors(supervisorData);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load supervision details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!exam) {
    return <div>Exam not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Supervision Details</CardTitle>
          <CardDescription>View exam supervision details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold">Exam Information</h3>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">Subject:</span> {exam.subject}</p>
                  <p><span className="font-medium">Date:</span> {format(new Date(exam.date), 'PPP')}</p>
                  <p>
                    <span className="font-medium">Time:</span>{' '}
                    {format(new Date(`2000-01-01T${exam.startTime}`), 'p')} -{' '}
                    {format(new Date(`2000-01-01T${exam.endTime}`), 'p')}
                  </p>
                  <p><span className="font-medium">Type:</span> {exam.exam_type}</p>
                  <p><span className="font-medium">Status:</span> {exam.status}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Supervision Requirements</h3>
                <div className="mt-2 space-y-2">
                  <p>
                    <span className="font-medium">Required Supervisors:</span>{' '}
                    {exam.required_supervisors || 2}
                  </p>
                  <p>
                    <span className="font-medium">Assigned Supervisors:</span>{' '}
                    {supervisors.length}
                  </p>
                  {exam.special_instructions && (
                    <p>
                      <span className="font-medium">Special Instructions:</span>{' '}
                      {exam.special_instructions}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Assigned Supervisors</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supervisors.map((supervisor) => (
                    <TableRow key={supervisor.id}>
                      <TableCell>{supervisor.name}</TableCell>
                      <TableCell>{supervisor.department}</TableCell>
                      <TableCell>{supervisor.designation}</TableCell>
                      <TableCell>{supervisor.phone}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisionView; 