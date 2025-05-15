import { examService, facultyService } from "./api";
import { Exam, Faculty } from "@/lib/types";

interface FacultyWorkload {
  faculty: Faculty;
  currentSupervisions: number;
  isAvailable: boolean;
}

export async function autoAssignFaculty(examId: string): Promise<string[]> {
  try {
    // Get exam details
    const exam = await examService.getById(examId);
    if (!exam) {
      throw new Error("Exam not found");
    }

    // Get exam date and day
    const examDate = new Date(exam.date);
    const examDay = examDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Get all faculty and their current workload
    const allFaculty = await facultyService.getAll();
    const facultyWorkload: FacultyWorkload[] = allFaculty.map(faculty => ({
      faculty,
      currentSupervisions: 0, // This should be fetched from the backend
      isAvailable: faculty.availability?.includes(examDay) || false
    }));

    // Filter faculty based on availability and max supervisions
    const availableFaculty = facultyWorkload.filter(fw => 
      fw.isAvailable && 
      (!fw.faculty.max_supervisions || fw.currentSupervisions < fw.faculty.max_supervisions)
    );

    // Sort faculty by seniority (higher seniority first)
    availableFaculty.sort((a, b) => b.faculty.seniority - a.faculty.seniority);

    // Calculate required number of faculty based on student count
    const studentCount = exam.student_ids?.length || 0;
    const requiredFaculty = Math.max(1, Math.ceil(studentCount / 30)); // 1 faculty per 30 students

    // Select top faculty based on seniority
    const selectedFaculty = availableFaculty
      .slice(0, requiredFaculty)
      .map(fw => fw.faculty.id);

    if (selectedFaculty.length === 0) {
      throw new Error("No suitable faculty available for the exam");
    }

    // Update exam with selected faculty
    await examService.update(examId, {
      ...exam,
      faculty_ids: selectedFaculty
    });

    return selectedFaculty;
  } catch (error) {
    console.error("Error in autoAssignFaculty:", error);
    throw error;
  }
} 