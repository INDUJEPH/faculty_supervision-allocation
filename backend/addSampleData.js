const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'indu',
  password: process.env.DB_PASSWORD || '001',
  database: process.env.DB_NAME || 'exam_manage'
};

async function addSampleData() {
  let connection;
  try {
    console.log('Connecting to MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!');

    // Add sample students
    const students = [
      ['John Smith', 'CS2001', 'computer science', 4, 'A', 'john.smith@university.edu', '555-1001'],
      ['Emily Johnson', 'CS2002', 'computer science', 4, 'A', 'emily.johnson@university.edu', '555-1002'],
      ['Michael Williams', 'CS2003', 'computer science', 4, 'B', 'michael.williams@university.edu', '555-1003'],
      ['Jessica Brown', 'CS2004', 'computer science', 4, 'B', 'jessica.brown@university.edu', '555-1004'],
      ['David Jones', 'CS2005', 'computer science', 6, 'A', 'david.jones@university.edu', '555-1005'],
      ['Thomas Taylor', 'EL3001', 'electronics', 2, 'A', 'thomas.taylor@university.edu', '555-2001'],
      ['Amanda Anderson', 'EL3002', 'electronics', 2, 'A', 'amanda.anderson@university.edu', '555-2002'],
      ['Brian Robinson', 'ME4001', 'mechanical', 3, 'A', 'brian.robinson@university.edu', '555-3001'],
      ['Nicole Lewis', 'ME4002', 'mechanical', 3, 'A', 'nicole.lewis@university.edu', '555-3002'],
      ['Steven Green', 'EE5001', 'electrical', 1, 'A', 'steven.green@university.edu', '555-4001']
    ];

    console.log('Adding sample students...');
    const studentQuery = 'INSERT INTO students (name, roll_number, department, semester, section, email, phone) VALUES ?';
    await connection.query(studentQuery, [students]);
    console.log('Added students successfully!');

    // Add sample faculty
    const faculty = [
      ['Dr. Richard Davis', 'computer science', 'Professor', 'richard.davis@university.edu', '555-5001', 15, 'full', 5],
      ['Dr. Jennifer Wilson', 'computer science', 'Associate Professor', 'jennifer.wilson@university.edu', '555-5002', 10, 'full', 4],
      ['Dr. Patricia Miller', 'electronics', 'Professor', 'patricia.miller@university.edu', '555-5006', 18, 'full', 5],
      ['Dr. Robert Taylor', 'electronics', 'Associate Professor', 'robert.taylor@university.edu', '555-5007', 11, 'full', 4],
      ['Dr. Thomas Harris', 'mechanical', 'Professor', 'thomas.harris@university.edu', '555-5011', 20, 'full', 5],
      ['Dr. Barbara Jackson', 'mechanical', 'Associate Professor', 'barbara.jackson@university.edu', '555-5012', 13, 'full', 4],
      ['Dr. Carol Walker', 'electrical', 'Professor', 'carol.walker@university.edu', '555-5016', 17, 'full', 5],
      ['Dr. John Nelson', 'electrical', 'Associate Professor', 'john.nelson@university.edu', '555-5017', 12, 'full', 4]
    ];

    console.log('Adding sample faculty...');
    const facultyQuery = 'INSERT INTO faculty (name, department, designation, email, phone, experience, shift_preference, max_supervisions) VALUES ?';
    await connection.query(facultyQuery, [faculty]);
    console.log('Added faculty successfully!');

    // Add sample classrooms
    const classrooms = [
      ['A-101', 60],
      ['A-102', 60],
      ['B-201', 80],
      ['B-202', 80],
      ['C-301', 100],
      ['C-302', 100],
      ['D-401', 40],
      ['D-402', 40]
    ];

    console.log('Adding sample classrooms...');
    const classroomQuery = 'INSERT INTO classrooms (name, capacity) VALUES ?';
    await connection.query(classroomQuery, [classrooms]);
    console.log('Added classrooms successfully!');

    console.log('All sample data added successfully!');
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the function
addSampleData(); 