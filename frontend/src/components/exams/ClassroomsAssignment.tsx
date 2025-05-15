import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card } from "@/components/ui/card";
import { Classroom } from "@/lib/types";
import { classroomService } from "@/services/api";
import { Grip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ClassroomAssignmentProps {
  selectedClassrooms: string[];
  onChange: (classroomIds: string[]) => void;
}

const ClassroomAssignment: React.FC<ClassroomAssignmentProps> = ({
  selectedClassrooms,
  onChange,
}) => {
  const [availableClassrooms, setAvailableClassrooms] = useState<Classroom[]>([]);
  const [assignedClassrooms, setAssignedClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        // Load all classrooms
        const allClassrooms = await classroomService.getAll();
        
        // Find assigned classrooms
        const assigned = allClassrooms.filter(c => selectedClassrooms.includes(c.id));
        setAssignedClassrooms(assigned);
        
        // Set available classrooms (excluding already assigned)
        const available = allClassrooms.filter(c => !selectedClassrooms.includes(c.id));
        setAvailableClassrooms(available);
        setError(null);
      } catch (err) {
        setError('Failed to fetch classrooms');
        toast.error('Failed to fetch classrooms');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, [selectedClassrooms]);

  const handleDragEnd = (result: any) => {
    const { source, destination } = result;
    
    // Return if dropped outside a droppable area
    if (!destination) return;
    
    // Handle moving between available and assigned lists
    if (source.droppableId !== destination.droppableId) {
      if (source.droppableId === "available" && destination.droppableId === "assigned") {
        // Moving from available to assigned
        const classroom = availableClassrooms[source.index];
        const newAvailable = [...availableClassrooms];
        newAvailable.splice(source.index, 1);
        const newAssigned = [...assignedClassrooms, classroom];
        
        setAvailableClassrooms(newAvailable);
        setAssignedClassrooms(newAssigned);
        
        // Call onChange with new classroom IDs
        onChange(newAssigned.map(c => c.id));
      } else {
        // Moving from assigned to available
        const classroom = assignedClassrooms[source.index];
        const newAssigned = [...assignedClassrooms];
        newAssigned.splice(source.index, 1);
        const newAvailable = [...availableClassrooms, classroom];
        
        setAvailableClassrooms(newAvailable);
        setAssignedClassrooms(newAssigned);
        
        // Call onChange with new classroom IDs
        onChange(newAssigned.map(c => c.id));
      }
    } else {
      // Reordering within the same list
      if (source.droppableId === "available") {
        const newAvailable = [...availableClassrooms];
        const [moved] = newAvailable.splice(source.index, 1);
        newAvailable.splice(destination.index, 0, moved);
        setAvailableClassrooms(newAvailable);
      } else {
        const newAssigned = [...assignedClassrooms];
        const [moved] = newAssigned.splice(source.index, 1);
        newAssigned.splice(destination.index, 0, moved);
        setAssignedClassrooms(newAssigned);
        
        // Call onChange with reordered classroom IDs
        onChange(newAssigned.map(c => c.id));
      }
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
      <h3 className="text-lg font-medium">Classroom Assignment</h3>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Classrooms */}
          <Card className="p-4 border">
            <h4 className="font-medium mb-4">Available Classrooms</h4>
            <Droppable droppableId="available">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="min-h-[200px] space-y-2"
                >
                  {availableClassrooms.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No available classrooms
                    </p>
                  ) : (
                    availableClassrooms.map((classroom, index) => (
                      <Draggable
                        key={classroom.id}
                        draggableId={classroom.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center p-3 bg-gray-50 rounded-md border"
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="mr-3 text-gray-400"
                            >
                              <Grip size={16} />
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium">{classroom.name}</p>
                              <p className="text-sm text-gray-500">
                                {classroom.building} · Floor: {classroom.floor} · 
                                Capacity: {classroom.capacity}
                              </p>
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

          {/* Assigned Classrooms */}
          <Card className="p-4 border">
            <h4 className="font-medium mb-4">Assigned Classrooms ({assignedClassrooms.length})</h4>
            <Droppable droppableId="assigned">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="min-h-[200px] space-y-2"
                >
                  {assignedClassrooms.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Drag classrooms here to assign
                    </p>
                  ) : (
                    assignedClassrooms.map((classroom, index) => (
                      <Draggable
                        key={classroom.id}
                        draggableId={classroom.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center p-3 bg-blue-50 rounded-md border border-blue-200"
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="mr-3 text-gray-400"
                            >
                              <Grip size={16} />
                            </div>
                            <div className="flex-grow">
                              <p className="font-medium">{classroom.name}</p>
                              <p className="text-sm text-gray-500">
                                {classroom.building} · Floor: {classroom.floor} · 
                                Capacity: {classroom.capacity}
                              </p>
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

export default ClassroomAssignment;
