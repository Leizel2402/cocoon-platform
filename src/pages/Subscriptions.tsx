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
  Filter,
  Search
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { useToast } from '../hooks/use-toast';

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
  icon: any;
  color: string;
  features: string[];
}

interface SubscriptionCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  availableCount: number;
  activeCount: number;
}

export function Subscriptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<SubscriptionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'parking' | 'amenities' | 'utilities'>('all');
  const [showNewSubscriptionForm, setShowNewSubscriptionForm] = useState(false);

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

  const totalMonthlyCost = subscriptions
    .filter(s => s.status === 'active' && s.billingCycle === 'monthly')
    .reduce((sum, s) => sum + s.price, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading subscriptions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Subscriptions
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your parking, amenities, and utilities subscriptions
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">${totalMonthlyCost}</div>
              <div className="text-sm text-gray-600">Monthly Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Overview */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setFilterType(category.id as any)}
              >
                <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{category.availableCount} available</span>
                  <span className="text-green-600 font-medium">{category.activeCount} active</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search subscriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-200"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Subscriptions' },
                { key: 'parking', label: 'Parking' },
                { key: 'amenities', label: 'Amenities' },
                { key: 'utilities', label: 'Utilities' }
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={filterType === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(filter.key as any)}
                  className={filterType === filter.key 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "border-gray-200 hover:bg-green-50"
                  }
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Settings className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchTerm ? 'No subscriptions found' : 'No subscriptions yet'}
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Add subscriptions to manage your parking, amenities, and utilities'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowNewSubscriptionForm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Subscription
              </Button>
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
                  <Card className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg ${subscription.color} flex items-center justify-center`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{subscription.name}</CardTitle>
                            <p className="text-gray-600 text-sm mb-3">{subscription.description}</p>
                            <div className="flex items-center gap-2 mb-3">
                              <Badge className={getStatusColor(subscription.status)}>
                                {getStatusIcon(subscription.status)}
                                <span className="ml-1 capitalize">{subscription.status}</span>
                              </Badge>
                              <Badge variant="outline" className="bg-gray-50">
                                {subscription.billingCycle}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
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
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Features */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
                          <div className="flex flex-wrap gap-2">
                            {subscription.features.map((feature, idx) => (
                              <Badge key={idx} variant="outline" className="bg-gray-50 text-gray-700">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Auto-renewal Toggle */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Auto-renewal</div>
                            <div className="text-xs text-gray-500">
                              {subscription.autoRenew ? 'Subscription will auto-renew' : 'Subscription will not auto-renew'}
                            </div>
                          </div>
                          <Switch
                            checked={subscription.autoRenew}
                            onCheckedChange={() => handleToggleAutoRenew(subscription.id)}
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download Invoice
                            </Button>
                            <Button variant="outline" size="sm">
                              <CreditCard className="h-4 w-4 mr-1" />
                              Update Payment
                            </Button>
                          </div>
                          {subscription.status === 'active' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelSubscription(subscription.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}