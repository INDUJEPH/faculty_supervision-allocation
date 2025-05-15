import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService, classroomService, facultyService, studentService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Exam, Classroom, Faculty, Student } from "@/lib/types";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Calendar, Clock, Users, Building2, Download, X, ArrowLeft, Printer, Eye } from "lucide-react";

const ExamList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const { data: exams = [], isLoading: examsLoading } = useQuery<Exam[]>({
    queryKey: ["exams"],
    queryFn: examService.getAll,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1
  });

  const { data: classrooms = [], isLoading: classroomsLoading } = useQuery({
    queryKey: ["classrooms"],
    queryFn: classroomService.getAll,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const { data: faculty = [], isLoading: facultyLoading } = useQuery<Faculty[]>({
    queryKey: ["faculty"],
    queryFn: facultyService.getAll,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: studentService.getAll,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  });

  const { data: examDetails, isLoading: examDetailsLoading, refetch: refetchExamDetails } = useQuery({
    queryKey: ["exam", selectedExam?.id],
    queryFn: () => selectedExam ? examService.getById(selectedExam.id) : null,
    enabled: !!selectedExam,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  const isLoading = examsLoading || classroomsLoading || facultyLoading || studentsLoading;
  const isError = false; // We'll handle errors individually if needed

  const deleteMutation = useMutation({
    mutationFn: examService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam deleted successfully");
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete exam";
      toast.error(errorMessage);
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      deleteMutation.mutate(id);
    }
  };

  const getClassroomNames = (classroomIds: string[] | undefined): string => {
    if (!classroomIds || classroomIds.length === 0) return "No classrooms assigned";
    return classroomIds
      .map(id => classrooms.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const getFacultyNames = (facultyIds: string[] | undefined): string => {
    if (!facultyIds || facultyIds.length === 0) return "No faculty assigned";
    return facultyIds
      .map(id => faculty.find(f => f.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const getStudentCount = (studentIds: string[] | undefined): number => {
    return studentIds?.length || 0;
  };

  const filteredExams = exams.filter((exam) =>
    exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateReport = () => {
    const reportData = exams.map(exam => ({
      examName: exam.name,
      subject: exam.subject,
      date: new Date(exam.date).toLocaleDateString(),
      time: `${exam.start_time} - ${exam.end_time}`,
      assignedFaculty: exam.faculty_ids?.map(id => {
        const facultyMember = faculty.find(f => f.id === id);
        return facultyMember ? `${facultyMember.name} (${facultyMember.department})` : 'Not assigned';
      }).join(', ') || 'Not assigned',
      assignedClassrooms: exam.classroom_ids?.map(id => {
        const classroom = classrooms.find(c => c.id === id);
        return classroom ? classroom.name : 'Not assigned';
      }).join(', ') || 'Not assigned',
      studentCount: exam.student_ids?.length || 0
    }));

    const csvContent = [
      ['Exam Name', 'Subject', 'Date', 'Time', 'Assigned Faculty', 'Assigned Classrooms', 'Student Count'],
      ...reportData.map(row => [
        row.examName,
        row.subject,
        row.date,
        row.time,
        row.assignedFaculty,
        row.assignedClassrooms,
        row.studentCount
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `exam-schedule-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleExamClick = async (exam: Exam) => {
    setSelectedExam(exam);
  };

  const handleCloseModal = () => {
    setSelectedExam(null);
  };

  useEffect(() => {
    console.log('Current faculty data:', faculty);
  }, [faculty]);

  useEffect(() => {
    if (exams.length > 0) {
      console.log('Current exams data:', exams);
      console.log('First exam faculty_ids:', exams[0].faculty_ids);
    }
  }, [exams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading exams. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exam Schedule</h1>
        <div className="flex gap-2">
          <Button onClick={generateReport} className="flex items-center gap-2">
            <Download size={16} />
            Generate Report
          </Button>
          <Button onClick={() => navigate("/exams/new")}>
            Schedule New Exam
          </Button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search exams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExams.map((exam) => (
          <Card key={exam.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{exam.name}</h3>
                  <p className="text-sm text-gray-600">{exam.subject}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExamClick(exam)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Show Report
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/exams/${exam.id}/edit`)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(exam.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(new Date(exam.date), "PPP")}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {exam.start_time} - {exam.end_time}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="w-4 h-4 mr-2" />
                    {exam.classroom_ids?.map(id => {
                      const classroom = classrooms.find(c => c.id === id);
                      return classroom?.name;
                    }).filter(Boolean).join(", ") || "No classrooms assigned"}
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 mt-1" />
                    <div>
                      <p className="font-medium">Faculty:</p>
                      <ul className="list-disc list-inside pl-2">
                        {exam.faculty_ids && exam.faculty_ids.length > 0 ? (
                          exam.faculty_ids.map(id => {
                            const facultyMember = faculty.find(f => f.id === id);
                            return facultyMember ? (
                              <li key={id} className="text-sm">
                                {facultyMember.name} ({facultyMember.department})
                              </li>
                            ) : (
                              <li key={id} className="text-sm text-gray-400">
                                Faculty member not found (ID: {id})
                              </li>
                            );
                          })
                        ) : (
                          <li>No faculty assigned</li>
                        )}
                      </ul>
                      <p className="font-medium mt-2">Students:</p>
                      <ul className="list-disc list-inside pl-2">
                        {exam.student_ids?.map(id => {
                          const student = students.find(s => s.id === id);
                          return student ? (
                            <li key={id} className="text-sm">
                              {student.name} ({student.roll_number})
                            </li>
                          ) : null;
                        })}
                        {(!exam.student_ids || exam.student_ids.length === 0) && (
                          <li>No students assigned</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedExam} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={handleCloseModal} className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button onClick={() => {/* TODO: Implement PDF download */}}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          {examDetailsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : examDetails ? (
            <div className="space-y-8 p-6">
              <div>
                <h2 className="text-2xl font-bold mb-6">{examDetails.subject} Examination</h2>
                
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Date</h3>
                    <p className="text-base">{format(new Date(examDetails.date), "MMMM d, yyyy")}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Time</h3>
                    <p className="text-base">{examDetails.start_time} - {examDetails.end_time}</p>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Total Students</h3>
                    <p className="text-base">{examDetails.student_ids?.length || 0}</p>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Classrooms</h3>
                    <p className="text-base">
                      {examDetails.classroom_ids?.map(id => {
                        const classroom = classrooms.find(c => c.id === id);
                        return classroom?.name;
                      }).filter(Boolean).join(", ") || "Not assigned"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Faculty Supervisors</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Department</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {examDetails.faculty_ids && examDetails.faculty_ids.length > 0 ? (
                        examDetails.faculty_ids.map(id => {
                          const facultyMember = faculty.find(f => f.id === id);
                          return facultyMember ? (
                            <tr key={id}>
                              <td className="px-4 py-3 text-sm">{facultyMember.name}</td>
                              <td className="px-4 py-3 text-sm">{facultyMember.department}</td>
                              <td className="px-4 py-3 text-sm">{facultyMember.email}</td>
                            </tr>
                          ) : null;
                        })
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-sm text-center text-gray-500">
                            No faculty assigned
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Student Seating Arrangement</h3>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Roll Number</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Classroom</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Seat No.</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Row</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Column</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {examDetails.student_ids?.map(id => {
                        const student = students.find(s => s.id === id);
                        return student ? (
                          <tr key={id}>
                            <td className="px-4 py-3 text-sm">{student.roll_number}</td>
                            <td className="px-4 py-3 text-sm">{student.name}</td>
                            <td className="px-4 py-3 text-sm">Not assigned</td>
                            <td className="px-4 py-3 text-sm">-</td>
                            <td className="px-4 py-3 text-sm">-</td>
                            <td className="px-4 py-3 text-sm">-</td>
                          </tr>
                        ) : null;
                      })}
                      {(!examDetails.student_ids || examDetails.student_ids.length === 0) && (
                        <tr>
                          <td colSpan={6} className="px-4 py-3 text-sm text-center text-gray-500">
                            No students assigned
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamList;
