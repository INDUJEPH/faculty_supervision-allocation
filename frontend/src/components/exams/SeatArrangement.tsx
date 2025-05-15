import React, { useState, useEffect } from "react";
import { Classroom, Student, SeatArrangement as SeatArrangementType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { studentService, classroomService, examService } from "@/services/api";
import { ChevronRight, Users, Download, Printer, Eye } from "lucide-react";
import StudentSeatCard from "./StudentSeatCard";

interface SeatArrangementProps {
  examId: string;
  selectedClassrooms: Classroom[];
  studentIds: string[];
  seatArrangements?: SeatArrangementType[];
  onSave: (seatArrangements: SeatArrangementType[]) => void;
}

const SeatArrangementComponent = ({
  examId,
  selectedClassrooms,
  studentIds,
  seatArrangements = [],
  onSave,
}: SeatArrangementProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [arrangements, setArrangements] = useState<SeatArrangementType[]>(seatArrangements);
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"admin" | "student">("admin");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const allStudents = await studentService.getAll();
        const examStudents = allStudents.filter(student => 
          studentIds.includes(student.id)
        );
        setStudents(examStudents);
        setError(null);
      } catch (err) {
        setError('Failed to fetch students');
        toast.error('Failed to fetch students');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
    
    if (selectedClassrooms.length > 0 && activeTab === "") {
      setActiveTab(selectedClassrooms[0].id);
    }
    
    if (arrangements.length === 0 && selectedClassrooms.length > 0) {
      const initialArrangements = selectedClassrooms.map(classroom => ({
        classroomId: classroom.id,
        seats: []
      }));
      setArrangements(initialArrangements);
    }
  }, [selectedClassrooms, studentIds, activeTab]);

  const getAssignedStudents = (classroomId: string) => {
    const arrangement = arrangements.find(a => a.classroomId === classroomId);
    if (!arrangement) return [];
    
    return arrangement.seats.map(seat => seat.studentId);
  };

  const getUnassignedStudents = () => {
    const assignedStudentIds = arrangements.flatMap(arrangement => 
      arrangement.seats.map(seat => seat.studentId)
    );
    
    return students.filter(student => !assignedStudentIds.includes(student.id));
  };

  const autoGenerateSeating = () => {
    setAutoGenerating(true);
    try {
      let remainingStudents = [...getUnassignedStudents()];
      
      const newArrangements = selectedClassrooms.map(classroom => {
        const existingArrangement = arrangements.find(a => a.classroomId === classroom.id) || {
          classroomId: classroom.id,
          seats: []
        };
        
        const assignedCount = existingArrangement.seats.length;
        const emptySeats = classroom.capacity - assignedCount;
        
        const studentsToAssign = remainingStudents.splice(0, emptySeats);
        
        const columns = Math.ceil(Math.sqrt(classroom.capacity));
        const rows = Math.ceil(classroom.capacity / columns);
        
        const newSeats = studentsToAssign.map((student, index) => {
          const position = index + assignedCount;
          return {
            studentId: student.id,
            seatNumber: position + 1,
            row: Math.floor(position / columns) + 1,
            column: position % columns + 1
          };
        });
        
        return {
          classroomId: classroom.id,
          seats: [...existingArrangement.seats, ...newSeats]
        };
      });
      
      setArrangements(newArrangements);
      toast.success("Seating arrangement auto-generated");
    } catch (error) {
      toast.error("Failed to generate seating arrangement");
      console.error(error);
    } finally {
      setAutoGenerating(false);
    }
  };


  const handleSave = async () => {
    try {
      await examService.updateSeatArrangements(examId, arrangements);
      onSave(arrangements);
      toast.success("Seating arrangements saved");
    } catch (error) {
      toast.error("Failed to save seating arrangements");
      console.error(error);
    }
  };
  const getStudentById = (studentId: string) => {
    return students.find(s => s.id === studentId);
  };

  const getClassroomById = (classroomId: string) => {
    return selectedClassrooms.find(c => c.id === classroomId);
  };

  const findStudentSeat = (studentId: string) => {
    for (const arrangement of arrangements) {
      const seat = arrangement.seats.find(s => s.studentId === studentId);
      if (seat) {
        const classroom = getClassroomById(arrangement.classroomId);
        return {
          classroom,
          seat
        };
      }
    }
    return null;
  };

  const generateStudentCards = () => {
    let studentsWithSeats = [];
    
    for (const student of students) {
      const seatInfo = findStudentSeat(student.id);
      if (seatInfo) {
        studentsWithSeats.push({
          student,
          classroom: seatInfo.classroom,
          seat: seatInfo.seat
        });
      }
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {studentsWithSeats.length > 0 ? (
          studentsWithSeats.map(({ student, classroom, seat }) => (
            <StudentSeatCard
              key={student.id}
              student={student}
              classroom={classroom}
              seat={seat}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <p className="text-gray-500">No seat assignments found</p>
          </div>
        )}
      </div>
    );
  };

  const renderSeatGrid = (classroomId: string) => {
    const arrangement = arrangements.find(a => a.classroomId === classroomId);
    if (!arrangement || arrangement.seats.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Users size={48} className="text-gray-300 mb-2" />
          <p className="text-gray-500">No seats assigned yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Use the auto-generate button to create a seating arrangement
          </p>
        </div>
      );
    }
    
    const classroom = getClassroomById(classroomId);
    if (!classroom) return null;
    
    const maxRow = Math.max(...arrangement.seats.map(s => s.row), 0);
    const maxCol = Math.max(...arrangement.seats.map(s => s.column), 0);
    
    const grid = Array(maxRow).fill(null).map(() => Array(maxCol).fill(null));
    
    arrangement.seats.forEach(seat => {
      if (seat.row > 0 && seat.column > 0) {
        const student = getStudentById(seat.studentId);
        grid[seat.row - 1][seat.column - 1] = student ? {
          id: student.id,
          name: student.name,
          rollNumber: student.rollNumber,
          seatNumber: seat.seatNumber
        } : null;
      }
    });
    
    return (
      <div className="overflow-x-auto">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">Row</TableHead>
              {Array(maxCol).fill(null).map((_, i) => (
                <TableHead key={i} className="text-center">Col {i + 1}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {grid.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell className="font-medium bg-gray-50">
                  Row {rowIndex + 1}
                </TableCell>
                {row.map((cell, colIndex) => (
                  <TableCell 
                    key={colIndex} 
                    className={`text-center border ${
                      cell ? "bg-primary/10" : "bg-gray-50"
                    }`}
                  >
                    {cell && (
                      <div className="p-2">
                        <div className="font-medium">{cell.name}</div>
                        <div className="text-xs text-gray-500">
                          {cell.rollNumber}
                        </div>
                        <Badge variant="outline" className="mt-1">
                          Seat #{cell.seatNumber}
                        </Badge>
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const handleDownloadSeatingPlan = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Failed to open print window. Please allow popups for this site.');
      return;
    }

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Seating Plan - Student Cards</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
          .card { border: 1px solid #6d9775; border-radius: 8px; overflow: hidden; page-break-inside: avoid; }
          .card-header { background-color: rgba(109, 151, 117, 0.1); padding: 10px; }
          .card-title { margin: 0; font-size: 16px; }
          .card-content { padding: 15px; }
          .badge { display: inline-block; padding: 3px 8px; background-color: rgba(109, 151, 117, 0.05); 
                   border: 1px solid #6d9775; border-radius: 4px; font-size: 12px; }
          @media print {
            .card { break-inside: avoid; }
            .page-break { page-break-after: always; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Seating Plan - Student Cards</h1>
            <button class="no-print" onclick="window.print()">Print</button>
            <p>Total Students: ${students.length}</p>
          </div>
          <div class="card-grid">
    `;

    for (const student of students) {
      const seatInfo = findStudentSeat(student.id);
      if (seatInfo) {
        const { classroom, seat } = seatInfo;
        html += `
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">${student.name}</h3>
              <p>Roll Number: ${student.rollNumber}</p>
            </div>
            <div class="card-content">
              <p><strong>Exam Seating Information</strong></p>
              <p>Classroom: ${classroom?.building} - ${classroom?.name}</p>
              <p>Seat Number: ${seat.seatNumber}</p>
              <p>Row: ${seat.row}, Column: ${seat.column}</p>
              <div style="text-align: right;">
                <span class="badge">Seat #${seat.seatNumber}</span>
              </div>
            </div>
          </div>
        `;
      }
    }

    html += `
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
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
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Seating Arrangement</CardTitle>
          <div className="flex space-x-2">
            {viewMode === "admin" && (
              <Button
                variant="outline"
                onClick={autoGenerateSeating}
                disabled={autoGenerating || getUnassignedStudents().length === 0}
              >
                {autoGenerating ? "Generating..." : "Auto-Generate"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === "admin" ? "student" : "admin")}
            >
              <Eye size={16} className="mr-2" />
              {viewMode === "admin" ? "Student View" : "Admin View"}
            </Button>
            {viewMode === "student" && (
              <>
                <Button variant="outline" onClick={handleDownloadSeatingPlan}>
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer size={16} className="mr-2" />
                  Print
                </Button>
              </>
            )}
            {viewMode === "admin" && (
              <Button onClick={handleSave}>Save Arrangement</Button>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
          <Users size={16} />
          <span>
            {getUnassignedStudents().length} unassigned students of {students.length} total
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "admin" ? (
          selectedClassrooms.length > 0 ? (
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="mb-4">
                {selectedClassrooms.map((classroom) => (
                  <TabsTrigger key={classroom.id} value={classroom.id}>
                    {classroom.name}
                    <Badge 
                      variant="secondary" 
                      className="ml-2"
                    >
                      {getAssignedStudents(classroom.id).length}/{classroom.capacity}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {selectedClassrooms.map((classroom) => (
                <TabsContent key={classroom.id} value={classroom.id}>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{classroom.building} - {classroom.name}</h3>
                      <p className="text-sm text-gray-500">
                        Capacity: {classroom.capacity} students | Floor: {classroom.floor}
                      </p>
                    </div>
                  </div>
                  {renderSeatGrid(classroom.id)}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-4">
              <p>No classrooms assigned to this exam yet.</p>
            </div>
          )
        ) : (
          generateStudentCards()
        )}
      </CardContent>
    </Card>
  );
};

export default SeatArrangementComponent;
