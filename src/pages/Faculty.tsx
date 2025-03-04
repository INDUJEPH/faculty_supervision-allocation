
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, School } from "lucide-react";
import { DragDropContext } from "react-beautiful-dnd";
import { toast } from "sonner";
import FacultyCard from "@/components/faculty/FacultyCard";
import ClassroomCard from "@/components/faculty/ClassroomCard";
import { useFacultyData } from "@/hooks/useFacultyData";

const Faculty = () => {
  const { facultyMembers, setFacultyMembers, classrooms, setClassrooms, loading } = useFacultyData();

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (destination.droppableId.startsWith('c')) {
      const faculty = facultyMembers.find(f => f.id === draggableId);
      const classroom = classrooms.find(c => c.id === destination.droppableId);
      
      if (faculty && classroom) {
        if (faculty.allocations >= faculty.maxLoad) {
          toast.error(`${faculty.name} has reached maximum supervision load`);
          return;
        }

        setClassrooms(prev => prev.map(c => {
          if (c.id === classroom.id) {
            return { ...c, supervisor: faculty };
          }
          return c;
        }));

        setFacultyMembers(prev => prev.map(f => {
          if (f.id === faculty.id) {
            return { ...f, allocations: f.allocations + 1 };
          }
          return f;
        }));

        toast.success(`${faculty.name} assigned to ${classroom.name}`);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slide-in">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading faculty and classroom data...</p>
            </div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Faculty Allocation</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Users className="w-5 h-5" />
                  <span>Total Faculty: {facultyMembers.length}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facultyMembers.map((faculty, index) => (
                  <FacultyCard key={faculty.id} faculty={faculty} index={index} />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Classroom Allocation</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <School className="w-5 h-5" />
                  <span>Total Rooms: {classrooms.length}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classrooms.map((classroom) => (
                  <ClassroomCard key={classroom.id} classroom={classroom} />
                ))}
              </div>
            </section>
          </DragDropContext>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Faculty;
