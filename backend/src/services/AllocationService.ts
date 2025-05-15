import mysql from 'mysql2/promise';
import { pool } from '../server';

export interface Faculty {
  id: number;
  name: string;
  department: string;
  designation: string;
  max_supervisions: number;
  current_supervisions?: number;
  seniority?: number;
}

export interface Exam {
  id: number;
  subject: string;
  date: string;
  start_time: string;
  end_time: string;
  department: string;
  exam_type: string;
  classroom_ids?: string;
}

export class AllocationService {
  /**
   * Get faculty members available for supervision based on criteria
   */
  static async getAvailableFaculty(exam: Exam, requiredCount: number) {
    try {
      // Get all faculty with their fields matching the actual database schema
      const [faculty] = await pool.query<any[]>(
        `SELECT 
          f.id, 
          f.name, 
          f.department, 
          f.designation, 
          f.seniority,
          f.max_supervisions,
          COUNT(fe.id) as current_supervisions
        FROM 
          faculty f
        LEFT JOIN 
          faculty_exams fe ON f.id = fe.faculty_id
        GROUP BY 
          f.id`
      );

      // Filter faculty to match exam department if possible
      const departmentMatches = faculty.filter(f => f.department === exam.department);
      const otherFaculty = faculty.filter(f => f.department !== exam.department);
      
      // Get faculty who are already busy at this time
      const [busyFaculty] = await pool.query<any[]>(
        `SELECT DISTINCT fe.faculty_id
        FROM faculty_exams fe
        JOIN exams e ON fe.exam_id = e.id
        WHERE e.date = ? 
        AND ((e.start_time <= ? AND e.end_time >= ?) 
          OR (e.start_time <= ? AND e.end_time >= ?)
          OR (e.start_time >= ? AND e.end_time <= ?))`,
        [
          exam.date, 
          exam.start_time, exam.start_time,
          exam.end_time, exam.end_time,
          exam.start_time, exam.end_time
        ]
      );
      
      const busyFacultyIds = busyFaculty.map(f => f.faculty_id);
      
      // Filter out busy faculty
      const availableDepartmentMatches = departmentMatches
        .filter(f => !busyFacultyIds.includes(f.id))
        .filter(f => f.current_supervisions < f.max_supervisions);
        
      const availableOtherFaculty = otherFaculty
        .filter(f => !busyFacultyIds.includes(f.id))
        .filter(f => f.current_supervisions < f.max_supervisions);
        
      // Combine and sort by score
      const scoredFaculty = [
        ...availableDepartmentMatches.map(f => ({ 
          ...f, 
          score: this.calculateScore(f, exam) 
        })),
        ...availableOtherFaculty.map(f => ({ 
          ...f, 
          score: this.calculateScore(f, exam) 
        }))
      ].sort((a, b) => b.score - a.score);
      
      // Return the top N faculty based on required count
      return scoredFaculty.slice(0, requiredCount);
    } catch (error) {
      console.error('Error getting available faculty:', error);
      throw error;
    }
  }
  
  /**
   * Calculate score for faculty based on criteria:
   * Availability: +10 points if the faculty is available
   * Workload Balance: Up to +20 points based on supervision capacity
   * Experience: Up to +10 points based on experience level
   * Department Match: +10 points if department matches
   */
  static calculateScore(faculty: Faculty, exam: Exam): number {
    let score = 0;
    
    // Always available at this point (we filtered busy faculty)
    score += 10;
    
    // Workload balance (up to 20 points)
    // Lower current supervision load gets higher score
    const currentLoad = faculty.current_supervisions || 0;
    const maxLoad = faculty.max_supervisions || 5;
    const remainingCapacity = maxLoad - currentLoad;
    score += Math.min(20, remainingCapacity * 2);
    
    // Use seniority instead of experience (up to 10 points)
    if (faculty.seniority !== undefined) {
      score += Math.min(10, faculty.seniority);
    }
    
    // Department match bonus (10 points)
    if (faculty.department === exam.department) {
      score += 10;
    }
    
    return score;
  }
  
  /**
   * Allocate faculty to an exam
   */
  static async allocateSupervisors(
    examId: number | string, 
    date: string, 
    startTime: string, 
    endTime: string, 
    examType: string, 
    requiredSupervisors: number
  ) {
    try {
      console.log(`Attempting to allocate supervisors for exam ${examId}`);
      console.log(`Parameters: date=${date}, startTime=${startTime}, endTime=${endTime}, examType=${examType}, requiredSupervisors=${requiredSupervisors}`);
      
      // Check if faculty_exams table exists, create it if not
      const [tables] = await pool.query<any[]>(
        `SHOW TABLES LIKE 'faculty_exams'`
      );
      
      if (tables.length === 0) {
        console.log('Creating faculty_exams table');
        await pool.query(`
          CREATE TABLE IF NOT EXISTS faculty_exams (
            id INT AUTO_INCREMENT PRIMARY KEY,
            faculty_id VARCHAR(36) NOT NULL,
            exam_id VARCHAR(36) NOT NULL,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY faculty_exam_unique (faculty_id, exam_id)
          )
        `);
      }
      
      // Get exam details
      const [exams] = await pool.query<any[]>(
        'SELECT * FROM exams WHERE id = ?',
        [examId]
      );
      
      if (exams.length === 0) {
        throw new Error('Exam not found');
      }
      
      const exam = {
        ...exams[0],
        date,
        start_time: startTime,
        end_time: endTime,
        exam_type: examType
      };
      
      // Get classrooms for the exam
      let classrooms = [];
      try {
        // Check if exam_classrooms table exists
        const [checkTable] = await pool.query<any[]>(`SHOW TABLES LIKE 'exam_classrooms'`);
        
        if (checkTable.length > 0) {
          const [rooms] = await pool.query<any[]>(
            `SELECT c.* 
            FROM classrooms c
            JOIN exam_classrooms ec ON c.id = ec.classroom_id
            WHERE ec.exam_id = ?`,
            [examId]
          );
          classrooms = rooms;
        } else {
          console.log('exam_classrooms table does not exist');
          // If the table doesn't exist, try to get classrooms from the exam's classroom_ids field
          if (exam.classroom_ids) {
            const classroomIds = typeof exam.classroom_ids === 'string' 
              ? exam.classroom_ids.split(',') 
              : exam.classroom_ids;
              
            if (classroomIds.length > 0) {
              const [rooms] = await pool.query<any[]>(
                `SELECT * FROM classrooms WHERE id IN (?)`,
                [classroomIds]
              );
              classrooms = rooms;
            }
          }
        }
      } catch (error) {
        console.error('Error getting classrooms:', error);
        // Continue without classrooms
      }
      
      // Get available faculty
      const allocatedFaculty = await this.getAvailableFaculty(exam, requiredSupervisors);
      
      if (allocatedFaculty.length === 0) {
        throw new Error('No suitable faculty available for supervision');
      }
      
      console.log(`Found ${allocatedFaculty.length} suitable faculty members for allocation`);
      
      // Assign faculty to exam
      for (const faculty of allocatedFaculty) {
        // Check if already assigned
        const [existing] = await pool.query<any[]>(
          'SELECT * FROM faculty_exams WHERE faculty_id = ? AND exam_id = ?',
          [faculty.id, examId]
        );
        
        if (existing.length === 0) {
          console.log(`Assigning faculty ${faculty.name} (ID: ${faculty.id}) to exam ${examId}`);
          await pool.query(
            'INSERT INTO faculty_exams (faculty_id, exam_id) VALUES (?, ?)',
            [faculty.id, examId]
          );
        } else {
          console.log(`Faculty ${faculty.name} (ID: ${faculty.id}) already assigned to exam ${examId}`);
        }
      }
      
      // Create response with allocations
      const allocations = allocatedFaculty.map((faculty, index) => {
        const classroom = classrooms[index % classrooms.length];
        return {
          classroom: classroom ? classroom.name : 'Unassigned',
          supervisor: faculty.name,
          department: faculty.department,
          experience: faculty.experience || 0
        };
      });
      
      return {
        success: true,
        allocations,
        message: `Successfully allocated ${allocatedFaculty.length} supervisors to the exam`
      };
    } catch (error: any) {
      console.error('Error allocating supervisors:', error);
      return {
        success: false,
        allocations: [],
        message: error.message || 'An error occurred while allocating supervisors'
      };
    }
  }
} 