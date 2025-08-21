import React, { useEffect, useState } from "react";
import {
  Home,
  Users,
  BarChart3,
  FileText,
  MessageSquare,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
  Bell,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/Sidebar";



const authService = {
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("currentUser");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  },
  isAuthenticated: () => {
    return localStorage.getItem("isAuthenticated") === "true";
  },
  logout: async () => {
    try {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("isAuthenticated");
      return true;
    } catch (error) {
      throw new Error("Logout failed");
    }
  },
};

// AdminLayout Component with Outlet support
const AdminLayout = () => {
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate()

  // Fetch current user on component mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "users", label: "Users", icon: Users },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      console.log("Logged out successfully");
       navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-80">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b px-4 lg:px-6 fixed top-0 left-0 right-0 lg:left-80 z-40">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {navigationItems.find((item) => item.id === activeTab)
                    ?.label || "Dashboard"}
                </h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  Welcome back, {currentUser?.email || "Admin"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content - This is where Outlet would render */}
        <div className="flex-1 p-4   overflow-auto mt-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;