import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ReportList = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Student Enrollment Report</CardTitle>
              <Badge variant="outline">Last Updated: 2024-03-15</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-gray-600">Total Students: 500</p>
                <p className="text-gray-600">Format: PDF</p>
              </div>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Exam Results Report</CardTitle>
              <Badge variant="outline">Last Updated: 2024-03-10</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-gray-600">Total Exams: 25</p>
                <p className="text-gray-600">Format: Excel</p>
              </div>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Faculty Workload Report</CardTitle>
              <Badge variant="outline">Last Updated: 2024-03-12</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-gray-600">Total Faculty: 50</p>
                <p className="text-gray-600">Format: PDF</p>
              </div>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Classroom Utilization Report</CardTitle>
              <Badge variant="outline">Last Updated: 2024-03-14</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <p className="text-gray-600">Total Classrooms: 30</p>
                <p className="text-gray-600">Format: Excel</p>
              </div>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportList; 