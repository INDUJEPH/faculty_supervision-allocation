import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { classroomService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Classroom } from "@/lib/types";
import { toast } from "sonner";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { School } from "lucide-react";
import { GraduationCap, Search, UserPlus2, Users2 } from "lucide-react";

const ClassroomList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: classrooms = [], isLoading, error, refetch } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => classroomService.getAll(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (error) {
      console.error('Classroom query error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch classrooms');
    }
  }, [error]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this classroom?")) {
      try {
        console.log('Deleting classroom:', id);
        await classroomService.delete(id);
        refetch(); // Refetch the classrooms list after deletion
        toast.success("Classroom deleted successfully");
      } catch (err) {
        console.error('Error deleting classroom:', {
          classroomId: id,
          error: err instanceof Error ? {
            message: err.message,
            stack: err.stack,
          } : err,
        });
        const message = err instanceof Error ? err.message : "Failed to delete classroom";
        toast.error(message);
      }
    }
  };

  const filteredClassrooms = Array.isArray(classrooms) ? classrooms.filter(classroom => 
    classroom.name?.toLowerCase().includes(search.toLowerCase()) ||
    classroom.building?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const isActive = (value: number | boolean): boolean => {
    return typeof value === 'number' ? value === 1 : value;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-500">{error instanceof Error ? error.message : 'An error occurred'}</p>
        <Button onClick={() => refetch()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-white/90 p-3 rounded-full shadow-md">
              <School className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">Classrooms</h1>
              <p className="text-gray-600">Manage classrooms and their facilities</p>
            </div>
          </div>
        </div>
        
        <Link to="/classrooms/new" className="hover-scale">
          <Button className="gap-2 px-5 py-6 bg-gradient-to-r from-primary to-primary/80 shadow-md hover:shadow-lg transition-all">
            <Plus className="mr-1" />
            Add Classroom
          </Button>
        </Link>
      </div>
      
      <Card className="border-primary/20 overflow-hidden shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 w-full max-w-md mb-6 bg-gray-50 rounded-lg overflow-hidden px-3 border border-gray-200 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or building..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 flex-1 py-3"
            />
          </div>
          
          {filteredClassrooms.length > 0 ? (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/10">
                    <TableHead className="font-semibold text-primary">Name</TableHead>
                    <TableHead className="font-semibold text-primary">Building</TableHead>
                    <TableHead className="font-semibold text-primary">Floor</TableHead>
                    <TableHead className="font-semibold text-primary">Capacity</TableHead>
                    <TableHead className="font-semibold text-primary">Facilities</TableHead>
                    <TableHead className="font-semibold text-primary">Status</TableHead>
                    <TableHead className="text-right font-semibold text-primary">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClassrooms.map((classroom) => (
                    <TableRow key={classroom.id} className="hover-scale transition-all duration-300">
                      <TableCell className="font-medium">{classroom.name}</TableCell>
                      <TableCell>{classroom.building}</TableCell>
                      <TableCell>{classroom.floor}</TableCell>
                      <TableCell>{classroom.capacity}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {isActive(classroom.has_projector) && (
                            <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 text-primary/90 font-medium px-2 py-1">
                              Projector
                            </Badge>
                          )}
                          {isActive(classroom.is_computer_lab) && (
                            <Badge variant="outline" className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 text-primary/90 font-medium px-2 py-1">
                              Computer Lab
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${
                            isActive(classroom.is_active)
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}
                        >
                          {isActive(classroom.is_active) ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                              <span className="sr-only">Open menu</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-primary/20 shadow-lg">
                            <DropdownMenuItem asChild>
                              <Link to={`/classrooms/${classroom.id}`} className="flex items-center gap-2 cursor-pointer">
                                <Eye className="h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/classrooms/${classroom.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 flex items-center gap-2 cursor-pointer"
                              onClick={() => handleDelete(classroom.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                              </svg>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No classrooms found. Click "Add Classroom" to create one.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassroomList;
