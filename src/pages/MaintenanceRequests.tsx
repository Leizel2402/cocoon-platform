import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Calendar,
  Camera,
  FileText,
  MapPin,
  Filter,
  Search,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'submitted' | 'in_progress' | 'completed' | 'cancelled';
  images: string[];
  submittedAt: Date;
  scheduledDate?: Date;
  completedDate?: Date;
  notes?: string;
  propertyAddress: string;
  unitNumber?: string;
}

export function MaintenanceRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'in_progress' | 'completed'>('all');

  // Form state
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: 'other' as MaintenanceRequest['category'],
    priority: 'medium' as MaintenanceRequest['priority'],
    images: [] as File[]
  });

  // Mock data - in real app, this would come from Firebase
  useEffect(() => {
    const mockRequests: MaintenanceRequest[] = [
      {
        id: '1',
        title: 'Kitchen Sink Leak',
        description: 'The kitchen sink has been dripping for the past few days. Water is pooling under the sink.',
        category: 'plumbing',
        priority: 'medium',
        status: 'in_progress',
        images: [],
        submittedAt: new Date('2024-01-15'),
        scheduledDate: new Date('2024-01-20'),
        propertyAddress: '1200 Autumn Willow Dr, Austin, TX 78745',
        unitNumber: 'Apt 205'
      },
      {
        id: '2',
        title: 'Broken Light Switch',
        description: 'The light switch in the living room is not working properly. Sometimes it works, sometimes it doesn\'t.',
        category: 'electrical',
        priority: 'low',
        status: 'submitted',
        images: [],
        submittedAt: new Date('2024-01-18'),
        propertyAddress: '1200 Autumn Willow Dr, Austin, TX 78745',
        unitNumber: 'Apt 205'
      },
      {
        id: '3',
        title: 'AC Not Cooling',
        description: 'The air conditioning unit is not cooling the apartment properly. It\'s been running but not getting cold.',
        category: 'hvac',
        priority: 'high',
        status: 'completed',
        images: [],
        submittedAt: new Date('2024-01-10'),
        completedDate: new Date('2024-01-12'),
        propertyAddress: '1200 Autumn Willow Dr, Austin, TX 78745',
        unitNumber: 'Apt 205'
      }
    ];

    setTimeout(() => {
      setRequests(mockRequests);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityColor = (priority: MaintenanceRequest['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
    }
  };

  const handleSubmitRequest = () => {
    if (!newRequest.title || !newRequest.description) {
      toast({
        title: "Missing information",
        description: "Please fill in the title and description.",
        variant: "destructive"
      });
      return;
    }

    const request: MaintenanceRequest = {
      id: Date.now().toString(),
      ...newRequest,
      status: 'submitted',
      images: [],
      submittedAt: new Date(),
      propertyAddress: '1200 Autumn Willow Dr, Austin, TX 78745',
      unitNumber: 'Apt 205'
    };

    setRequests(prev => [request, ...prev]);
    setNewRequest({
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      images: []
    });
    setShowNewRequestForm(false);

    toast({
      title: "Request submitted",
      description: "Your maintenance request has been submitted successfully.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading maintenance requests...</p>
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
                Maintenance Requests
              </h1>
              <p className="text-gray-600 mt-2">
                Submit and track maintenance requests for your property
              </p>
            </div>
            <Button
              onClick={() => setShowNewRequestForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
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
                  placeholder="Search maintenance requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-200"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Requests' },
                { key: 'submitted', label: 'Submitted' },
                { key: 'in_progress', label: 'In Progress' },
                { key: 'completed', label: 'Completed' }
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={filterStatus === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(filter.key as any)}
                  className={filterStatus === filter.key 
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

      {/* New Request Form Modal */}
      {showNewRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Submit Maintenance Request</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewRequestForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  placeholder="Brief description of the issue"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <Textarea
                  placeholder="Detailed description of the problem..."
                  value={newRequest.description}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newRequest.category}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-green-200"
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="hvac">HVAC</option>
                    <option value="appliance">Appliance</option>
                    <option value="structural">Structural</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-green-200"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload photos</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <Button
                variant="outline"
                onClick={() => setShowNewRequestForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRequest}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Wrench className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchTerm ? 'No requests found' : 'No maintenance requests yet'}
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Submit your first maintenance request to get started'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowNewRequestForm(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{request.title}</CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                          </Badge>
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority} priority
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{request.propertyAddress} {request.unitNumber}</span>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Submitted {request.submittedAt.toLocaleDateString()}</span>
                        </div>
                        {request.scheduledDate && (
                          <div className="flex items-center mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Scheduled {request.scheduledDate.toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{request.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-gray-50">
                          <Wrench className="h-3 w-3 mr-1" />
                          {request.category}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Add Note
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
