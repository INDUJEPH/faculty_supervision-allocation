import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

const ScheduleExam = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    department: 'Computer Science',
    semester: '6',
    date: '',
    start_time: '',
    end_time: '',
    exam_type: 'Regular'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Format the date to YYYY-MM-DD
      const formattedDate = formData.date;
      
      // Format times to HH:mm:ss
      const formattedStartTime = formData.start_time + ':00';
      const formattedEndTime = formData.end_time + ':00';
      
      const dataToSend = {
        ...formData,
        date: formattedDate,
        start_time: formattedStartTime,
        end_time: formattedEndTime
      };

      console.log('Sending data to server:', dataToSend);
      
      const response = await axios.post(`${API_CONFIG.baseUrl}/exams`, dataToSend);
      
      console.log('Server response:', response.data);
      
      toast({
        title: "Success",
        description: "Exam scheduled successfully",
      });
      
      navigate('/exams');
    } catch (error: any) {
      console.error('Failed to schedule exam:', error);
      console.error('Error response:', error.response?.data);
      
      toast({
        title: "Error",
        description: error.response?.data?.details || "Failed to schedule exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule New Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Mechanical">Mechanical</SelectItem>
                    <SelectItem value="Civil">Civil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData({ ...formData, semester: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="examType">Exam Type</Label>
                <Select
                  value={formData.exam_type}
                  onValueChange={(value) => setFormData({ ...formData, exam_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Backlog">Backlog</SelectItem>
                    <SelectItem value="Special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Scheduling...' : 'Schedule Exam'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleExam; 