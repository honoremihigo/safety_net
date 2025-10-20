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
  Contact,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Brain,
  Frown,
  Target,
  Lightbulb,
  HeartHandshake,
  Zap,
  Phone,
  MessageCircle,
  Shield as ShieldAlert,
  Scissors,
  Quote,
  Apple,
  UserX,
  MessageCircleReply,
  Calendar,
  MessageSquareCode,
  Video,
  UserRoundSearch,
  User,
} from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

import logo from "../assets/images/safety_net_logo.png"; // Ensure you have a logo image in the specified path

const AdminSidebar = ({
  currentUser,
  sidebarOpen,

  mobileMenuOpen,
  setMobileMenuOpen,

}) => {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState(null);

  // Auto-open dropdowns if current path matches any child item
  useEffect(() => {
    const currentPath = location.pathname;
    
    const tipsPages = [
 
      "/admin/depression-tips",

      "/admin/general-tips",
 
    ];
    
    const contactsPages = [
      "/admin/crisis-contacts",
      "/admin/crisis-messages",
      "/admin/emergency-actions"
    ];
    
    if (tipsPages.includes(currentPath)) {
      setOpenDropdown('tips');
    } else if (contactsPages.includes(currentPath)) {
      setOpenDropdown('contacts');
    } else {
      setOpenDropdown(null);
    }
  }, [location.pathname]);

  const toggleDropdown = (dropdownId) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/admin/dashboard" },
   
    { 
      id: "user-management", 
      label: "User Management", 
      icon: Users, 
      isDropdown: true,
      children: [
        
        { id: "users", label: "Users", icon: User, path: "/admin/users" },
        { id: "users-activity", label: "Users Activities", icon: UserRoundSearch, path: "/admin/users-activities" },
       

      ]
    },

    { 
      id: "tips", 
      label: "Tips Management", 
      icon: Lightbulb, 
      isDropdown: true,
      children: [

        { id: "depression-tips", label: "Depression Tips", icon: Frown, path: "/admin/depression-tips" },

        { id: "general-tips", label: "General Tips", icon: Star, path: "/admin/general-tips" },

      ]
    },

    // { id: "self-harm-coping-strategies", label: "Self Harm Coping", icon: HeartHandshake, path: "/admin/self-harm-coping-strategies" },
    { id: "testimonials", label: "Testimonials", icon: Quote, path: "/admin/testimonials" },
      { id: "testimonaias-ve", label: " Testimonial Videos", icon: Video, path: "/admin/testimonials-video" },
   
    { id: "therapy", label: "Therapy Booking", icon: Calendar, path: "/admin/therapy-booking" },
  
        { id: "feedback", label: "Feedback Management", icon: MessageSquareCode, path: "/admin/crisis-messages" },
    

    
  ];

  const SidebarItem = ({ item, isActive, onClick }) => (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center space-x-2 px-1.5 py-2 rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-primary-50 text-primary-700 border-r-2 border-primary-600"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      <item.icon
        className={`w-4 h-4 ${isActive ? "text-primary-600" : "text-gray-400"}`}
      />
      {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
    </button>
  );

  const DropdownItem = ({ item, isActive }) => (
    <Link
      to={item.path}
      className={`flex items-center space-x-2 px-6 py-1.5 rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-primary-50 text-primary-700"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }`}
    >
      <item.icon
        className={`w-3 h-3 ${isActive ? "text-primary-600" : "text-gray-400"}`}
      />
      <span className="text-xs">{item.label}</span>
    </Link>
  );

  const DropdownHeader = ({ item, isOpen, onToggle }) => {
    const hasActiveChild = item.children?.some(child => location.pathname === child.path);
    
    return (
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-1.5 py-2 rounded-lg transition-all duration-200 ${
          hasActiveChild
            ? "bg-primary-50 text-primary-700"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center space-x-2">
          <item.icon
            className={`w-4 h-4 ${hasActiveChild ? "text-primary-600" : "text-gray-400"}`}
          />
          {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
        </div>
        {sidebarOpen && (
          <div className="transition-transform duration-200">
            {isOpen ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </div>
        )}
      </button>
    );
  };

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
          sidebarOpen ? "w-72" : "w-16"
        } bg-white border-r border-gray-200 transition-all duration-300`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-3 border-b">
            {sidebarOpen && (
              <div className="flex items-center space-x-1.5">
                <img src={logo} className="w-12 h-12" />
                <span className="text-lg font-bold text-gray-900">Safety Net</span>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
            {navigationItems.map((item) => {
              if (item.isDropdown) {
                const isOpen = openDropdown === item.id;
                
                return (
                  <div key={item.id} className="space-y-0.5">
                    <DropdownHeader
                      item={item}
                      isOpen={isOpen}
                      onToggle={() => toggleDropdown(item.id)}
                    />
                    {sidebarOpen && isOpen && (
                      <div className="space-y-0.5 ml-1">
                        {item.children.map((child) => (
                          <DropdownItem
                            key={child.id}
                            item={child}
                            isActive={location.pathname === child.path}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
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
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-3 border-t">
            <div
              className={`flex items-center ${
                sidebarOpen ? "space-x-2" : "justify-center"
              }`}
            >
              <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">
                  {currentUser?.email?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {currentUser?.email || "Admin User"}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {currentUser?.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;