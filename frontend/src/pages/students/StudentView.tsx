import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studentService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  GraduationCap, 
  School, 
  Hash, 
  Layers, 
  Users, 
  UserCircle, 
  Edit3, 
  BookOpen 
} from "lucide-react";
import { Student } from "@/lib/types";

const StudentView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await studentService.getById(id);
        if (data) {
          setStudent(data);
        } else {
          setError("Student not found");
          toast.error("Student not found");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch student";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
        <p>{error || "Student not found"}</p>
        <button
          onClick={() => navigate("/students")}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-gradient-to-r from-primary/20 to-transparent p-6 rounded-xl">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/students")}
            className="p-3 h-auto rounded-full bg-white/80 hover:bg-white shadow-sm"
          >
            <ArrowLeft size={18} className="text-primary" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">{student.name}</h1>
            <p className="text-gray-500 flex items-center gap-2">
              <Hash size={14} />
              {student.rollNumber}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/students/${id}/edit`)}
          className="border-primary/30 text-primary hover:bg-primary/10 gap-2"
        >
          <Edit3 size={16} />
          Edit Details
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-primary/20 shadow-md hover:shadow-lg transition-all overflow-hidden">
          <div className="bg-gradient-to-b from-primary/20 to-primary/5 p-8 flex flex-col items-center justify-center">
            <div className="bg-white rounded-full p-6 shadow-md mb-4">
              <UserCircle size={60} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-center">{student.name}</h2>
            <p className="text-gray-600 flex items-center gap-1 mt-1">
              <Hash size={14} /> {student.rollNumber}
            </p>
          </div>
          
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="text-sm text-gray-500 uppercase font-medium mb-3">Student Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <School className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Department</p>
                    <p className="font-medium">{student.department}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Semester</p>
                    <p className="font-medium">{student.semester}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Section</p>
                    <p className="font-medium">{student.section}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-primary/20 shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/10">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Academic Information</h2>
            </div>
          </div>
          
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-medium mb-4">
                <GraduationCap className="h-5 w-5 text-primary" />
                Elective Subjects
              </h3>
              
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                {student.electiveSubjects && student.electiveSubjects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {student.electiveSubjects.map((subject: string, index: number) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-primary/10 shadow-sm hover:shadow-md transition-all hover:border-primary/30 hover-scale"
                      >
                        <div className="bg-primary/10 p-2 rounded-full">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-gray-700">{subject}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="bg-gray-100 p-3 rounded-full mb-2">
                      <BookOpen className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No elective subjects enrolled</p>
                    <p className="text-sm text-gray-400 mt-1">Student hasn't selected any elective courses yet</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => navigate(`/students/${id}/edit`)}
                className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
                variant="outline"
              >
                <Edit3 size={16} />
                Edit Academic Details
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentView;
