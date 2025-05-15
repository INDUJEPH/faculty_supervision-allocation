-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  roll_number VARCHAR(50) NOT NULL UNIQUE,
  department VARCHAR(100) NOT NULL,
  semester INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create faculty table
CREATE TABLE IF NOT EXISTS faculty (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  experience INT,
  shift_preference ENUM('full', 'half', 'none'),
  max_supervisions INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  classroom_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL
);

-- Create exam-classroom mapping table
CREATE TABLE IF NOT EXISTS exam_classrooms (
  exam_id VARCHAR(36),
  classroom_id VARCHAR(36),
  PRIMARY KEY (exam_id, classroom_id),
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

-- Create exam-faculty mapping table
CREATE TABLE IF NOT EXISTS exam_faculty (
  exam_id VARCHAR(36),
  faculty_id VARCHAR(36),
  PRIMARY KEY (exam_id, faculty_id),
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE
);

-- Create exam-student mapping table
CREATE TABLE IF NOT EXISTS exam_students (
  exam_id VARCHAR(36),
  student_id VARCHAR(36),
  PRIMARY KEY (exam_id, student_id),
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create seating arrangements table with correct column names
CREATE TABLE IF NOT EXISTS seating_arrangements (
  id VARCHAR(36) PRIMARY KEY,
  exam_id VARCHAR(36) NOT NULL,
  classroom_id VARCHAR(36) NOT NULL,
  student_id VARCHAR(36) NOT NULL,
  seat_number INT NOT NULL,
  seat_row INT NOT NULL,
  seat_column INT NOT NULL,
  UNIQUE KEY unique_seat (exam_id, classroom_id, seat_number),
  UNIQUE KEY unique_student_exam (exam_id, student_id),
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
); 