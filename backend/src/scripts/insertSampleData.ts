import { pool } from '../server';
import fs from 'fs';
import path from 'path';

async function insertSampleData() {
  try {
    // First, clear existing data (in correct order due to foreign key constraints)
    await pool.query('DELETE FROM exams');
    await pool.query('DELETE FROM students');
    await pool.query('DELETE FROM faculty');
    await pool.query('DELETE FROM classrooms');
    console.log('Existing data cleared successfully');

    // Read and execute sample data SQL
    const sampleDataSql = fs.readFileSync(path.join(__dirname, '../data/sample_data.sql'), 'utf8');
    const insertStatements = sampleDataSql.split(';').filter(statement => statement.trim());

    // Execute each statement
    for (const statement of insertStatements) {
      if (statement.trim()) {
        await pool.query(statement);
        console.log('Data inserted successfully');
      }
    }

    console.log('Sample data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

insertSampleData(); 