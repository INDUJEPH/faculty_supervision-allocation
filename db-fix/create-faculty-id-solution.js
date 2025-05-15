// This script checks the structure of the faculty table and its related tables,
// then creates SQL statements for fixing the id column issue
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'indu',
  password: process.env.DB_PASSWORD || '001',
  database: process.env.DB_NAME || 'exam_manage'
};

async function analyzeAndCreateSolution() {
  let connection;
  try {
    console.log('Connecting to MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!');

    // Check if id column exists in faculty table
    console.log('Checking faculty table structure...');
    const [facultyColumns] = await connection.query(`DESCRIBE faculty`);
    console.log('Faculty table columns:');
    console.table(facultyColumns);

    // Get primary key information
    const [primaryKeyInfo] = await connection.query(`
      SHOW KEYS FROM faculty WHERE Key_name = 'PRIMARY'
    `);
    
    console.log('Primary key info:');
    console.table(primaryKeyInfo);

    // Check foreign key constraints that reference faculty table
    console.log('Checking foreign key relationships...');
    const [foreignKeys] = await connection.query(`
      SELECT
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE
        REFERENCED_TABLE_NAME = 'faculty'
        AND TABLE_SCHEMA = '${dbConfig.database}'
    `);

    console.log('Foreign keys referencing faculty table:');
    console.table(foreignKeys);

    // For each foreign key, get the column type
    console.log('Checking column types in related tables:');
    for (const fk of foreignKeys) {
      const [columnInfo] = await connection.query(`
        SHOW COLUMNS FROM ${fk.TABLE_NAME} LIKE '${fk.COLUMN_NAME}'
      `);
      console.log(`Column ${fk.TABLE_NAME}.${fk.COLUMN_NAME}:`);
      console.table(columnInfo);
    }

    // Generate solution SQL
    console.log('\n\n=== PROPOSED SOLUTION ===\n');
    console.log('Based on the analysis, here is the SQL you should run to fix the issue:');
    
    const hasIdColumn = facultyColumns.some(col => col.Field === 'id');
    const idIsAutoIncrement = hasIdColumn && facultyColumns.find(col => col.Field === 'id').Extra.includes('auto_increment');
    
    if (hasIdColumn && !idIsAutoIncrement) {
      console.log(`
-- Solution: The id column exists but is not AUTO_INCREMENT
-- First, make sure there is existing data in the id column (it should not be NULL)
-- Then run:

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Modify the id column to be AUTO_INCREMENT
ALTER TABLE faculty MODIFY id INT NOT NULL AUTO_INCREMENT;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
      `);
    } else if (!hasIdColumn) {
      console.log(`
-- Solution: The id column does not exist, we need to add it
-- First, create a new faculty table with proper id column

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- Create temporary table
CREATE TABLE faculty_new LIKE faculty;

-- Add id column to new table
ALTER TABLE faculty_new ADD COLUMN id INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;

-- Copy data to new table
INSERT INTO faculty_new SELECT NULL, * FROM faculty;

-- Rename tables
RENAME TABLE faculty TO faculty_old, faculty_new TO faculty;

-- Drop old table
DROP TABLE faculty_old;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
      `);
    } else {
      console.log(`
-- The id column already exists and is AUTO_INCREMENT. No changes needed.
-- If you're still having issues, check if you need to insert data without specifying the id value
-- and let MySQL handle the AUTO_INCREMENT.
      `);
    }

    console.log('\nNext steps:');
    console.log('1. Create a backup of your database before applying any changes.');
    console.log('2. Copy the appropriate SQL statements above.');
    console.log('3. Run them in your database administration tool (like phpMyAdmin or MySQL Workbench).');
    console.log('4. Test your application to ensure the issue is resolved.');

  } catch (error) {
    console.error('Error analyzing database:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the analysis
analyzeAndCreateSolution(); 