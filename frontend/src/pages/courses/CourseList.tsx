import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const CourseList = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Button>
          <BookOpen className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Structures</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Department: Computer Science</p>
            <p className="text-gray-600">Credits: 4</p>
            <p className="text-gray-600">Semester: 3</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Circuit Theory</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Department: Electrical Engineering</p>
            <p className="text-gray-600">Credits: 3</p>
            <p className="text-gray-600">Semester: 2</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thermodynamics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Department: Mechanical Engineering</p>
            <p className="text-gray-600">Credits: 3</p>
            <p className="text-gray-600">Semester: 3</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseList; 