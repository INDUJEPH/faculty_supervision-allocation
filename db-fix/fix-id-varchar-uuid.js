// This script modifies the faculty table to use UUID for id
// This aligns with foreign key constraints in other tables that use VARCHAR(36)
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
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

    // Check if the id column exists and its type
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM faculty LIKE 'id'
    `);

    if (columns.length > 0) {
      console.log(`Current id column type: ${columns[0].Type}`);
      
      // If id is not VARCHAR(36), we need to modify it
      if (columns[0].Type.toLowerCase() !== 'varchar(36)') {
        console.log('The id column needs to be changed to VARCHAR(36) to match foreign key references');
        
        // First, check if there's existing data
        const [rowCount] = await connection.query(`
          SELECT COUNT(*) as count FROM faculty
        `);
        
        console.log(`Faculty table has ${rowCount[0].count} rows`);
        
        if (rowCount[0].count > 0) {
          console.log('Table has existing data. We need to create a new table with the correct structure.');
          
          // Get existing table structure
          const [createTableStatement] = await connection.query(`
            SHOW CREATE TABLE faculty
          `);
          
          const createTableSQL = createTableStatement[0]['Create Table'];
          console.log('Current table structure:');
          console.log(createTableSQL);
          
          // Disable foreign key checks temporarily
          await connection.query('SET FOREIGN_KEY_CHECKS = 0');
          console.log('Foreign key checks disabled');
          
          try {
            // Create a new table (temporary) with the same structure
            console.log('Creating temporary table faculty_new...');
            await connection.query(`
              CREATE TABLE faculty_new LIKE faculty
            `);
            
            // Modify the id column in the new table
            console.log('Modifying id column in temporary table to VARCHAR(36)...');
            await connection.query(`
              ALTER TABLE faculty_new 
              MODIFY id VARCHAR(36) NOT NULL
            `);
            
            // Get all rows from the original table
            console.log('Fetching all data from faculty table...');
            const [rows] = await connection.query(`
              SELECT * FROM faculty
            `);
            
            if (rows.length > 0) {
              console.log(`Found ${rows.length} rows to transfer`);
              
              // For each row, generate a UUID and insert into the new table
              console.log('Inserting data with UUID into temporary table...');
              for (const row of rows) {
                const uuid = uuidv4();
                
                // Get column names except id
                const columns = Object.keys(row).filter(key => key !== 'id');
                const columnList = ['id', ...columns].join(', ');
                
                // Get values for the columns except id
                const valuesList = [
                  `'${uuid}'`, 
                  ...columns.map(col => {
                    if (row[col] === null) return 'NULL';
                    if (typeof row[col] === 'string') return `'${row[col].replace(/'/g, "''")}'`;
                    return row[col];
                  })
                ].join(', ');
                
                // Insert the row with new UUID
                await connection.query(`
                  INSERT INTO faculty_new (${columnList}) 
                  VALUES (${valuesList})
                `);
                
                // Update references in other tables
                const [foreignKeys] = await connection.query(`
                  SELECT
                    TABLE_NAME,
                    COLUMN_NAME
                  FROM
                    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                  WHERE
                    REFERENCED_TABLE_NAME = 'faculty'
                    AND REFERENCED_COLUMN_NAME = 'id'
                    AND TABLE_SCHEMA = '${dbConfig.database}'
                `);
                
                for (const fk of foreignKeys) {
                  console.log(`Updating references in ${fk.TABLE_NAME}.${fk.COLUMN_NAME}...`);
                  await connection.query(`
                    UPDATE ${fk.TABLE_NAME}
                    SET ${fk.COLUMN_NAME} = '${uuid}'
                    WHERE ${fk.COLUMN_NAME} = '${row.id}'
                  `);
                }
              }
              
              // Rename tables to swap old with new
              console.log('Swapping tables...');
              await connection.query(`
                RENAME TABLE faculty TO faculty_old,
                             faculty_new TO faculty
              `);
              
              // Drop the old table
              console.log('Dropping old table...');
              await connection.query(`
                DROP TABLE faculty_old
              `);
              
              console.log('Table structure updated successfully!');
            }
          } finally {
            // Re-enable foreign key checks
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
            console.log('Foreign key checks re-enabled');
          }
        } else {
          // No data, we can simply modify the column
          console.log('Table has no data. Modifying id column directly...');
          await connection.query('SET FOREIGN_KEY_CHECKS = 0');
          try {
            await connection.query(`
              ALTER TABLE faculty 
              MODIFY id VARCHAR(36) NOT NULL
            `);
            console.log('id column modified successfully!');
          } finally {
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
          }
        }
      } else {
        console.log('id column is already VARCHAR(36), no type change needed');
      }

      // Now, we need to ensure we can handle auto-generation of UUID values for new inserts
      // MySQL doesn't have a native UUID generator as DEFAULT value, so we'll need to handle this in the application code
      console.log(`
IMPORTANT: Since we're using UUID for the id column, make sure your API/backend code generates a UUID before inserting a new faculty record.
Add the following code to your faculty creation route/controller:

const { v4: uuidv4 } = require('uuid');

// Before inserting faculty data
facultyData.id = uuidv4();

// Then proceed with the normal insert operation
`);
    } else {
      console.log('id column does not exist. Creating it...');
      await connection.query(`
        ALTER TABLE faculty 
        ADD COLUMN id VARCHAR(36) NOT NULL FIRST
      `);
      console.log('id column created successfully!');
      
      // Generate UUID for existing rows if any
      console.log('Generating UUIDs for existing rows...');
      const [rows] = await connection.query(`
        SELECT * FROM faculty
      `);
      
      if (rows.length > 0) {
        for (const row of rows) {
          const uuid = uuidv4();
          await connection.query(`
            UPDATE faculty 
            SET id = '${uuid}'
            WHERE id IS NULL OR id = '' LIMIT 1
          `);
        }
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