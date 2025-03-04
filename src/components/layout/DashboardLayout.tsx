import React from "react";
import { Calendar, User, BookOpen, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Calendar, label: "Schedule", path: "/schedule" },
  { icon: User, label: "Faculty", path: "/faculty" },
  { icon: BookOpen, label: "Classrooms", path: "/classrooms" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <h1 className="text-xl font-medium text-gray-900">Smart Schedule</h1>
          <div className="flex space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 
                  ${location.pathname === item.path 
                    ? "text-accent bg-accent/10" 
                    : "text-gray-600 hover:text-accent hover:bg-accent/5"}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <main className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;