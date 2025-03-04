
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ScheduleCalendar from "@/components/schedule/ScheduleCalendar";
import ScheduleFilters from "@/components/schedule/ScheduleFilters";
import ScheduleStats from "@/components/schedule/ScheduleStats";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export type Schedule = {
  id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room_number: string;
  teacher: {
    id: string;
    name: string;
    subject: string;
    experience?: string;
    position?: string;
  };
  class: {
    id: string;
    name: string;
    grade_level: string;
  };
};

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

const Schedule: React.FC = () => {
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const { data: scheduleData, isLoading: scheduleLoading } = useQuery({
    queryKey: ["schedule", selectedDay, selectedTeacher, selectedClass],
    queryFn: async () => {
      let query = supabase
        .from("schedule_slots")
        .select(`
          id,
          day_of_week,
          start_time,
          end_time,
          room_number,
          teacher:teacher_id(id, name, subject, experience, position),
          class:class_id(id, name, grade_level)
        `)
        .order("start_time");

      if (selectedDay) {
        query = query.eq("day_of_week", selectedDay);
      }
      
      if (selectedTeacher) {
        query = query.eq("teacher_id", selectedTeacher);
      }
      
      if (selectedClass) {
        query = query.eq("class_id", selectedClass);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching schedule data:", error);
        toast({
          title: "Error fetching schedule",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as Schedule[];
    },
  });

  const { data: teachers = [], isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ["teachers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, name, subject, experience, position")
        .order("name");
      
      if (error) {
        console.error("Error fetching teachers:", error);
        toast({
          title: "Error fetching teachers",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data;
    },
  });

  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name, grade_level")
        .order("name");
      
      if (error) {
        console.error("Error fetching classes:", error);
        toast({
          title: "Error fetching classes",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data;
    },
  });

  const isLoading = scheduleLoading || teachersLoading || classesLoading;

  const handleDayChange = (day: string | null) => {
    setSelectedDay(day === "_all" ? null : day);
  };

  const handleTeacherChange = (teacherId: string | null) => {
    setSelectedTeacher(teacherId === "_all" ? null : teacherId);
  };

  const handleClassChange = (classId: string | null) => {
    setSelectedClass(classId === "_all" ? null : classId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-muted-foreground">
            View and manage class schedules across the week
          </p>
        </div>

        {scheduleLoading || teachersLoading || classesLoading ? (
          <div className="h-96 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-6">
              <ScheduleFilters
                days={["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]}
                teachers={teachers}
                classes={classes}
                selectedDay={selectedDay}
                selectedTeacher={selectedTeacher}
                selectedClass={selectedClass}
                onDayChange={handleDayChange}
                onTeacherChange={handleTeacherChange}
                onClassChange={handleClassChange}
              />
              
              <ScheduleStats 
                totalSlots={scheduleData?.length || 0}
                uniqueTeachers={new Set(scheduleData?.map(s => s.teacher.id) || []).size}
                uniqueClasses={new Set(scheduleData?.map(s => s.class.id) || []).size}
              />
            </div>

            <div className="md:col-span-3">
              {scheduleData && scheduleData.length > 0 ? (
                <ScheduleCalendar scheduleData={scheduleData} />
              ) : (
                <div className="h-96 bg-muted/30 rounded-lg flex items-center justify-center">
                  <p className="text-lg text-muted-foreground">
                    No schedule data found. Try adjusting your filters.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Schedule;
