import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { examService, facultyService } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { Exam, Faculty } from '@/lib/types';

interface SupervisionSchedule {
  exam: Exam;
  faculty: Faculty;
  classroom: string;
  time: string;
}

const ViewSchedule: React.FC = () => {
  const [schedules, setSchedules] = useState<SupervisionSchedule[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedFaculty) {
      loadSchedule();
    }
  }, [selectedFaculty]);

  const loadData = async () => {
    try {
      const facultyData = await facultyService.getAll();
      setFaculty(facultyData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load faculty data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSchedule = async () => {
    try {
      // Call the API to get assigned exams for this faculty
      const exams = await examService.getSupervisionSchedule(selectedFaculty);
      
      // Format the exams data to match the SupervisionSchedule interface
      const scheduleData = exams.map(exam => ({
        exam: {
          ...exam,
          id: exam.id,
          subject: exam.subject,
          date: exam.date,
          startTime: exam.start_time,
          endTime: exam.end_time,
        },
        faculty: faculty.find(f => f.id === selectedFaculty) || { id: "", name: "" } as Faculty,
        classroom: exam.classroom_names || "Unassigned",
        time: `${exam.start_time} - ${exam.end_time}`
      }));
      
      setSchedules(scheduleData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load supervision schedule',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      if (!timeString) return 'N/A';
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      return format(date, 'p');
    } catch (error) {
      return 'Invalid Time';
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
          <CardDescription>View faculty supervision assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger>
                <SelectValue placeholder="Select faculty member" />
              </SelectTrigger>
              <SelectContent>
                {faculty.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name} - {member.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedFaculty && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assigned Supervisions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Classroom</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.map((schedule, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDate(schedule.exam.date)}</TableCell>
                          <TableCell>
                            {formatTime(schedule.exam.startTime)} - {formatTime(schedule.exam.endTime)}
                          </TableCell>
                          <TableCell>{schedule.exam.subject}</TableCell>
                          <TableCell>{schedule.classroom}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Assigned
                            </span>
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

export default ViewSchedule; 