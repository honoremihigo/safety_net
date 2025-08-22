import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Shield, 
  Phone, 
  AlertTriangle,
  TrendingUp,
  Star,
  BookOpen,
  Activity
} from 'lucide-react';

// Import all services
import { getAllTips as getAllBingeEatingTips } from "../services/bingeEatingTipsService";
import { getAllBodyShapeTips } from "../services/bodyShapeTipsService";
import { getAllDepressionTips } from "../services/depressionTipsService";
import { getAllFailingTips } from "../services/failingTipsService";
import { getAllGeneralTips } from "../services/generalTipsService";
import { getAllGuiltTips } from "../services/guiltTipsService";
import { getAllPanicAttackTips } from "../services/panicAttackTipsService";
import { getAllCrisisContacts } from "../services/crisisContactsService";
import { getAllCrisisMessages } from "../services/crisisMessagesService";
import { getAllEmergencyActions } from "../services/emergencyActionsService";
import { getAllSelfHarmCopingStrategies } from "../services/selfHarmCopingStrategiesService";
import { getAllTestimonials } from "../services/testimonialsService";
import { getAllUsers } from "../services/usersServices";

const DashboardHome = () => {
  const [dashboardData, setDashboardData] = useState({
    users: [],
    bingeEatingTips: [],
    bodyShapeTips: [],
    depressionTips: [],
    failingTips: [],
    generalTips: [],
    guiltTips: [],
    panicAttackTips: [],
    crisisContacts: [],
    crisisMessages: [],
    emergencyActions: [],
    selfHarmStrategies: [],
    testimonials: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          users,
          bingeEatingTips,
          bodyShapeTips,
          depressionTips,
          failingTips,
          generalTips,
          guiltTips,
          panicAttackTips,
          crisisContacts,
          crisisMessages,
          emergencyActions,
          selfHarmStrategies,
          testimonials
        ] = await Promise.all([
          getAllUsers(),
          getAllBingeEatingTips(),
          getAllBodyShapeTips(),
          getAllDepressionTips(),
          getAllFailingTips(),
          getAllGeneralTips(),
          getAllGuiltTips(),
          getAllPanicAttackTips(),
          getAllCrisisContacts(),
          getAllCrisisMessages(),
          getAllEmergencyActions(),
          getAllSelfHarmCopingStrategies(),
          getAllTestimonials()
        ]);

        setDashboardData({
          users,
          bingeEatingTips,
          bodyShapeTips,
          depressionTips,
          failingTips,
          generalTips,
          guiltTips,
          panicAttackTips,
          crisisContacts,
          crisisMessages,
          emergencyActions,
          selfHarmStrategies,
          testimonials
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Calculate metrics
  const totalTips = 
    dashboardData.bingeEatingTips.length +
    dashboardData.bodyShapeTips.length +
    dashboardData.depressionTips.length +
    dashboardData.failingTips.length +
    dashboardData.generalTips.length +
    dashboardData.guiltTips.length +
    dashboardData.panicAttackTips.length;

  const averageRating = dashboardData.testimonials.length > 0 
    ? (dashboardData.testimonials.reduce((acc, t) => acc + (t.rating || 0), 0) / dashboardData.testimonials.length).toFixed(1)
    : 0;

  const recentCrisisMessages = dashboardData.crisisMessages
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  const recentTestimonials = dashboardData.testimonials
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color = "blue", trend }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className=" bg-gray-50 p-6">
      <div className=" mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={dashboardData.users.length}
            icon={Users}
            color="blue"
            trend="+12% this month"
          />
          <StatCard
            title="Total Tips"
            value={totalTips}
            icon={BookOpen}
            color="green"
            trend="+8 new this week"
          />
          <StatCard
            title="Crisis Messages"
            value={dashboardData.crisisMessages.length}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Average Rating"
            value={averageRating}
            icon={Star}
            color="yellow"
            trend="⭐ Excellent"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Heart className="w-5 h-5 text-pink-500 mr-2" />
              <div>
                <p className="text-xs text-gray-600">Testimonials</p>
                <p className="text-lg font-semibold">{dashboardData.testimonials.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-blue-500 mr-2" />
              <div>
                <p className="text-xs text-gray-600">Crisis Contacts</p>
                <p className="text-lg font-semibold">{dashboardData.crisisContacts.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-500 mr-2" />
              <div>
                <p className="text-xs text-gray-600">Coping Strategies</p>
                <p className="text-lg font-semibold">{dashboardData.selfHarmStrategies.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-purple-500 mr-2" />
              <div>
                <p className="text-xs text-gray-600">Emergency Actions</p>
                <p className="text-lg font-semibold">{dashboardData.emergencyActions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 text-indigo-500 mr-2" />
              <div>
                <p className="text-xs text-gray-600">Panic Attack Tips</p>
                <p className="text-lg font-semibold">{dashboardData.panicAttackTips.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <BookOpen className="w-5 h-5 text-orange-500 mr-2" />
              <div>
                <p className="text-xs text-gray-600">Depression Tips</p>
                <p className="text-lg font-semibold">{dashboardData.depressionTips.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Crisis Messages */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                Recent Crisis Messages
              </h3>
            </div>
            <div className="p-6">
              {recentCrisisMessages.length > 0 ? (
                <div className="space-y-4">
                  {recentCrisisMessages.map((message, index) => (
                    <div key={index} className="border-l-4 border-red-400 pl-4 py-2">
                      <p className="text-sm font-medium text-gray-900">
                        {message.firstName} {message.lastName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{message.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No crisis messages</p>
              )}
            </div>
          </div>

          {/* Tips Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Tips by Category</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {[
                  { name: 'General Tips', count: dashboardData.generalTips.length, color: 'blue' },
                  { name: 'Binge Eating', count: dashboardData.bingeEatingTips.length, color: 'green' },
                  { name: 'Body Shape', count: dashboardData.bodyShapeTips.length, color: 'purple' },
                  { name: 'Depression', count: dashboardData.depressionTips.length, color: 'indigo' },
                  { name: 'Guilt', count: dashboardData.guiltTips.length, color: 'pink' },
                  { name: 'Failing', count: dashboardData.failingTips.length, color: 'yellow' }
                ].map((category) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{category.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full bg-${category.color}-100 text-${category.color}-700`}>
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Testimonials */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                Recent Testimonials
              </h3>
            </div>
            <div className="p-6">
              {recentTestimonials.length > 0 ? (
                <div className="space-y-4">
                  {recentTestimonials.map((testimonial, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{testimonial.name}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{testimonial.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">No testimonials yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Resources Summary */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Emergency Resources Status</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{dashboardData.crisisContacts.length}</p>
              <p className="text-sm text-gray-600">Crisis Contacts Available</p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{dashboardData.selfHarmStrategies.length}</p>
              <p className="text-sm text-gray-600">Coping Strategies</p>
            </div>
            <div className="text-center">
              <Activity className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{dashboardData.emergencyActions.length}</p>
              <p className="text-sm text-gray-600">Emergency Actions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;