/* eslint-disable no-unused-vars */
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
  Maximize,
  Minimize,
  Globe,
} from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import AdminSidebar from "../components/Sidebar";
import PWAInstallButton from "../components/PWAInstallButton";

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("EN");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Available languages
  const languages = [
    { code: "EN", name: "English", flag: "🇺🇸" },
    { code: "ES", name: "Español", flag: "🇪🇸" },
    { code: "FR", name: "Français", flag: "🇫🇷" },
    { code: "DE", name: "Deutsch", flag: "🇩🇪" },
  ];

  useEffect(() => {
    document.body.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [location.pathname]);

  // Fetch current user on component mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem("preferredLanguage") || "EN";
    setCurrentLanguage(savedLanguage);
  }, []);

  // Fullscreen functionality
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  const handleLanguageChange = (langCode) => {
    setCurrentLanguage(langCode);
    localStorage.setItem("preferredLanguage", langCode);
    setShowLanguageDropdown(false);
    
    // Here you would typically trigger your translation system
    console.log(`Language changed to: ${langCode}`);
  };

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

      {/* <PWAInstallButton /> */}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 lg:ml-72">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b px-2 lg:px-2 fixed top-0 left-0 right-0 lg:left-72 z-50">
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

            <div className="flex items-center space-x-2">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg flex items-center space-x-1 hover:bg-gray-100"
                  title="Change Language"
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">
                    {currentLanguage}
                  </span>
                </button>

                {showLanguageDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                    <div className="py-1 max-h-64 overflow-y-auto">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-3 ${
                            currentLanguage === lang.code
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.name}</span>
                          {currentLanguage === lang.code && (
                            <span className="ml-auto text-blue-500">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </button>

              {/* User Avatar with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors cursor-pointer"
                  title="User Menu"
                >
                  <span className="text-white text-sm font-medium">
                    {currentUser?.email?.charAt(0).toUpperCase() || "A"}
                  </span>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {currentUser?.name || "Admin User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {currentUser?.email || "admin@example.com"}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Overlay to close dropdowns when clicking outside */}
        {(showLanguageDropdown || showUserDropdown) && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => {
              setShowLanguageDropdown(false);
              setShowUserDropdown(false);
            }}
          />
        )}

        {/* Page Content - This is where Outlet would render */}
        <div className="flex-1 p-1 overflow-auto mt-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;