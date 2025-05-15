-- Seed data for exam management system

-- Clear existing data
TRUNCATE TABLE students;
TRUNCATE TABLE faculty;
TRUNCATE TABLE classrooms;
TRUNCATE TABLE exams;

-- Insert Students
INSERT INTO students (name, roll_number, department, semester, section, email, phone) VALUES
('John Smith', 'CS2001', 'computer science', 4, 'A', 'john.smith@university.edu', '555-1001'),
('Emily Johnson', 'CS2002', 'computer science', 4, 'A', 'emily.johnson@university.edu', '555-1002'),
('Michael Williams', 'CS2003', 'computer science', 4, 'B', 'michael.williams@university.edu', '555-1003'),
('Jessica Brown', 'CS2004', 'computer science', 4, 'B', 'jessica.brown@university.edu', '555-1004'),
('David Jones', 'CS2005', 'computer science', 6, 'A', 'david.jones@university.edu', '555-1005'),
('Sarah Garcia', 'CS2006', 'computer science', 6, 'A', 'sarah.garcia@university.edu', '555-1006'),
('Robert Miller', 'CS2007', 'computer science', 6, 'B', 'robert.miller@university.edu', '555-1007'),
('Jennifer Davis', 'CS2008', 'computer science', 6, 'B', 'jennifer.davis@university.edu', '555-1008'),
('James Wilson', 'CS2009', 'computer science', 8, 'A', 'james.wilson@university.edu', '555-1009'),
('Lisa Moore', 'CS2010', 'computer science', 8, 'A', 'lisa.moore@university.edu', '555-1010'),

('Thomas Taylor', 'EL3001', 'electronics', 2, 'A', 'thomas.taylor@university.edu', '555-2001'),
('Amanda Anderson', 'EL3002', 'electronics', 2, 'A', 'amanda.anderson@university.edu', '555-2002'),
('Christopher Thomas', 'EL3003', 'electronics', 2, 'B', 'christopher.thomas@university.edu', '555-2003'),
('Michelle Jackson', 'EL3004', 'electronics', 2, 'B', 'michelle.jackson@university.edu', '555-2004'),
('Daniel White', 'EL3005', 'electronics', 4, 'A', 'daniel.white@university.edu', '555-2005'),
('Stephanie Harris', 'EL3006', 'electronics', 4, 'A', 'stephanie.harris@university.edu', '555-2006'),
('Kevin Martin', 'EL3007', 'electronics', 4, 'B', 'kevin.martin@university.edu', '555-2007'),
('Laura Thompson', 'EL3008', 'electronics', 4, 'B', 'laura.thompson@university.edu', '555-2008'),
('Joseph Garcia', 'EL3009', 'electronics', 6, 'A', 'joseph.garcia@university.edu', '555-2009'),
('Ashley Martinez', 'EL3010', 'electronics', 6, 'A', 'ashley.martinez@university.edu', '555-2010'),

('Brian Robinson', 'ME4001', 'mechanical', 3, 'A', 'brian.robinson@university.edu', '555-3001'),
('Nicole Lewis', 'ME4002', 'mechanical', 3, 'A', 'nicole.lewis@university.edu', '555-3002'),
('Justin Lee', 'ME4003', 'mechanical', 3, 'B', 'justin.lee@university.edu', '555-3003'),
('Heather Walker', 'ME4004', 'mechanical', 3, 'B', 'heather.walker@university.edu', '555-3004'),
('Eric Hall', 'ME4005', 'mechanical', 5, 'A', 'eric.hall@university.edu', '555-3005'),
('Melissa Allen', 'ME4006', 'mechanical', 5, 'A', 'melissa.allen@university.edu', '555-3006'),
('Brandon Young', 'ME4007', 'mechanical', 5, 'B', 'brandon.young@university.edu', '555-3007'),
('Rebecca King', 'ME4008', 'mechanical', 5, 'B', 'rebecca.king@university.edu', '555-3008'),
('Patrick Wright', 'ME4009', 'mechanical', 7, 'A', 'patrick.wright@university.edu', '555-3009'),
('Rachel Scott', 'ME4010', 'mechanical', 7, 'A', 'rachel.scott@university.edu', '555-3010'),

('Steven Green', 'EE5001', 'electrical', 1, 'A', 'steven.green@university.edu', '555-4001'),
('Christine Adams', 'EE5002', 'electrical', 1, 'A', 'christine.adams@university.edu', '555-4002'),
('Timothy Baker', 'EE5003', 'electrical', 1, 'B', 'timothy.baker@university.edu', '555-4003'),
('Patricia Nelson', 'EE5004', 'electrical', 1, 'B', 'patricia.nelson@university.edu', '555-4004'),
('George Rivera', 'EE5005', 'electrical', 3, 'A', 'george.rivera@university.edu', '555-4005'),
('Karen Mitchell', 'EE5006', 'electrical', 3, 'A', 'karen.mitchell@university.edu', '555-4006'),
('Edward Carter', 'EE5007', 'electrical', 3, 'B', 'edward.carter@university.edu', '555-4007'),
('Nancy Perez', 'EE5008', 'electrical', 3, 'B', 'nancy.perez@university.edu', '555-4008'),
('Ronald Roberts', 'EE5009', 'electrical', 5, 'A', 'ronald.roberts@university.edu', '555-4009'),
('Carol Turner', 'EE5010', 'electrical', 5, 'A', 'carol.turner@university.edu', '555-4010');

-- Insert Faculty
INSERT INTO faculty (name, department, designation, email, phone, experience, shift_preference, max_supervisions) VALUES
('Dr. Richard Davis', 'computer science', 'Professor', 'richard.davis@university.edu', '555-5001', 15, 'full', 5),
('Dr. Jennifer Wilson', 'computer science', 'Associate Professor', 'jennifer.wilson@university.edu', '555-5002', 10, 'full', 4),
('Dr. Michael Thompson', 'computer science', 'Assistant Professor', 'michael.thompson@university.edu', '555-5003', 7, 'half', 3),
('Prof. Elizabeth Roberts', 'computer science', 'Senior Lecturer', 'elizabeth.roberts@university.edu', '555-5004', 12, 'full', 4),
('Prof. William Johnson', 'computer science', 'Lecturer', 'william.johnson@university.edu', '555-5005', 5, 'half', 2),

('Dr. Patricia Miller', 'electronics', 'Professor', 'patricia.miller@university.edu', '555-5006', 18, 'full', 5),
('Dr. Robert Taylor', 'electronics', 'Associate Professor', 'robert.taylor@university.edu', '555-5007', 11, 'full', 4),
('Dr. Susan Anderson', 'electronics', 'Assistant Professor', 'susan.anderson@university.edu', '555-5008', 6, 'half', 3),
('Prof. Joseph White', 'electronics', 'Senior Lecturer', 'joseph.white@university.edu', '555-5009', 10, 'full', 4),
('Prof. Mary Martinez', 'electronics', 'Lecturer', 'mary.martinez@university.edu', '555-5010', 4, 'half', 2),

('Dr. Thomas Harris', 'mechanical', 'Professor', 'thomas.harris@university.edu', '555-5011', 20, 'full', 5),
('Dr. Barbara Jackson', 'mechanical', 'Associate Professor', 'barbara.jackson@university.edu', '555-5012', 13, 'full', 4),
('Dr. Charles Garcia', 'mechanical', 'Assistant Professor', 'charles.garcia@university.edu', '555-5013', 8, 'half', 3),
('Prof. Margaret Thomas', 'mechanical', 'Senior Lecturer', 'margaret.thomas@university.edu', '555-5014', 11, 'full', 4),
('Prof. Daniel Moore', 'mechanical', 'Lecturer', 'daniel.moore@university.edu', '555-5015', 6, 'half', 2),

('Dr. Carol Walker', 'electrical', 'Professor', 'carol.walker@university.edu', '555-5016', 17, 'full', 5),
('Dr. John Nelson', 'electrical', 'Associate Professor', 'john.nelson@university.edu', '555-5017', 12, 'full', 4),
('Dr. Amanda Allen', 'electrical', 'Assistant Professor', 'amanda.allen@university.edu', '555-5018', 7, 'half', 3),
('Prof. James Rivera', 'electrical', 'Senior Lecturer', 'james.rivera@university.edu', '555-5019', 10, 'full', 4),
('Prof. Dorothy Hall', 'electrical', 'Lecturer', 'dorothy.hall@university.edu', '555-5020', 5, 'half', 2);

-- Insert Classrooms
INSERT INTO classrooms (name, capacity) VALUES
('A-101', 60),
('A-102', 60),
('A-103', 40),
('A-104', 40),
('A-105', 30),
('B-201', 80),
('B-202', 80),
('B-203', 60),
('B-204', 40),
('B-205', 40),
('C-301', 100),
('C-302', 100),
('C-303', 80),
('C-304', 60),
('C-305', 60),
('D-401', 40),
('D-402', 40),
('D-403', 30),
('D-404', 30),
('D-405', 20);

-- Create exam_classrooms table if it doesn't exist
CREATE TABLE IF NOT EXISTS exam_classrooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  classroom_id INT NOT NULL,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE CASCADE
);

-- Insert Exams with various dates (past, present, and future)
INSERT INTO exams (name, subject, date, start_time, end_time, status, exam_type, semester) VALUES
-- Past exams
('Midterm Exam', 'Data Structures', DATE_SUB(CURDATE(), INTERVAL 30 DAY), '09:00:00', '12:00:00', 'completed', 'regular', 4),
('Final Exam', 'Computer Networks', DATE_SUB(CURDATE(), INTERVAL 25 DAY), '14:00:00', '17:00:00', 'completed', 'regular', 6),
('Backlog Exam', 'Operating Systems', DATE_SUB(CURDATE(), INTERVAL 20 DAY), '09:00:00', '12:00:00', 'completed', 'backlog', 6),
('Special Exam', 'Digital Electronics', DATE_SUB(CURDATE(), INTERVAL 15 DAY), '14:00:00', '16:00:00', 'completed', 'special', 4),

-- Current/Upcoming exams (next 7 days)
('Midterm Exam', 'Algorithms', CURDATE(), '09:00:00', '12:00:00', 'in-progress', 'regular', 4),
('Final Exam', 'Database Systems', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00', '17:00:00', 'scheduled', 'regular', 6),
('Midterm Exam', 'Machine Learning', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '09:00:00', '12:00:00', 'scheduled', 'regular', 8),
('Final Exam', 'Software Engineering', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '14:00:00', '17:00:00', 'scheduled', 'regular', 4),
('Backlog Exam', 'Computer Architecture', DATE_ADD(CURDATE(), INTERVAL 6 DAY), '09:00:00', '12:00:00', 'scheduled', 'backlog', 6),

-- Future exams (beyond 7 days)
('Midterm Exam', 'Artificial Intelligence', DATE_ADD(CURDATE(), INTERVAL 10 DAY), '09:00:00', '12:00:00', 'scheduled', 'regular', 6),
('Final Exam', 'Web Development', DATE_ADD(CURDATE(), INTERVAL 15 DAY), '14:00:00', '17:00:00', 'scheduled', 'regular', 4),
('Midterm Exam', 'Computer Graphics', DATE_ADD(CURDATE(), INTERVAL 20 DAY), '09:00:00', '12:00:00', 'scheduled', 'regular', 6),
('Final Exam', 'Mobile Computing', DATE_ADD(CURDATE(), INTERVAL 25 DAY), '14:00:00', '17:00:00', 'scheduled', 'regular', 8),
('Special Exam', 'Embedded Systems', DATE_ADD(CURDATE(), INTERVAL 30 DAY), '09:00:00', '11:00:00', 'scheduled', 'special', 6);

-- Associate classrooms with exams
INSERT INTO exam_classrooms (exam_id, classroom_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 6), (2, 7), (2, 8),
(3, 3), (3, 4),
(4, 5),
(5, 11), (5, 12), (5, 13),
(6, 6), (6, 7), (6, 8),
(7, 1), (7, 2),
(8, 3), (8, 4), (8, 5),
(9, 16), (9, 17),
(10, 11), (10, 12),
(11, 6), (11, 7),
(12, 1), (12, 2),
(13, 3), (13, 4),
(14, 5); 