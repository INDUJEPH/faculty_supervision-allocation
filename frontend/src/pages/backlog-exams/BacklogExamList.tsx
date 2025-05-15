import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const BacklogExamList = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Backlog Exams</h1>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Exam
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Data Structures - Semester 3</CardTitle>
              <Badge variant="destructive">Scheduled: 2024-04-15</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-gray-600">Total Students: 8</p>
                <p className="text-gray-600">Department: Computer Science</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Time: 10:00 AM - 1:00 PM</p>
                <p className="text-gray-600">Venue: Room 101</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Circuit Theory - Semester 2</CardTitle>
              <Badge variant="destructive">Scheduled: 2024-04-20</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-gray-600">Total Students: 5</p>
                <p className="text-gray-600">Department: Electrical Engineering</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Time: 2:00 PM - 5:00 PM</p>
                <p className="text-gray-600">Venue: Room 102</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BacklogExamList; 