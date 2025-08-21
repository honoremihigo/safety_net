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
  ShapesIcon,
  Shapes,
  Activity,
  AlertCircle,
  Star,
  Heart,
} from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
const AdminSidebar = ({
  currentUser,
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
  onLogout,
}) => {
  const location = useLocation();
  

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, path: "/admin/dashboard" },
  { id: "users", label: "Users", icon: Users, path: "/admin/users" },
  { id: "binge-eating-tips", label: "Binge Eating Tips", icon: BookOpen, path: "/admin/binge-eating-tips" },
  { id: "body-shape-tips", label: "Body Shape Tips", icon: Shapes, path: "/admin/body-shape-tips" },
  { id: "depression-tips", label: "Depression Tips", icon: Activity, path: "/admin/depression-tips" },
  { id: "failing-tips", label: "Failing Tips", icon: AlertCircle, path: "/admin/failing-tips" },
  { id: "general-tips", label: "General Tips", icon: Star, path: "/admin/general-tips" },
  { id: "guilt-tips", label: "Guilt Tips", icon: Heart, path: "/admin/guilt-tips" },
];


  const SidebarItem = ({ item, isActive, onClick }) => (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center space-x-3 px-2 py-3 rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      <item.icon
        className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`}
      />
      {sidebarOpen && <span className="font-medium">{item.label}</span>}
    </button>
  );

  return (
    <>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed inset-y-0 left-0 z-50 ${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Admin</span>
              </div>
            )}
            {/* <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 hidden lg:block"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button> */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className="block"
              >
                <SidebarItem
                  item={item}
                  isActive={location.pathname === item.path}
                  onClick={() => {}}
                />
              </Link>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t">
            <div
              className={`flex items-center ${
                sidebarOpen ? "space-x-3" : "justify-center"
              }`}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {currentUser?.email?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentUser?.email || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser?.email}
                  </p>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={onLogout}
                className="w-full mt-3 flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar
