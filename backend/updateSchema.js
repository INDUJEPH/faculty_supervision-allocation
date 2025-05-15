const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'indu',
  password: process.env.DB_PASSWORD || '001',
  database: process.env.DB_NAME || 'exam_manage'
};

async function updateSchema() {
  let connection;
  try {
    console.log('Connecting to MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!');

    // First check if columns exist
    console.log('Checking students table columns...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM students
    `);
    
    const columnNames = columns.map(col => col.Field);
    
    // Update students table to add email and phone columns if they don't exist
    if (!columnNames.includes('email')) {
      console.log('Adding email column...');
      await connection.query(`
        ALTER TABLE students 
        ADD COLUMN email VARCHAR(255) AFTER section
      `);
    }
    
    if (!columnNames.includes('phone')) {
      console.log('Adding phone column...');
      await connection.query(`
        ALTER TABLE students 
        ADD COLUMN phone VARCHAR(20) AFTER email
      `);
    }
    
    console.log('Students table updated successfully!');

    // Update faculty table schema if needed
    console.log('Updating faculty table schema...');
    await connection.query(`
      ALTER TABLE faculty 
      MODIFY COLUMN shift_preference ENUM('full', 'half', 'none') DEFAULT 'none'
    `);
    console.log('Faculty table updated successfully!');

    console.log('All schema updates completed successfully!');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the function
updateSchema(); 