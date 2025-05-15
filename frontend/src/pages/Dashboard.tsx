import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  CalendarDays, 
  Users, 
  GraduationCap, 
  School, 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Settings, 
  BarChart, 
  Building2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Upload
} from "lucide-react";
import { examService, facultyService, studentService, classroomService } from "@/services/api";
import { Exam, Faculty, Student, Classroom } from "@/lib/types";
import { toast } from "sonner";
import dashboardService, {
  DashboardStats,
  DepartmentStats,
  SemesterStats,
  FacultyStats,
  ReportData
} from "../services/dashboardService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  PieChart, 
  Pie, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell,
  CartesianGrid
} from "recharts";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [semesterStats, setSemesterStats] = useState<SemesterStats[]>([]);
  const [facultyStats, setFacultyStats] = useState<FacultyStats[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          statsData,
          deptStats,
          semStats,
          facStats,
          exams
        ] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getDepartmentStats(),
          dashboardService.getSemesterStats(selectedDepartment),
          dashboardService.getFacultyStats(),
          dashboardService.getUpcomingExams()
        ]);

        setStats(statsData);
        setDepartmentStats(deptStats);
        setSemesterStats(semStats);
        setFacultyStats(facStats);
        setUpcomingExams(exams);
        setError(null);

        // Extract unique departments from department stats
        const uniqueDepartments = [...new Set(deptStats.map(stat => stat.department))];
        setDepartments(uniqueDepartments);
        if (uniqueDepartments.length > 0) {
          setSelectedDepartment(uniqueDepartments[0]);
        }
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedDepartment]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  const renderAcademicTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={departmentStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Semester-wise Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                  data={semesterStats}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="semester" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculty Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={facultyStats}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="examination">Examination</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Students</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.studentCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Faculty</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.facultyCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Classrooms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.classroomCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Exams</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats?.upcomingExamCount}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Student Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {departmentStats.map((stat) => (
                    <div key={stat.department} className="flex justify-between items-center">
                      <span>{stat.department}</span>
                      <Badge>{stat.count} students</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Exams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {upcomingExams.map((exam) => (
                    <div key={exam.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{exam.name}</p>
                        <p className="text-sm text-gray-500">{exam.subject}</p>
                      </div>
                      <Badge>{new Date(exam.date).toLocaleDateString()}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academic">
          {renderAcademicTab()}

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button asChild>
                    <Link to="/students/upload">Upload Students</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/faculty/add">Add Faculty</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/departments">Manage Departments</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/classrooms">Manage Classrooms</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="examination">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button asChild className="w-full">
                    <Link to="/exams/schedule">Schedule Exam</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/exams/arrange">Arrange Seating</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/exams/backlog">Backlog Exams</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/exams/results">Manage Results</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Supervision Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button asChild className="w-full">
                    <Link to="/supervision/assign">Assign Supervisors</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/supervision/schedule">View Schedule</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/supervision/reports">Supervision Reports</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Academic Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button asChild className="w-full">
                    <Link to="/reports/student-enrollment">Student Enrollment</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/reports/faculty-workload">Faculty Workload</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/reports/department-performance">Department Performance</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Examination Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button asChild className="w-full">
                    <Link to="/reports/exam-schedule">Exam Schedule</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/reports/classroom-utilization">Classroom Utilization</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/reports/supervision">Supervision Reports</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
