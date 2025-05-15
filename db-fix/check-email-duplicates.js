// This script checks for duplicate emails in the faculty table and proposes solutions
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'indu',
  password: process.env.DB_PASSWORD || '001',
  database: process.env.DB_NAME || 'exam_manage'
};

async function checkEmailConstraint() {
  let connection;
  try {
    console.log('Connecting to MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!');

    // Check email column constraints
    console.log('Checking email column constraints...');
    const [indexes] = await connection.query(`
      SHOW INDEX FROM faculty WHERE Column_name = 'email'
    `);

    console.log('Email column indexes:');
    console.table(indexes);

    const hasUniqueConstraint = indexes.some(index => index.Non_unique === 0);
    
    if (hasUniqueConstraint) {
      console.log('The email field has a UNIQUE constraint.');
      
      // Check if there are any duplicate values currently
      const [duplicates] = await connection.query(`
        SELECT email, COUNT(*) as count
        FROM faculty 
        WHERE email IS NOT NULL
        GROUP BY email
        HAVING COUNT(*) > 1
      `);
      
      if (duplicates.length > 0) {
        console.log('Warning: There are duplicate email values in the database:');
        console.table(duplicates);
      } else {
        console.log('No duplicate email values found in the database.');
      }
      
      // Check existing emails
      const [emails] = await connection.query(`
        SELECT id, name, email, designation 
        FROM faculty
        ORDER BY id
        LIMIT 10
      `);
      
      console.log('Sample faculty records:');
      console.table(emails);

      console.log('\n=== SOLUTIONS ===\n');
      console.log('You have several options to fix the 409 Conflict error:');
      console.log('1. Make the email field allow NULL values (easiest solution if email is not always required):');
      console.log(`
-- SQL to make email allow NULL values and keep the unique constraint:
ALTER TABLE faculty MODIFY email VARCHAR(100) NULL;
      `);
      
      console.log('2. Remove the unique constraint from email (if you need to allow duplicate emails):');
      console.log(`
-- SQL to remove unique constraint from email (replace KEY_NAME with the actual key name from above):
ALTER TABLE faculty DROP INDEX ${indexes[0]?.Key_name || 'email'};
      `);
      
      console.log('3. Add a composite unique constraint (if emails should be unique within a department):');
      console.log(`
-- SQL to create a composite unique constraint:
ALTER TABLE faculty DROP INDEX ${indexes[0]?.Key_name || 'email'};
ALTER TABLE faculty ADD CONSTRAINT unique_email_per_department UNIQUE (email, department);
      `);
      
      console.log('\nChoose the appropriate solution based on your requirements. Make sure to backup your database before making these changes.');
    } else {
      console.log('The email field does NOT have a UNIQUE constraint. Checking for other issues...');
      
      // Get table structure
      const [columnInfo] = await connection.query(`
        SHOW COLUMNS FROM faculty
      `);
      
      console.log('Faculty table structure:');
      console.table(columnInfo);
      
      console.log('\nNo obvious constraints found that would cause a duplicate entry error.');
      console.log('The issue might be in one of the following:');
      console.log('1. A trigger on the faculty table');
      console.log('2. A unique constraint on a combination of fields');
      console.log('3. Application-level validation');
      
      // Check other unique constraints
      const [constraints] = await connection.query(`
        SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = '${dbConfig.database}' 
        AND TABLE_NAME = 'faculty'
        AND CONSTRAINT_TYPE = 'UNIQUE'
      `);
      
      if (constraints.length > 0) {
        console.log('\nOther unique constraints found:');
        console.table(constraints);
      }
    }

  } catch (error) {
    console.error('Error checking email constraint:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the function
checkEmailConstraint(); 