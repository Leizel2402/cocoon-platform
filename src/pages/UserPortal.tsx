import { useState, useEffect } from "react";
import {
  FileText,
  Home,
  CheckCircle,
  CreditCard,
  Settings,
  Wrench,
  MessageSquare,
  Search,
  Car,
  Dumbbell,
  Zap,
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  DollarSign,
  Loader2,
  CheckCircle2,
  Clock3,
  XCircle,
  RotateCcw,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
  getUserRentPayments,
  getUserSubscriptions,
  getUserMessages,
  getUserApplications,
  getUserProperty,
  debugFirebaseCollections,
  type RentPayment,
  type UserSubscription,
  type UserMessage,
  type UserApplication,
  type UserProperty
} from "../services/userDataService";
import { maintenanceService, type MaintenanceRequest } from "../services/maintenanceService";
import { useNavigate } from "react-router-dom";

// Dummy data for UI demonstration
const dummyRentPayments: RentPayment[] = [
  {
    id: '1',
    amount: 2500,
    dueDate: new Date('2024-02-01'),
    status: 'due',
    property: 'Sunset Apartments - Unit 205',
    propertyId: 'prop1',
    unitId: 'unit1',
    unitNumber: '205'
  },
  {
    id: '2',
    amount: 2500,
    dueDate: new Date('2024-01-01'),
    status: 'paid',
    property: 'Sunset Apartments - Unit 205',
    propertyId: 'prop1',
    unitId: 'unit1',
    unitNumber: '205'
  },
  {
    id: '3',
    amount: 2500,
    dueDate: new Date('2023-12-01'),
    status: 'paid',
    property: 'Sunset Apartments - Unit 205',
    propertyId: 'prop1',
    unitId: 'unit1',
    unitNumber: '205'
  }
];

const dummySubscriptions: UserSubscription[] = [
  {
    id: '1',
    name: 'Covered Parking',
    type: 'parking',
    price: 75,
    status: 'active',
    nextBilling: new Date('2024-02-01'),
    propertyId: 'prop1',
    unitId: 'unit1'
  },
  {
    id: '2',
    name: 'Fitness Center',
    type: 'amenities',
    price: 25,
    status: 'active',
    nextBilling: new Date('2024-02-01'),
    propertyId: 'prop1',
    unitId: 'unit1'
  },
  {
    id: '3',
    name: 'High-Speed Internet',
    type: 'utilities',
    price: 89,
    status: 'active',
    nextBilling: new Date('2024-02-01'),
    propertyId: 'prop1',
    unitId: 'unit1'
  }
];

const dummyMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: '1',
    title: 'Kitchen Sink Leak',
    description: 'Water dripping from under the kitchen sink',
    status: 'in_progress',
    priority: 'medium',
    submittedAt: new Date('2024-01-15'),
    propertyId: 'prop1',
    tenantId: 'user123',
    landlordId: 'landlord123',
    propertyAddress: '123 Sunset Blvd, Los Angeles, CA 90210',
    unitNumber: '205',
    category: 'plumbing',
    images: []
  },
  {
    id: '2',
    title: 'Broken Light Switch',
    description: 'Light switch in bedroom not working',
    status: 'submitted',
    priority: 'low',
    submittedAt: new Date('2024-01-18'),
    propertyId: 'prop1',
    tenantId: 'user123',
    landlordId: 'landlord123',
    propertyAddress: '123 Sunset Blvd, Los Angeles, CA 90210',
    unitNumber: '205',
    category: 'electrical',
    images: []
  }
];

const dummyMessages: UserMessage[] = [
  {
    id: '1',
    from: 'Property Manager',
    subject: 'Maintenance Update',
    message: 'Your kitchen sink repair has been scheduled for tomorrow.',
    timestamp: new Date('2024-01-20'),
    isRead: false,
    isUrgent: false,
    propertyId: 'prop1'
  },
  {
    id: '2',
    from: 'Building Management',
    subject: 'Rent Reminder',
    message: 'Your rent payment is due in 3 days.',
    timestamp: new Date('2024-01-19'),
    isRead: true,
    isUrgent: true,
    propertyId: 'prop1'
  }
];

const dummyApplications: UserApplication[] = [
  {
    id: 'app123456',
    propertyId: 'prop1',
    propertyName: 'Sunset Apartments',
    unitId: 'unit1',
    unitNumber: '205',
    status: 'approved',
    submittedAt: new Date('2024-01-15'),
    appFeeCents: 7500
  }
];

const dummyUserProperty: UserProperty = {
  id: 'prop1',
  name: 'Sunset Apartments',
  address: '123 Sunset Blvd, Los Angeles, CA 90210',
  unitId: 'unit1',
  unitNumber: '205',
  rent: 2500,
  leaseStart: new Date('2023-06-01'),
  leaseEnd: new Date('2024-05-31'),
  status: 'active'
};

const dummyStats = {
  totalApplications: 1,
  recentApplications: 1,
  currentRent: 2500,
  currentRentStatus: 'due' as 'due' | 'paid' | 'overdue',
  activeSubscriptions: 3,
  openMaintenanceRequests: 1,
  unreadMessages: 1
};

export function UserPortal() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  // State for dynamic data
  const [rentPayments, setRentPayments] = useState<RentPayment[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [userProperty, setUserProperty] = useState<UserProperty | null>(null);
  const [stats, setStats] = useState({
    totalApplications: 0,
    recentApplications: 0,
    currentRent: 0,
    currentRentStatus: 'paid' as 'due' | 'paid' | 'overdue',
    activeSubscriptions: 0,
    openMaintenanceRequests: 0,
    unreadMessages: 0
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  // Fetch user data when user is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        
        // For now, use dummy data for UI demonstration
        // TODO: Replace with real Firebase data when collections are set up
        // setRentPayments(dummyRentPayments);
        // setSubscriptions(dummySubscriptions);
        // setMaintenanceRequests(dummyMaintenanceRequests);
        // setMessages(dummyMessages);
        // setApplications(dummyApplications);
        // setUserProperty(dummyUserProperty);
        // setStats(dummyStats);

        // Uncomment below when Firebase collections are ready:
        
        // Debug Firebase collections first
        await debugFirebaseCollections(user.uid);
        
        const [
          rentPaymentsData,
          subscriptionsData,
          maintenanceRequestsData,
          messagesData,
          applicationsData,
          userPropertyData
        ] = await Promise.all([
          getUserRentPayments(user.uid),
          getUserSubscriptions(user.uid),
          maintenanceService.getMaintenanceRequestsByTenant(user.uid),
          getUserMessages(user.uid),
          getUserApplications(user.uid),
          getUserProperty(user.uid)
        ]);

     
        setRentPayments(rentPaymentsData);
        setSubscriptions(subscriptionsData);
        setMaintenanceRequests(maintenanceRequestsData);
        setMessages(messagesData);
        setApplications(applicationsData);
        setUserProperty(userPropertyData);
        // Calculate stats with the fetched data
        const calculatedStats = {
          totalApplications: applicationsData.length,
          recentApplications: applicationsData.filter(app => {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            // Handle both Date and string types for submittedAt
            const submittedDate = typeof app.submittedAt === 'string' ? new Date(app.submittedAt) : app.submittedAt;
            return submittedDate >= thirtyDaysAgo;
          }).length,
          currentRent: rentPaymentsData.find(p => p.status === 'due')?.amount || 0,
          currentRentStatus: (rentPaymentsData.find(p => p.status === 'due')?.status || 'paid') as 'due' | 'paid' | 'overdue',
          activeSubscriptions: subscriptionsData.filter(s => s.status === 'active').length,
          openMaintenanceRequests: maintenanceRequestsData.filter(m => m.status === 'submitted' || m.status === 'in_progress').length,
          unreadMessages: messagesData.filter(m => !m.isRead).length
        };
        
        setStats(calculatedStats);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to dummy data on error
        setRentPayments(dummyRentPayments);
        setSubscriptions(dummySubscriptions);
        setMaintenanceRequests(dummyMaintenanceRequests);
        setMessages(dummyMessages);
        setApplications(dummyApplications);
        setUserProperty(dummyUserProperty);
        setStats(dummyStats);
      } finally {
        setDataLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Function to refresh maintenance requests
  const refreshMaintenanceRequests = async () => {
    if (!user) return;
    
    try {
      setMaintenanceLoading(true);
      const requests = await maintenanceService.getMaintenanceRequestsByTenant(user.uid);
      setMaintenanceRequests(requests);
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        openMaintenanceRequests: requests.filter(m => m.status === 'submitted' || m.status === 'in_progress').length
      }));
    } catch (error) {
      console.error('Error refreshing maintenance requests:', error);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  // Function to refresh applications
  const refreshApplications = async () => {
    if (!user) return;
    
    try {
      setApplicationsLoading(true);
      const apps = await getUserApplications(user.uid);
     
      setApplications(apps);
      
      // Update stats
      const recentApps = apps.filter(app => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        // Handle both Date and string types for submittedAt
        const submittedDate = typeof app.submittedAt === 'string' ? new Date(app.submittedAt) : app.submittedAt;
        return submittedDate >= thirtyDaysAgo;
      }).length;
      
      
      setStats(prevStats => ({
        ...prevStats,
        totalApplications: apps.length,
        recentApplications: recentApps
      }));
    } catch (error) {
      console.error('Error refreshing applications:', error);
    } finally {
      setApplicationsLoading(false);
    }
  };

  // Show loading state while authentication or data is loading
  if (authLoading || dataLoading) {
  return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your portal...</p>
                </div>
              </div>
    );
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Cocoon</h2>
          <p className="text-gray-600 mb-6">Please sign in to access your renter portal</p>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors">
            Sign In
                </button>
              </div>
            </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Top Navigation Bar */}
   

      {/* Header Banner */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold">Renter Portal</h1>
            </div>
            <div className="flex items-center space-x-2">
              {stats.unreadMessages > 0 && (
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.unreadMessages}
                  </span>
                </div>
              )}
              <button 
              
              onClick={() => navigate('/property')}
              className="px-3 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 font-semibold transition-all duration-200 shadow-lg text-xs">
                Find Home
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Home className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Renter Portal</h1>
                <p className="text-sm text-green-50">
                  Welcome back, {user.displayName || user.email} • {stats.activeSubscriptions} active services
                  {userProperty && (
                    <span className="ml-2">• {userProperty.name}</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {stats.unreadMessages > 0 && (
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {stats.unreadMessages}
                  </span>
                </div>
              )}
              <button 
              
              onClick={() => navigate('/property')}
              className="px-6 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 font-semibold transition-all duration-200 shadow-lg text-sm">
                Find New Home
              </button>
            </div>
          </div>

          {/* Mobile User Info */}
          <div className="sm:hidden bg-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-50 text-sm">Welcome back, {user.displayName || user.email}</p>
                <p className="text-green-100 text-xs">{stats.activeSubscriptions} active services</p>
              </div>
              {userProperty && (
                <div className="text-right">
                  <p className="text-green-50 text-sm font-semibold">{userProperty.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Info Card */}
        <div className="mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Home className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {userProperty ? userProperty.name : 'No Active Lease'}
                  </h2>
                  <div className="flex items-center text-gray-600 text-xs sm:text-sm mt-1">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span>
                      {userProperty ? (
                        <>
                          {userProperty.unitNumber && `Unit ${userProperty.unitNumber} • `}
                          {userProperty.address}
                        </>
                      ) : (
                        user.email
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {userProperty ? (
                  <>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      userProperty.status === 'active' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {userProperty.status === 'active' ? '✓ Active Lease' : 'Lease Expired'}
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                      ✓ Verified
                </span>
                  </>
                ) : (
                  <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-semibold border border-yellow-200">
                    No Active Lease
                </span>
                )}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-xs font-medium">Rent Due</p>
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">${stats.currentRent}</p>
                <p className="text-xs text-gray-500 mt-1">Feb 1, 2024</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-xs font-medium">Services</p>
                  <Settings className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
                <p className="text-xs text-gray-500 mt-1">Active</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-xs font-medium">Requests</p>
                  <Wrench className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.openMaintenanceRequests}</p>
                <p className="text-xs text-gray-500 mt-1">Open</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600 text-xs font-medium">Messages</p>
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
                <p className="text-xs text-gray-500 mt-1">Unread</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center mb-5">
                <Settings className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button className="p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all duration-200 group">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 mx-auto shadow-sm">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm text-center">Pay Rent</p>
                  <p className="text-xs text-gray-500 mt-1 text-center">Due in 3 days</p>
                </button>

                <button onClick={() =>  navigate('/maintenance')} className="p-4 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all duration-200 group">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 mx-auto shadow-sm">
                    <Wrench className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm text-center">Maintenance</p>
                  <p className="text-xs text-gray-500 mt-1 text-center">Report issue</p>
                </button>

                <button className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200 group">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 mx-auto shadow-sm">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm text-center">Messages</p>
                  <p className="text-xs text-gray-500 mt-1 text-center">{stats.unreadMessages} unread</p>
                </button>

                <button 
                
                onClick={() => navigate('/subscriptions')}
                className="p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all duration-200 group">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 mx-auto shadow-sm">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm text-center">Services</p>
                  <p className="text-xs text-gray-500 mt-1 text-center">Manage</p>
                </button>

                <button className="p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-all duration-200 group">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 mx-auto shadow-sm">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm text-center">Documents</p>
                  <p className="text-xs text-gray-500 mt-1 text-center">View lease</p>
                </button>

                <button onClick={() => navigate('/property')} className="p-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-all duration-200 group">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-3 mx-auto shadow-sm">
                    <Search className="h-6 w-6 text-teal-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm text-center">Find Home</p>
                  <p className="text-xs text-gray-500 mt-1 text-center">Browse</p>
                </button>
              </div>
            </div>

            {/* Rent Payment Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 p-6 text-gray-800 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div>
                    <p className="text-gray-600 text-sm mb-1">Next Payment Due</p>
                    <h3 className="text-4xl font-bold text-gray-900">
                      ${rentPayments.length > 0 ? rentPayments[0].amount.toLocaleString() : '0'}
                    </h3>
                    </div>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Due: {rentPayments.length > 0 ? rentPayments[0].dueDate.toLocaleDateString() : 'No payments due'}
                  </p>
                  {rentPayments.length > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {(() => {
                        const daysLeft = Math.ceil((rentPayments[0].dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                        return daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : `${Math.abs(daysLeft)} days overdue`;
                      })()}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <button className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-sm">
                    Pay Now
                </button>
                
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 mb-4">Payment History</h4>
                  <div className="space-y-3">
                    {rentPayments.filter(p => p.status === 'paid').slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">${payment.amount.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">{payment.dueDate.toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                          Paid
                        </span>
                      </div>
                    ))}
                    {rentPayments.filter(p => p.status === 'paid').length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">No payment history available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Requests */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center">
                  <Wrench className="h-5 w-5 text-red-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Maintenance Requests</h3>
                  {maintenanceLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400 ml-2" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={refreshMaintenanceRequests}
                    disabled={maintenanceLoading}
                    className="text-sm text-gray-600 hover:text-gray-700 font-semibold flex items-center disabled:opacity-50"
                  >
                    Refresh
                  </button>
                  <button 
                  
                  onClick={() => navigate('/maintenance')}
                  className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {maintenanceRequests.length > 0 ? (
                  maintenanceRequests.slice(0, 5).map((request) => (
                    <div key={request.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Wrench className={`h-5 w-5 ${
                            request.status === 'in_progress' ? 'text-blue-600' : 
                            request.status === 'completed' ? 'text-green-600' : 
                            request.status === 'cancelled' ? 'text-red-600' : 'text-gray-400'
                          }`} />
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{request.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Submitted {request.submittedAt.toLocaleDateString()}
                            </p>
                            {request.category && (
                              <p className="text-xs text-gray-400 mt-1 capitalize">
                                {request.category.replace('_', ' ')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            request.priority === 'emergency' ? 'bg-red-100 text-red-700 border border-red-200' :
                            request.priority === 'high' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                            request.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                            'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {request.priority}
                          </span>
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            request.status === 'submitted' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                            request.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                            request.status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                            request.status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {request.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      {request.description && (
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                          {request.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 mb-2">No maintenance requests</p>
                    <p className="text-xs text-gray-400">Submit a request when you need help</p>
                  </div>
                )}
              </div>

              <button
              onClick={() => navigate('/maintenance')}
              className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-red-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-medium">
                + New Maintenance Request
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Property Services */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Property Services</h3>
                </div>
              </div>
              
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {sub.type === 'parking' && <Car className="h-5 w-5 text-blue-600" />}
                        {sub.type === 'amenities' && <Dumbbell className="h-5 w-5 text-green-600" />}
                        {sub.type === 'utilities' && <Zap className="h-5 w-5 text-yellow-600" />}
                        <p className="text-sm font-semibold text-gray-900">{sub.name}</p>
                      </div>
                      <p className="text-base font-bold text-gray-900">${sub.price}</p>
                    </div>
                    <p className="text-xs text-gray-500 ml-8">Next billing: {sub.nextBilling.toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 py-2 text-sm text-green-600 hover:text-green-700 font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Manage Services
              </button>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-bold text-gray-900">Messages</h3>
                </div>
                {stats.unreadMessages > 0 && (
                  <span className="px-2.5 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                    {stats.unreadMessages}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div key={msg.id} className={`p-4 rounded-lg border-l-4 ${
                      msg.isUrgent ? 'bg-red-50 border-red-500' : 
                      !msg.isRead ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900">{msg.subject}</p>
                        {!msg.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>}
                    </div>
                      <p className="text-xs text-gray-600 mb-2">From: {msg.from}</p>
                      <p className="text-xs text-gray-700 mb-2">{msg.message}</p>
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                      {msg.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No messages</p>
                )}
              </div>

              <button className="w-full mt-4 py-2 text-sm text-green-600 hover:text-green-700 font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                View All Messages
              </button>
            </div>

            {/* Applications Summary */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  <h3 className="text-lg font-bold">Applications</h3>
                  {applicationsLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-white/70 ml-2" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {applications.length > 0 && (
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-semibold">
                      {applications.length} total
                    </span>
                  )}
                  <button 
                    onClick={refreshApplications}
                    disabled={applicationsLoading}
                    className="text-white/70 hover:text-white text-xs font-semibold disabled:opacity-50"
                  >
                    Refresh
                  </button>
                </div>
              </div>
              
              <div className="space-y-4 mb-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <span className="text-green-50 text-xs block mb-1">Total Submitted</span>
                    <span className="text-2xl font-bold">{stats.totalApplications}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-green-50 text-xs block mb-1">This Month</span>
                    <span className="text-2xl font-bold">{stats.recentApplications}</span>
                  </div>
                </div>
                
                {applications.length > 0 ? (
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-green-50 text-xs mb-3 font-medium">Recent Applications:</p>
                    <div className="space-y-3">
                      {applications.slice(0, 3).map((app) => {
                        const getStatusIcon = (status: string) => {
                          switch (status) {
                            case 'approved': return <CheckCircle2 className="h-4 w-4" />;
                            case 'under_review': return <Clock3 className="h-4 w-4" />;
                            case 'pending': return <Clock className="h-4 w-4" />;
                            case 'rejected': return <XCircle className="h-4 w-4" />;
                            case 'withdrawn': return <RotateCcw className="h-4 w-4" />;
                            default: return <AlertCircle className="h-4 w-4" />;
                          }
                        };

                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case 'approved': return 'bg-green-500 text-white';
                            case 'under_review': return 'bg-blue-500 text-white';
                            case 'pending': return 'bg-yellow-500 text-white';
                            case 'rejected': return 'bg-red-500 text-white';
                            case 'withdrawn': return 'bg-gray-500 text-white';
                            default: return 'bg-gray-500 text-white';
                          }
                        };

                        const getDaysAgo = (date: Date | string) => {
                          const now = new Date();
                          // Handle both Date objects and ISO string dates
                          const submittedDate = typeof date === 'string' ? new Date(date) : date;
                          const diffTime = Math.abs(now.getTime() - submittedDate.getTime());
                          
                          // Calculate different time units
                          const diffMinutes = Math.floor(diffTime / (1000 * 60));
                          const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                          
                          
                          
                          // Return appropriate time format
                          if (diffMinutes < 1) {
                            return 'Just now';
                          } else if (diffMinutes < 60) {
                            return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
                          } else if (diffHours < 24) {
                            return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
                          } else if (diffDays < 7) {
                            return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
                          } else {
                            const diffWeeks = Math.floor(diffDays / 7);
                            return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
                          }
                        };

                        return (
                          <div key={app.id} className="bg-white/10 rounded-lg p-3 hover:bg-white/15 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-semibold truncate">
                                  {app.propertyName}
                                </p>
                                {app.unitNumber && (
                                  <p className="text-green-100 text-xs">
                                    Unit {app.unitNumber}
                                  </p>
                                )}
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ml-2 flex items-center gap-1 ${getStatusColor(app.status)}`}>
                                {getStatusIcon(app.status)}
                                {app.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-green-100">
                              <span>{getDaysAgo(app.submittedAt)}</span>
                              <span className="font-medium">${(app.appFeeCents / 100).toFixed(2)} fee</span>
                            </div>
                            {app.status === 'approved' && (
                              <div className="mt-2 pt-2 border-t border-white/20">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-green-200" />
                                  <p className="text-green-200 text-xs font-medium">
                                    Congratulations! Your application was approved.
                                  </p>
                                </div>
                              </div>
                            )}
                            {app.status === 'rejected' && (
                              <div className="mt-2 pt-2 border-t border-white/20">
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-4 w-4 text-red-200" />
                                  <p className="text-red-200 text-xs">
                                    Application was not approved. Contact property management for details.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-white/20 text-center">
                    <FileText className="h-8 w-8 text-white/50 mx-auto mb-2" />
                    <p className="text-green-100 text-sm">No applications yet</p>
                    <p className="text-green-200 text-xs">Start your rental journey today</p>
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => navigate('/my-applications')}
                className="w-full py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
              >
                {applications.length > 0 ? 'View All Applications' : 'Start Application'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}