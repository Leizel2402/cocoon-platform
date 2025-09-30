import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Home, 
  Calendar, 
  TrendingUp, 
  DollarSign,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  UserCheck,
  FileText,
  Phone,
  Mail,
  MapPin,
  Star,
  Filter,
  Search,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import SubmissionsDashboard from '../components/SubmissionsDashboard';
import { getTourBookings, getApplications } from '../services/submissionService';
import { calculateMonthlyRevenue, getRevenueTrends } from '../services/revenueService';
import { format } from 'date-fns';

interface DashboardStats {
  totalApplications: number;
  totalTours: number;
  pendingApplications: number;
  pendingTours: number;
  approvedApplications: number;
  confirmedTours: number;
  totalProperties: number;
  monthlyRevenue: number;
  occupiedUnits: number;
  averageRent: number;
  occupancyRate: number;
}

interface RecentActivity {
  id: string;
  type: 'application' | 'tour';
  name: string;
  property: string;
  status: string;
  date: Date;
  priority: 'high' | 'medium' | 'low';
}

const LandlordDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    totalTours: 0,
    pendingApplications: 0,
    pendingTours: 0,
    approvedApplications: 0,
    confirmedTours: 0,
    totalProperties: 0,
    monthlyRevenue: 0,
    occupiedUnits: 0,
    averageRent: 0,
    occupancyRate: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && !['landlord_admin', 'landlord_employee', 'cocoon_admin', 'cocoon_employee'].includes(user.role)) {
      navigate('/', { replace: true });
      return;
    }
    loadDashboardData();
  }, [user, navigate, timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [applicationsResult, toursResult, revenueData] = await Promise.all([
        getApplications(user?.uid),
        getTourBookings(user?.uid),
        calculateMonthlyRevenue(user?.uid)
      ]);

      if (applicationsResult.success && toursResult.success) {
        const applications = applicationsResult.data;
        const tours = toursResult.data;

        // Calculate stats with real revenue data
        const newStats: DashboardStats = {
          totalApplications: applications.length,
          totalTours: tours.length,
          pendingApplications: applications.filter(app => app.status === 'pending').length,
          pendingTours: tours.filter(tour => tour.status === 'pending').length,
          approvedApplications: applications.filter(app => app.status === 'approved').length,
          confirmedTours: tours.filter(tour => tour.status === 'confirmed').length,
          totalProperties: revenueData.totalProperties,
          monthlyRevenue: revenueData.monthlyRevenue,
          occupiedUnits: revenueData.occupiedUnits,
          averageRent: revenueData.averageRent,
          occupancyRate: revenueData.occupancyRate
        };

        setStats(newStats);

        // Create recent activity
        const activities: RecentActivity[] = [
          ...applications.slice(0, 5).map(app => ({
            id: app.id,
            type: 'application' as const,
            name: `${app.firstName} ${app.lastName}`,
            property: app.propertyName || 'Unknown Property',
            status: app.status,
            date: app.submittedAt?.toDate() || new Date(),
            priority: app.status === 'pending' ? 'high' as const : 'medium' as const
          })),
          ...tours.slice(0, 5).map(tour => ({
            id: tour.id,
            type: 'tour' as const,
            name: `${tour.firstName} ${tour.lastName}`,
            property: tour.propertyName || 'Unknown Property',
            status: tour.status,
            date: tour.submittedAt?.toDate() || new Date(),
            priority: tour.status === 'pending' ? 'high' as const : 'low' as const
          }))
        ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

        setRecentActivity(activities);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 p-3 rounded-xl shadow-lg">
                <Building className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  {user?.role === 'landlord_admin' || user?.role === 'landlord_employee' ? 'Landlord Dashboard' : 'Cocoon Staff Dashboard'}
                </h1>
                <p className="text-gray-600">
                  Welcome back, {user?.email?.split('@')[0]}! Here's what's happening with your properties.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={loadDashboardData}
                variant="outline"
                className="flex items-center space-x-2 border-green-200 text-green-700 hover:bg-green-50"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div> */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Tour Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTours}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8% from last month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Reviews</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingApplications + stats.pendingTours}</p>
                <p className="text-sm text-yellow-600 flex items-center mt-1">
                  <Clock className="h-4 w-4 mr-1" />
                  Needs attention
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
                <div className="text-xs text-gray-500 mt-1">
                  <p>Occupancy: {stats.occupancyRate}% ({stats.occupiedUnits}/{stats.totalProperties})</p>
                  <p>Avg Rent: ${stats.averageRent.toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 mb-8"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <div className="flex items-center space-x-3">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
                  <p className="text-gray-500">No applications or tour requests in the selected time period.</p>
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'application' ? 'bg-blue-100' : 'bg-emerald-100'
                      }`}>
                        {activity.type === 'application' ? (
                          <FileText className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Calendar className="h-5 w-5 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.name}</p>
                        <p className="text-sm text-gray-600">{activity.property}</p>
                        <p className="text-xs text-gray-500">{format(activity.date, 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                      <Badge className={getPriorityColor(activity.priority)}>
                        {activity.priority}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Submissions Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20"
        >
          <div className="p-6">
            <SubmissionsDashboard 
              userRole={user?.role === 'landlord_admin' || user?.role === 'landlord_employee' ? 'landlord' : 'staff'} 
              userId={user?.uid}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandlordDashboard;
