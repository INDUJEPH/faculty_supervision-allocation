import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Student, Faculty, Classroom, Exam, SeatingArrangement, SupervisionReport, StudentUploadResult, FacultyUploadResult, SupervisorUploadResult, ClassroomUploadResult, SupervisorAllocationResult } from '../lib/types';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

export const studentService = {
  getAll: async () => {
    const response = await api.get<Student[]>('/api/students');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Student>(`/api/students/${id}`);
    return response.data;
  },
  create: async (student: Omit<Student, 'id'>) => {
    const response = await api.post<Student>('/api/students', student);
    return response.data;
  },
  update: async (id: string, student: Partial<Student>) => {
    const response = await api.put<Student>(`/api/students/${id}`, student);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/students/${id}`);
  },
  uploadStudents: async (formData: FormData): Promise<StudentUploadResult> => {
    const response = await api.post<StudentUploadResult>('/api/students/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export const facultyService = {
  getAll: async () => {
    const response = await api.get<Faculty[]>('/api/faculty');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Faculty>(`/api/faculty/${id}`);
    return response.data;
  },
  create: async (faculty: Omit<Faculty, 'id'> | any) => {
    try {
      console.log('Creating faculty with data:', faculty);
      const response = await api.post<Faculty>('/api/faculty/add', faculty);
      return response.data;
    } catch (error: any) {
      console.error('Error in faculty creation service:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },
  // A simplified create function that tries with minimum required fields
  createSimple: async (name: string, department: string, designation: string) => {
    try {
      const simpleData = {
        name,
        department,
        designation,
        email: `${name.toLowerCase().replace(/\s/g, '.')}@example.com`,
        phone: '1234567890',
        experience: 0,
        seniority: 0,
        shift_preference: 'full',
        max_supervisions: 1,
        specialization: '',
        availability: '[]'
      };
      
      console.log('Creating faculty with simplified data:', simpleData);
      const response = await api.post<Faculty>('/api/faculty/add', simpleData);
      return response.data;
    } catch (error: any) {
      console.error('Error in simplified faculty creation:', error);
      console.error('Error response details:', error.response?.data);
      throw error;
    }
  },
  update: async (id: string, faculty: Partial<Faculty>) => {
    const response = await api.put<Faculty>(`/api/faculty/${id}`, faculty);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/faculty/${id}`);
  },
  uploadFaculty: async (formData: FormData): Promise<FacultyUploadResult> => {
    const response = await api.post('/api/faculty/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  uploadSupervisors: async (formData: FormData): Promise<SupervisorUploadResult> => {
    try {
      const response = await api.post('/api/supervisors/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error uploading supervisors:', error);
      throw new Error(error.response?.data?.error || 'Failed to upload supervisors');
    }
  },
};

export const classroomService = {
  getAll: async () => {
    const response = await api.get<Classroom[]>('/api/classrooms');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Classroom>(`/api/classrooms/${id}`);
    return response.data;
  },
  create: async (classroom: Omit<Classroom, 'id'>) => {
    const response = await api.post<Classroom>('/api/classrooms', classroom);
    return response.data;
  },
  update: async (id: string, classroom: Partial<Classroom>) => {
    const response = await api.put<Classroom>(`/api/classrooms/${id}`, classroom);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/classrooms/${id}`);
  },
  uploadClassrooms: async (formData: FormData): Promise<ClassroomUploadResult> => {
    const response = await api.post<ClassroomUploadResult>('/api/classrooms/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const examService = {
  getAll: async () => {
    const response = await api.get<Exam[]>('/api/exams');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Exam>(`/api/exams/${id}`);
    return response.data;
  },
  create: async (exam: Omit<Exam, 'id'>) => {
    const response = await api.post<Exam>('/api/exams', exam);
    return response.data;
  },
  update: async (id: string, exam: Partial<Exam>) => {
    const response = await api.put<Exam>(`/api/exams/${id}`, exam);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/exams/${id}`);
  },
  getAssignments: async () => {
    const response = await api.get<Exam[]>('/api/exams/assign');
    return response.data;
  },
  getBacklog: async () => {
    const response = await api.get<Exam[]>('/api/exams/backlog');
    return response.data;
  },
  getReports: async () => {
    const response = await api.get<Exam[]>('/api/exams/reports');
    return response.data;
  },
  addResults: async (examId: string, results: any[]) => {
    const response = await api.post(`/api/exams/results`, { examId, results });
    return response.data;
  },
  getResults: async (examId: string) => {
    const response = await api.get(`/api/exams/results/${examId}`);
    return response.data;
  },
  getSupervisionReports: async (department?: string): Promise<SupervisionReport[]> => {
    const url = department 
      ? `/api/supervision/reports?department=${encodeURIComponent(department)}`
      : '/api/supervision/reports';
    const { data } = await api.get<SupervisionReport[]>(url);
    return data;
  },
  getSupervisionSchedule: async (facultyId: string): Promise<any[]> => {
    const url = `/api/supervision/schedule?facultyId=${encodeURIComponent(facultyId)}`;
    const { data } = await api.get(url);
    return data;
  },
  assignSupervisors: async (examId: string, facultyIds: string[]): Promise<any> => {
    const response = await api.post(`/api/exams/${examId}/supervisors`, { facultyIds });
    return response.data;
  }
};

export const seatingService = {
  getByExamId: async (examId: string) => {
    const response = await api.get<SeatingArrangement[]>(`/api/seating-arrangements/${examId}`);
    return response.data;
  },
  create: async (examId: string, classroomAssignments: any[]) => {
    const response = await api.post('/api/exams/arrange', { examId, classroomAssignments });
    return response.data;
  },
  update: async (examId: string, classroomAssignments: any[]) => {
    const response = await api.put('/api/exams/arrange', { examId, classroomAssignments });
    return response.data;
  },
  delete: async (examId: string) => {
    await api.delete(`/api/seating-arrangements/${examId}`);
  },
};

export const uploadSupervisors = async (formData: FormData): Promise<SupervisorUploadResult> => {
  const response = await api.post('/api/supervisors/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const allocateSupervisors = async (data: {
  examId: string;
  date: string;
  startTime: string;
  endTime: string;
  examType: string;
  requiredSupervisors: number;
}): Promise<SupervisorAllocationResult> => {
  try {
    console.log('Sending allocation request to API:', data);
    
    // Format the data correctly to match what the backend expects
    const formattedData = {
      examId: data.examId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      examType: data.examType,
      requiredSupervisors: parseInt(String(data.requiredSupervisors))
    };
    
    const response = await api.post<SupervisorAllocationResult>('/api/supervisors/allocate', formattedData);
    console.log('API response received:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error in allocateSupervisors:', error);
    // If there's a response from the server, return that error message
    if (error.response?.data?.message) {
      return {
        success: false,
        message: error.response.data.message,
        allocations: []
      };
    }
    
    // Otherwise return a generic error
    return {
      success: false,
      message: error.message || 'Failed to allocate supervisors',
      allocations: []
    };
  }
};
