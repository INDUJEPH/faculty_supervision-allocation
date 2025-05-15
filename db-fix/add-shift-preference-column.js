// This script adds the shift_preference column to the faculty table if it doesn't exist
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'indu',
  password: process.env.DB_PASSWORD || '001',
  database: process.env.DB_NAME || 'exam_manage'
};

async function fixFacultyTable() {
  let connection;
  try {
    console.log('Connecting to MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!');

    // Check if column exists
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM faculty LIKE 'shift_preference'
    `);

    if (columns.length === 0) {
      console.log('Adding shift_preference column to faculty table...');
      await connection.query(`
        ALTER TABLE faculty 
        ADD COLUMN shift_preference ENUM('full', 'half', 'none') DEFAULT 'full' AFTER experience
      `);
      console.log('shift_preference column added successfully!');
    } else {
      console.log('shift_preference column already exists in faculty table.');
    }

    // Show the table structure
    const [tableStructure] = await connection.query(`
      DESCRIBE faculty
    `);
    console.log('Faculty table structure:');
    console.table(tableStructure);

    console.log('Schema fix completed successfully!');
  } catch (error) {
    console.error('Error fixing schema:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the function
fixFacultyTable(); 