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
  const [openDropdown, setOpenDropdown] = useState(null);

  // Auto-open dropdowns if current path matches any child item
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Check if current path is within tips section
    const tipsPages = [
      "/admin/binge-eating-tips",
      "/admin/body-shape-tips",
      "/admin/depression-tips",
      "/admin/failing-tips",
      "/admin/general-tips",
      "/admin/guilt-tips",
      "/admin/panic-attack-tips"
    ];
    
    // Check if current path is within contacts section
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
    { id: "users", label: "Users", icon: Users, path: "/admin/users" },
    { 
      id: "tips", 
      label: "Tips Management", 
      icon: Lightbulb, 
      isDropdown: true,
      children: [
        { id: "binge-eating-tips", label: "Binge Eating Tips", icon: Apple, path: "/admin/binge-eating-tips" },
        { id: "body-shape-tips", label: "Body Shape Tips", icon: UserX, path: "/admin/body-shape-tips" },
        { id: "depression-tips", label: "Depression Tips", icon: Frown, path: "/admin/depression-tips" },
        { id: "failing-tips", label: "Failing Tips", icon: Target, path: "/admin/failing-tips" },
        { id: "general-tips", label: "General Tips", icon: Star, path: "/admin/general-tips" },
        { id: "guilt-tips", label: "Guilt Tips", icon: Heart, path: "/admin/guilt-tips" },
        { id: "panic-attack-tips", label: "Panic Attack Tips", icon: Zap, path: "/admin/panic-attack-tips" },
      ]
    },
    {
      id: "contacts",
      label: "Contact & Crisis Management",
      icon: Phone,
      isDropdown: true,
      children: [
        { id: "crisis-contacts", label: "Crisis Contacts", icon: Contact, path: "/admin/crisis-contacts" },
        { id: "crisis-messages", label: "Crisis Messages", icon: MessageCircle, path: "/admin/crisis-messages" },
        { id: "emergency-actions", label: "Emergency Actions", icon: ShieldAlert, path: "/admin/emergency-actions" },
      ]
    },
    { id: "self-harm-coping-strategies", label: "Self Harm Coping", icon: HeartHandshake, path: "/admin/self-harm-coping-strategies" },
    { id: "testimonials", label: "Testimonials", icon: Quote, path: "/admin/testimonials" },
  ];

  const SidebarItem = ({ item, isActive, onClick }) => (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center space-x-3 px-2 py-3 rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-primary-50 text-primary-700 border-r-2 border-primary-600"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      <item.icon
        className={`w-5 h-5 ${isActive ? "text-primary-600" : "text-gray-400"}`}
      />
      {sidebarOpen && <span className="font-medium">{item.label}</span>}
    </button>
  );

  const DropdownItem = ({ item, isActive }) => (
    <Link
      to={item.path}
      className={`flex items-center space-x-3 px-8 py-2 rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-primary-50 text-primary-700"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
      }`}
    >
      <item.icon
        className={`w-4 h-4 ${isActive ? "text-primary-600" : "text-gray-400"}`}
      />
      <span className="text-sm">{item.label}</span>
    </Link>
  );

  const DropdownHeader = ({ item, isOpen, onToggle }) => {
    const hasActiveChild = item.children?.some(child => location.pathname === child.path);
    
    return (
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-2 py-3 rounded-lg transition-all duration-200 ${
          hasActiveChild
            ? "bg-primary-50 text-primary-700"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center space-x-3">
          <item.icon
            className={`w-5 h-5 ${hasActiveChild ? "text-primary-600" : "text-gray-400"}`}
          />
          {sidebarOpen && <span className="font-medium">{item.label}</span>}
        </div>
        {sidebarOpen && (
          <div className="transition-transform duration-200">
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
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
          sidebarOpen ? "w-80" : "w-20"
        } bg-white border-r border-gray-200 transition-all duration-300`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">Admin</span>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              if (item.isDropdown) {
                const isOpen = openDropdown === item.id;
                
                return (
                  <div key={item.id} className="space-y-1">
                    <DropdownHeader
                      item={item}
                      isOpen={isOpen}
                      onToggle={() => toggleDropdown(item.id)}
                    />
                    {sidebarOpen && isOpen && (
                      <div className="space-y-1 ml-2">
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
          <div className="p-4 border-t">
            <div
              className={`flex items-center ${
                sidebarOpen ? "space-x-3" : "justify-center"
              }`}
            >
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
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

export default AdminSidebar;