import { pool } from '../config/database';

async function createTables() {
  try {
    // Create students table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        roll_number VARCHAR(20) UNIQUE NOT NULL,
        department VARCHAR(50) NOT NULL,
        semester INT NOT NULL,
        section VARCHAR(10) NOT NULL,
        elective_subjects JSON
      )
    `);

    // Create faculty table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faculty (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        department VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        max_supervisions INT DEFAULT 3,
        seniority INT DEFAULT 0,
        availability JSON
      )
    `);

    // Create classrooms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS classrooms (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        building VARCHAR(50) NOT NULL,
        floor INT NOT NULL,
        capacity INT NOT NULL,
        has_projector BOOLEAN DEFAULT false,
        is_computer_lab BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true
      )
    `);

    // Create exams table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL
      )
    `);

    // Create exam_students table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_students (
        exam_id VARCHAR(36),
        student_id VARCHAR(36),
        PRIMARY KEY (exam_id, student_id),
        FOREIGN KEY (exam_id) REFERENCES exams(id),
        FOREIGN KEY (student_id) REFERENCES students(id)
      )
    `);

    // Create exam_faculty table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_faculty (
        exam_id VARCHAR(36),
        faculty_id VARCHAR(36),
        PRIMARY KEY (exam_id, faculty_id),
        FOREIGN KEY (exam_id) REFERENCES exams(id),
        FOREIGN KEY (faculty_id) REFERENCES faculty(id)
      )
    `);

    // Create exam_classrooms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_classrooms (
        exam_id VARCHAR(36),
        classroom_id VARCHAR(36),
        PRIMARY KEY (exam_id, classroom_id),
        FOREIGN KEY (exam_id) REFERENCES exams(id),
        FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
      )
    `);

    // Create seating_arrangements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seating_arrangements (
        id VARCHAR(36) PRIMARY KEY,
        exam_id VARCHAR(36),
        student_id VARCHAR(36),
        classroom_id VARCHAR(36),
        seat_number INT NOT NULL,
        FOREIGN KEY (exam_id) REFERENCES exams(id),
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (classroom_id) REFERENCES classrooms(id)
      )
    `);

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createTables(); 