

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Faculty, Classroom } from "@/lib/types";

import { facultyService, studentService } from "@/services/api";
import { autoAssignFaculty } from "@/utils/facultyAssignment";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { AlertCircle, Grip, School } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { toast } from "sonner";

interface FacultyAssignmentProps {
  examId: string;
  subject?: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  selectedClassrooms: Classroom[];
  selectedFaculty: string[];
  examType?: "internal1" | "internal2" | "external";
  onChange: (facultyIds: string[]) => void;
}

const FacultyAssignment: React.FC<FacultyAssignmentProps> = ({
  examId,
  subject,
  date,
  startTime,
  endTime,
  selectedClassrooms,
  selectedFaculty,
  examType = "internal1",
  onChange,
}) => {
  const [availableFaculty, setAvailableFaculty] = useState<Faculty[]>([]);
  const [assignedFaculty, setAssignedFaculty] = useState<Faculty[]>([]);
  const [filterDepartment, setFilterDepartment] = useState<string>("");
  const [filterSemesterPref, setFilterSemesterPref] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [semesterType, setSemesterType] = useState<string>("unknown");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load all faculty
        const allFaculty = await facultyService.getAll();
        
        // Find assigned faculty
        const assigned = allFaculty.filter(f => selectedFaculty.includes(f.id));
        setAssignedFaculty(assigned);
        
        // Set available faculty (excluding already assigned)
        const available = allFaculty.filter(f => !selectedFaculty.includes(f.id));
        setAvailableFaculty(available);
        
        // Determine semester type from students assigned to exam
        const students = await studentService.getAll();
        const examStudents = students.filter(student => student.semester);
        if (examStudents.length > 0) {
          const semester = examStudents[0].semester;
          const type = semester % 2 === 0 ? "even" : "odd";
          setSemesterType(type);
        }
        setError(null);
      } catch (err) {
        setError('Failed to fetch faculty data');
        toast.error('Failed to fetch faculty data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFaculty]);

  const handleDragEnd = (result: any) => {
    const { source, destination } = result;
    
    // Return if dropped outside a droppable area
    if (!destination) return;
    
    // Handle moving between available and assigned lists
    if (source.droppableId !== destination.droppableId) {
      if (source.droppableId === "available" && destination.droppableId === "assigned") {
        // Moving from available to assigned
        const faculty = availableFaculty[source.index];
        const newAvailable = [...availableFaculty];
        newAvailable.splice(source.index, 1);
        const newAssigned = [...assignedFaculty, faculty];
        
        setAvailableFaculty(newAvailable);
        setAssignedFaculty(newAssigned);
        
        // Call onChange with new faculty IDs
        onChange(newAssigned.map(f => f.id));
      } else {
        // Moving from assigned to available
        const faculty = assignedFaculty[source.index];
        const newAssigned = [...assignedFaculty];
        newAssigned.splice(source.index, 1);
        const newAvailable = [...availableFaculty, faculty];
        
        setAvailableFaculty(newAvailable);
        setAssignedFaculty(newAssigned);
        
        // Call onChange with new faculty IDs
        onChange(newAssigned.map(f => f.id));
      }
    } else {
      // Reordering within the same list
      if (source.droppableId === "available") {
        const newAvailable = [...availableFaculty];
        const [moved] = newAvailable.splice(source.index, 1);
        newAvailable.splice(destination.index, 0, moved);
        setAvailableFaculty(newAvailable);
      } else {
        const newAssigned = [...assignedFaculty];
        const [moved] = newAssigned.splice(source.index, 1);
        newAssigned.splice(destination.index, 0, moved);
        setAssignedFaculty(newAssigned);
        
        // Call onChange with reordered faculty IDs
        onChange(newAssigned.map(f => f.id));
      }
    }
  };

  const handleAutoAssign = () => {
    const exam = {
      id: examId,
      subject: subject || "",
      date,
      startTime,
      endTime,
      classroomIds: selectedClassrooms.map(c => c.id),
      facultyIds: [],
      studentIds: [],
      name: "",
      examType: examType
    };
    
    const assignedFacultyIds = autoAssignFaculty(exam, selectedClassrooms, subject);
    onChange(assignedFacultyIds);
  };

  // Filter available faculty based on selected filters
  const filteredAvailableFaculty = availableFaculty.filter(faculty => {
    const departmentMatches = !filterDepartment || faculty.department === filterDepartment;
    const semesterPrefMatches = !filterSemesterPref || 
                              faculty.preferredSemesters === filterSemesterPref || 
                              faculty.preferredSemesters === "both";
    return departmentMatches && semesterPrefMatches;
  });

  const getSemesterPrefLabel = (pref: string) => {
    switch(pref) {
      case "odd": return "Odd Semesters (1,3,5,7)";
      case "even": return "Even Semesters (2,4,6,8)";
      case "both": return "All Semesters";
      default: return "Unknown";
    }
  };

  // Get unique departments for filter
  const departments = [...new Set(availableFaculty.map(f => f.department))];

  const getFacultySuitabilityColor = (faculty: Faculty) => {
    if (faculty.preferredSemesters === "both") return "bg-green-50 border-green-200";
    if (faculty.preferredSemesters === semesterType) return "bg-green-50 border-green-200";
    return "bg-yellow-50 border-yellow-200";
  };

  const getExamTypeLabel = (type: string) => {
    switch(type) {
      case "internal1": return "Internal Exam 1";
      case "internal2": return "Internal Exam 2";
      case "external": return "External Exam";
      default: return "Unknown Exam Type";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-medium">Faculty Assignment</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
              <School className="w-3 h-3" />
              {semesterType === "even" ? "Even Semester" : "Odd Semester"}
            </Badge>
            <Badge variant="outline" className="bg-purple-50">
              {getExamTypeLabel(examType)}
            </Badge>
          </div>
        </div>
        <Button onClick={handleAutoAssign} variant="outline" size="sm">
          Auto Assign
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filterSemesterPref} onValueChange={setFilterSemesterPref}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by Semester Preference" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Preferences</SelectItem>
            <SelectItem value="odd">Odd Semesters (1,3,5,7)</SelectItem>
            <SelectItem value="even">Even Semesters (2,4,6,8)</SelectItem>
            <SelectItem value="both">All Semesters</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Faculty */}
          <Card className="p-4 border">
            <h4 className="font-medium mb-4">Available Faculty</h4>
            <Droppable droppableId="available">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="min-h-[200px] space-y-2"
                >
                  {filteredAvailableFaculty.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No available faculty matching filters
                    </p>
                  ) : (
                    filteredAvailableFaculty.map((faculty, index) => (
                      <Draggable
                        key={faculty.id}
                        draggableId={faculty.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center p-3 rounded-md border ${
                              faculty.seniority >= 4 
                                ? "bg-blue-50 border-blue-200" 
                                : "bg-gray-50 border-gray-200"
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="mr-3 text-gray-400"
                            >
                              <Grip size={16} />
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <p className="font-medium">{faculty.name}</p>
                                {faculty.preferredSemesters !== semesterType && faculty.preferredSemesters !== "both" && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="ml-2">
                                          <AlertCircle size={14} className="text-amber-500" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Preferred for {getSemesterPrefLabel(faculty.preferredSemesters)} exams</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {faculty.department} · Seniority: {faculty.seniority}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {getSemesterPrefLabel(faculty.preferredSemesters)}
                                </Badge>
                                {faculty.seniority >= 4 && (
                                  <Badge variant="outline" className="bg-blue-50 text-xs">
                                    Senior Faculty
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Card>

          {/* Assigned Faculty */}
          <Card className="p-4 border">
            <h4 className="font-medium mb-4">
              Assigned Faculty ({assignedFaculty.length})
              {examType === "external" && assignedFaculty.length > 0 && 
                !assignedFaculty.some(f => f.seniority >= 4) && (
                <Badge variant="outline" className="ml-2 bg-red-50 text-red-700">
                  Senior faculty needed for external exam
                </Badge>
              )}
            </h4>
            <Droppable droppableId="assigned">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="min-h-[200px] space-y-2"
                >
                  {assignedFaculty.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Drag faculty here to assign
                    </p>
                  ) : (
                    assignedFaculty.map((faculty, index) => (
                      <Draggable
                        key={faculty.id}
                        draggableId={faculty.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center p-3 rounded-md border ${getFacultySuitabilityColor(faculty)}`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="mr-3 text-gray-400"
                            >
                              <Grip size={16} />
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center">
                                <p className="font-medium">{faculty.name}</p>
                                {faculty.preferredSemesters !== semesterType && faculty.preferredSemesters !== "both" && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="ml-2">
                                          <AlertCircle size={14} className="text-amber-500" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Preferred for {getSemesterPrefLabel(faculty.preferredSemesters)} exams</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {faculty.department} · Seniority: {faculty.seniority}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {getSemesterPrefLabel(faculty.preferredSemesters)}
                                </Badge>
                                {faculty.seniority >= 4 && (
                                  <Badge variant="outline" className="bg-blue-50 text-xs">
                                    Senior Faculty
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Card>
        </div>
      </DragDropContext>
    </div>
  );
};

export default FacultyAssignment;
