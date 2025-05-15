import { pool } from '../server';

async function resetDatabase() {
  try {
    // Drop tables in reverse order of dependencies
    await pool.query('DROP TABLE IF EXISTS exams');
    await pool.query('DROP TABLE IF EXISTS students');
    await pool.query('DROP TABLE IF EXISTS faculty');
    await pool.query('DROP TABLE IF EXISTS classrooms');

    console.log('Tables dropped successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetDatabase(); 