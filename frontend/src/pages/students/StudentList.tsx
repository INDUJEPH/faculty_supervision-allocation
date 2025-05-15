import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Student } from "@/lib/types";
import { Plus, Pencil, Trash2, Mail, Building2, GraduationCap, BookOpen } from "lucide-react";

const StudentList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: studentService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: studentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student deleted successfully");
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete student";
      toast.error(errorMessage);
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Students</h1>
        <Button onClick={() => navigate("/students/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Student
        </Button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.roll_number}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/students/${student.id}/edit`)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(student.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="w-4 h-4 mr-2" />
                  {student.department}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Semester {student.semester} - Section {student.section}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Elective Subjects: {student.elective_subjects?.join(", ") || "None"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentList;
