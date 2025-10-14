import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Car, 
  Dumbbell, 
  Wifi, 
  Droplets, 
  Zap, 
  Trash2, 
  Plus, 
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  CreditCard,
  Download,
  Search,
  ArrowLeft,
  Loader2,
  ChevronRight,
  X,
  Building,
  Star,
  Shield,
  Key,
  Camera,
  Battery,
  Phone,
  Users,
  Lock,
  Tv,
  Waves,
  Thermometer,
  Router,
  Smartphone,
  Database,
  Heart,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '../components/ui/textarea';

interface Subscription {
  id: string;
  name: string;
  type: 'parking' | 'amenities' | 'utilities';
  description: string;
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'annually';
  status: 'active' | 'inactive' | 'pending' | 'cancelled';
  startDate: Date;
  nextBillingDate: Date;
  autoRenew: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  features: string[];
}

interface SubscriptionCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  availableCount: number;
  activeCount: number;
}

export function Subscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<SubscriptionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'parking' | 'amenities' | 'utilities'>('all');
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state for Add Service modal
  const [newService, setNewService] = useState({
    name: '',
    type: 'parking' as 'parking' | 'amenities' | 'utilities',
    description: '',
    price: '',
    billingCycle: 'monthly' as 'monthly' | 'quarterly' | 'annually',
    autoRenew: true,
    features: [] as string[],
    startDate: new Date(),
    provider: '',
    contactInfo: '',
    notes: ''
  });
  
  const [newFeature, setNewFeature] = useState('');
  
  // Feature suggestions with icons based on service type
  const getFeatureSuggestions = (serviceType: string) => {
    const suggestions = {
      parking: [
        { text: '24/7 access', icon: Clock },
        { text: 'Security cameras', icon: Camera },
        { text: 'Covered parking', icon: Shield },
        { text: 'Electric vehicle charging', icon: Battery },
        { text: 'Reserved spot', icon: Key },
        { text: 'Key card access', icon: Lock }
      ],
      amenities: [
        { text: 'Cardio equipment', icon: Heart },
        { text: 'Weight training', icon: Dumbbell },
        { text: 'Pool access', icon: Waves },
        { text: 'Sauna included', icon: Thermometer },
        { text: 'Group classes', icon: Users },
        { text: 'Personal trainer', icon: Star }
      ],
      utilities: [
        { text: 'High-speed internet', icon: Wifi },
        { text: 'Cable TV', icon: Tv },
        { text: 'Unlimited data', icon: Database },
        { text: '24/7 support', icon: Phone },
        { text: 'WiFi included', icon: Router },
        { text: 'Smart home features', icon: Smartphone }
      ]
    };
    return suggestions[serviceType as keyof typeof suggestions] || [];
  };

  // Mock data - in real app, this would come from Firebase
  useEffect(() => {
    const mockCategories: SubscriptionCategory[] = [
      {
        id: 'parking',
        name: 'Parking',
        description: 'Parking spaces and garage access',
        icon: Car,
        color: 'bg-blue-100 text-blue-600',
        availableCount: 3,
        activeCount: 1
      },
      {
        id: 'amenities',
        name: 'Amenities',
        description: 'Gym, pool, and other building amenities',
        icon: Dumbbell,
        color: 'bg-green-100 text-green-600',
        availableCount: 5,
        activeCount: 2
      },
      {
        id: 'utilities',
        name: 'Utilities',
        description: 'Water, electricity, and internet services',
        icon: Zap,
        color: 'bg-yellow-100 text-yellow-600',
        availableCount: 4,
        activeCount: 3
      }
    ];

    const mockSubscriptions: Subscription[] = [
      {
        id: '1',
        name: 'Covered Parking Spot',
        type: 'parking',
        description: 'Reserved covered parking space in the garage',
        price: 75,
        billingCycle: 'monthly',
        status: 'active',
        startDate: new Date('2024-01-01'),
        nextBillingDate: new Date('2024-02-01'),
        autoRenew: true,
        icon: Car,
        color: 'bg-blue-100 text-blue-600',
        features: ['Covered parking', '24/7 access', 'Security cameras']
      },
      {
        id: '2',
        name: 'Fitness Center Access',
        type: 'amenities',
        description: 'Full access to the building fitness center',
        price: 25,
        billingCycle: 'monthly',
        status: 'active',
        startDate: new Date('2024-01-01'),
        nextBillingDate: new Date('2024-02-01'),
        autoRenew: true,
        icon: Dumbbell,
        color: 'bg-green-100 text-green-600',
        features: ['Cardio equipment', 'Weight training', 'Group classes']
      },
      {
        id: '3',
        name: 'High-Speed Internet',
        type: 'utilities',
        description: 'Premium internet service with unlimited data',
        price: 89,
        billingCycle: 'monthly',
        status: 'active',
        startDate: new Date('2024-01-01'),
        nextBillingDate: new Date('2024-02-01'),
        autoRenew: true,
        icon: Wifi,
        color: 'bg-yellow-100 text-yellow-600',
        features: ['1 Gbps speed', 'Unlimited data', '24/7 support']
      },
      {
        id: '4',
        name: 'Pool Access',
        type: 'amenities',
        description: 'Access to the rooftop pool and lounge area',
        price: 15,
        billingCycle: 'monthly',
        status: 'inactive',
        startDate: new Date('2023-12-01'),
        nextBillingDate: new Date('2024-02-01'),
        autoRenew: false,
        icon: Droplets,
        color: 'bg-green-100 text-green-600',
        features: ['Pool access', 'Lounge chairs', 'Poolside service']
      }
    ];

    setTimeout(() => {
      setCategories(mockCategories);
      setSubscriptions(mockSubscriptions);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscription.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || subscription.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusIcon = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'cancelled':
        return <Trash2 className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
    }
  };

  const handleToggleAutoRenew = (subscriptionId: string) => {
    setSubscriptions(prev => prev.map(sub => 
      sub.id === subscriptionId 
        ? { ...sub, autoRenew: !sub.autoRenew }
        : sub
    ));
    
    const subscription = subscriptions.find(s => s.id === subscriptionId);
    toast({
      title: subscription?.autoRenew ? "Auto-renewal disabled" : "Auto-renewal enabled",
      description: subscription?.autoRenew ? "Subscription will not auto-renew" : "Subscription will auto-renew",
    });
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    setSubscriptions(prev => prev.map(sub => 
      sub.id === subscriptionId 
        ? { ...sub, status: 'cancelled' as const }
        : sub
    ));
    
    const subscription = subscriptions.find(s => s.id === subscriptionId);
    toast({
      title: "Subscription cancelled",
      description: `${subscription?.name} has been cancelled`,
    });
  };

  const handleAddService = async () => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add services",
        variant: "destructive"
      });
      return;
    }

    // Validate required fields
    if (!newService.name || !newService.price || !newService.description) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Validate price is a positive number
    const price = parseFloat(newService.price);
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid positive number",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call with user authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create subscription with user context
      const newSubscription: Subscription = {
        id: `sub_${Date.now()}_${user.uid}`,
        name: newService.name.trim(),
        type: newService.type,
        description: newService.description.trim(),
        price: parseFloat(newService.price),
        billingCycle: newService.billingCycle,
        status: 'pending', // Requires approval from property management
        startDate: newService.startDate,
        nextBillingDate: new Date(newService.startDate.getTime() + (newService.billingCycle === 'monthly' ? 30 : newService.billingCycle === 'quarterly' ? 90 : 365) * 24 * 60 * 60 * 1000),
        autoRenew: newService.autoRenew,
        icon: newService.type === 'parking' ? Car : newService.type === 'amenities' ? Dumbbell : Zap,
        color: newService.type === 'parking' ? 'bg-blue-100 text-blue-600' : newService.type === 'amenities' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600',
        features: newService.features
      };

      setSubscriptions(prev => [newSubscription, ...prev]);
      
      // Reset form
      setNewService({
        name: '',
        type: 'parking',
        description: '',
        price: '',
        billingCycle: 'monthly',
        autoRenew: true,
        features: [],
        startDate: new Date(),
        provider: '',
        contactInfo: '',
        notes: ''
      });
      setNewFeature('');
      
      setShowAddServiceModal(false);
      
      toast({
        title: "Service request submitted",
        description: `${newService.name} has been submitted for approval. You'll be notified once it's approved.`,
      });
    } catch {
      toast({
        title: "Error adding service",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && !newService.features.includes(newFeature.trim())) {
      setNewService(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const addSuggestedFeature = (featureText: string) => {
    if (!newService.features.includes(featureText)) {
      setNewService(prev => ({
        ...prev,
        features: [...prev.features, featureText]
      }));
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setNewService(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  const resetForm = () => {
    setNewService({
      name: '',
      type: 'parking',
      description: '',
      price: '',
      billingCycle: 'monthly',
      autoRenew: true,
      features: [],
      startDate: new Date(),
      provider: '',
      contactInfo: '',
      notes: ''
    });
    setNewFeature('');
    setShowAddServiceModal(false);
  };

  const totalMonthlyCost = subscriptions
    .filter(s => s.status === 'active' && s.billingCycle === 'monthly')
    .reduce((sum, s) => sum + s.price, 0);

  const totalQuarterlyCost = subscriptions
    .filter(s => s.status === 'active' && s.billingCycle === 'quarterly')
    .reduce((sum, s) => sum + s.price, 0);

  const totalAnnualCost = subscriptions
    .filter(s => s.status === 'active' && s.billingCycle === 'annually')
    .reduce((sum, s) => sum + s.price, 0);

  const upcomingRenewals = subscriptions.filter(s => {
    const daysUntilRenewal = Math.ceil((s.nextBillingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return s.status === 'active' && daysUntilRenewal <= 7;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header Banner */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <button 
              onClick={() => navigate('/user-portal')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold">Subscriptions</h1>
            </div>
            <Button
              onClick={() => setShowAddServiceModal(true)}
              size="sm"
              className="bg-white text-green-600 hover:bg-green-50 font-semibold transition-all duration-200 shadow-lg"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/user-portal')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Subscriptions</h1>
                <p className="text-sm text-green-50">
                  Manage your parking, amenities, and utilities subscriptions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* <div className="text-right text-sm">
                <p className="text-green-50">Welcome back, {user?.displayName || user?.email}</p>
                <p className="text-green-100">${totalMonthlyCost} monthly total</p>
              </div> */}
              <Button
                onClick={() => setShowAddServiceModal(true)}
                className="bg-white text-green-600 hover:bg-green-50 font-semibold transition-all duration-200 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>
          </div>

          {/* Mobile User Info */}
          <div className="sm:hidden bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-50 text-sm">Welcome back, {user?.displayName || user?.email}</p>
                <p className="text-green-100 text-xs">Manage your subscriptions</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">${totalMonthlyCost}</p>
                <p className="text-green-100 text-xs">monthly total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Services</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{subscriptions.length}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Active Services</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  {subscriptions.filter(s => s.status === 'active').length}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Monthly Cost</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">${totalMonthlyCost}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Auto-Renew</p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                  {subscriptions.filter(s => s.autoRenew).length}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Renter Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Cost Breakdown */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Cost Breakdown</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Services</span>
                <span className="font-semibold text-gray-900">${totalMonthlyCost}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Quarterly Services</span>
                <span className="font-semibold text-gray-900">${totalQuarterlyCost}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Annual Services</span>
                <span className="font-semibold text-gray-900">${totalAnnualCost}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">Total Active</span>
                  <span className="text-lg font-bold text-green-600">
                    ${totalMonthlyCost + totalQuarterlyCost + totalAnnualCost}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Renewals */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Upcoming Renewals</h3>
            </div>
            {upcomingRenewals.length > 0 ? (
              <div className="space-y-3">
                {upcomingRenewals.slice(0, 3).map((subscription) => {
                  const daysLeft = Math.ceil((subscription.nextBillingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={subscription.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{subscription.name}</p>
                        <p className="text-xs text-gray-600">${subscription.price} {subscription.billingCycle}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        daysLeft <= 1 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {daysLeft <= 1 ? 'Due Today' : `${daysLeft} days`}
                      </span>
                    </div>
                  );
                })}
                {upcomingRenewals.length > 3 && (
                  <p className="text-xs text-gray-500 text-center">
                    +{upcomingRenewals.length - 3} more renewals
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No upcoming renewals in the next 7 days</p>
              </div>
            )}
          </div>
        </div>

        {/* Categories Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => setFilterType(category.id as 'all' | 'parking' | 'amenities' | 'utilities')}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${category.color} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">{category.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{category.description}</p>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">{category.availableCount} available</span>
                  <span className="text-green-600 font-semibold">{category.activeCount} active</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search subscriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-200 w-full"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', count: subscriptions.length },
                { key: 'parking', label: 'Parking', count: subscriptions.filter(s => s.type === 'parking').length },
                { key: 'amenities', label: 'Amenities', count: subscriptions.filter(s => s.type === 'amenities').length },
                { key: 'utilities', label: 'Utilities', count: subscriptions.filter(s => s.type === 'utilities').length }
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={filterType === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(filter.key as 'all' | 'parking' | 'amenities' | 'utilities')}
                  className={`text-xs sm:text-sm ${filterType === filter.key 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "border-gray-200 hover:bg-green-50 text-gray-700"
                  }`}
                >
                  {filter.label}
                  {/* <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded-full text-xs">
                    {filter.count}
                  </span> */}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Subscriptions List */}
        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mx-auto mb-6">
              <Settings className="h-10 w-10 sm:h-12 sm:w-12 text-green-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {searchTerm ? 'No subscriptions found' : 'No subscriptions yet'}
            </h3>
            <p className="text-gray-600 text-sm sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms or check different categories'
                : 'Manage your building amenities, parking, and utility subscriptions all in one place'
              }
            </p>
            {!searchTerm && (
              <div className="space-y-4">
                <Button 
                  onClick={() => setShowAddServiceModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subscription
                </Button>
                <div className="text-xs text-gray-500 max-w-sm mx-auto">
                  Contact your property manager to add parking, amenity, or utility subscriptions
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSubscriptions.map((subscription, index) => {
              const Icon = subscription.icon;
              return (
                <motion.div
                  key={subscription.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
                    {/* Mobile Layout */}
                    <div className="sm:hidden">
                      <div className="flex items-start gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-xl ${subscription.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-gray-900 mb-1 truncate">{subscription.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`flex px-2 py-1 rounded-full  text-xs font-semibold ${getStatusColor(subscription.status)}`}>
                              {getStatusIcon(subscription.status)}
                              <span className="ml-1 capitalize">{subscription.status}</span>
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              {subscription.billingCycle}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs mb-2 line-clamp-2">{subscription.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-green-600">
                            ${subscription.price}
                          </div>
                          <div className="text-xs text-gray-600">
                            per {subscription.billingCycle.slice(0, -2)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl ${subscription.color} flex items-center justify-center`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{subscription.name}</h3>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full flex gap-1 text-xs font-semibold ${getStatusColor(subscription.status)}`}>
                                  {getStatusIcon(subscription.status)}
                                  <span className="ml-1 capitalize">{subscription.status}</span>
                                </span>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                  {subscription.billingCycle}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{subscription.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Started {subscription.startDate.toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>Next billing {subscription.nextBillingDate.toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            ${subscription.price}
                          </div>
                          <div className="text-sm text-gray-600">
                            per {subscription.billingCycle.slice(0, -2)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 sm:space-y-4 pt-4 border-t border-gray-100">
                      {/* Features */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">Features:</h4>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {subscription.features.map((feature, idx) => (
                            <span key={idx} className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Auto-renewal Toggle */}
                      <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900">Auto-renewal</div>
                          <div className="text-xs text-gray-500">
                            {subscription.autoRenew ? 'Subscription will auto-renew' : 'Subscription will not auto-renew'}
                          </div>
                        </div>
                        <Switch
                          checked={subscription.autoRenew}
                          onCheckedChange={() => handleToggleAutoRenew(subscription.id)}
                        />
                      </div>

                      {/* Mobile Actions */}
                      <div className="sm:hidden space-y-2">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-900 flex-1 text-xs">
                            <Download className="h-3 w-3 mr-1" />
                            Invoice
                          </Button>
                          <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-900 flex-1 text-xs">
                            <CreditCard className="h-3 w-3 mr-1" />
                            Payment
                          </Button>
                        </div>
                        {subscription.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelSubscription(subscription.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 w-full text-xs"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Cancel Subscription
                          </Button>
                        )}
                      </div>

                      {/* Desktop Actions */}
                      <div className="hidden sm:flex items-center justify-between">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-900">
                            <Download className="h-4 w-4 mr-1" />
                            Download Invoice
                          </Button>
                          <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-900">
                            <CreditCard className="h-4 w-4 mr-1" />
                            Update Payment
                          </Button>
                        </div>
                        {subscription.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelSubscription(subscription.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 sm:hidden z-50">
        <Button
          onClick={() => setShowAddServiceModal(true)}
          className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-auto overflow-hidden shadow-2xl"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Plus className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Add New Service</h2>
                    <p className="text-green-50 text-sm">Request a new subscription (requires approval)</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Property Info */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Property</p>
                    <p className="text-sm text-gray-600">1200 Autumn Willow Dr, Austin, TX 78745 • Apt 205</p>
                  </div>
                </div>
              </div>

              {/* Service Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name *
                </label>
                <Input
                  placeholder="e.g., Covered Parking Spot, Gym Membership, High-Speed Internet"
                  value={newService.name}
                  onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">Enter a descriptive name for your service</p>
              </div>

              {/* Service Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  value={newService.type}
                  onChange={(e) => setNewService(prev => ({ ...prev, type: e.target.value as 'parking' | 'amenities' | 'utilities' }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="parking">Parking</option>
                  <option value="amenities">Amenities</option>
                  <option value="utilities">Utilities</option>
                </select>
                <p className="text-xs text-gray-500">Select the category that best describes your service</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  placeholder="Describe what this service includes and any important details..."
                  value={newService.description}
                  onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">Provide details about what's included in this service</p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Features
                </label>
                
                {/* Suggested Features */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Suggested features for {newService.type}:</p>
                  <div className="flex flex-wrap gap-2">
                    {getFeatureSuggestions(newService.type).map((suggestion, index) => {
                      const IconComponent = suggestion.icon;
                      const isAdded = newService.features.includes(suggestion.text);
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => addSuggestedFeature(suggestion.text)}
                          disabled={isAdded}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isAdded 
                              ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                              : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700 border border-gray-200 hover:border-green-300'
                          }`}
                        >
                          <IconComponent className="h-4 w-4" />
                          <span>{suggestion.text}</span>
                          {isAdded && <CheckCircle className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Add Custom Feature Input */}
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Or add a custom feature:</p>
                  <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom feature..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                    <Button
                      type="button"
                      onClick={addFeature}
                      disabled={!newFeature.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white px-4"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Features List */}
                {newService.features.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Selected features ({newService.features.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {newService.features.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium border border-green-200"
                        >
                          <Star className="h-4 w-4" />
                          <span>{feature}</span>
                          <button
                            type="button"
                            onClick={() => removeFeature(feature)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Features help describe what's included with your service subscription
                </p>
              </div>

              {/* Price and Billing Cycle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={newService.price}
                      onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Enter the cost amount</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Billing Cycle *
                  </label>
                  <select
                    value={newService.billingCycle}
                    onChange={(e) => setNewService(prev => ({ ...prev, billingCycle: e.target.value as 'monthly' | 'quarterly' | 'annually' }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly (3 months)</option>
                    <option value="annually">Annually (12 months)</option>
                  </select>
                  <p className="text-xs text-gray-500">How often you'll be charged</p>
                </div>
              </div>

              {/* Provider and Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Provider
                  </label>
                  <Input
                    placeholder="e.g., Building Management, Spectrum, AT&T"
                    value={newService.provider}
                    onChange={(e) => setNewService(prev => ({ ...prev, provider: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">Who provides this service</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Information
                  </label>
                  <Input
                    placeholder="Phone, email, or contact person"
                    value={newService.contactInfo}
                    onChange={(e) => setNewService(prev => ({ ...prev, contactInfo: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">How to reach the provider</p>
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Start Date
                </label>
                <Input
                  type="date"
                  value={newService.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setNewService(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">When this service begins</p>
              </div>

              {/* Auto-renewal Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Auto-renewal</div>
                    <div className="text-xs text-gray-500">
                      Automatically renew this service when it expires
                    </div>
                  </div>
                </div>
                <Switch
                  checked={newService.autoRenew}
                  onCheckedChange={(checked) => setNewService(prev => ({ ...prev, autoRenew: checked }))}
                />
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <Textarea
                  placeholder="Any additional information, terms, or special instructions..."
                  value={newService.notes}
                  onChange={(e) => setNewService(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">Optional notes or special terms</p>
              </div>

              {/* Info Panel */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                    <AlertTriangle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Approval Process</p>
                    <p className="text-sm text-blue-700">
                      Your service request will be reviewed by property management. Once approved, 
                      it will be added to your active subscriptions and billing will begin.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddService}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}