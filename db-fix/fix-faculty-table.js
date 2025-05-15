// This script adds the experience column to the faculty table if it doesn't exist
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
      SHOW COLUMNS FROM faculty LIKE 'experience'
    `);

    if (columns.length === 0) {
      console.log('Adding experience column to faculty table...');
      await connection.query(`
        ALTER TABLE faculty 
        ADD COLUMN experience INT AFTER phone
      `);
      console.log('Experience column added successfully!');

      // Check if seniority column exists
      const [seniorityCheck] = await connection.query(`
        SHOW COLUMNS FROM faculty LIKE 'seniority'
      `);

      if (seniorityCheck.length > 0) {
        console.log('Copying seniority values to experience column...');
        await connection.query(`
          UPDATE faculty SET experience = seniority WHERE experience IS NULL
        `);
        console.log('Data copied successfully!');
      }
    } else {
      console.log('Experience column already exists in faculty table.');
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