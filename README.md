<<<<<<< HEAD
# Exam Management System

A comprehensive system for managing exams, students, faculty, and classrooms.

## Features

- Dashboard with statistics and charts
- Student management
- Faculty management
- Classroom management
- Exam scheduling and management
- Supervision assignment

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/exam-management-system.git
cd exam-management-system
```

2. Install dependencies for backend and frontend
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up the database
```bash
# Create a MySQL database named 'exam_manage'
mysql -u root -p
CREATE DATABASE exam_manage;
```

4. Configure environment variables
```bash
# Copy the sample .env file
cp backend/.env.example backend/.env

# Edit the .env file with your database credentials
```

5. Start the development servers
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd ../frontend
npm run dev
```

## Loading Sample Data

The application comes with a sample data seeding script that will populate your database with realistic test data.

### To load sample data:

1. Ensure your database is set up and your backend server can connect to it
2. Run the seeding script:
```bash
cd backend
npm run seed
```

This will add:
- 40 Students across 4 departments
- 20 Faculty members across 4 departments
- 20 Classrooms with different capacities
- 14 Exams (past, current, and future)

### Sample Data Details

- **Students**: Distributed across Computer Science, Electronics, Electrical, and Mechanical departments in various semesters
- **Faculty**: Professors, Associate Professors, Assistant Professors, and Lecturers from all departments
- **Classrooms**: Various sizes from 20 to 100 seats
- **Exams**: Mix of past, current and upcoming exams with different types (regular, backlog, special)

## Usage

After starting both servers:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## API Endpoints

### Dashboard
- GET `/api/dashboard/stats` - Get dashboard statistics
- GET `/api/dashboard/department-stats` - Get department-wise statistics
- GET `/api/dashboard/semester-stats` - Get semester-wise statistics
- GET `/api/dashboard/faculty-stats` - Get faculty statistics
- GET `/api/dashboard/upcoming-exams` - Get upcoming exams

### Students
- GET `/api/students` - Get all students
- GET `/api/students/:id` - Get student by ID
- POST `/api/students/upload` - Upload students via CSV

### Faculty
- GET `/api/faculty` - Get all faculty members
- GET `/api/faculty/:id` - Get faculty by ID
- POST `/api/faculty/upload` - Upload faculty via CSV

### Classrooms
- GET `/api/classrooms` - Get all classrooms
- GET `/api/classrooms/:id` - Get classroom by ID
- POST `/api/classrooms/upload` - Upload classrooms via CSV

### Exams
- GET `/api/exams` - Get all exams
- GET `/api/exams/:id` - Get exam by ID
=======
# faculty_supervision-allocation
>>>>>>> 926299cb343dbad8d3c4732a163a6412e7806127
