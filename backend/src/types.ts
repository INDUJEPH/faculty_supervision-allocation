import { ResultSetHeader, RowDataPacket } from 'mysql2';

// Generic type for query results
export interface QueryResult<T = any> {
  [key: string]: T;
}

// Row types for different tables
export interface StudentRow extends RowDataPacket {
  id: string;
  name: string;
  roll_number: string;
  department: string;
  semester: number;
  section: string;
  elective_subjects: string[];
  email?: string;
  phone?: string;
  admission_date?: string;
  special_requirements?: string;
  is_backlog_student?: boolean;
  backlog_subjects?: string;
}

export interface FacultyRow extends RowDataPacket {
  id: string;
  name: string;
  department: string;
  email: string;
  phone: string;
  max_supervisions: number;
  seniority: number;
  designation: string;
  joining_date: string;
  preferred_exam_types?: string;
  is_exam_coordinator?: boolean;
  can_supervise_special_needs?: boolean;
  last_supervision_date?: string;
  supervision_count_this_month?: number;
}

export interface ClassroomRow extends RowDataPacket {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  has_projector: boolean;
  is_computer_lab: boolean;
  has_special_needs_facilities?: boolean;
  is_accessible?: boolean;
  preferred_seating_type?: string;
  maintenance_schedule?: string;
}

export interface ExamRow extends RowDataPacket {
  id: string;
  name: string;
  subject: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  exam_type: 'regular' | 'backlog' | 'special';
  semester: number;
  classroom_ids?: string;
  faculty_ids?: string;
  student_ids?: string;
  is_special_needs_accommodated?: boolean;
  required_supervisors?: number;
  special_instructions?: string;
  emergency_contact?: string;
  backup_supervisor_id?: string;
}

export interface SeatingArrangementRow extends RowDataPacket {
  id: string;
  exam_id: string;
  classroom_id: string;
  student_id: string;
  seat_number: number;
  row_number: number;
  column_number: number;
  is_special_needs_seating?: boolean;
  assignment_details?: string;
}

// Count result type
export interface CountResult extends RowDataPacket {
  count: number;
}

// Dashboard stats type
export interface DashboardStats {
  studentCount: number;
  facultyCount: number;
  classroomCount: number;
  upcomingExamCount: number;
}

// Department stats type
export interface DepartmentStats extends RowDataPacket {
  department: string;
  count: number;
}

// Semester stats type
export interface SemesterStats extends RowDataPacket {
  semester: number;
  count: number;
}

// Faculty stats type
export interface FacultyStats extends RowDataPacket {
  department: string;
  count: number;
}

// Student upload result type
export interface StudentUploadResult {
  success: number;
  failures: Array<{
    student: any;
    error: string;
  }>;
}

export type { ResultSetHeader }; 