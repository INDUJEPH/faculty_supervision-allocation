import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Classroom, Student, SeatArrangement, Exam, Faculty } from "@/lib/types";
import { studentService, facultyService } from "@/services/api";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

interface ExamReportProps {
  exam: Exam;
  selectedClassrooms: Classroom[];
}

const ExamReport = ({ exam, selectedClassrooms }: ExamReportProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentsData, facultyData] = await Promise.all([
          studentService.getAll(),
          facultyService.getAll()
        ]);
        
        setStudents(studentsData.filter(student => exam.studentIds.includes(student.id)));
        setFaculty(facultyData.filter(f => exam.facultyIds.includes(f.id)));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch data";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [exam.studentIds, exam.facultyIds]);

  const formatDate = (dateString: string | Date) => {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStudentSeatInfo = (studentId: string) => {
    for (const arrangement of exam.seatArrangements || []) {
      const seat = arrangement.seats.find(s => s.studentId === studentId);
      if (seat) {
        const classroom = selectedClassrooms.find(c => c.id === arrangement.classroomId);
        return {
          classroom: classroom?.name || "Unknown",
          seatNumber: seat.seatNumber,
          row: seat.row,
          column: seat.column
        };
      }
    }
    return { classroom: "Not assigned", seatNumber: "-", row: "-", column: "-" };
  };

  const generatePDF = () => {
    setIsGenerating(true);
    
    // Simulate PDF generation
    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Report generated successfully");
      
      // Simulate download
      const a = document.createElement('a');
      a.href = 'javascript:void(0)';
      a.download = `${exam.subject}_exam_report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 1500);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <Card className="mt-6 print:shadow-none" id="exam-report">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Exam Report</CardTitle>
          <div className="flex space-x-2 print:hidden">
            <Button 
              variant="outline" 
              onClick={printReport}
              className="flex items-center gap-2"
            >
              <Printer size={16} />
              Print
            </Button>
            <Button 
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              {isGenerating ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="bg-secondary/10 p-4 rounded-lg">
            <h2 className="text-xl font-bold">{exam.subject} Examination</h2>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(exam.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{exam.startTime} - {exam.endTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="font-medium">{students.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Classrooms</p>
                <p className="font-medium">{selectedClassrooms.map(c => c.name).join(", ")}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Faculty Supervisors</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculty.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">No faculty assigned</TableCell>
                  </TableRow>
                ) : (
                  faculty.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>{f.department}</TableCell>
                      <TableCell>{f.email}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Student Seating Arrangement</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Classroom</TableHead>
                  <TableHead>Seat No.</TableHead>
                  <TableHead>Row</TableHead>
                  <TableHead>Column</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const { classroom, seatNumber, row, column } = getStudentSeatInfo(student.id);
                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{classroom}</TableCell>
                      <TableCell>{seatNumber}</TableCell>
                      <TableCell>{row}</TableCell>
                      <TableCell>{column}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="print:hidden text-center text-gray-500 text-sm mt-8">
            <p>Generated on {new Date().toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamReport;
