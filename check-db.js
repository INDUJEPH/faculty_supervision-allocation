const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'indu',
  password: process.env.DB_PASSWORD || '001',
  database: process.env.DB_NAME || 'exam_manage'
};

async function checkDatabaseStructure() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');

    // Get table structure
    console.log('Checking students table structure:');
    const [studentColumns] = await connection.query('DESCRIBE students');
    console.log(studentColumns);

    console.log('\nChecking faculty table structure:');
    const [facultyColumns] = await connection.query('DESCRIBE faculty');
    console.log(facultyColumns);

    console.log('\nChecking classrooms table structure:');
    const [classroomColumns] = await connection.query('DESCRIBE classrooms');
    console.log(classroomColumns);

    console.log('\nChecking exams table structure:');
    const [examColumns] = await connection.query('DESCRIBE exams');
    console.log(examColumns);

  } catch (error) {
    console.error('Error checking database structure:', error);
  } finally {
    // Close connection
    if (connection) {
      await connection.end();
    }
  }
}

// Run the function
checkDatabaseStructure().catch(console.error); 