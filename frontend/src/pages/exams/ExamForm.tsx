import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { examService, classroomService, facultyService, studentService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { autoAssignFaculty } from "@/utils/facultyAssignment";
import { Wand2, Users } from "lucide-react";
import { Exam, Classroom, Faculty, Student } from "@/lib/types";
import { autoAssignClassrooms } from "@/services/classroomAssignment";

const ExamForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use React Query for data fetching with caching
  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ["exam", id],
    queryFn: () => examService.getById(id!),
    enabled: isEditing,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: classrooms = [], isLoading: classroomsLoading } = useQuery({
    queryKey: ["classrooms"],
    queryFn: classroomService.getAll,
    staleTime: 1000 * 60 * 5,
  });

  const { data: faculty = [], isLoading: facultyLoading } = useQuery({
    queryKey: ["faculty"],
    queryFn: facultyService.getAll,
    staleTime: 1000 * 60 * 5,
  });

  const { data: studentsData = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: studentService.getAll,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = examLoading || classroomsLoading || facultyLoading || studentsLoading;

  useEffect(() => {
    if (exam) {
      // Format the date to yyyy-MM-dd for the input field
      const formattedDate = exam.date ? new Date(exam.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      setFormData({
        ...exam,
        date: formattedDate,
        classroom_ids: exam.classroom_ids || [],
        faculty_ids: exam.faculty_ids || [],
        student_ids: exam.student_ids || []
      });
    }
  }, [exam]);

  const initialFormState: Partial<Exam> = {
    name: "",
    subject: "",
    date: new Date().toISOString().split('T')[0],
    start_time: "09:00",
    end_time: "12:00",
    exam_type: "internal1",
    semester: "",
    classroom_ids: [],
    faculty_ids: [],
    student_ids: []
  };

  const [formData, setFormData] = useState<Partial<Exam>>(initialFormState);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedSection, setSelectedSection] = useState<string>("all");

  const formatDateForInput = (date: string | Date): string => {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    return typeof date === 'string' ? date : new Date().toISOString().split('T')[0];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassroomChange = (classroomId: string, checked: boolean) => {
    setFormData({
      ...formData,
      classroom_ids: checked
        ? [...formData.classroom_ids, classroomId]
        : formData.classroom_ids.filter(id => id !== classroomId)
    });
  };

  const handleFacultyChange = (facultyId: string, checked: boolean) => {
    setFormData({
      ...formData,
      faculty_ids: checked
        ? [...formData.faculty_ids, facultyId]
        : formData.faculty_ids.filter(id => id !== facultyId)
    });
  };

  const handleStudentChange = (studentId: string, checked: boolean) => {
    setFormData({
      ...formData,
      student_ids: checked
        ? [...formData.student_ids, studentId]
        : formData.student_ids.filter(id => id !== studentId)
    });
  };

  const handleBulkStudentAssignment = async () => {
    try {
      // Filter students based on selected department, semester, section
      let filteredStudents = [...studentsData];
      
      if (selectedDepartment !== "all") {
        filteredStudents = filteredStudents.filter(
          student => student.department === selectedDepartment
        );
      }
      
      if (selectedSemester !== "all") {
        filteredStudents = filteredStudents.filter(
          student => student.semester === parseInt(selectedSemester)
        );
      }
      
      if (selectedSection !== "all") {
        filteredStudents = filteredStudents.filter(
          student => student.section === selectedSection
        );
      }
      
      // Get IDs of filtered students
      const filteredStudentIds = filteredStudents.map(student => student.id);
      
      // Update form data with these student IDs
      setFormData({
        ...formData,
        student_ids: filteredStudentIds
      });
      
      toast.success(`Assigned ${filteredStudentIds.length} students to the exam`);
    } catch (error) {
      console.error("Error assigning students:", error);
      toast.error("Failed to assign students");
    }
  };

  const handleAutoAssignFaculty = async () => {
    try {
      if (!formData.classroom_ids || formData.classroom_ids.length === 0) {
        toast.error("Please assign classrooms first");
        return;
      }

      if (!formData.id) {
        toast.error("Please save the exam first before auto-assigning faculty");
        return;
      }

      const facultyIds = await autoAssignFaculty(formData.id);
      
      if (facultyIds && facultyIds.length > 0) {
        setFormData(prev => ({
          ...prev,
          faculty_ids: facultyIds
        }));
        toast.success(`Assigned ${facultyIds.length} faculty members`);
      } else {
        toast.error("No suitable faculty available for the selected date");
      }
    } catch (error) {
      console.error("Error auto-assigning faculty:", error);
      toast.error("Failed to auto-assign faculty. Please try again.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.classroom_ids || formData.classroom_ids.length === 0) {
      toast.error("Please select at least one classroom");
      return;
    }

    if (!formData.faculty_ids || formData.faculty_ids.length === 0) {
      toast.error("Please assign at least one faculty member");
      return;
    }
    
    console.log('Submitting exam data:', formData);
    
    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  // Get unique departments, semesters, and sections for filters
  const departments = [...new Set(studentsData.map(s => s.department))];
  const semesters = [...new Set(studentsData.map(s => s.semester))].sort((a, b) => a - b);
  const sections = [...new Set(studentsData.map(s => s.section))].sort();

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Exam>) => {
      const exam = await examService.update(id!, data);
      
      // Get students for the selected semester
      const semesterStudents = studentsData.filter(s => s.semester.toString() === data.semester);
      
      // Update exam with student IDs
      await examService.update(exam.id, {
        ...exam,
        student_ids: semesterStudents.map(s => s.id)
      });

      // Re-assign classrooms and faculty if semester changed
      if (data.semester !== formData.semester) {
        try {
          await autoAssignClassrooms(exam.id);
          await autoAssignFaculty(exam.id);
        } catch (error) {
          console.error("Error in auto-assignment:", error);
          // Don't throw here, just log the error
        }
      }

      return exam;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam updated successfully");
      navigate("/exams");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : "Failed to update exam";
      toast.error(errorMessage);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Exam>) => {
      // First create the exam with basic details
      const exam = await examService.create(data as Omit<Exam, "id">);
      
      // Get students for the selected semester
      const semesterStudents = studentsData.filter(s => s.semester.toString() === data.semester);
      
      // Update exam with student IDs
      await examService.update(exam.id, {
        ...exam,
        student_ids: semesterStudents.map(s => s.id)
      });

      // Auto-assign classrooms and faculty
      try {
        await autoAssignClassrooms(exam.id);
        await autoAssignFaculty(exam.id);
      } catch (error) {
        console.error("Error in auto-assignment:", error);
        // Don't throw here, just log the error
      }

      return exam;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam created successfully");
      navigate("/exams");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'object' && error !== null && 'message' in error
          ? String(error.message)
          : "Failed to create exam";
      toast.error(errorMessage);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-500">Loading exam data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Exam Schedule" : "Schedule New Exam"}
      </h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Exam Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date as string}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    name="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    name="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="exam_type">Exam Type</Label>
                <Select
                  value={formData.exam_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, exam_type: value as Exam["exam_type"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal1">Internal 1</SelectItem>
                    <SelectItem value="internal2">Internal 2</SelectItem>
                    <SelectItem value="external">External</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Classrooms *</Label>
              <div className="border rounded-md p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {classrooms.map((classroom) => (
                    <div key={classroom.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`classroom-${classroom.id}`}
                        checked={formData.classroom_ids?.includes(classroom.id)}
                        onCheckedChange={(checked) => 
                          handleClassroomChange(classroom.id, !!checked)
                        }
                      />
                      <Label htmlFor={`classroom-${classroom.id}`} className="cursor-pointer">
                        {classroom.name} ({classroom.capacity} seats)
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Faculty Supervisors *</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleAutoAssignFaculty}
                >
                  <Wand2 size={16} />
                  Auto-Assign
                </Button>
              </div>
              <div className="border rounded-md p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {faculty.map((facultyMember) => (
                    <div key={facultyMember.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={facultyMember.id}
                        checked={formData.faculty_ids?.includes(facultyMember.id)}
                        onCheckedChange={(checked) => {
                          const newFacultyIds = checked
                            ? [...(formData.faculty_ids || []), facultyMember.id]
                            : (formData.faculty_ids || []).filter(id => id !== facultyMember.id);
                          setFormData(prev => ({ ...prev, faculty_ids: newFacultyIds }));
                        }}
                      />
                      <Label htmlFor={facultyMember.id}>
                        {facultyMember.name} ({facultyMember.department})
                        <div className="text-xs text-gray-500">
                          Max Supervisions: {facultyMember.max_supervisions || "Not set"}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Students</Label>
                <div className="flex space-x-2">
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {semesters.map(semester => (
                        <SelectItem key={semester} value={semester.toString()}>
                          Semester {semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Section" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sections</SelectItem>
                      {sections.map(section => (
                        <SelectItem key={section} value={section}>
                          Section {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={handleBulkStudentAssignment}
                  >
                    <Users size={16} />
                    Assign
                  </Button>
                </div>
              </div>
              <div className="border rounded-md p-4 space-y-4">
                <p className="text-sm text-gray-500 mb-2">
                  {formData.student_ids?.length || 0} students assigned to this exam
                </p>
                <div className="max-h-64 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {studentsData.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={student.id}
                        checked={formData.student_ids?.includes(student.id)}
                        onCheckedChange={(checked) => {
                          const newStudentIds = checked
                            ? [...(formData.student_ids || []), student.id]
                            : (formData.student_ids || []).filter(id => id !== student.id);
                          setFormData(prev => ({ ...prev, student_ids: newStudentIds }));
                        }}
                      />
                      <Label htmlFor={student.id}>
                        {student.name} ({student.roll_number})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/exams")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending || createMutation.isPending}
              >
                {updateMutation.isPending || createMutation.isPending
                  ? "Saving..."
                  : isEditing
                  ? "Update Exam"
                  : "Schedule Exam"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamForm;
