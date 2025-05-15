import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Exam } from '../lib/types';

export interface DashboardStats {
  studentCount: number;
  facultyCount: number;
  classroomCount: number;
  upcomingExamCount: number;
}

export interface DepartmentStats {
  department: string;
  count: number;
}

export interface SemesterStats {
  semester: number;
  count: number;
}

export interface FacultyStats {
  department: string;
  count: number;
}

export interface StudentUploadResult {
  success: number;
  failures: Array<{
    student: any;
    error: string;
  }>;
}

export interface ReportData {
  department?: string;
  semester?: number;
  section?: string;
  student_count?: number;
  faculty_count?: number;
  exam_count?: number;
  name?: string;
  building?: string;
  floor?: number;
  capacity?: number;
  classrooms?: string;
  faculty?: string;
}

const dashboardService = {
  // Dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats`);
    return response.data as DashboardStats;
  },

  // Department statistics
  getDepartmentStats: async (): Promise<DepartmentStats[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/department-stats`);
    return response.data as DepartmentStats[];
  },

  // Semester statistics
  getSemesterStats: async (department?: string): Promise<SemesterStats[]> => {
    const url = department 
      ? `${API_BASE_URL}/api/dashboard/semester-stats?department=${encodeURIComponent(department)}`
      : `${API_BASE_URL}/api/dashboard/semester-stats`;
    const response = await axios.get(url);
    return response.data as SemesterStats[];
  },

  // Faculty statistics
  getFacultyStats: async (): Promise<FacultyStats[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/faculty-stats`);
    return response.data as FacultyStats[];
  },

  // Upcoming exams
  getUpcomingExams: async (): Promise<Exam[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/upcoming-exams`);
    return response.data as Exam[];
  },

  // Bulk student upload
  uploadStudents: async (students: any[]): Promise<StudentUploadResult> => {
    const response = await axios.post(`${API_BASE_URL}/api/students/upload`, { students });
    return response.data as StudentUploadResult;
  },

  // Reports
  getStudentEnrollmentReport: async (): Promise<ReportData[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/reports/student-enrollment`);
    return response.data as ReportData[];
  },

  getFacultyWorkloadReport: async (): Promise<ReportData[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/reports/faculty-workload`);
    return response.data as ReportData[];
  },

  getExamScheduleReport: async (): Promise<ReportData[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/reports/exam-schedule`);
    return response.data as ReportData[];
  },

  getClassroomUtilizationReport: async (): Promise<ReportData[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/reports/classroom-utilization`);
    return response.data as ReportData[];
  },

  getDepartmentPerformanceReport: async (): Promise<ReportData[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/reports/department-performance`);
    return response.data as ReportData[];
  },
};

export default dashboardService; 