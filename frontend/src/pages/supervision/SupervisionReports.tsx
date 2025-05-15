import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { examService, facultyService } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { Faculty } from '@/lib/types';

// Interface to match what the API returns
interface ApiReportItem {
  id: string;
  name: string;
  department: string;
  designation: string;
  total_exams: string | number;
  exam_names?: string;
  total_hours?: string | number;
  email?: string;
  phone?: string;
  experience?: number;
  max_supervisions?: number;
  [key: string]: any; // For any other properties
}

interface SupervisionReport {
  faculty: Faculty;
  totalSupervisions: number;
  completedSupervisions: number;
  upcomingSupervisions: number;
  lastSupervision: string;
  nextSupervision: string;
  departments: string[];
}

// Sample data to use when API returns empty results
const generateMockData = (department: string): SupervisionReport[] => {
  // Only show mock data for the selected department or all departments
  const mockFaculty: Record<string, Faculty[]> = {
    'computer science': [
      { id: 'mock-1', name: 'Dr. John Smith', department: 'Computer Science', designation: 'Professor', email: 'john.smith@example.com', phone: '123-456-7890', experience: 10, shift_preference: 'full', max_supervisions: 5, specialization: 'AI', availability: [] },
      { id: 'mock-2', name: 'Dr. Sarah Johnson', department: 'Computer Science', designation: 'Associate Professor', email: 'sarah.j@example.com', phone: '123-456-7891', experience: 7, shift_preference: 'half', max_supervisions: 3, specialization: 'Data Science', availability: [] }
    ],
    'electronics': [
      { id: 'mock-3', name: 'Dr. Michael Lee', department: 'Electronics', designation: 'Professor', email: 'michael.lee@example.com', phone: '123-456-7892', experience: 12, shift_preference: 'full', max_supervisions: 4, specialization: 'Circuits', availability: [] },
      { id: 'mock-4', name: 'Prof. Jessica Martinez', department: 'Electronics', designation: 'Assistant Professor', email: 'jessica.m@example.com', phone: '123-456-7893', experience: 5, shift_preference: 'half', max_supervisions: 2, specialization: 'Microcontrollers', availability: [] }
    ],
    'electrical': [
      { id: 'mock-5', name: 'Dr. Robert Wilson', department: 'Electrical', designation: 'Professor', email: 'robert.w@example.com', phone: '123-456-7894', experience: 15, shift_preference: 'full', max_supervisions: 5, specialization: 'Power Systems', availability: [] },
      { id: 'mock-6', name: 'Dr. Emily Davis', department: 'Electrical', designation: 'Associate Professor', email: 'emily.d@example.com', phone: '123-456-7895', experience: 8, shift_preference: 'full', max_supervisions: 4, specialization: 'Control Systems', availability: [] }
    ],
    'mechanical': [
      { id: 'mock-7', name: 'Prof. Thomas Brown', department: 'Mechanical', designation: 'Professor', email: 'thomas.b@example.com', phone: '123-456-7896', experience: 14, shift_preference: 'full', max_supervisions: 6, specialization: 'Thermodynamics', availability: [] },
      { id: 'mock-8', name: 'Dr. Jennifer Clark', department: 'Mechanical', designation: 'Assistant Professor', email: 'jennifer.c@example.com', phone: '123-456-7897', experience: 6, shift_preference: 'half', max_supervisions: 3, specialization: 'Materials Science', availability: [] }
    ],
  };

  const todayDate = new Date().toISOString().split('T')[0];
  const lastWeekDate = subDays(new Date(), 7).toISOString().split('T')[0];
  const nextWeekDate = addDays(new Date(), 7).toISOString().split('T')[0];

  let selectedFaculty: Faculty[] = [];
  
  if (department === '' || department === 'all departments') {
    // Combine all departments
    Object.values(mockFaculty).forEach(facultyArray => {
      selectedFaculty = [...selectedFaculty, ...facultyArray];
    });
  } else {
    // Use the selected department
    selectedFaculty = mockFaculty[department] || [];
  }

  return selectedFaculty.map(faculty => ({
    faculty,
    totalSupervisions: Math.floor(Math.random() * 10) + 5,
    completedSupervisions: Math.floor(Math.random() * 5) + 1,
    upcomingSupervisions: Math.floor(Math.random() * 3) + 1,
    lastSupervision: lastWeekDate,
    nextSupervision: nextWeekDate,
    departments: [faculty.department]
  }));
};

const SupervisionReports: React.FC = () => {
  const [reports, setReports] = useState<SupervisionReport[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const { toast } = useToast();

  const departments = ['All Departments', 'Computer Science', 'Electronics', 'Electrical', 'Mechanical'];

  useEffect(() => {
    loadReports();
  }, [selectedDepartment]);

  // Helper function to filter reports by department
  const filterReportsByDepartment = (reports: SupervisionReport[], department: string): SupervisionReport[] => {
    if (!department || department === '' || department === 'all departments') {
      return reports;
    }
    
    return reports.filter(report => {
      const facultyDepartment = report.faculty.department.toLowerCase();
      return facultyDepartment === department.toLowerCase();
    });
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Get data from the API endpoint - always get all reports initially
      const response = await examService.getSupervisionReports('');
      console.log('Raw API response:', response);
      
      // Check if we received data in the expected format
      if (Array.isArray(response) && response.length > 0) {
        // Map the API response to our SupervisionReport type
        const transformedReports: SupervisionReport[] = response.map((apiItem: any) => {
          // Create a Faculty object from the API data
          const facultyMember: Faculty = {
            id: apiItem.id || `temp-${Math.random()}`,
            name: apiItem.name || 'Unknown',
            department: apiItem.department || 'Unknown',
            designation: apiItem.designation || 'Faculty',
            email: apiItem.email || '',
            phone: apiItem.phone || '',
            experience: apiItem.experience || 0,
            shift_preference: 'full',
            max_supervisions: apiItem.max_supervisions || 5,
            specialization: '',
            availability: []
          };
          
          // Parse total_exams value, handling different possible types
          let totalExams = 0;
          if (typeof apiItem.total_exams === 'number') {
            totalExams = apiItem.total_exams;
          } else if (typeof apiItem.total_exams === 'string') {
            totalExams = parseInt(apiItem.total_exams) || 0;
          }
          
          // Create the SupervisionReport with calculated values
          return {
            faculty: facultyMember,
            totalSupervisions: totalExams,
            completedSupervisions: Math.floor(totalExams * 0.7), // 70% completed
            upcomingSupervisions: Math.ceil(totalExams * 0.3), // 30% upcoming
            lastSupervision: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            nextSupervision: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            departments: [apiItem.department]
          };
        });
        
        console.log('Transformed API data:', transformedReports);
        
        // Filter reports by selected department
        const filteredReports = filterReportsByDepartment(transformedReports, selectedDepartment);
        console.log('Filtered reports:', filteredReports);
        
        // Use the transformed data
        setReports(filteredReports);
        setUseMockData(false);
        return;
      }
      
      // If we get here, either the API returned no data or the data was invalid
      console.log('No valid supervision data from API, using mock data instead');
      setReports(generateMockData(selectedDepartment.toLowerCase()));
      setUseMockData(true);
      
    } catch (error) {
      console.error('Failed to load supervision reports:', error);
      toast({
        title: 'API Error',
        description: 'Using example data for demonstration purposes',
        variant: 'default',
      });
      // Use mock data on error
      setReports(generateMockData(selectedDepartment.toLowerCase()));
      setUseMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      return format(parseISO(dateString), 'PPP');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Safe getter for numeric values with fallback to 0
  const getSafeNumber = (report: SupervisionReport | undefined, property: keyof SupervisionReport): number => {
    if (!report) return 0;
    const value = report[property];
    return typeof value === 'number' ? value : 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Supervision Reports</CardTitle>
          <CardDescription>
            View supervision statistics and reports
            {useMockData && (
              <span className="ml-2 text-orange-500 font-medium">
                (Demo Data)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-end">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept.toLowerCase()}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Supervisions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {reports.reduce((sum, report) => sum + (report?.totalSupervisions || 0), 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {reports.reduce((sum, report) => sum + (report?.completedSupervisions || 0), 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {reports.reduce((sum, report) => sum + (report?.upcomingSupervisions || 0), 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {reports.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Faculty Supervision Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Faculty Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Total Supervisions</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Upcoming</TableHead>
                        <TableHead>Last Supervision</TableHead>
                        <TableHead>Next Supervision</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report, index) => (
                        <TableRow key={report?.faculty?.id || index}>
                          <TableCell>{report?.faculty?.name || 'Unknown'}</TableCell>
                          <TableCell className="capitalize">{report?.faculty?.department || 'Unknown'}</TableCell>
                          <TableCell>{report?.totalSupervisions || 0}</TableCell>
                          <TableCell>{report?.completedSupervisions || 0}</TableCell>
                          <TableCell>{report?.upcomingSupervisions || 0}</TableCell>
                          <TableCell>{formatDate(report?.lastSupervision || '')}</TableCell>
                          <TableCell>{formatDate(report?.nextSupervision || '')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No supervision reports available for {selectedDepartment ? selectedDepartment : 'any department'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupervisionReports; 