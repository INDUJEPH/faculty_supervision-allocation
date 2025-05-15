import { examService, classroomService } from "./api";
import { Exam, Classroom } from "@/lib/types";

interface ClassroomAssignment {
  classroom: Classroom;
  assignedStudents: number;
  isAvailable: boolean;
}

export async function autoAssignClassrooms(examId: string): Promise<string[]> {
  try {
    // Get exam details
    const exam = await examService.getById(examId);
    if (!exam) {
      throw new Error("Exam not found");
    }

    // Get all classrooms
    const allClassrooms = await classroomService.getAll();
    
    // Sort classrooms by capacity (larger first)
    const sortedClassrooms = [...allClassrooms].sort((a, b) => b.capacity - a.capacity);

    // Get total student count
    const studentCount = exam.student_ids?.length || 0;
    if (studentCount === 0) {
      throw new Error("No students assigned to the exam");
    }

    // Initialize classroom assignments
    const assignments: ClassroomAssignment[] = sortedClassrooms.map(classroom => ({
      classroom,
      assignedStudents: 0,
      isAvailable: true
    }));

    // Group classrooms by building and floor
    const classroomGroups = assignments.reduce((groups, assignment) => {
      const key = `${assignment.classroom.building}-${assignment.classroom.floor}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(assignment);
      return groups;
    }, {} as Record<string, ClassroomAssignment[]>);

    // Sort groups by number of classrooms (larger groups first)
    const sortedGroups = Object.entries(classroomGroups)
      .sort(([, a], [, b]) => b.length - a.length);

    // Assign students to classrooms using block technique
    let remainingStudents = studentCount;
    const selectedClassrooms: string[] = [];

    for (const [, group] of sortedGroups) {
      if (remainingStudents <= 0) break;

      // Calculate how many students can be assigned to this block
      const blockCapacity = group.reduce((sum, assignment) => sum + assignment.classroom.capacity, 0);
      const studentsForBlock = Math.min(remainingStudents, blockCapacity);

      // Distribute students across classrooms in the block
      let blockRemainingStudents = studentsForBlock;
      for (const assignment of group) {
        if (blockRemainingStudents <= 0) break;

        const studentsToAssign = Math.min(
          blockRemainingStudents,
          assignment.classroom.capacity
        );

        assignment.assignedStudents = studentsToAssign;
        blockRemainingStudents -= studentsToAssign;
        remainingStudents -= studentsToAssign;

        if (studentsToAssign > 0) {
          selectedClassrooms.push(assignment.classroom.id);
        }
      }
    }

    if (remainingStudents > 0) {
      throw new Error("Not enough classroom capacity for all students");
    }

    // Update exam with selected classrooms
    await examService.update(examId, {
      ...exam,
      classroom_ids: selectedClassrooms
    });

    return selectedClassrooms;
  } catch (error) {
    console.error("Error in autoAssignClassrooms:", error);
    throw error;
  }
} 