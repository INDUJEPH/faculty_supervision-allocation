export const API_BASE_URL = 'http://localhost:3001/api';

export const API_CONFIG = {
  baseUrl: '/api',  // This will use the proxy we set up in vite.config.ts
  endpoints: {
    students: '/students',
    faculty: '/faculty',
    classrooms: '/classrooms',
    exams: '/exams',
    seatingArrangements: '/seating-arrangements',
    supervisors: '/supervisors'
  }
}; 