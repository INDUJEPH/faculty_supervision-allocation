
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Calendar, Users, School, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardStats = {
  totalTeachers: number;
  totalClasses: number;
  totalScheduleSlots: number;
  roomUtilization: number;
};

type ExamInfo = {
  subject: string;
  date: string;
  faculty: string;
  room: string;
};

const StatsCard = ({ icon: Icon, label, value, trend }: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: string;
}) => (
  <div className="glass-card rounded-xl p-6 hover-lift">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <h3 className="mt-1 text-2xl font-semibold text-gray-900">{value}</h3>
        {trend && (
          <p className="mt-1 text-sm text-green-600">{trend}</p>
        )}
      </div>
      <Icon className="w-8 h-8 text-accent" />
    </div>
  </div>
);

const UpcomingExam = ({ subject, date, faculty, room }: ExamInfo) => (
  <div className="glass-card rounded-lg p-4 hover-lift">
    <h4 className="font-medium text-gray-900">{subject}</h4>
    <div className="mt-2 space-y-1">
      <p className="text-sm text-gray-500 flex items-center">
        <Calendar className="w-4 h-4 mr-2" /> {date}
      </p>
      <p className="text-sm text-gray-500 flex items-center">
        <Users className="w-4 h-4 mr-2" /> {faculty}
      </p>
      <p className="text-sm text-gray-500 flex items-center">
        <School className="w-4 h-4 mr-2" /> {room}
      </p>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full" />
      ))}
    </div>
  </div>
);

const Index = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingExams, setUpcomingExams] = useState<ExamInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch total teachers
        const { count: teachersCount, error: teachersError } = await supabase
          .from('teachers')
          .select('*', { count: 'exact', head: true });

        if (teachersError) throw teachersError;

        // Fetch total classes
        const { count: classesCount, error: classesError } = await supabase
          .from('classes')
          .select('*', { count: 'exact', head: true });

        if (classesError) throw classesError;

        // Fetch schedule slots
        const { count: slotsCount, error: slotsError } = await supabase
          .from('schedule_slots')
          .select('*', { count: 'exact', head: true });

        if (slotsError) throw slotsError;

        // Calculate utilization (slots / (classes * 5 days * 8 hours)) as percentage
        const maxSlots = classesCount * 5 * 8; // classes * days * hours
        const utilization = maxSlots > 0 ? Math.round((slotsCount / maxSlots) * 100) : 0;

        setStats({
          totalTeachers: teachersCount || 0,
          totalClasses: classesCount || 0,
          totalScheduleSlots: slotsCount || 0,
          roomUtilization: utilization
        });

        // Generate upcoming exams from schedule data and teachers
        const { data: scheduleData, error: scheduleError } = await supabase
          .from('schedule_slots')
          .select(`
            id, 
            day_of_week, 
            start_time, 
            room_number,
            teacher:teacher_id(name, subject),
            class:class_id(name)
          `)
          .order('day_of_week')
          .order('start_time')
          .limit(3);

        if (scheduleError) throw scheduleError;

        if (scheduleData) {
          const examInfos = scheduleData.map(slot => {
            // Format day and time for display
            const timeStr = slot.start_time.substring(0, 5);
            
            return {
              subject: slot.teacher?.subject || 'Unassigned',
              date: `${slot.day_of_week}, ${timeStr}`,
              faculty: slot.teacher?.name || 'Unassigned',
              room: slot.room_number
            };
          });

          setUpcomingExams(examInfos);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slide-in">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              icon={Calendar}
              label="Schedule Slots"
              value={stats?.totalScheduleSlots.toString() || "0"}
              trend="From database"
            />
            <StatsCard 
              icon={Users}
              label="Faculty"
              value={`${stats?.totalTeachers || 0}`}
            />
            <StatsCard 
              icon={School}
              label="Classes"
              value={`${stats?.totalClasses || 0}`}
            />
            <StatsCard 
              icon={Clock}
              label="Room Utilization"
              value={`${stats?.roomUtilization || 0}%`}
              trend="Based on schedule"
            />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Upcoming Classes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingExams.length > 0 ? (
              upcomingExams.map((exam, index) => (
                <UpcomingExam 
                  key={index}
                  subject={exam.subject}
                  date={exam.date}
                  faculty={exam.faculty}
                  room={exam.room}
                />
              ))
            ) : (
              <div className="col-span-3 py-8 text-center">
                <p className="text-muted-foreground">No upcoming classes scheduled.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Index;
