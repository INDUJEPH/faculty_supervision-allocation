import { Faculty, Exam, Classroom } from "@/lib/types";
import { facultyService, examService, studentService } from "@/services/api";

// Get day of the week from date
const getDayOfWeek = (date: Date): keyof Faculty["availability"] => {
  const days: (keyof Faculty["availability"])[] = [
    "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
  ];
  return days[date.getDay()];
};

// Determine if a semester is odd or even
const isSemesterOdd = (semester: number): boolean => {
  return semester % 2 !== 0;
};

// Check if faculty is suitable for the exam based on semester preferences
const isFacultySuitableForSemester = (faculty: Faculty, exam: Exam): boolean => {
  // If faculty has no preference, they can supervise any semester
  if (faculty.preferredSemesters === "both") return true;
  
  // Get students for this exam
  const students = studentService.getAll().filter(s => exam.studentIds.includes(s.id));
  
  // If no students assigned yet, faculty is considered suitable
  if (students.length === 0) return true;
  
  // Get the first student's semester as reference
  const semesterType = isSemesterOdd(students[0].semester) ? "odd" : "even";
  
  // Check if faculty preference matches semester type
  return faculty.preferredSemesters === semesterType;
};

// Get faculty members available on a specific day
const getAvailableFaculty = (date: Date, department?: string, examType?: string): Faculty[] => {
  const faculty = facultyService.getAll();
  const dayOfWeek = getDayOfWeek(date);
  
  // Filter faculty by availability on the exam day
  return faculty.filter(f => {
    // Only include faculty from specific department if provided
    if (department && f.department !== department) return false;
    
    // Check if faculty is available on that day
    return f.availability[dayOfWeek as keyof typeof f.availability];
  });
};

// Count current supervisions for each faculty
const getFacultySupervisionCounts = (): Record<string, number> => {
  const exams = examService.getAll();
  const supervisionCounts: Record<string, number> = {};
  
  // Initialize counts to 0 for all faculty
  facultyService.getAll().forEach(f => {
    supervisionCounts[f.id] = 0;
  });
  
  // Count current supervisions
  exams.forEach(exam => {
    exam.facultyIds.forEach(facultyId => {
      if (supervisionCounts[facultyId] !== undefined) {
        supervisionCounts[facultyId]++;
      }
    });
  });
  
  return supervisionCounts;
};

// Calculate faculty workload score (lower is better for assignment)
const calculateFacultyWorkloadScore = (
  faculty: Faculty, 
  supervisionCounts: Record<string, number>,
  exam: Exam
): number => {
  // Base score on current supervisions relative to max capacity
  const currentSupervisions = supervisionCounts[faculty.id] || 0;
  const capacityUsedRatio = currentSupervisions / faculty.maxSupervisions;
  
  // Check if faculty is at or over their maximum supervisions
  if (capacityUsedRatio >= 1) {
    return Number.MAX_VALUE; // Effectively remove from consideration
  }
  
  // Adjust by seniority (higher seniority faculty should get priority when needed)
  // We convert to a ratio where 0 = most senior, 1 = least senior
  const seniorityFactor = (6 - faculty.seniority) / 5; // 5 is highest seniority
  
  // External exams require more senior faculty
  let examTypeFactor = 0;
  if (exam.examType === "external" && faculty.seniority < 4) {
    examTypeFactor = 0.5; // Penalize less senior faculty for external exams
  }
  
  // Semester suitability factor
  let semesterFactor = 0;
  if (!isFacultySuitableForSemester(faculty, exam)) {
    semesterFactor = 0.3; // Penalty for semester mismatch
  }
  
  // Combined score where lower is better for assignment
  // Weight the factors - capacity usage is more important than seniority
  return (capacityUsedRatio * 0.5) + (seniorityFactor * 0.2) + examTypeFactor + semesterFactor;
};

// Check if a faculty member is already busy with another exam at this time
const isFacultyBusyAtTime = (faculty: Faculty, exam: Exam): boolean => {
  const exams = examService.getAll();
  const examDate = exam.date instanceof Date ? exam.date : new Date(exam.date);
  const examDateString = examDate.toISOString().split('T')[0];
  
  // Find exams on the same day
  const samedayExams = exams.filter(e => {
    const eDate = e.date instanceof Date ? e.date : new Date(e.date);
    return eDate.toISOString().split('T')[0] === examDateString;
  });
  
  // Check for time conflicts
  return samedayExams.some(e => {
    if (e.id === exam.id) return false; // Skip the current exam
    
    // Check if faculty is assigned to this exam
    if (!e.facultyIds.includes(faculty.id)) return false;
    
    // Check time overlap
    return (exam.startTime < e.endTime && exam.endTime > e.startTime);
  });
};

interface FacultyWorkload {
  facultyId: string;
  currentSupervisions: number;
  maxSupervisions: number;
  seniority: number;
  department: string;
  availability: string[];
}

export const autoAssignFaculty = async (examId: string): Promise<string[]> => {
  try {
    // Fetch exam data
    const exam = await examService.getById(examId);
    if (!exam) {
      throw new Error("Exam not found");
    }

    // Get exam date and day
    const examDate = new Date(exam.date);
    const examDay = examDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Fetch all faculty and their current workload
    const faculty = await facultyService.getAll();
    const exams = await examService.getAll();
    const students = await studentService.getAll();

    // Calculate current workload for each faculty member
    const facultyWorkload: FacultyWorkload[] = faculty.map(f => {
      const currentSupervisions = exams.filter(e => 
        e.faculty_ids?.includes(f.id)
      ).length;

      return {
        facultyId: f.id,
        currentSupervisions,
        maxSupervisions: f.max_supervisions,
        seniority: f.seniority,
        department: f.department,
        availability: f.availability || []
      };
    });

    // Filter faculty based on criteria:
    // 1. Available on exam day
    // 2. Not exceeding max supervisions
    // 3. Sort by seniority (higher seniority first)
    const availableFaculty = facultyWorkload
      .filter(f => f.availability.includes(examDay))
      .filter(f => f.currentSupervisions < f.maxSupervisions)
      .sort((a, b) => b.seniority - a.seniority);

    // Calculate required number of faculty based on student count
    const studentCount = exam.student_ids?.length || 0;
    const requiredFaculty = Math.ceil(studentCount / 30); // 1 faculty per 30 students, minimum 1

    // Select top faculty members based on seniority
    const selectedFaculty = availableFaculty
      .slice(0, Math.max(requiredFaculty, 1))
      .map(f => f.facultyId);

    if (selectedFaculty.length === 0) {
      throw new Error("No suitable faculty available for the selected date");
    }

    return selectedFaculty;
  } catch (error) {
    console.error("Error in auto-assigning faculty:", error);
    throw error;
  }
};
