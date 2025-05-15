// This script modifies the id column in the faculty table to be auto-increment
// while properly handling foreign key constraints
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'indu',
  password: process.env.DB_PASSWORD || '001',
  database: process.env.DB_NAME || 'exam_manage'
};

async function fixIdColumn() {
  let connection;
  try {
    console.log('Connecting to MySQL database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!');

    // First, get information about foreign keys that reference the faculty table
    console.log('Checking for foreign key constraints...');
    const [foreignKeys] = await connection.query(`
      SELECT
        TABLE_NAME,
        CONSTRAINT_NAME
      FROM
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE
        REFERENCED_TABLE_NAME = 'faculty'
        AND REFERENCED_COLUMN_NAME = 'id'
        AND TABLE_SCHEMA = '${dbConfig.database}'
    `);

    if (foreignKeys.length > 0) {
      console.log(`Found ${foreignKeys.length} foreign key constraints referencing faculty.id:`);
      foreignKeys.forEach(fk => {
        console.log(`- ${fk.CONSTRAINT_NAME} from table ${fk.TABLE_NAME}`);
      });

      // Check for id column properties
      const [columns] = await connection.query(`
        SHOW COLUMNS FROM faculty LIKE 'id'
      `);

      // If id is already AUTO_INCREMENT, no need to make changes
      if (columns.length > 0 && columns[0].Extra.includes('auto_increment')) {
        console.log('id column is already set to AUTO_INCREMENT. No changes needed.');
        return;
      }

      console.log('We need to temporarily disable foreign key checks to make this change...');
      
      // Start a transaction and disable foreign key checks
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      console.log('Foreign key checks disabled');

      try {
        // Check if id exists and modify it
        if (columns.length > 0) {
          console.log('Modifying id column to be AUTO_INCREMENT...');
          
          // First, check if id is the primary key
          const [primaryKeyInfo] = await connection.query(`
            SHOW KEYS FROM faculty WHERE Key_name = 'PRIMARY'
          `);
          
          if (primaryKeyInfo.length === 0 || primaryKeyInfo[0].Column_name !== 'id') {
            if (primaryKeyInfo.length > 0) {
              console.log('Dropping existing primary key...');
              await connection.query(`
                ALTER TABLE faculty DROP PRIMARY KEY
              `);
            }
            
            console.log('Setting id as primary key and AUTO_INCREMENT...');
            await connection.query(`
              ALTER TABLE faculty 
              MODIFY id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
            `);
          } else {
            console.log('Adding AUTO_INCREMENT to id column...');
            await connection.query(`
              ALTER TABLE faculty 
              MODIFY id INT NOT NULL AUTO_INCREMENT
            `);
          }
        } else {
          console.log('id column does not exist. Creating it...');
          await connection.query(`
            ALTER TABLE faculty 
            ADD COLUMN id INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST
          `);
        }
        
        console.log('id column modified successfully!');
      } finally {
        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Foreign key checks re-enabled');
      }
    } else {
      console.log('No foreign key constraints found. Proceeding with simple modification...');
      
      // Check if id column exists and its properties
      const [columns] = await connection.query(`
        SHOW COLUMNS FROM faculty LIKE 'id'
      `);

      if (columns.length > 0) {
        // Check if id is already AUTO_INCREMENT
        if (columns[0].Extra.includes('auto_increment')) {
          console.log('id column is already set to AUTO_INCREMENT');
        } else {
          console.log('Modifying id column to be AUTO_INCREMENT...');
          
          // First, we need to check the current primary key
          const [primaryKeyInfo] = await connection.query(`
            SHOW KEYS FROM faculty WHERE Key_name = 'PRIMARY'
          `);
          
          // If id is not the primary key, we need to drop the existing primary key first
          if (primaryKeyInfo.length === 0 || primaryKeyInfo[0].Column_name !== 'id') {
            if (primaryKeyInfo.length > 0) {
              console.log('Dropping existing primary key...');
              await connection.query(`
                ALTER TABLE faculty DROP PRIMARY KEY
              `);
            }
            
            // Make id the primary key
            console.log('Setting id as primary key and AUTO_INCREMENT...');
            await connection.query(`
              ALTER TABLE faculty 
              MODIFY id INT NOT NULL AUTO_INCREMENT PRIMARY KEY
            `);
          } else {
            // If id is already the primary key, just modify it to be AUTO_INCREMENT
            console.log('Adding AUTO_INCREMENT to id column...');
            await connection.query(`
              ALTER TABLE faculty 
              MODIFY id INT NOT NULL AUTO_INCREMENT
            `);
          }
          
          console.log('id column modified successfully!');
        }
      } else {
        console.log('id column does not exist. Creating it...');
        await connection.query(`
          ALTER TABLE faculty 
          ADD COLUMN id INT NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST
        `);
        console.log('id column created successfully!');
      }
    }

    // Show the updated table structure
    const [updatedStructure] = await connection.query(`
      DESCRIBE faculty
    `);
    console.log('Updated faculty table structure:');
    console.table(updatedStructure);

    console.log('ID column fix completed successfully!');
  } catch (error) {
    console.error('Error fixing id column:', error);
  } finally {
    if (connection) {
      // Ensure foreign key checks are re-enabled in case of errors
      try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      } catch (e) {
        // Ignore errors here
      }
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the function
fixIdColumn(); 