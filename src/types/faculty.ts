
export type Faculty = {
    id: string;
    name: string;
    subject: string;
    department?: string;
    allocations: number;
    maxLoad: number;
    position?: string;
    experience?: string;
  };
  
  export type Classroom = {
    id: string;
    name: string;
    capacity: number;
    allocatedStudents: number;
    examDate: string;
    supervisor?: Faculty | null;
  };
  