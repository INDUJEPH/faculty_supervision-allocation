import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  Users2, 
  GraduationCap, 
  School, 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Settings, 
  BarChart, 
  Building2, 
  ChevronDown,
  LogOut,
  ClipboardList,
  UserCheck,
  Users,
  UserPlus,
  Upload
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const Header = () => {
  const location = useLocation();
  
  const navItems = [
    { 
      name: "Dashboard", 
      path: "/", 
      icon: <LayoutDashboard className="h-4 w-4" /> 
    },
    { 
      name: "Academic", 
      path: "/academic",
      icon: <BookOpen className="h-4 w-4" />,
      subItems: [
        { name: "Departments", path: "/departments", icon: <Building2 className="h-4 w-4" /> },
        { name: "Students", path: "/students", icon: <GraduationCap className="h-4 w-4" /> },
        { name: "Faculty", path: "/faculty", icon: <Users2 className="h-4 w-4" /> },
        { name: "Courses", path: "/courses", icon: <FileText className="h-4 w-4" /> },
      ]
    },
    { 
      name: "Examination", 
      path: "/examination",
      icon: <Calendar className="h-4 w-4" />,
      subItems: [
        { name: "Schedule Exam", path: "/exams/schedule/new", icon: <Calendar className="h-4 w-4" /> },
        { name: "Arrange Seating", path: "/exams/seating/arrange", icon: <School className="h-4 w-4" /> },
        { name: "Manage Results", path: "/exams/results", icon: <FileText className="h-4 w-4" /> },
        { name: "Backlog Exams", path: "/exams/backlog", icon: <Calendar className="h-4 w-4" /> },
      ]
    },
    {
      name: "Supervision",
      path: "/supervision",
      icon: <Users className="h-5 w-5" />,
      subItems: [
        {
          name: "Assign Supervisors",
          path: "/supervision/assign",
          icon: <UserPlus className="h-4 w-4" />,
        },
        {
          name: "View Schedule",
          path: "/supervision/schedule",
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          name: "Reports",
          path: "/supervision/reports",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          name: "Upload Supervisors",
          path: "/supervision/upload",
          icon: <Upload className="h-4 w-4" />,
        },
      ],
    },
    { 
      name: "Reports", 
      path: "/reports", 
      icon: <BarChart className="h-4 w-4" /> 
    },
    { 
      name: "Settings", 
      path: "/settings", 
      icon: <Settings className="h-4 w-4" /> 
    },
  ];
  
  return (
    <header className="bg-gradient-to-r from-primary to-primary/90 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <School className="h-8 w-8" />
              <span className="text-xl font-bold">University Admin</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              item.subItems ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "text-white hover:bg-white/10 h-10 px-3",
                        location.pathname.startsWith(item.path) && "bg-white/10"
                      )}
                    >
                      <span className="flex items-center">
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {item.subItems.map((subItem) => (
                      <DropdownMenuItem key={subItem.path} asChild>
                        <Link 
                          to={subItem.path} 
                          className={cn(
                            "flex items-center cursor-pointer",
                            location.pathname === subItem.path && "bg-muted"
                          )}
                        >
                          {subItem.icon}
                          <span className="ml-2">{subItem.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium h-10",
                    location.pathname === item.path
                      ? "bg-white/10 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              )
            ))}
          </nav>
          
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
