import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ResultList = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Exam Results</h1>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Data Structures - Semester 3</CardTitle>
              <Badge variant="outline">Published: 2024-03-15</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-gray-600">Total Students: 45</p>
                <p className="text-gray-600">Pass Percentage: 85%</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Highest Score: 95</p>
                <p className="text-gray-600">Average Score: 75</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Circuit Theory - Semester 2</CardTitle>
              <Badge variant="outline">Published: 2024-03-10</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-gray-600">Total Students: 40</p>
                <p className="text-gray-600">Pass Percentage: 80%</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Highest Score: 92</p>
                <p className="text-gray-600">Average Score: 72</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultList; 