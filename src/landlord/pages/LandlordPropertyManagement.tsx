import React, { useState } from 'react';
import PropertyForm from '../components/PropertyForm/PropertyForm';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Building, 
  Plus, 
  List, 
  Settings, 
  Users, 
  DollarSign, 
  TrendingUp,
  MapPin,
  Clock,
  AlertTriangle,
  Home,
  Wrench,
  Bell,
  ChevronRight,
  Eye,
  Edit,
  Loader2,
  BarChart3
} from 'lucide-react';

const LandlordPropertyManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [loading] = useState(false);

  // Mock data for demonstration
  const properties = [
    {
      id: '1',
      name: 'Downtown Apartments',
      address: '123 Main St, San Francisco, CA 94102',
      units: 12,
      occupied: 8,
      available: 4,
      totalRent: 45000,
      occupancyRate: 67,
      status: 'active',
      lastMaintenance: '2024-01-15',
      nextInspection: '2024-03-01'
    },
    {
      id: '2',
      name: 'Garden View Complex',
      address: '456 Oak Ave, San Francisco, CA 94103',
      units: 8,
      occupied: 6,
      available: 2,
      totalRent: 32000,
      occupancyRate: 75,
      status: 'active',
      lastMaintenance: '2024-01-10',
      nextInspection: '2024-02-15'
    },
    {
      id: '3',
      name: 'Sunset Heights',
      address: '789 Sunset Blvd, San Francisco, CA 94104',
      units: 6,
      occupied: 4,
      available: 2,
      totalRent: 28000,
      occupancyRate: 67,
      status: 'maintenance',
      lastMaintenance: '2024-01-20',
      nextInspection: '2024-03-15'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'application',
      message: 'New application received for Unit 3A',
      time: '2 hours ago',
      status: 'pending',
      property: 'Downtown Apartments',
      priority: 'medium'
    },
    {
      id: '2',
      type: 'maintenance',
      message: 'Maintenance request completed for Unit 5B',
      time: '4 hours ago',
      status: 'completed',
      property: 'Garden View Complex',
      priority: 'low'
    },
    {
      id: '3',
      type: 'payment',
      message: 'Rent payment received from Unit 2C',
      time: '1 day ago',
      status: 'paid',
      property: 'Downtown Apartments',
      priority: 'low'
    },
    {
      id: '4',
      type: 'maintenance',
      message: 'Urgent: Water leak reported in Unit 1A',
      time: '3 hours ago',
      status: 'urgent',
      property: 'Sunset Heights',
      priority: 'high'
    },
    {
      id: '5',
      type: 'application',
      message: 'Application approved for Unit 4B',
      time: '1 day ago',
      status: 'approved',
      property: 'Garden View Complex',
      priority: 'low'
    }
  ];

  // Calculate stats
  const totalProperties = properties.length;
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
  const totalOccupied = properties.reduce((sum, p) => sum + p.occupied, 0);
  const totalRevenue = properties.reduce((sum, p) => sum + p.totalRent, 0);
  const averageOccupancy = totalUnits > 0 ? (totalOccupied / totalUnits) * 100 : 0;
  const pendingApplications = recentActivity.filter(a => a.type === 'application' && a.status === 'pending').length;
  const urgentMaintenance = recentActivity.filter(a => a.type === 'maintenance' && a.priority === 'high').length;

  if (showPropertyForm) {
    return <PropertyForm />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading property management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header Banner */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Landlord Dashboard</h1>
                <p className="text-sm text-green-50">
                  AI-powered property management • {totalProperties} properties • {totalUnits} units • ${totalRevenue.toLocaleString()}/month revenue
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {urgentMaintenance > 0 && (
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {urgentMaintenance}
                  </span>
                </div>
              )}
              <Button
                onClick={() => setShowPropertyForm(true)}
                className="bg-white text-green-600 hover:bg-green-50 font-semibold transition-all duration-200 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-700 text-xs font-semibold">Total Properties</p>
                  <Building className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{totalProperties}</p>
                <p className="text-xs text-blue-600 mt-1 font-medium">Active</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-700 text-xs font-semibold">Total Units</p>
                  <Home className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{totalUnits}</p>
                <p className="text-xs text-green-600 mt-1 font-medium">{totalOccupied} occupied</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-700 text-xs font-semibold">Monthly Revenue</p>
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-purple-600 mt-1 font-medium">{averageOccupancy.toFixed(0)}% occupancy</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-orange-700 text-xs font-semibold">Pending Items</p>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{pendingApplications + urgentMaintenance}</p>
                <p className="text-xs text-orange-600 mt-1 font-medium">{urgentMaintenance} urgent</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-2">
            <nav className="flex space-x-2">
              {[
                { id: 'overview', label: 'Dashboard', icon: TrendingUp },
                { id: 'properties', label: 'Properties', icon: Building },
                { id: 'listings', label: 'Listings', icon: List },
                { id: 'applications', label: 'Applications', icon: Users },
                { id: 'maintenance', label: 'Work Orders', icon: Wrench },
                { id: 'reports', label: 'Reports', icon: BarChart3 },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-3 px-4 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Properties Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mr-4">
                      <Building className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Properties Overview</h2>
                      <p className="text-sm text-gray-600">Manage your property portfolio</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center px-4 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 font-semibold transition-all duration-200"
                  >
                    Manage All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </motion.button>
                </div>
                <div className="space-y-4">
                  {properties.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-green-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          {/* <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm"> */}
                            <Home className="h-6 w-6 text-green-600" />
                          {/* </div> */}
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{property.name}</h3>
                            <div className="flex items-center text-gray-600 text-sm">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{property.address}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          property.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                          property.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                          {property.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <p className="text-xs text-gray-500 font-medium">Units</p>
                          <p className="font-bold text-gray-900 text-lg">{property.occupied}/{property.units}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <p className="text-xs text-gray-500 font-medium">Occupancy</p>
                          <p className="font-bold text-gray-900 text-lg">{property.occupancyRate}%</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold ">
                          ${property.totalRent.toLocaleString()}/month
                        </span>
                        <span className="text-sm text-gray-500 font-medium">
                          {property.available} available
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-4">
                      <Bell className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                      <p className="text-sm text-gray-600">Latest updates and notifications</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center px-4 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 font-semibold transition-all duration-200"
                  >
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </motion.button>
                </div>
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.01, x: 4 }}
                      className={`p-4 rounded-xl border-l-4 transition-all duration-200 ${
                        activity.priority === 'high' ? 'bg-gradient-to-r from-red-50 to-red-100 border-red-500 hover:shadow-md' :
                        activity.status === 'completed' ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-500 hover:shadow-md' :
                        activity.status === 'pending' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-500 hover:shadow-md' :
                        'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-500 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            activity.type === 'application' ? 'bg-blue-100' :
                            activity.type === 'maintenance' ? 'bg-orange-100' :
                            'bg-green-100'
                          }`}>
                            {activity.type === 'application' && <Users className="h-4 w-4 text-blue-600" />}
                            {activity.type === 'maintenance' && <Wrench className="h-4 w-4 text-orange-600" />}
                            {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-green-600" />}
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{activity.message}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                          activity.priority === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                          activity.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-gray-100 text-gray-700 border-gray-200'
                        }`}>
                          {activity.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-medium">{activity.property}</span>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
                <p className="text-gray-600 mt-1">Manage your property portfolio</p>
              </div>
              <Button 
                onClick={() => setShowPropertyForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-sm">
                          <Building className="h-7 w-7 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{property.name}</h3>
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span className="truncate">{property.address}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        property.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' :
                        property.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {property.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <p className="text-xs text-blue-700 font-semibold mb-1">Total Units</p>
                        <p className="text-xl font-bold text-gray-900">{property.units}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                        <p className="text-xs text-green-700 font-semibold mb-1">Available</p>
                        <p className="text-xl font-bold text-green-600">{property.available}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-gray-600 font-medium">Occupancy Rate</span>
                        <span className="font-bold text-gray-900">{property.occupancyRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${property.occupancyRate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${property.totalRent.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-medium">Last Maintenance</p>
                        <p className="text-sm font-semibold text-gray-900">{property.lastMaintenance}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-all duration-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-all duration-200"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-semibold text-gray-700 transition-all duration-200"
                      >
                        <Settings className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Active Listings</h2>
                <p className="text-gray-600 mt-1">Manage your property listings and pricing</p>
              </div>
              <Button 
                onClick={() => setShowPropertyForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <List className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Listing Management</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Create and manage property listings with AI-powered pricing recommendations, photo management, and social media integration.
                </p>
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                    <List className="h-4 w-4 mr-2" />
                    View All Listings
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    New Listing
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tenant Applications</h2>
                <p className="text-gray-600 mt-1">Review, screen, and manage rental applications</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  {pendingApplications} Pending Review
                </Badge>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  AI Screening Available
                </Badge>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Tenant Screening</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Review applications with AI-assisted screening, credit checks, and background verification. Invite qualified prospects to apply.
                </p>
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                    <Users className="h-4 w-4 mr-2" />
                    View All Applications
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Invite to Apply
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Work Orders Tab */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Work Orders</h2>
                <p className="text-gray-600 mt-1">Manage maintenance requests and work orders</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  {urgentMaintenance} Urgent
                </Badge>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Maintenance Management</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Track and manage maintenance requests from tenants. Schedule repairs, assign contractors, and monitor work progress.
                </p>
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                    <Wrench className="h-4 w-4 mr-2" />
                    View All Work Orders
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Work Order
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analytics & Reports</h2>
                <p className="text-gray-600 mt-1">Track performance, occupancy, and revenue metrics</p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Intelligence</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Generate comprehensive reports on occupancy rates, revenue trends, lead conversion, and property performance analytics.
                </p>
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-gray-600 mt-1">Manage your account, employees, and preferences</p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Landlord Settings</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Manage your organization, employee roles, notification preferences, and property management settings.
                </p>
                <div className="flex justify-center space-x-3">
                  <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Employees
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandlordPropertyManagement;
