-- Check if experience column exists
SELECT COUNT(*) INTO @column_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'faculty' 
AND COLUMN_NAME = 'experience';

-- Add the column if it doesn't exist
SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE faculty ADD COLUMN experience INT AFTER phone', 
  'SELECT "Column already exists"');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- For compatibility, copy seniority values to experience if seniority exists
SELECT COUNT(*) INTO @seniority_exists 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = 'faculty' 
AND COLUMN_NAME = 'seniority';

SET @update_sql = IF(@seniority_exists = 1 AND @column_exists = 0,
  'UPDATE faculty SET experience = seniority WHERE experience IS NULL',
  'SELECT "No update needed"');

PREPARE stmt FROM @update_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Let's see the table structure
DESCRIBE faculty; 