// This script adds all potentially missing columns to the faculty table
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'indu',
  password: process.env.DB_PASSWORD || '001',
  database: process.env.DB_NAME || 'exam_manage'
};

async function fixAllMissingColumns() {
  let connection;
  try {
    console.log('Connecting to MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!');

    // Get current columns
    const [currentColumns] = await connection.query(`
      SHOW COLUMNS FROM faculty
    `);
    
    const columnNames = currentColumns.map(col => col.Field);
    console.log('Current columns:', columnNames);
    
    // Check and add experience column
    if (!columnNames.includes('experience')) {
      console.log('Adding experience column...');
      await connection.query(`
        ALTER TABLE faculty 
        ADD COLUMN experience INT AFTER phone
      `);
      console.log('experience column added successfully!');
    }
    
    // Check and add shift_preference column
    if (!columnNames.includes('shift_preference')) {
      console.log('Adding shift_preference column...');
      await connection.query(`
        ALTER TABLE faculty 
        ADD COLUMN shift_preference ENUM('full', 'half', 'none') DEFAULT 'full' AFTER experience
      `);
      console.log('shift_preference column added successfully!');
    }
    
    // Check and add max_supervisions column
    if (!columnNames.includes('max_supervisions')) {
      console.log('Adding max_supervisions column...');
      await connection.query(`
        ALTER TABLE faculty 
        ADD COLUMN max_supervisions INT DEFAULT 3 AFTER shift_preference
      `);
      console.log('max_supervisions column added successfully!');
    }
    
    // Check and add specialization column
    if (!columnNames.includes('specialization')) {
      console.log('Adding specialization column...');
      await connection.query(`
        ALTER TABLE faculty 
        ADD COLUMN specialization VARCHAR(255) AFTER max_supervisions
      `);
      console.log('specialization column added successfully!');
    }
    
    // Check and add availability column
    if (!columnNames.includes('availability')) {
      console.log('Adding availability column...');
      await connection.query(`
        ALTER TABLE faculty 
        ADD COLUMN availability TEXT AFTER specialization
      `);
      console.log('availability column added successfully!');
    }
    
    // Show the updated table structure
    const [updatedStructure] = await connection.query(`
      DESCRIBE faculty
    `);
    console.log('Updated faculty table structure:');
    console.table(updatedStructure);

    console.log('All schema fixes completed successfully!');
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
fixAllMissingColumns(); 