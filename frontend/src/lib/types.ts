export interface Faculty {
    id: string;
    name: string;
    department: string;
    designation: string;
    email: string;
    phone: string;
    experience: number;
    shift_preference: 'full' | 'half' | 'none';
    max_supervisions: number;
    specialization?: string;
    availability: { [key: string]: boolean } | string[] | string;
    created_at?: string;
    joining_date?: string;
    preferred_exam_types?: string[];
    is_exam_coordinator?: boolean;
    can_supervise_special_needs?: boolean;
    last_supervision_date?: string;
    supervision_count_this_month?: number;
  }
  
  export interface Student {
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
    special_requirements?: {
      type: string;
      description: string;
    }[];
    is_backlog_student?: boolean;
    backlog_subjects?: string[];
  }
  
  export interface Classroom {
    id: string;
    name: string;
    building: string;
    floor: number;
    capacity: number;
    has_special_needs_facilities?: boolean;
    is_accessible?: boolean;
    preferred_seating_type?: string;
    maintenance_schedule?: {
      last_maintenance: string;
      next_maintenance: string;
    };
  }
  
  export interface Exam {
    id: string;
    name: string;
    subject: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    exam_type: 'regular' | 'backlog' | 'special';
    semester: number;
    classroom_ids: string[];
    faculty_ids: string[];
    student_ids: string[];
    is_special_needs_accommodated?: boolean;
    required_supervisors?: number;
    special_instructions?: string;
    emergency_contact?: {
      name: string;
      phone: string;
    };
    backup_supervisor_id?: string;
  }
  
  export interface SeatingArrangement {
    id: string;
    exam_id: string;
    classroom_id: string;
    student_id: string;
    seat_number: string;
    row: number;
    column: number;
    is_special_needs_seating?: boolean;
    assignment_details?: {
      reason: string;
      approved_by: string;
      date: string;
    };
  }
  
  export interface ExamSupervision {
    id: string;
    exam_id: string;
    faculty_id: string;
    role: 'primary' | 'secondary' | 'backup';
    check_in_time?: string;
    check_out_time?: string;
    status: 'assigned' | 'confirmed' | 'completed' | 'absent';
    notes?: string;
  }
  
  export interface SeatingRule {
    id: string;
    exam_id: string;
    min_distance_between_students: number;
    special_needs_rules?: {
      type: string;
      requirements: string[];
    }[];
    department_wise_seating?: boolean;
    random_seating?: boolean;
  }
  
  export interface ExamIncident {
    id: string;
    exam_id: string;
    student_id: string;
    type: 'misconduct' | 'technical' | 'emergency';
    severity: 'low' | 'medium' | 'high';
    description: string;
    reported_by: string;
    reported_at: string;
    status: 'open' | 'investigating' | 'resolved';
    resolution?: {
      action_taken: string;
      resolved_by: string;
      resolved_at: string;
    };
  }
  
  export interface ExamAttendance {
    id: string;
    exam_id: string;
    student_id: string;
    check_in_time?: string;
    check_out_time?: string;
    status: 'present' | 'absent' | 'late';
    notes?: string;
  }
  
  export interface RoomAllocationRule {
    id: string;
    exam_id: string;
    max_students_per_row: number;
    aisle_width: number;
    emergency_exit_clearance: number;
    backup_room_id?: string;
    special_requirements?: {
      type: string;
      description: string;
    }[];
  }
  
  export interface SupervisionRotation {
    id: string;
    faculty_id: string;
    exam_id: string;
    duty_date: string;
    duty_type: 'morning' | 'afternoon' | 'full_day';
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
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
  
  export interface DashboardStats {
    totalStudents: number;
    totalFaculty: number;
    totalClassrooms: number;
    upcomingExams: number;
  }
  
  export interface StudentUploadResult {
    success: number;
    failures: Array<{
      student: any;
      error: string;
    }>;
  }
  
  export interface ReportData {
    id: string;
    title: string;
    type: string;
    date: string;
    status: 'pending' | 'completed' | 'failed';
    downloadUrl?: string;
  }
  
  export interface SupervisionReport {
    faculty: Faculty;
    totalSupervisions: number;
    completedSupervisions: number;
    upcomingSupervisions: number;
    lastSupervision: string;
    nextSupervision: string;
    departments: string[];
  }
  
  export interface FacultyUploadResult {
    success: number;
    failures: Array<{
      row: string;
      error: string;
    }>;
    faculty: Array<{
      id: number;
      name: string;
      department: string;
      email: string;
      phone: string;
      experience: number;
      shiftPreference: 'full' | 'half' | 'none';
      maxSupervisions: number;
    }>;
  }
  
  export interface SupervisorUploadResult {
    success: boolean;
    failures: Array<{
      row: number;
      error: string;
    }>;
    supervisors: Array<{
      name: string;
      department: string;
      experience: number;
    }>;
  }
  
  export interface SupervisorAllocationResult {
    success: boolean;
    allocations: Array<{
      classroom: string;
      supervisor: string;
      department: string;
      experience: number;
    }>;
    message: string;
  }
  
  export interface ClassroomUploadResult {
    success: number;
    failures: Array<{
      row: string;
      error: string;
    }>;
    classrooms: Array<{
      id: number;
      name: string;
      capacity: number;
    }>;
  }
  