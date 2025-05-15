import express from 'express';
import cors from 'cors';
import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import multer from 'multer';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { Readable } from 'stream';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import { v4 as uuidv4 } from 'uuid';
import { 
  StudentRow, 
  FacultyRow, 
  ClassroomRow, 
  ExamRow, 
  SeatingArrangementRow, 
  CountResult,
  QueryResult,
  DashboardStats,
  DepartmentStats,
  SemesterStats,
  FacultyStats,
  StudentUploadResult
} from './types';
import { AllocationService } from './services/AllocationService';

// Load environment variables
dotenv.config();

const app = express();
const upload = multer();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:4173', 'http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(fileUpload());

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'indu',
  password: process.env.DB_PASSWORD || '001',
  database: process.env.DB_NAME || 'exam_manage'
};

// Create database pool
export const pool = mysql.createPool(dbConfig);

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Connected to MySQL database');
    connection.release();
  })
  .catch(error => {
    console.error('Error connecting to MySQL:', error);
    process.exit(1);
  });

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create students table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        roll_number VARCHAR(50) NOT NULL UNIQUE,
        department VARCHAR(100) NOT NULL,
        semester INT NOT NULL,
        section VARCHAR(10),
        email VARCHAR(255),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create faculty table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faculty (
        id VARCHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(100) NOT NULL,
        designation VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        experience INT,
        shift_preference ENUM('full', 'half', 'none'),
        max_supervisions INT,
        specialization VARCHAR(255),
        availability TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create classrooms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS classrooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        capacity INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create exams table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        status VARCHAR(50) DEFAULT 'scheduled',
        exam_type ENUM('regular', 'backlog', 'special') DEFAULT 'regular',
        semester INT NOT NULL,
        classroom_ids VARCHAR(255),
        faculty_ids VARCHAR(255),
        student_ids VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create exam_classrooms table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS exam_classrooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        exam_id INT NOT NULL,
        classroom_id INT NOT NULL,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    process.exit(1);
  }
};

// Check if sample data should be loaded
const shouldLoadSampleData = process.env.LOAD_SAMPLE_DATA === 'true';

// Initialize database and start server
initializeDatabase().then(() => {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`CORS enabled for origins: ${['http://localhost:8080', 'http://localhost:4173', 'http://localhost:5173', 'http://localhost:3000'].join(', ')}`);
    
    if (shouldLoadSampleData) {
      console.log('Loading sample data is enabled. Run "npm run seed" to load sample data.');
    }
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});

// Get dashboard statistics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [studentCount] = await pool.query<CountResult[]>('SELECT COUNT(*) as count FROM students_new');
    const [facultyCount] = await pool.query<CountResult[]>('SELECT COUNT(*) as count FROM faculty');
    const [classroomCount] = await pool.query<CountResult[]>('SELECT COUNT(*) as count FROM classrooms');
    const [examCount] = await pool.query<CountResult[]>('SELECT COUNT(*) as count FROM exams WHERE date >= CURDATE()');

    const stats: DashboardStats = {
      studentCount: studentCount[0].count,
      facultyCount: facultyCount[0].count,
      classroomCount: classroomCount[0].count,
      upcomingExamCount: examCount[0].count
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get department-wise statistics
app.get('/api/dashboard/department-stats', async (req, res) => {
  try {
    const [studentStats] = await pool.query<RowDataPacket[]>(`
      SELECT department, COUNT(*) as count
      FROM students_new
      GROUP BY department
      ORDER BY count DESC
    `);

    res.json(studentStats);
  } catch (error) {
    console.error('Error fetching department stats:', error);
    res.status(500).json({ error: 'Failed to fetch department statistics' });
  }
});

// Get semester-wise statistics
app.get('/api/dashboard/semester-stats', async (req, res) => {
  try {
    const [semesterStats] = await pool.query<RowDataPacket[]>(`
      SELECT semester, COUNT(*) as count
      FROM students_new
      GROUP BY semester
      ORDER BY semester ASC
    `);

    res.json(semesterStats);
  } catch (error) {
    console.error('Error fetching semester stats:', error);
    res.status(500).json({ error: 'Failed to fetch semester statistics' });
  }
});

// Get faculty statistics
app.get('/api/dashboard/faculty-stats', async (req, res) => {
  try {
    const [facultyStats] = await pool.query<RowDataPacket[]>(`
      SELECT department, COUNT(*) as count
      FROM faculty
      GROUP BY department
      ORDER BY count DESC
    `);

    res.json(facultyStats);
  } catch (error) {
    console.error('Error fetching faculty stats:', error);
    res.status(500).json({ error: 'Failed to fetch faculty statistics' });
  }
});

// Get upcoming exams
app.get('/api/dashboard/upcoming-exams', async (req, res) => {
  try {
    const [upcomingExams] = await pool.query<RowDataPacket[]>(`
      SELECT e.*, GROUP_CONCAT(c.name) as classroom_names
      FROM exams e
      LEFT JOIN exam_classrooms ec ON e.id = ec.exam_id
      LEFT JOIN classrooms c ON ec.classroom_id = c.id
      WHERE e.date >= CURDATE()
      GROUP BY e.id
      ORDER BY e.date ASC, e.start_time ASC
      LIMIT 5
    `);

    res.json(upcomingExams);
  } catch (error) {
    console.error('Error fetching upcoming exams:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming exams' });
  }
});

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const [students] = await pool.query<StudentRow[]>('SELECT * FROM students_new');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student by ID
app.get('/api/students/:id', async (req, res) => {
  try {
    const [students] = await pool.query<StudentRow[]>('SELECT * FROM students_new WHERE id = ?', [req.params.id]);
    
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(students[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all faculty members
app.get('/api/faculty', async (req, res) => {
  try {
    const [faculty] = await pool.query<FacultyRow[]>('SELECT * FROM faculty');
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get faculty member by ID
app.get('/api/faculty/:id', async (req, res) => {
  try {
    const [faculty] = await pool.query<FacultyRow[]>('SELECT * FROM faculty WHERE id = ?', [req.params.id]);
    
    if (faculty.length === 0) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    
    res.json(faculty[0]);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all classrooms
app.get('/api/classrooms', async (req, res) => {
  try {
    const [classrooms] = await pool.query<ClassroomRow[]>('SELECT * FROM classrooms');
    res.json(classrooms);
  } catch (error) {
    console.error('Error fetching classrooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get classroom by ID
app.get('/api/classrooms/:id', async (req, res) => {
  try {
    const [classrooms] = await pool.query<ClassroomRow[]>('SELECT * FROM classrooms WHERE id = ?', [req.params.id]);
    
    if (classrooms.length === 0) {
      return res.status(404).json({ error: 'Classroom not found' });
    }
    
    res.json(classrooms[0]);
  } catch (error) {
    console.error('Error fetching classroom:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all exams
app.get('/api/exams', async (req, res) => {
  try {
    const [exams] = await pool.query<ExamRow[]>(`
      SELECT e.*, 
        GROUP_CONCAT(DISTINCT c.name) as classroom_names,
        COUNT(DISTINCT ec.classroom_id) as classroom_count
      FROM exams e
      LEFT JOIN exam_classrooms ec ON e.id = ec.exam_id
      LEFT JOIN classrooms c ON ec.classroom_id = c.id
      GROUP BY e.id
      ORDER BY e.date DESC
    `);
    
    res.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get exam by ID
app.get('/api/exams/:id', async (req, res) => {
  try {
    const [exams] = await pool.query<ExamRow[]>(`
      SELECT e.*, 
        GROUP_CONCAT(DISTINCT c.name) as classroom_names,
        COUNT(DISTINCT ec.classroom_id) as classroom_count
      FROM exams e
      LEFT JOIN exam_classrooms ec ON e.id = ec.exam_id
      LEFT JOIN classrooms c ON ec.classroom_id = c.id
      WHERE e.id = ?
      GROUP BY e.id
    `, [req.params.id]);
    
    if (exams.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    
    res.json(exams[0]);
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload students via CSV
app.post('/api/students/upload', async (req, res) => {
  try {
    const files = req.files as unknown as { [fieldname: string]: fileUpload.UploadedFile | fileUpload.UploadedFile[] } | undefined;
    
    if (!files || !files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    
    // Get the department from form data if provided
    const defaultDepartment = req.body.department?.toLowerCase();
    
    const results = {
      success: 0,
      failures: [] as Array<{ student: any; error: string }>
    };

    const fileContent = uploadedFile.data.toString();
    const rows: any[] = [];

    await new Promise((resolve, reject) => {
      const stream = Readable.from(fileContent)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    for (const row of rows) {
      try {
        const student = {
          name: row.name,
          roll_number: row.roll_number,
          department: row.department?.toLowerCase() || defaultDepartment,
          semester: parseInt(row.semester),
          section: row.section,
          email: row.email,
          phone: row.phone
        };

        // Validate required fields
        if (!student.name || !student.roll_number || !student.department || !student.semester) {
          throw new Error('Missing required fields');
        }

        // Validate department
        const validDepartments = ['computer science', 'electronics', 'electrical', 'mechanical'];
        if (!validDepartments.includes(student.department)) {
          throw new Error('Invalid department');
        }

        // Validate semester
        if (student.semester < 1 || student.semester > 8) {
          throw new Error('Invalid semester (must be between 1 and 8)');
        }

        const [result] = await pool.query<ResultSetHeader>(
          'INSERT INTO students_new (name, roll_number, department, semester, section, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [student.name, student.roll_number, student.department, student.semester, student.section, student.email, student.phone]
        );

        results.success++;
      } catch (error: any) {
        results.failures.push({
          student: row,
          error: error.message
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error uploading students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload faculty via CSV
app.post('/api/faculty/upload', async (req, res) => {
  try {
    const files = req.files as unknown as { [fieldname: string]: fileUpload.UploadedFile | fileUpload.UploadedFile[] } | undefined;
    
    if (!files || !files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    
    const results = {
      success: 0,
      failures: [] as Array<{ faculty: any; error: string }>
    };

    const fileContent = uploadedFile.data.toString();
    const rows: any[] = [];

    await new Promise((resolve, reject) => {
      const stream = Readable.from(fileContent)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    for (const row of rows) {
      try {
        const faculty = {
          name: row.name,
          department: row.department?.toLowerCase(),
          designation: row.designation,
          email: row.email,
          phone: row.phone,
          experience: parseInt(row.experience) || 0,
          shift_preference: row.shift_preference || 'none',
          max_supervisions: parseInt(row.max_supervisions) || 0,
          specialization: row.specialization || '',
          availability: row.availability ? row.availability.split(',').map((day: string) => day.trim()) : null
        };

        // Validate required fields
        if (!faculty.name || !faculty.department || !faculty.designation) {
          throw new Error('Missing required fields');
        }

        // Validate department
        const validDepartments = ['computer science', 'electronics', 'electrical', 'mechanical'];
        if (!validDepartments.includes(faculty.department)) {
          throw new Error('Invalid department');
        }

        // Validate shift preference
        const validShiftPreferences = ['full', 'half', 'none'];
        if (!validShiftPreferences.includes(faculty.shift_preference)) {
          throw new Error('Invalid shift preference');
        }

        // Convert availability array to JSON string
        const availabilityJson = faculty.availability ? JSON.stringify(faculty.availability) : null;

        const [result] = await pool.query<ResultSetHeader>(
          'INSERT INTO faculty (id, name, department, designation, email, phone, experience, shift_preference, max_supervisions, specialization, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [faculty.name, faculty.department, faculty.designation, faculty.email, faculty.phone, faculty.experience, faculty.shift_preference, faculty.max_supervisions, faculty.specialization, availabilityJson]
        );

        results.success++;
      } catch (error: any) {
        results.failures.push({
          faculty: row,
          error: error.message
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error uploading faculty:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload classrooms via CSV
app.post('/api/classrooms/upload', async (req, res) => {
  try {
    const files = req.files as unknown as { [fieldname: string]: fileUpload.UploadedFile | fileUpload.UploadedFile[] } | undefined;
    
    if (!files || !files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
    
    const results = {
      success: 0,
      failures: [] as Array<{ classroom: any; error: string }>
    };

    const fileContent = uploadedFile.data.toString();
    const rows: any[] = [];

    await new Promise((resolve, reject) => {
      const stream = Readable.from(fileContent)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    for (const row of rows) {
      try {
        const classroom = {
          name: row.name,
          capacity: parseInt(row.capacity)
        };

        // Validate required fields
        if (!classroom.name || isNaN(classroom.capacity)) {
          throw new Error('Missing required fields or invalid capacity');
        }

        // Validate capacity
        if (classroom.capacity < 1) {
          throw new Error('Capacity must be greater than 0');
        }

        const [result] = await pool.query<ResultSetHeader>(
          'INSERT INTO classrooms (name, capacity) VALUES (?, ?)',
          [classroom.name, classroom.capacity]
        );

        results.success++;
      } catch (error: any) {
        results.failures.push({
          classroom: row,
          error: error.message
        });
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error uploading classrooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a faculty member
app.post('/api/faculty/add', async (req, res) => {
  try {
    const faculty = req.body;
    console.log('Faculty add request received:', JSON.stringify(faculty, null, 2));
    
    // Validate required fields
    if (!faculty.name || !faculty.department || !faculty.designation) {
      console.log('Missing required fields:', { 
        name: faculty.name || 'missing', 
        department: faculty.department || 'missing', 
        designation: faculty.designation || 'missing' 
      });
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Generate a UUID for the new faculty record
    const facultyId = uuidv4();
    
    // Log all parameters for debugging
    console.log('Faculty parameters:', {
      id: facultyId, // Log the generated UUID
      name: faculty.name,
      department: faculty.department,
      designation: faculty.designation,
      email: faculty.email,
      phone: faculty.phone,
      experience: faculty.experience,
      shift_preference: faculty.shift_preference,
      max_supervisions: faculty.max_supervisions,
      specialization: faculty.specialization,
      availability: faculty.availability,
    });
    
    // Get the table structure to display in the logs
    try {
      const [tableStructure] = await pool.query('DESCRIBE faculty');
      console.log('Current faculty table structure:', tableStructure);
    } catch (describeError) {
      console.error('Error getting table structure:', describeError);
    }
    
    // Convert availability array to JSON string if it exists
    const availability = faculty.availability ? JSON.stringify(faculty.availability) : null;
    console.log('Converted availability:', availability);
    
    // Ensure email is unique if provided
    let email = faculty.email;
    if (email) {
      try {
        // Check if the email already exists
        const [existingFaculty] = await pool.query<RowDataPacket[]>('SELECT id FROM faculty WHERE email = ?', [email]);
        
        if (existingFaculty.length > 0) {
          // Generate a unique email by adding a random suffix
          const randomSuffix = Math.floor(Math.random() * 10000);
          const emailParts = email.split('@');
          email = `${emailParts[0]}+${randomSuffix}@${emailParts[1]}`;
          console.log(`Email already exists. Using modified email: ${email}`);
        }
      } catch (emailCheckError) {
        console.error('Error checking existing email:', emailCheckError);
        // Continue with original email if check fails
      }
    }
    
    // Log the SQL before executing
    console.log('Executing SQL with parameters:', [
      facultyId, // Include the UUID in the parameters
      faculty.name, 
      faculty.department, 
      faculty.designation, 
      email, // Use potentially modified email 
      faculty.phone, 
      faculty.experience, 
      faculty.shift_preference, 
      faculty.max_supervisions, 
      faculty.specialization, 
      availability
    ]);
    
    // Create simplified query - try with just the required fields if all fields causes issues
    let query, params;
    try {
      query = 'INSERT INTO faculty (id, name, department, designation, email, phone, experience, shift_preference, max_supervisions, specialization, availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      params = [facultyId, faculty.name, faculty.department, faculty.designation, email, faculty.phone, faculty.experience, faculty.shift_preference, faculty.max_supervisions, faculty.specialization, availability];
      
      const [result] = await pool.query<ResultSetHeader>(query, params);
      
      const responseData = {
        id: facultyId, // Use the generated UUID in the response
        ...faculty,
        email, // Include potentially modified email
      };
      console.log('Faculty created successfully:', responseData);
      
      res.status(201).json(responseData);
    } catch (sqlError) {
      console.error('SQL Error in faculty creation:', sqlError);
      
      // Try a simplified insert with only required fields
      try {
        console.log('Trying with simplified query...');
        query = 'INSERT INTO faculty (id, name, department, designation) VALUES (?, ?, ?, ?)';
        params = [facultyId, faculty.name, faculty.department, faculty.designation];
        
        const [result] = await pool.query<ResultSetHeader>(query, params);
        
        const simplifiedResponse = {
          id: facultyId, // Use the generated UUID in the response
          name: faculty.name,
          department: faculty.department,
          designation: faculty.designation
        };
        console.log('Faculty created with simplified query:', simplifiedResponse);
        
        res.status(201).json(simplifiedResponse);
      } catch (simplifiedError) {
        console.error('Even simplified query failed:', simplifiedError);
        throw sqlError; // Throw the original error for better debugging
      }
    }
  } catch (error) {
    console.error('Error adding faculty:', error);
    // Provide more detailed error information
    const errorDetails = error instanceof Error ? error.stack : String(error);
    console.error('Error details:', errorDetails);
    
    // Check for specific error types
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific MySQL errors
      if ('code' in error) {
        const mysqlError = error as any;
        if (mysqlError.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ 
            error: 'Duplicate entry', 
            details: 'A faculty with this information already exists'
          });
        }
        
        if (mysqlError.code === 'ER_NO_SUCH_TABLE') {
          return res.status(500).json({ 
            error: 'Database error', 
            details: 'The faculty table does not exist'
          });
        }
        
        if (mysqlError.code === 'ER_BAD_FIELD_ERROR') {
          return res.status(500).json({ 
            error: 'Database schema error', 
            details: mysqlError.message || 'Invalid field in faculty table'
          });
        }
      }
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.constructor.name : 'Unknown'
    });
  }
});

// Get faculty member for add/edit form
app.get('/api/faculty/add', async (req, res) => {
  try {
    // Return empty form template
    res.json({
      name: '',
      department: 'computer science',
      designation: '',
      email: '',
      phone: '',
      experience: 0,
      shift_preference: 'full',
      max_supervisions: 0,
      specialization: '',
      availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get exam with seating arrangement details
app.get('/api/exams/arrange', async (req, res) => {
  try {
    const examId = req.query.id;
    
    if (!examId) {
      return res.status(400).json({ error: 'Exam ID is required' });
    }
    
    const [exams] = await pool.query<ExamRow[]>(
      `SELECT e.*,
        GROUP_CONCAT(DISTINCT c.name) as classroom_names,
        COUNT(DISTINCT ec.classroom_id) as classroom_count
      FROM exams e
      LEFT JOIN exam_classrooms ec ON e.id = ec.exam_id
      LEFT JOIN classrooms c ON ec.classroom_id = c.id
      WHERE e.id = ?
      GROUP BY e.id`,
      [examId]
    );
    
    if (exams.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    
    // Get classroom details
    const [classrooms] = await pool.query<ClassroomRow[]>(
      `SELECT c.* 
      FROM classrooms c
      JOIN exam_classrooms ec ON c.id = ec.classroom_id
      WHERE ec.exam_id = ?`,
      [examId]
    );
    
    // Get seating arrangements if any
    const [seatingArrangements] = await pool.query<SeatingArrangementRow[]>(
      `SELECT sa.* 
      FROM seating_arrangements sa
      WHERE sa.exam_id = ?`,
      [examId]
    );
    
    res.json({
      exam: exams[0],
      classrooms,
      seatingArrangements: seatingArrangements || []
    });
  } catch (error) {
    console.error('Error fetching exam arrangement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get supervision reports
app.get('/api/supervision/reports', async (req, res) => {
  try {
    // Get supervision assignments grouped by faculty
    const [reports] = await pool.query<RowDataPacket[]>(
      `SELECT 
        f.id,
        f.name,
        f.department,
        f.designation,
        COUNT(DISTINCT e.id) as total_exams,
        GROUP_CONCAT(DISTINCT e.name ORDER BY e.date) as exam_names,
        SUM(TIMESTAMPDIFF(HOUR, e.start_time, e.end_time)) as total_hours
      FROM faculty f
      LEFT JOIN faculty_exams fe ON f.id = fe.faculty_id
      LEFT JOIN exams e ON fe.exam_id = e.id
      GROUP BY f.id
      ORDER BY total_exams DESC`
    );
    
    res.json(reports);
  } catch (error) {
    console.error('Error fetching supervision reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get faculty supervision schedule by faculty ID
app.get('/api/supervision/schedule', async (req, res) => {
  try {
    const facultyId = req.query.facultyId;
    
    if (!facultyId) {
      return res.status(400).json({ error: 'Faculty ID is required' });
    }
    
    // Get all exams assigned to this faculty member
    const [assignedExams] = await pool.query<RowDataPacket[]>(
      `SELECT 
        e.*,
        GROUP_CONCAT(DISTINCT c.name) as classroom_names
      FROM exams e
      JOIN faculty_exams fe ON e.id = fe.exam_id
      LEFT JOIN exam_classrooms ec ON e.id = ec.exam_id
      LEFT JOIN classrooms c ON ec.classroom_id = c.id
      WHERE fe.faculty_id = ?
      GROUP BY e.id
      ORDER BY e.date ASC, e.start_time ASC`,
      [facultyId]
    );
    
    res.json(assignedExams);
  } catch (error) {
    console.error('Error fetching faculty supervision schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint for automatic supervisor allocation
app.post('/api/supervisors/allocate', async (req, res) => {
  try {
    const { examId, date, startTime, endTime, examType, requiredSupervisors } = req.body;
    
    // Validate required fields
    if (!examId || !date || !startTime || !endTime || !examType || !requiredSupervisors) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Parse requiredSupervisors as a number
    const numSupervisors = parseInt(requiredSupervisors);
    if (isNaN(numSupervisors) || numSupervisors < 1) {
      return res.status(400).json({ 
        success: false, 
        message: 'Required supervisors must be a positive number' 
      });
    }
    
    const result = await AllocationService.allocateSupervisors(
      examId,
      date,
      startTime,
      endTime,
      examType,
      numSupervisors
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('Error allocating supervisors:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error',
      allocations: []
    });
  }
});

// Create faculty_exams table if needed
app.get('/api/setup/tables', async (req, res) => {
  try {
    // Create faculty_exams table for supervision assignments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faculty_exams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faculty_id INT NOT NULL,
        exam_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        UNIQUE KEY faculty_exam_unique (faculty_id, exam_id)
      )
    `);
    
    // Create seating_arrangements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seating_arrangements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        exam_id INT NOT NULL,
        classroom_id INT NOT NULL,
        student_id INT NOT NULL,
        seat_number INT NOT NULL,
        row_number INT,
        column_number INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY seat_unique (exam_id, classroom_id, seat_number)
      )
    `);
    
    res.status(200).json({ message: 'Tables created successfully' });
  } catch (error) {
    console.error('Error setting up tables:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new student
app.post('/api/students', async (req, res) => {
  try {
    const student = req.body;
    
    // Handle both camelCase and snake_case field names
    const name = student.name;
    const roll_number = student.roll_number || student.rollNumber;
    const department = (student.department || '').toLowerCase();
    const semester = parseInt(student.semester);
    const section = student.section;
    const email = student.email;
    const phone = student.phone;
    const elective_subjects = student.elective_subjects || student.electiveSubjects;
    
    // Validate required fields
    if (!name || !roll_number || !department || !semester) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate department
    const validDepartments = ['computer science', 'electronics', 'electrical', 'mechanical'];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({ error: 'Invalid department' });
    }
    
    // Validate semester
    if (isNaN(semester) || semester < 1 || semester > 8) {
      return res.status(400).json({ error: 'Invalid semester (must be between 1 and 8)' });
    }
    
    console.log('Inserting student:', { name, roll_number, department, semester, section, email, phone });
    
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO students_new (name, roll_number, department, semester, section, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        name,
        roll_number,
        department,
        semester,
        section,
        email || null,
        phone || null
      ]
    );
    
    res.status(201).json({
      id: result.insertId,
      name,
      roll_number,
      department,
      semester,
      section,
      email,
      phone,
      elective_subjects: elective_subjects || []
    });
  } catch (error: any) {
    console.error('Error creating student:', error);
    
    // Handle duplicate entry errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A student with this roll number already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = req.body;
    
    // Handle both camelCase and snake_case field names
    const name = student.name;
    const roll_number = student.roll_number || student.rollNumber;
    const department = (student.department || '').toLowerCase();
    const semester = parseInt(student.semester);
    const section = student.section;
    const email = student.email;
    const phone = student.phone;
    const elective_subjects = student.elective_subjects || student.electiveSubjects;
    
    // Validate required fields
    if (!name || !roll_number || !department || !semester) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate department
    const validDepartments = ['computer science', 'electronics', 'electrical', 'mechanical'];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({ error: 'Invalid department' });
    }
    
    // Validate semester
    if (isNaN(semester) || semester < 1 || semester > 8) {
      return res.status(400).json({ error: 'Invalid semester (must be between 1 and 8)' });
    }
    
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE students_new SET name = ?, roll_number = ?, department = ?, semester = ?, section = ?, email = ?, phone = ? WHERE id = ?',
      [
        name,
        roll_number,
        department,
        semester,
        section,
        email || null,
        phone || null,
        id
      ]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json({
      id,
      name,
      roll_number,
      department,
      semester,
      section,
      email,
      phone,
      elective_subjects: elective_subjects || []
    });
  } catch (error: any) {
    console.error('Error updating student:', error);
    
    // Handle duplicate entry errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A student with this roll number already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query<ResultSetHeader>('DELETE FROM students_new WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});