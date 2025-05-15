// This script removes the UNIQUE constraint from the faculty.email column
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'indu',
  password: process.env.DB_PASSWORD || '001',
  database: process.env.DB_NAME || 'exam_manage'
};

async function removeEmailUniqueConstraint() {
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

    if (indexes.length === 0) {
      console.log('No indexes found on email column. Nothing to remove.');
      return;
    }

    // Find the unique constraint
    const uniqueIndex = indexes.find(index => index.Non_unique === 0);
    
    if (!uniqueIndex) {
      console.log('No unique constraint found on email column.');
      return;
    }

    // Get the index name
    const indexName = uniqueIndex.Key_name;
    console.log(`Found unique constraint: ${indexName}`);

    // Drop the constraint
    console.log(`Dropping unique constraint: ${indexName}`);
    await connection.query(`
      ALTER TABLE faculty DROP INDEX ${indexName}
    `);

    console.log(`Unique constraint dropped successfully!`);

    // Also make the email field nullable if it's not already
    const [emailColumn] = await connection.query(`
      SHOW COLUMNS FROM faculty WHERE Field = 'email'
    `);

    if (emailColumn[0] && emailColumn[0].Null === 'NO') {
      console.log('Making email column nullable...');
      await connection.query(`
        ALTER TABLE faculty MODIFY email VARCHAR(100) NULL
      `);
      console.log('Email column is now nullable.');
    } else {
      console.log('Email column is already nullable.');
    }

    // Verify the changes
    const [updatedIndexes] = await connection.query(`
      SHOW INDEX FROM faculty WHERE Column_name = 'email'
    `);

    console.log('Updated email column indexes:');
    console.table(updatedIndexes);

    console.log('Database fix completed successfully!');
  } catch (error) {
    console.error('Error removing unique constraint:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the function
removeEmailUniqueConstraint(); 