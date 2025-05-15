const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'indu',
  password: process.env.DB_PASSWORD || '001',
  database: process.env.DB_NAME || 'exam_manage'
};

// Generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Sample data
const sampleStudents = [
  { id: generateUUID(), name: 'John Smith', roll_number: 'CS001', department: 'computer science', semester: 3, section: 'A' },
  { id: generateUUID(), name: 'Emily Johnson', roll_number: 'CS002', department: 'computer science', semester: 3, section: 'A' },
  { id: generateUUID(), name: 'Michael Brown', roll_number: 'CS003', department: 'computer science', semester: 5, section: 'B' },
  { id: generateUUID(), name: 'Sarah Davis', roll_number: 'EL001', department: 'electronics', semester: 3, section: 'A' },
  { id: generateUUID(), name: 'James Wilson', roll_number: 'EL002', department: 'electronics', semester: 5, section: 'B' },
  { id: generateUUID(), name: 'Jennifer Miller', roll_number: 'ME001', department: 'mechanical', semester: 3, section: 'A' },
  { id: generateUUID(), name: 'Robert Taylor', roll_number: 'ME002', department: 'mechanical', semester: 5, section: 'B' },
  { id: generateUUID(), name: 'Jessica Anderson', roll_number: 'EE001', department: 'electrical', semester: 3, section: 'A' },
  { id: generateUUID(), name: 'Daniel Thomas', roll_number: 'EE002', department: 'electrical', semester: 5, section: 'B' },
  { id: generateUUID(), name: 'Lisa Martinez', roll_number: 'CS004', department: 'computer science', semester: 7, section: 'C' }
];

const sampleFaculty = [
  { id: generateUUID(), name: 'Dr. David Wilson', department: 'computer science', designation: 'Professor', email: 'david.wilson@faculty.edu', phone: '1122334455', max_supervisions: 5, seniority: 15, is_exam_coordinator: 1 },
  { id: generateUUID(), name: 'Dr. Susan Clark', department: 'computer science', designation: 'Associate Professor', email: 'susan.clark@faculty.edu', phone: '2233445566', max_supervisions: 4, seniority: 10 },
  { id: generateUUID(), name: 'Prof. Robert Johnson', department: 'electronics', designation: 'Assistant Professor', email: 'robert.johnson@faculty.edu', phone: '3344556677', max_supervisions: 3, seniority: 8 },
  { id: generateUUID(), name: 'Dr. Mary Williams', department: 'electronics', designation: 'Professor', email: 'mary.williams@faculty.edu', phone: '4455667788', max_supervisions: 5, seniority: 12 },
  { id: generateUUID(), name: 'Prof. James Brown', department: 'mechanical', designation: 'Assistant Professor', email: 'james.brown@faculty.edu', phone: '5566778899', max_supervisions: 2, seniority: 6 },
  { id: generateUUID(), name: 'Dr. Patricia Davis', department: 'mechanical', designation: 'Associate Professor', email: 'patricia.davis@faculty.edu', phone: '6677889900', max_supervisions: 4, seniority: 9 },
  { id: generateUUID(), name: 'Prof. Michael Miller', department: 'electrical', designation: 'Assistant Professor', email: 'michael.miller@faculty.edu', phone: '7788990011', max_supervisions: 2, seniority: 5 },
  { id: generateUUID(), name: 'Dr. Elizabeth Moore', department: 'electrical', designation: 'Professor', email: 'elizabeth.moore@faculty.edu', phone: '8899001122', max_supervisions: 5, seniority: 14 }
];

const sampleClassrooms = [
  { id: generateUUID(), name: 'Classroom 101', building: 'Main Building', floor: 1, capacity: 40, preferred_seating_type: 'standard' },
  { id: generateUUID(), name: 'Classroom 102', building: 'Main Building', floor: 1, capacity: 40, preferred_seating_type: 'standard' },
  { id: generateUUID(), name: 'Classroom 103', building: 'Main Building', floor: 1, capacity: 50, preferred_seating_type: 'standard' },
  { id: generateUUID(), name: 'Classroom 201', building: 'Main Building', floor: 2, capacity: 35, preferred_seating_type: 'standard' },
  { id: generateUUID(), name: 'Classroom 202', building: 'Main Building', floor: 2, capacity: 35, preferred_seating_type: 'standard' },
  { id: generateUUID(), name: 'Classroom 301', building: 'Main Building', floor: 3, capacity: 60, preferred_seating_type: 'standard' },
  { id: generateUUID(), name: 'Lecture Hall 1', building: 'Science Block', floor: 1, capacity: 100, has_projector: 1, preferred_seating_type: 'theater' },
  { id: generateUUID(), name: 'Lecture Hall 2', building: 'Science Block', floor: 1, capacity: 120, has_projector: 1, preferred_seating_type: 'theater' },
  { id: generateUUID(), name: 'Computer Lab A', building: 'Technology Block', floor: 1, capacity: 30, is_computer_lab: 1, preferred_seating_type: 'lab' },
  { id: generateUUID(), name: 'Computer Lab B', building: 'Technology Block', floor: 1, capacity: 30, is_computer_lab: 1, preferred_seating_type: 'lab' }
];

const getDateAfterDays = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Current date + days
const today = new Date().toISOString().split('T')[0];
const nextWeek = getDateAfterDays(7);
const twoWeeksFromNow = getDateAfterDays(14);
const threeWeeksFromNow = getDateAfterDays(21);

const sampleExams = [
  { id: generateUUID(), name: 'Data Structures Midterm', subject: 'Data Structures', date: nextWeek, start_time: '09:00:00', end_time: '11:00:00' },
  { id: generateUUID(), name: 'Database Systems Final', subject: 'Database Systems', date: twoWeeksFromNow, start_time: '14:00:00', end_time: '16:00:00' },
  { id: generateUUID(), name: 'Computer Networks Midterm', subject: 'Computer Networks', date: nextWeek, start_time: '11:30:00', end_time: '13:30:00' },
  { id: generateUUID(), name: 'Digital Electronics Final', subject: 'Digital Electronics', date: threeWeeksFromNow, start_time: '09:00:00', end_time: '11:00:00' },
  { id: generateUUID(), name: 'Mechanics Midterm', subject: 'Mechanics', date: nextWeek, start_time: '14:00:00', end_time: '16:00:00' },
  { id: generateUUID(), name: 'Electric Circuits Final', subject: 'Electric Circuits', date: twoWeeksFromNow, start_time: '09:00:00', end_time: '11:00:00' },
  { id: generateUUID(), name: 'Algorithms Backlog', subject: 'Design and Analysis of Algorithms', date: threeWeeksFromNow, start_time: '14:00:00', end_time: '16:00:00' }
];

// Connect to database and insert data
async function insertSampleData() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');

    // Start transaction
    await connection.beginTransaction();

    // Clear existing data
    await connection.query('DELETE FROM exam_classrooms');
    await connection.query('DELETE FROM exams');
    await connection.query('DELETE FROM classrooms');
    await connection.query('DELETE FROM faculty');
    await connection.query('DELETE FROM students');

    // Insert students
    console.log('Inserting students...');
    for (const student of sampleStudents) {
      await connection.query(
        'INSERT INTO students (id, name, roll_number, department, semester, section) VALUES (?, ?, ?, ?, ?, ?)',
        [student.id, student.name, student.roll_number, student.department, student.semester, student.section]
      );
    }

    // Insert faculty
    console.log('Inserting faculty...');
    for (const faculty of sampleFaculty) {
      await connection.query(
        'INSERT INTO faculty (id, name, department, designation, email, phone, max_supervisions, seniority, is_exam_coordinator) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [faculty.id, faculty.name, faculty.department, faculty.designation, faculty.email, faculty.phone, faculty.max_supervisions, faculty.seniority, faculty.is_exam_coordinator || 0]
      );
    }

    // Insert classrooms
    console.log('Inserting classrooms...');
    for (const classroom of sampleClassrooms) {
      await connection.query(
        'INSERT INTO classrooms (id, name, building, floor, capacity, has_projector, is_computer_lab, preferred_seating_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [classroom.id, classroom.name, classroom.building, classroom.floor, classroom.capacity, classroom.has_projector || 0, classroom.is_computer_lab || 0, classroom.preferred_seating_type]
      );
    }

    // Insert exams
    console.log('Inserting exams...');
    for (const exam of sampleExams) {
      await connection.query(
        'INSERT INTO exams (id, name, subject, date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
        [exam.id, exam.name, exam.subject, exam.date, exam.start_time, exam.end_time]
      );
    }

    // Commit transaction
    await connection.commit();
    console.log('Sample data inserted successfully');

  } catch (error) {
    // Rollback on error
    if (connection) {
      await connection.rollback();
    }
    console.error('Error inserting sample data:', error);
  } finally {
    // Close connection
    if (connection) {
      await connection.end();
    }
  }
}

// Run the function
insertSampleData().catch(console.error); 