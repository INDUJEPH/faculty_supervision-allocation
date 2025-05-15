import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Classroom } from "@/lib/types";

interface SimpleClassroomAssignmentProps {
  classrooms: Classroom[];
  selectedClassroomIds: string[];
  onClassroomChange: (classroomIds: string[]) => void;
}

const SimpleClassroomAssignment: React.FC<SimpleClassroomAssignmentProps> = ({
  classrooms,
  selectedClassroomIds,
  onClassroomChange,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Assign Classrooms</label>
      <Select
        value={selectedClassroomIds[0]} // For now, we'll just handle single selection
        onValueChange={(value) => onClassroomChange([value])}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a classroom" />
        </SelectTrigger>
        <SelectContent>
          {classrooms.map((classroom) => (
            <SelectItem key={classroom.id} value={classroom.id}>
              {classroom.name} (Capacity: {classroom.capacity})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SimpleClassroomAssignment; 