import React from "react";
import { Card } from "@/components/ui/card";
import { User, CalendarDays, School } from "lucide-react";
import { Droppable } from "react-beautiful-dnd";
import { Classroom } from "@/types/faculty";

interface ClassroomCardProps {
  classroom: Classroom;
  onDrop?: (facultyId: string) => void;
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({ classroom, onDrop }) => (
  <Droppable droppableId={classroom.id}>
    {(provided) => (
      <div ref={provided.innerRef} {...provided.droppableProps}>
        <Card className="p-4 glass-card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">{classroom.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                <CalendarDays className="w-4 h-4 inline mr-1" />
                {classroom.examDate}
              </p>
            </div>
            <School className="w-5 h-5 text-accent" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Capacity</span>
              <span>{classroom.allocatedStudents}/{classroom.capacity}</span>
            </div>
            {classroom.supervisor && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <User className="w-4 h-4" />
                <span>{classroom.supervisor.name}</span>
                {classroom.supervisor.position && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-sm text-xs bg-primary/10 text-primary-foreground">
                    {classroom.supervisor.position}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-8 gap-1">
              {Array.from({ length: classroom.capacity }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-sm ${
                    i < classroom.allocatedStudents
                      ? "bg-accent/20"
                      : "bg-gray-100"
                  } transition-colors duration-200 hover:bg-accent/40 cursor-pointer`}
                  title={`Seat ${i + 1}`}
                />
              ))}
            </div>
          </div>
          {provided.placeholder}
        </Card>
      </div>
    )}
  </Droppable>
);

export default ClassroomCard;