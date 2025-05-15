import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Student, Classroom } from "@/lib/types";
import { MapPin, Building2, User, ArrowRight } from "lucide-react";

interface StudentSeatCardProps {
  student: Student;
  classroom: Classroom | undefined;
  seat: {
    seatNumber: number;
    row: number;
    column: number;
  };
}

const StudentSeatCard: React.FC<StudentSeatCardProps> = ({
  student,
  classroom,
  seat
}) => {
  if (!classroom) return null;

  return (
    <Card className="overflow-hidden border-primary/30 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <CardHeader className="bg-gradient-to-r from-primary/20 to-primary/5 pb-3 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-medium text-lg">{student.name}</h4>
          <p className="text-sm text-gray-600">ID: {student.rollNumber}</p>
        </div>
        <div className="bg-white rounded-full p-2 shadow-sm">
          <User className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4 relative">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent z-0"></div>
        
        <div className="flex items-start space-x-3 relative z-10">
          <div className="bg-primary/10 p-2 rounded-full">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-gray-700">Location</p>
            <p className="text-sm">{classroom.building}</p>
            <p className="text-sm">Room: {classroom.name}</p>
            <p className="text-sm text-gray-500">Floor: {classroom.floor}</p>
          </div>
        </div>
        
        <div className="flex items-start space-x-3 relative z-10">
          <div className="bg-primary/10 p-2 rounded-full">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-gray-700">Seating</p>
            <p className="text-sm">Seat Number: <span className="font-semibold">{seat.seatNumber}</span></p>
            <div className="flex items-center mt-1">
              <span className="text-sm">Row: {seat.row}</span>
              <ArrowRight className="h-3 w-3 mx-2 text-gray-400" />
              <span className="text-sm">Column: {seat.column}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end relative z-10">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-medium px-3 py-1">
            Seat #{seat.seatNumber}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentSeatCard;
