import React from "react";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { Draggable } from "react-beautiful-dnd";
import { Faculty } from "@/types/faculty";

interface FacultyCardProps {
  faculty: Faculty;
  index: number;
}

const FacultyCard: React.FC<FacultyCardProps> = ({ faculty, index }) => (
  <Draggable draggableId={faculty.id} index={index}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <Card className="p-4 glass-card hover-lift">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <User className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{faculty.name}</h3>
              <p className="text-sm text-gray-500">{faculty.subject}</p>
              {faculty.position && (
                <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs bg-primary/10 text-primary-foreground">
                  {faculty.position}
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">Allocated: {faculty.allocations}/{faculty.maxLoad}</span>
            {faculty.experience && (
              <span className="text-gray-500 text-xs">Exp: {faculty.experience}</span>
            )}
          </div>
        </Card>
      </div>
    )}
  </Draggable>
);

export default FacultyCard;