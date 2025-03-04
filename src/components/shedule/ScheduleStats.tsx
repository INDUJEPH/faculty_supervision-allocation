import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, BookOpen } from "lucide-react";

interface ScheduleStatsProps {
  totalSlots: number;
  uniqueTeachers: number;
  uniqueClasses: number;
}

const ScheduleStats: React.FC<ScheduleStatsProps> = ({
  totalSlots,
  uniqueTeachers,
  uniqueClasses,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Total Time Slots</p>
            <p className="text-2xl font-bold">{totalSlots}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Teachers Scheduled</p>
            <p className="text-2xl font-bold">{uniqueTeachers}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Classes Scheduled</p>
            <p className="text-2xl font-bold">{uniqueClasses}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleStats;