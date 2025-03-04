
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Faculty, Classroom } from "@/types/faculty";
import { toast } from "sonner";

export const useFacultyData = () => {
  const [facultyMembers, setFacultyMembers] = useState<Faculty[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: teachersData, error: teachersError } = await supabase
          .from('teachers')
          .select('id, name, subject, position, experience')
          .order('name', { ascending: true });

        if (teachersError) throw teachersError;

        const facultyData = teachersData.map(teacher => ({
          id: teacher.id,
          name: teacher.name,
          subject: teacher.subject,
          department: teacher.subject.split(' ')[0],
          allocations: 0,
          maxLoad: 3,
          position: teacher.position || undefined,
          experience: teacher.experience || undefined
        }));

        setFacultyMembers(facultyData);

        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, name, grade_level')
          .order('name', { ascending: true });

        if (classesError) throw classesError;

        const classroomData = classesData.map((cls, index) => {
          const baseCapacity = cls.grade_level.includes('12th') ? 25 : 
                              cls.grade_level.includes('11th') ? 30 :
                              cls.grade_level.includes('10th') ? 35 : 40;
          
          const capacity = baseCapacity + Math.floor(Math.random() * 10);
          const allocatedStudents = capacity - Math.floor(Math.random() * 10);
          
          const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][index % 5];
          const hour = 8 + (index % 8);
          const examDate = `${day}, ${hour}:00 AM`;
          
          return {
            id: cls.id,
            name: cls.name,
            capacity,
            allocatedStudents,
            examDate,
            supervisor: null
          };
        });

        if (facultyData.length > 0 && classroomData.length > 0) {
          classroomData[0].supervisor = facultyData[0];
          if (classroomData.length > 1 && facultyData.length > 1) {
            classroomData[1].supervisor = facultyData[1];
          }
          
          const updatedFaculty = [...facultyData];
          updatedFaculty[0].allocations = 1;
          if (facultyData.length > 1) {
            updatedFaculty[1].allocations = 1;
          }
          setFacultyMembers(updatedFaculty);
        }

        setClassrooms(classroomData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    facultyMembers,
    setFacultyMembers,
    classrooms,
    setClassrooms,
    loading
  };
};
