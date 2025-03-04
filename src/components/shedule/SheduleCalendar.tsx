import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Schedule } from "@/pages/Schedule";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScheduleCalendarProps {
  scheduleData: Schedule[];
}

const timeSlots = [
  "08:00:00", "09:00:00", "10:00:00", "11:00:00", 
  "12:00:00", "13:00:00", "14:00:00", "15:00:00", "16:00:00"
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const formatTime = (time: string) => {
  return time.substring(0, 5);
};

// Function to truncate long subject names
const formatSubject = (subject: string) => {
  return subject.length > 25 ? subject.substring(0, 25) + "..." : subject;
};

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ scheduleData }) => {
  const getScheduleForDayAndTime = (day: string, startTime: string) => {
    return scheduleData.filter(
      (schedule) => 
        schedule.day_of_week === day && 
        schedule.start_time === startTime
    );
  };

  // Group by day to check if we need to show particular days
  const scheduleByDay = days.reduce((acc, day) => {
    acc[day] = scheduleData.filter(s => s.day_of_week === day);
    return acc;
  }, {} as Record<string, Schedule[]>);

  // Filter out days with no schedule
  const daysWithSchedule = days.filter(day => scheduleByDay[day].length > 0);

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="grid grid-cols-[100px_repeat(auto-fill,minmax(140px,1fr))]">
            {/* Header row with days */}
            <div className="h-16 flex items-center justify-center font-medium bg-muted/50 border-b border-r">
              Time / Day
            </div>
            
            {daysWithSchedule.length > 0 ? (
              daysWithSchedule.map((day) => (
                <div 
                  key={day} 
                  className="h-16 flex items-center justify-center font-medium bg-muted/50 border-b"
                >
                  {day}
                </div>
              ))
            ) : (
              days.map((day) => (
                <div 
                  key={day} 
                  className="h-16 flex items-center justify-center font-medium bg-muted/50 border-b"
                >
                  {day}
                </div>
              ))
            )}

            {/* Time slots rows */}
            {timeSlots.slice(0, -1).map((time, i) => (
              <React.Fragment key={time}>
                {/* Time slot */}
                <div className="h-24 flex items-center justify-center font-medium text-sm border-r border-b">
                  {formatTime(time)}
                </div>
                
                {/* Schedule cells */}
                {(daysWithSchedule.length > 0 ? daysWithSchedule : days).map((day) => {
                  const schedules = getScheduleForDayAndTime(day, time);
                  return (
                    <div 
                      key={`${day}-${time}`}
                      className="h-24 border-b p-1 bg-card"
                    >
                      {schedules.length > 0 ? (
                        <div className="h-full flex flex-col gap-1 overflow-y-auto">
                          {schedules.map((schedule) => (
                            <TooltipProvider key={schedule.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-primary/10 hover:bg-primary/20 transition-colors p-2 rounded-md text-xs cursor-default">
                                    <div className="font-medium">
                                      {schedule.class.name}
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <span>{schedule.teacher.name}</span>
                                      {schedule.teacher.position && (
                                        <Badge variant="outline" className="text-[9px]">
                                          {schedule.teacher.position}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-[10px] mt-0.5 text-primary-foreground/70 font-medium truncate">
                                      {formatSubject(schedule.teacher.subject)}
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                      <Badge variant="outline" className="text-[10px]">
                                        {schedule.room_number}
                                      </Badge>
                                      <span className="text-[10px]">
                                        {formatTime(schedule.start_time)}-{formatTime(schedule.end_time)}
                                      </span>
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-sm">
                                  <div className="space-y-1.5">
                                    <p><strong>Class:</strong> {schedule.class.name} ({schedule.class.grade_level})</p>
                                    <p><strong>Teacher:</strong> {schedule.teacher.name}</p>
                                    {schedule.teacher.position && <p><strong>Position:</strong> {schedule.teacher.position}</p>}
                                    {schedule.teacher.experience && <p><strong>Experience:</strong> {schedule.teacher.experience}</p>}
                                    <p><strong>Subject:</strong> {schedule.teacher.subject}</p>
                                    <p><strong>Room:</strong> {schedule.room_number}</p>
                                    <p><strong>Time:</strong> {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleCalendar;