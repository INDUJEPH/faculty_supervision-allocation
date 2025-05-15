
import { Outlet } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="bg-gradient-to-t from-gray-200 to-gray-100 border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0">
              <p className="text-gray-700 font-medium">Exam Scheduler</p>
              <p className="text-sm text-gray-500">Streamline your examination process</p>
            </div>
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
