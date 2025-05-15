-- Insert sample students
INSERT INTO students (name, roll_number, department, semester) VALUES
('John Doe', 'CS2021001', 'computer science', 5),
('Jane Smith', 'CS2021002', 'computer science', 5),
('Alice Johnson', 'EE2021001', 'electrical', 3),
('Bob Wilson', 'ME2021001', 'mechanical', 7),
('Carol Brown', 'EC2021001', 'electronics', 4);

-- Insert sample faculty
INSERT INTO faculty (name, department, designation, email, phone, experience, shift_preference, max_supervisions) VALUES
('Dr. James Wilson', 'computer science', 'Professor', 'james.wilson@example.com', '1234567890', 15, 'full', 5),
('Dr. Sarah Parker', 'electrical', 'Associate Professor', 'sarah.parker@example.com', '2345678901', 10, 'full', 4),
('Prof. Michael Brown', 'mechanical', 'Assistant Professor', 'michael.brown@example.com', '3456789012', 8, 'half', 3),
('Dr. Emily Davis', 'electronics', 'Professor', 'emily.davis@example.com', '4567890123', 12, 'full', 5),
('Prof. Robert Taylor', 'computer science', 'Associate Professor', 'robert.taylor@example.com', '5678901234', 9, 'half', 3);

-- Insert sample classrooms
INSERT INTO classrooms (name, capacity) VALUES
('Room 101', 40),
('Room 102', 35),
('Lab 201', 30),
('Room 301', 50),
('Lab 202', 25);

-- Insert sample exams
INSERT INTO exams (name, date, start_time, end_time, classroom_id) VALUES
('Database Systems Mid Term', CURDATE() + INTERVAL 7 DAY, '09:00:00', '12:00:00', 1),
('Computer Networks Final', CURDATE() + INTERVAL 14 DAY, '14:00:00', '17:00:00', 2),
('Digital Electronics Quiz', CURDATE() + INTERVAL 3 DAY, '10:00:00', '11:30:00', 3),
('Machine Design Test', CURDATE() + INTERVAL 10 DAY, '09:00:00', '12:00:00', 4),
('Programming Fundamentals', CURDATE() + INTERVAL 5 DAY, '14:00:00', '17:00:00', 5);

-- Insert exam-classroom mappings
INSERT INTO exam_classrooms (exam_id, classroom_id)
SELECT e.id, c.id
FROM exams e, classrooms c
WHERE e.name = 'Database Systems Mid Term' AND c.name = 'Room 101';

-- Insert exam-faculty mappings
INSERT INTO exam_faculty (exam_id, faculty_id)
SELECT e.id, f.id
FROM exams e, faculty f
WHERE e.name = 'Database Systems Mid Term' AND f.name = 'Dr. James Wilson';

-- Insert exam-student mappings
INSERT INTO exam_students (exam_id, student_id)
SELECT e.id, s.id
FROM exams e, students s
WHERE e.name = 'Database Systems Mid Term' AND s.department = 'computer science';

-- Insert seating arrangements
INSERT INTO seating_arrangements (id, exam_id, classroom_id, student_id, seat_number, seat_row, seat_column)
SELECT 
    UUID(),
    e.id,
    c.id,
    s.id,
    1,
    1,
    1
FROM exams e, classrooms c, students s
WHERE e.name = 'Database Systems Mid Term' 
AND c.name = 'Room 101'
AND s.name = 'John Doe'; 