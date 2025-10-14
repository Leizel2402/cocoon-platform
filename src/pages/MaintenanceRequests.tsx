import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Calendar,
  MapPin,
  Search,
  Eye,
  MessageSquare,
  Loader2,
  Phone,
  X,
  ChevronDown,
  Upload,
  Zap,
  Home,
  Building,
  Settings,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'submitted' | 'in_progress' | 'completed' | 'cancelled';
  images: File[];
  submittedAt: Date;
  scheduledDate?: Date;
  completedDate?: Date;
  notes?: string;
  propertyAddress: string;
  unitNumber?: string;
}

export function MaintenanceRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'in_progress' | 'completed'>('all');
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  // Form state
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: 'other' as MaintenanceRequest['category'],
    priority: 'medium' as MaintenanceRequest['priority'],
    images: [] as File[]
  });

  // Cleanup image URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviewUrls]);

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

  // Image upload handlers
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newFiles = [...uploadedImages, ...files].slice(0, 5); // Max 5 images
      setUploadedImages(newFiles);
      
      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(newPreviewUrls);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = uploadedImages.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
    setUploadedImages(newFiles);
    setImagePreviewUrls(newPreviewUrls);
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
      images: uploadedImages,
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
    setUploadedImages([]);
    setImagePreviewUrls([]);
    setShowNewRequestForm(false);

    toast({
      title: "Request submitted",
      description: "Your maintenance request has been submitted successfully.",
    });
  };

  // Custom Select Component
  const CustomSelect = ({ 
    value, 
    onChange, 
    options, 
    placeholder 
  }: { 
    value: string; 
    onChange: (value: string) => void; 
    options: { value: string; label: string; icon?: React.ReactNode }[]; 
    placeholder: string; 
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.value === value);

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-green-200 bg-white text-left flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            {selectedOption?.icon}
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
              {selectedOption?.label || placeholder}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full p-3 text-left hover:bg-gray-50 flex items-center space-x-2 first:rounded-t-xl last:rounded-b-xl"
              >
                {option.icon}
                <span className="text-gray-900">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading maintenance requests...</p>
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
                  <Wrench className="h-6 w-6 text-green-600" />
                </div>
              {/* <button 
                onClick={() => navigate('/portal')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button> */}
            <div>
                <h1 className="text-2xl font-bold">Maintenance Requests</h1>
                <p className="text-sm text-green-50">
                Submit and track maintenance requests for your property
              </p>
            </div>
            </div>
            <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowNewRequestForm(true)}
                className="bg-white text-green-600 hover:bg-green-50 font-semibold transition-all duration-200 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>
      </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wrench className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-blue-600">
                  {requests.filter(r => r.status === 'submitted').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div> */}

      {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
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
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', count: requests.length },
                { key: 'submitted', label: 'Submitted', count: requests.filter(r => r.status === 'submitted').length },
                { key: 'in_progress', label: 'In Progress', count: requests.filter(r => r.status === 'in_progress').length },
                { key: 'completed', label: 'Completed', count: requests.filter(r => r.status === 'completed').length }
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={filterStatus === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(filter.key as 'all' | 'submitted' | 'in_progress' | 'completed')}
                  className={filterStatus === filter.key 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "border-gray-200 hover:bg-green-50 text-gray-700"
                  }
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

      {/* New Request Form Modal */}
      {showNewRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Submit Maintenance Request</h2>
                    <p className="text-green-50 text-sm">Report an issue with your property</p>
                  </div>
                </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewRequestForm(false)}
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
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
              <div>
                    <p className="text-sm font-medium text-gray-900">Property</p>
                    <p className="text-sm text-gray-600">1200 Autumn Willow Dr, Austin, TX 78745 • Apt 205</p>
                  </div>
                </div>
              </div>

              {/* Title Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Title *
                </label>
                <Input
                  placeholder="e.g., Kitchen sink is leaking"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">Brief description of the problem</p>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <Textarea
                  placeholder="Please provide as much detail as possible about the issue..."
                  value={newRequest.description}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500">Include when the issue started, how often it occurs, etc.</p>
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <CustomSelect
                    value={newRequest.category}
                    onChange={(value) => setNewRequest(prev => ({ ...prev, category: value as MaintenanceRequest['category'] }))}
                    placeholder="Select category"
                    options={[
                      { value: 'plumbing', label: 'Plumbing', icon: <Wrench className="h-4 w-4 text-blue-600" /> },
                      { value: 'electrical', label: 'Electrical', icon: <Zap className="h-4 w-4 text-yellow-600" /> },
                      { value: 'hvac', label: 'HVAC', icon: <Settings className="h-4 w-4 text-gray-600" /> },
                      { value: 'appliance', label: 'Appliance', icon: <Home className="h-4 w-4 text-green-600" /> },
                      { value: 'structural', label: 'Structural', icon: <Building className="h-4 w-4 text-orange-600" /> },
                      { value: 'other', label: 'Other', icon: <FileText className="h-4 w-4 text-gray-600" /> }
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <CustomSelect
                    value={newRequest.priority}
                    onChange={(value) => setNewRequest(prev => ({ ...prev, priority: value as MaintenanceRequest['priority'] }))}
                    placeholder="Select priority"
                    options={[
                      { value: 'low', label: 'Low - Can wait a few days', icon: <div className="w-3 h-3 bg-green-500 rounded-full" /> },
                      { value: 'medium', label: 'Medium - Should be fixed soon', icon: <div className="w-3 h-3 bg-yellow-500 rounded-full" /> },
                      { value: 'high', label: 'High - Needs attention this week', icon: <div className="w-3 h-3 bg-orange-500 rounded-full" /> },
                      { value: 'emergency', label: 'Emergency - Immediate attention needed', icon: <div className="w-3 h-3 bg-red-500 rounded-full" /> }
                    ]}
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos (Optional)
                </label>
                
                {/* Upload Area */}
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 hover:bg-green-50 transition-colors">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-1">Upload photos of the issue</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 10MB each (Max 5 photos)</p>
                    <p className="text-xs text-gray-400 mt-2">Click to select files</p>
                  </div>
                </div>

                {/* Image Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Upload preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-blue-600 text-xs font-bold">i</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">What happens next?</p>
                    <p className="text-sm text-blue-700">
                      Your request will be reviewed by our maintenance team. You'll receive updates via email and can track progress in your portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowNewRequestForm(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitRequest}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Submit Request
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Requests List */}
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
                className="bg-green-600 hover:bg-green-700 text-white"
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                     onClick={() => setSelectedRequest(request)}>
                  <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{request.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1  flex rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(request.priority)}`}>
                            {request.priority} priority
                          </span>
                        </div>
                        </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{request.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{request.propertyAddress} {request.unitNumber}</span>
                        </div>
                      </div>
                    <div className="text-right text-sm text-gray-500 ml-4">
                      <div className="flex items-center justify-end mb-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Submitted {request.submittedAt.toLocaleDateString()}</span>
                        </div>
                        {request.scheduledDate && (
                        <div className="flex items-center justify-end">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>Scheduled {request.scheduledDate.toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        <Wrench className="h-3 w-3 mr-1 inline" />
                          {request.category}
                      </span>
                      </div>
                      <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRequest(request);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-gray-600 hover:text-gray-900"
                      >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Add Note
                        </Button>
                      </div>
                    </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">Request Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRequest(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{selectedRequest.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs flex gap-1 font-semibold ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusIcon(selectedRequest.status)}
                    <span className="ml-1 capitalize">{selectedRequest.status.replace('_', ' ')}</span>
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(selectedRequest.priority)}`}>
                    {selectedRequest.priority} priority
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedRequest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Category</h4>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {selectedRequest.category}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Property</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{selectedRequest.propertyAddress} {selectedRequest.unitNumber}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Submitted</h4>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{selectedRequest.submittedAt.toLocaleDateString()}</span>
                  </div>
                </div>
                {selectedRequest.scheduledDate && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Scheduled</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{selectedRequest.scheduledDate.toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {selectedRequest.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                  <p className="text-gray-700">{selectedRequest.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Manager
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
