import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { facultyService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Faculty } from "@/lib/types";
import { Plus, Pencil, Trash2, Mail, Phone, Building2, Calendar, Award } from "lucide-react";

const FacultyList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: faculty = [], isLoading } = useQuery({
    queryKey: ["faculty"],
    queryFn: facultyService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const deleteMutation = useMutation({
    mutationFn: facultyService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
      toast.success("Faculty deleted successfully");
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete faculty";
      toast.error(errorMessage);
    },
  });

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this faculty member?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredFaculty = faculty.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-bold">Faculty Members</h1>
        <Button onClick={() => navigate("/faculty/new")}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Faculty
        </Button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search faculty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFaculty.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.department}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(`/faculty/${member.id}/edit`)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(member.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {member.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {member.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="w-4 h-4 mr-2" />
                  {member.department}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {(() => {
                    if (!member.availability) return "No availability set";
                    // Handle string format (JSON string from database)
                    if (typeof member.availability === 'string') {
                      try {
                        const parsedAvailability = JSON.parse(member.availability);
                        if (Array.isArray(parsedAvailability)) {
                          return parsedAvailability.join(", ");
                        }
                        return "No availability set";
                      } catch (e) {
                        return "No availability set";
                      }
                    }
                    // Handle array format
                    if (Array.isArray(member.availability)) {
                      return member.availability.join(", ");
                    }
                    // Handle object format
                    if (typeof member.availability === 'object') {
                      return Object.entries(member.availability)
                        .filter(([_, value]) => value)
                        .map(([day]) => day)
                        .join(", ") || "No availability set";
                    }
                    return "No availability set";
                  })()}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Award className="w-4 h-4 mr-2" />
                  Max Supervisions: {member.max_supervisions || "Not set"}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Seniority:</strong> {member.experience || "Not set"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FacultyList;
