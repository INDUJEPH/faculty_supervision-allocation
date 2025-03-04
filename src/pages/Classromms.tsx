
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { School, User, Users } from "lucide-react";
import { toast } from "sonner";

type Seat = {
  id: string;
  studentName?: string;
  status: "available" | "occupied" | "blocked";
};

type ClassroomDetail = {
  id: string;
  name: string;
  rows: number;
  cols: number;
  supervisor?: string;
  seats: Seat[];
};

const ClassroomGrid = ({ classroom, onSeatClick }: { 
  classroom: ClassroomDetail;
  onSeatClick: (seatId: string) => void;
}) => (
  <div className="p-4">
    <div 
      className="grid gap-1" 
      style={{ 
        gridTemplateColumns: `repeat(${classroom.cols}, minmax(0, 1fr))` 
      }}
    >
      {classroom.seats.map((seat) => (
        <button
          key={seat.id}
          onClick={() => onSeatClick(seat.id)}
          className={`
            w-10 h-10 rounded-lg flex items-center justify-center text-xs font-medium
            transition-all duration-200 transform hover:scale-105
            ${seat.status === "occupied" ? "bg-accent/20 text-accent" : 
              seat.status === "blocked" ? "bg-gray-200 cursor-not-allowed" :
              "bg-gray-100 hover:bg-accent/10"}
          `}
          title={seat.studentName || "Available"}
        >
          {seat.studentName ? seat.studentName[0] : ""}
        </button>
      ))}
    </div>
  </div>
);

const Classrooms = () => {
  const [classrooms, setClassrooms] = useState<ClassroomDetail[]>([
    {
      id: "1",
      name: "Room 301",
      rows: 5,
      cols: 8,
      supervisor: "Dr. Smith",
      seats: Array.from({ length: 40 }, (_, i) => ({
        id: `seat-${i}`,
        status: Math.random() > 0.7 ? "occupied" : 
                Math.random() > 0.8 ? "blocked" : "available",
        studentName: Math.random() > 0.7 ? `Student ${i + 1}` : undefined,
      })),
    },
    {
      id: "2",
      name: "Room 302",
      rows: 4,
      cols: 6,
      supervisor: "Prof. Johnson",
      seats: Array.from({ length: 24 }, (_, i) => ({
        id: `seat-${i}`,
        status: Math.random() > 0.7 ? "occupied" : 
                Math.random() > 0.8 ? "blocked" : "available",
        studentName: Math.random() > 0.7 ? `Student ${i + 1}` : undefined,
      })),
    },
  ]);

  const handleSeatClick = (classroomId: string, seatId: string) => {
    setClassrooms(prev => prev.map(classroom => {
      if (classroom.id === classroomId) {
        return {
          ...classroom,
          seats: classroom.seats.map(seat => {
            if (seat.id === seatId && seat.status === "available") {
              toast.success("Seat assigned to new student");
              return {
                ...seat,
                status: "occupied",
                studentName: `New Student`,
              };
            }
            return seat;
          }),
        };
      }
      return classroom;
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slide-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Classroom Seating</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-accent/20 mr-2" />
              Occupied
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-200 mr-2" />
              Blocked
            </span>
            <span className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-100 mr-2" />
              Available
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {classrooms.map((classroom) => (
            <Card key={classroom.id} className="overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {classroom.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Supervisor: {classroom.supervisor}
                    </p>
                  </div>
                  <School className="w-6 h-6 text-accent" />
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>
                    {classroom.seats.filter(s => s.status === "occupied").length} occupied
                  </span>
                  <span>
                    {classroom.seats.filter(s => s.status === "available").length} available
                  </span>
                </div>
              </div>
              <ClassroomGrid 
                classroom={classroom}
                onSeatClick={(seatId) => handleSeatClick(classroom.id, seatId)}
              />
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Classrooms;
