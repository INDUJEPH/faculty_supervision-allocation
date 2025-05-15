import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { examService, classroomService, facultyService, studentService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Exam, Classroom, Faculty, Student } from "@/lib/types";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Clock, School, Users, FileText } from "lucide-react";
import FacultyAssignment from "@/components/exams/FacultyAssignment";
import ClassroomAssignment from "@/components/exams/ClassroomsAssignment";
import SeatArrangementComponent from "@/components/exams/SeatArrangement";
import ExamReport from "@/components/exams/ExamReport";

// Define a type that represents the actual backend data shape
interface BackendExam {
  id: string;
  name: string;
  subject: string;
  date: string;
  start_time?: string;
  end_time?: string;
  startTime?: string;
  endTime?: string;
  status: string;
  exam_type: string;
  semester: number;
  classroom_ids?: string[];
  classroomIds?: string[];
  faculty_ids?: string[];
  facultyIds?: string[];
  student_ids?: string[];
  studentIds?: string[];
  [key: string]: any; // Allow for other unknown properties
}

const ExamView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassrooms, setSelectedClassrooms] = useState<Classroom[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("general");
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const [examData, classroomsData, facultyData, studentsData] = await Promise.all([
          examService.getById(id),
          classroomService.getAll(),
          facultyService.getAll(),
          studentService.getAll()
        ]);

        if (examData) {
          // Cast to our backend type which has more flexible properties
          const backendData = examData as BackendExam;
          
          // Transform backend data into expected frontend structure
          const transformedExam: Exam = {
            id: backendData.id || id,
            name: backendData.name || '',
            subject: backendData.subject || '',
            date: backendData.date || '',
            startTime: backendData.startTime || backendData.start_time || '',
            endTime: backendData.endTime || backendData.end_time || '',
            status: (backendData.status || 'scheduled') as 'scheduled' | 'completed' | 'cancelled',
            exam_type: (backendData.exam_type || 'regular') as 'regular' | 'backlog' | 'special',
            semester: backendData.semester || 0,
            classroom_ids: [],
            faculty_ids: [],
            student_ids: [],
          };
          
          // Handle classroom IDs from different possible property names
          if (Array.isArray(backendData.classroom_ids)) {
            transformedExam.classroom_ids = backendData.classroom_ids;
          } else if (Array.isArray(backendData.classroomIds)) {
            transformedExam.classroom_ids = backendData.classroomIds;
          }
          
          // Handle faculty IDs from different possible property names
          if (Array.isArray(backendData.faculty_ids)) {
            transformedExam.faculty_ids = backendData.faculty_ids;
          } else if (Array.isArray(backendData.facultyIds)) {
            transformedExam.faculty_ids = backendData.facultyIds;
          }
          
          // Handle student IDs from different possible property names
          if (Array.isArray(backendData.student_ids)) {
            transformedExam.student_ids = backendData.student_ids;
          } else if (Array.isArray(backendData.studentIds)) {
            transformedExam.student_ids = backendData.studentIds;
          }

          setExam(transformedExam);
          setClassrooms(classroomsData);
          setFaculty(facultyData);
          setStudents(studentsData);
          
          // Use the transformed exam data for filtering classrooms
          const examClassrooms = classroomsData.filter(c => 
            transformedExam.classroom_ids.includes(c.id)
          );
          setSelectedClassrooms(examClassrooms);
        } else {
          setError("Exam not found");
          toast.error("Exam not found");
        }
      } catch (err) {
        console.error("Error fetching exam data:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFacultyChange = (facultyIds: string[]) => {
    if (!exam) return;
    
    try {
      const updatedExam = { ...exam, faculty_ids: facultyIds };
      examService.update(exam.id, updatedExam);
      setExam(updatedExam);
      toast.success("Faculty assignments updated");
    } catch (error) {
      toast.error("Failed to update faculty assignments");
    }
  };

  const handleClassroomChange = (classroomIds: string[]) => {
    if (!exam) return;
    
    try {
      const updatedExam = { ...exam, classroom_ids: classroomIds };
      examService.update(exam.id, updatedExam);
      setExam(updatedExam);
      
      const updatedSelectedClassrooms = classrooms.filter(c => 
        classroomIds.includes(c.id)
      );
      setSelectedClassrooms(updatedSelectedClassrooms);
      
      toast.success("Classroom assignments updated");
    } catch (error) {
      toast.error("Failed to update classroom assignments");
    }
  };

  const handleSeatArrangementsChange = (seatArrangements: any[]) => {
    if (!exam) return;
    
    try {
      // Need to use type assertion since seatArrangements isn't in our Exam type
      const updatedExam = { 
        ...exam,
        seatArrangements 
      };
      
      examService.update(exam.id, updatedExam);
      setExam(updatedExam);
      toast.success("Seating arrangement updated");
    } catch (error) {
      toast.error("Failed to update seating arrangement");
    }
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = dateString instanceof Date ? dateString : new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const toggleReport = () => {
    setShowReport(!showReport);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
        <p>{error || "Exam not found"}</p>
        <button
          onClick={() => navigate("/exams")}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Back to Exams
        </button>
      </div>
    );
  }

  const getClassroomNames = () => {
    const ids = Array.isArray(exam.classroom_ids) ? exam.classroom_ids : [];
    return ids
      .map(id => classrooms.find(c => c.id === id)?.name || "Unknown")
      .join(", ");
  };

  const getFacultyNames = () => {
    const ids = Array.isArray(exam.faculty_ids) ? exam.faculty_ids : [];
    return ids
      .map(id => faculty.find(f => f.id === id)?.name || "Unknown")
      .join(", ");
  };

  const getStudentNames = () => {
    const ids = Array.isArray(exam.student_ids) ? exam.student_ids : [];
    return ids
      .map(id => students.find(s => s.id === id)?.name || "Unknown")
      .join(", ");
  };

  // Get seat arrangements from exam
  const seatArrangements = (exam as any).seatArrangements || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/exams")}
            className="p-0 h-auto"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold">{exam.subject}</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={toggleReport}
          >
            <FileText size={16} className="mr-2" />
            {showReport ? "Hide Report" : "Show Report"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "View Mode" : "Edit Mode"}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/exams/${id}/edit`)}
          >
            Edit All Details
          </Button>
        </div>
      </div>

      {showReport && (
        <ExamReport
          exam={exam}
          selectedClassrooms={selectedClassrooms}
        />
      )}

      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Exam Details</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="text-gray-500" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p>{formatDate(exam.date)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="text-gray-500" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p>{exam.startTime} - {exam.endTime}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <School className="text-gray-500" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p>{exam.subject}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Users className="text-gray-500" size={18} />
                <div>
                  <p className="text-sm text-gray-500">Students</p>
                  <p>{exam.student_ids.length > 0 ? exam.student_ids.length : "No students assigned"}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Assignment Summary</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Classrooms</p>
                <p className="font-medium">
                  {exam.classroom_ids.length} classroom(s) assigned
                </p>
                <p className="text-sm">
                  {getClassroomNames()}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Faculty</p>
                <p className="font-medium">
                  {exam.faculty_ids.length} faculty member(s) assigned
                </p>
                <p className="text-sm">
                  {getFacultyNames()}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {isEditing && (
          <div className="mt-8 space-y-8">
            <h2 className="text-xl font-semibold">Exam Management</h2>
            
            <FacultyAssignment 
              examId={exam.id}
              subject={exam.subject}
              date={exam.date}
              startTime={exam.startTime}
              endTime={exam.endTime}
              selectedClassrooms={selectedClassrooms}
              selectedFaculty={exam.faculty_ids}
              onChange={handleFacultyChange}
            />
            
            <ClassroomAssignment
              selectedClassrooms={exam.classroom_ids}
              onChange={handleClassroomChange}
            />
            
            <SeatArrangementComponent
              examId={exam.id}
              selectedClassrooms={selectedClassrooms}
              studentIds={exam.student_ids}
              seatArrangements={seatArrangements}
              onSave={handleSeatArrangementsChange}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExamView;
