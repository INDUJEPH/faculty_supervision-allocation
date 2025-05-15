import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import FacultyList from "./pages/faculty/FacultyList";
import FacultyForm from "./pages/faculty/FacultyForm";
import FacultyView from "./pages/faculty/FacultyView";
import FacultyUploadWrapper from "./pages/faculty/FacultyUploadWrapper";
import StudentList from "./pages/students/StudentList";
import StudentForm from "./pages/students/StudentForm";
import StudentView from "./pages/students/StudentView";
import ClassroomList from "./pages/classrooms/ClassroomList";
import ClassroomForm from "./pages/classrooms/ClassroomForm";
import ExamList from "./pages/exams/ExamList";
import ExamForm from "./pages/exams/ExamForm";
import ExamView from "./pages/exams/ExamView";
import DepartmentList from "./pages/departments/DepartmentList";
import CourseList from "./pages/courses/CourseList";
import ResultList from "./pages/results/ResultList";
import BacklogExamList from "./pages/backlog-exams/BacklogExamList";
import ReportList from "./pages/reports/ReportList";
import Settings from "./pages/settings/Settings";
import AdminProfile from "./pages/admin/AdminProfile";
import NotFound from "./pages/NotFound";
import StudentUpload from "./pages/students/StudentUpload";
import ClassroomView from "./pages/classrooms/ClassroomView";
import ExamSchedule from "./pages/exams/ExamSchedule";
import SeatingArrangement from "./pages/exams/SeatingArrangement";
import SupervisionList from "./pages/supervision/SupervisionList";
import SupervisionView from "./pages/supervision/SupervisionView";
import SupervisionSchedule from "./pages/supervision/SupervisionSchedule";
import ReportView from "./pages/reports/ReportView";
import ScheduleExam from "./pages/exams/ScheduleExam";
import ArrangeSeating from "./pages/exams/ArrangeSeating";
import ManageResults from "./pages/exams/ManageResults";
import AssignSupervisors from "./pages/supervision/AssignSupervisors";
import ViewSchedule from "./pages/supervision/ViewSchedule";
import SupervisionReports from "./pages/supervision/SupervisionReports";
import SupervisorUpload from "./pages/supervision/SupervisorUpload";
import ClassroomUpload from "./pages/classrooms/ClassroomUpload";

const StudentUploadWrapper = () => {
  const navigate = useNavigate();
  return <StudentUpload onUploadComplete={() => navigate('/students')} />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "faculty",
        element: <FacultyList />,
      },
      {
        path: "faculty/new",
        element: <FacultyForm />,
      },
      {
        path: "faculty/:id",
        element: <FacultyView />,
      },
      {
        path: "faculty/:id/edit",
        element: <FacultyForm />,
      },
      {
        path: "faculty/upload",
        element: <FacultyUploadWrapper />,
      },
      {
        path: "students",
        element: <StudentList />,
      },
      {
        path: "students/new",
        element: <StudentForm />,
      },
      {
        path: "students/:id",
        element: <StudentView />,
      },
      {
        path: "students/:id/edit",
        element: <StudentForm />,
      },
      {
        path: "students/upload",
        element: <StudentUploadWrapper />,
      },
      {
        path: "classrooms",
        element: <ClassroomList />,
      },
      {
        path: "classrooms/new",
        element: <ClassroomForm />,
      },
      {
        path: "classrooms/:id/edit",
        element: <ClassroomForm />,
      },
      {
        path: "classrooms/:id",
        element: <ClassroomView />,
      },
      {
        path: "classrooms/upload",
        element: <ClassroomUpload />,
      },
      {
        path: "exams",
        children: [
          {
            index: true,
            element: <ExamList />,
          },
          {
            path: "schedule",
            element: <ExamSchedule />,
          },
          {
            path: "schedule/new",
            element: <ScheduleExam />,
          },
          {
            path: "seating",
            element: <SeatingArrangement />,
          },
          {
            path: "seating/arrange",
            element: <ArrangeSeating />,
          },
          {
            path: "results",
            element: <ManageResults />,
          },
          {
            path: "backlog",
            element: <BacklogExamList />,
          },
          {
            path: ":id",
            element: <ExamView />,
          },
        ],
      },
      {
        path: "departments",
        element: <DepartmentList />,
      },
      {
        path: "courses",
        element: <CourseList />,
      },
      {
        path: "results",
        element: <ResultList />,
      },
      {
        path: "backlog-exams",
        element: <BacklogExamList />,
      },
      {
        path: "reports",
        children: [
          {
            index: true,
            element: <ReportList />,
          },
          {
            path: ":id",
            element: <ReportView />,
          },
        ],
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "admin/profile",
        element: <AdminProfile />,
      },
      {
        path: "supervision",
        children: [
          {
            index: true,
            element: <SupervisionList />,
          },
          {
            path: "assign",
            element: <AssignSupervisors />,
          },
          {
            path: "schedule",
            element: <ViewSchedule />,
          },
          {
            path: "reports",
            element: <SupervisionReports />,
          },
          {
            path: "upload",
            element: <SupervisorUpload />,
          },
          {
            path: ":id",
            element: <SupervisionView />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster />
        <Sonner />
      </TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
