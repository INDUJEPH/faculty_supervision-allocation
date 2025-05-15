import fs from 'fs';
import path from 'path';
import { pool } from '../server';

/**
 * Script to seed the database with initial data
 */
async function seedDatabase() {
  try {
    console.log('Starting database seeding process...');

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'seed-data.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Split SQL statements
    const statements = sqlContent
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      await pool.query(`${statement};`);
      console.log('Executed SQL statement successfully');
    }

    console.log('Database seeding completed successfully!');
    console.log('Inserted:');
    console.log('- 40 Students across 4 departments');
    console.log('- 20 Faculty members across 4 departments');
    console.log('- 20 Classrooms');
    console.log('- 14 Exams (past, current, and future)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding process
seedDatabase(); 