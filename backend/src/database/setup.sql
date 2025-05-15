-- Create database if not exists
CREATE DATABASE IF NOT EXISTS exam_manage;
USE exam_manage;

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roll_number VARCHAR(20) NOT NULL UNIQUE,
    department VARCHAR(50) NOT NULL,
    semester INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    elective_subjects JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create faculty table
CREATE TABLE IF NOT EXISTS faculty (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    max_supervisions INT DEFAULT 3,
    seniority INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create classrooms table
CREATE TABLE IF NOT EXISTS classrooms (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    building VARCHAR(50) NOT NULL,
    floor INT NOT NULL,
    capacity INT NOT NULL,
    has_projector BOOLEAN DEFAULT FALSE,
    is_computer_lab BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
-- Students
INSERT INTO students (id, name, roll_number, department, semester, section) VALUES
(UUID(), 'John Doe', 'CS2023001', 'Computer Science', 3, 'A'),
(UUID(), 'Jane Smith', 'CS2023002', 'Computer Science', 3, 'A'),
(UUID(), 'Bob Johnson', 'CS2023003', 'Computer Science', 3, 'B'),
(UUID(), 'Alice Brown', 'EE2023001', 'Electrical Engineering', 2, 'A'),
(UUID(), 'Charlie Wilson', 'EE2023002', 'Electrical Engineering', 2, 'B'),
(UUID(), 'David Lee', 'ME2023001', 'Mechanical Engineering', 4, 'A'),
(UUID(), 'Eva Martinez', 'ME2023002', 'Mechanical Engineering', 4, 'B');

-- Faculty
INSERT INTO faculty (id, name, department, email, phone) VALUES
(UUID(), 'Dr. Sarah Williams', 'Computer Science', 'sarah.williams@university.edu', '1234567890'),
(UUID(), 'Prof. Michael Brown', 'Computer Science', 'michael.brown@university.edu', '2345678901'),
(UUID(), 'Dr. Emily Davis', 'Electrical Engineering', 'emily.davis@university.edu', '3456789012'),
(UUID(), 'Prof. Robert Wilson', 'Electrical Engineering', 'robert.wilson@university.edu', '4567890123'),
(UUID(), 'Dr. Lisa Anderson', 'Mechanical Engineering', 'lisa.anderson@university.edu', '5678901234');

-- Classrooms
INSERT INTO classrooms (id, name, building, floor, capacity, has_projector, is_computer_lab) VALUES
(UUID(), 'Room 101', 'Main Building', 1, 50, TRUE, FALSE),
(UUID(), 'Room 102', 'Main Building', 1, 40, TRUE, FALSE),
(UUID(), 'Lab 201', 'Science Building', 2, 30, TRUE, TRUE),
(UUID(), 'Lab 202', 'Science Building', 2, 25, TRUE, TRUE),
(UUID(), 'Room 301', 'Engineering Building', 3, 60, TRUE, FALSE);

-- Exams
INSERT INTO exams (id, name, subject, date, start_time, end_time) VALUES
(UUID(), 'Midterm Exam', 'Data Structures', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00:00', '12:00:00'),
(UUID(), 'Final Exam', 'Circuit Theory', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00:00', '17:00:00'),
(UUID(), 'Midterm Exam', 'Thermodynamics', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '09:00:00', '12:00:00'),
(UUID(), 'Final Exam', 'Database Systems', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '14:00:00', '17:00:00'); 