import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

type Teacher = {
  id: string;
  name: string;
  subject: string;
  experience?: string;
  position?: string;
};

type Class = {
  id: string;
  name: string;
  grade_level: string;
};

interface ScheduleFiltersProps {
  days: string[];
  teachers: Teacher[];
  classes: Class[];
  selectedDay: string | null;
  selectedTeacher: string | null;
  selectedClass: string | null;
  onDayChange: (day: string | null) => void;
  onTeacherChange: (teacherId: string | null) => void;
  onClassChange: (classId: string | null) => void;
}

const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({
  days,
  teachers,
  classes,
  selectedDay,
  selectedTeacher,
  selectedClass,
  onDayChange,
  onTeacherChange,
  onClassChange,
}) => {
  // Function to truncate long subject names
  const formatSubject = (subject: string) => {
    return subject.length > 20 ? subject.substring(0, 20) + "..." : subject;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="day-filter">Day of Week</Label>
          <Select
            value={selectedDay || ""}
            onValueChange={(value) => onDayChange(value === "" ? null : value)}
          >
            <SelectTrigger id="day-filter">
              <SelectValue placeholder="All days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All days</SelectItem>
              {days.map((day) => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="teacher-filter">Teacher</Label>
          <Select
            value={selectedTeacher || ""}
            onValueChange={(value) => onTeacherChange(value === "" ? null : value)}
          >
            <SelectTrigger id="teacher-filter">
              <SelectValue placeholder="All teachers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All teachers</SelectItem>
              {teachers && teachers.length > 0 && teachers.map((teacher) => (
                <TooltipProvider key={teacher.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <SelectItem value={teacher.id}>
                        {teacher.name} 
                        {teacher.position && <Badge variant="outline" className="ml-1 text-[10px]">{teacher.position}</Badge>}
                      </SelectItem>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-sm space-y-1">
                      <p><strong>Subject:</strong> {teacher.subject}</p>
                      {teacher.experience && <p><strong>Experience:</strong> {teacher.experience}</p>}
                      {teacher.position && <p><strong>Position:</strong> {teacher.position}</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="class-filter">Class</Label>
          <Select
            value={selectedClass || ""}
            onValueChange={(value) => onClassChange(value === "" ? null : value)}
          >
            <SelectTrigger id="class-filter">
              <SelectValue placeholder="All classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All classes</SelectItem>
              {classes && classes.length > 0 && classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} ({cls.grade_level})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleFilters;