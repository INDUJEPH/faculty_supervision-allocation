import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

const DepartmentList = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Departments</h1>
        <Button>
          <Building2 className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Computer Science</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Total Students: 150</p>
            <p className="text-gray-600">Total Faculty: 12</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Electrical Engineering</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Total Students: 120</p>
            <p className="text-gray-600">Total Faculty: 10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mechanical Engineering</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Total Students: 100</p>
            <p className="text-gray-600">Total Faculty: 8</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DepartmentList; 