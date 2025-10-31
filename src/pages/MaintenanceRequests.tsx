import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
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
  FileText,
  Shield,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { maintenanceService, MaintenanceRequest } from '../services/maintenanceService';
import { getUserApprovedApplications, UserApplication } from '../services/userDataService';
import { landlordService, LandlordContactInfo } from '../services/landlordService';
import { notificationService } from '../services/notificationService';
import { Loader } from '../components/ui/Loader';

// Using MaintenanceRequest interface from maintenanceService

export function MaintenanceRequests() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'in_progress' | 'completed'>('all');
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [approvedApplications, setApprovedApplications] = useState<UserApplication[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<UserApplication | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [landlordContactInfo, setLandlordContactInfo] = useState<LandlordContactInfo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<MaintenanceRequest | null>(null);
// console.log("uploadedImages",uploadedImages);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest('.property-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Fetch landlord contact info when a request is selected
  const fetchLandlordContactInfo = useCallback(async (landlordId: string) => {
    try {
      const contactInfo = await landlordService.getLandlordContactInfo(landlordId);
      setLandlordContactInfo(contactInfo);
    } catch (error) {
      console.error('Error fetching landlord contact info:', error);
      toast({
        title: "Error",
        description: "Failed to load landlord contact information.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Handle Contact Manager button click
  const handleContactManager = () => {
    if (landlordContactInfo?.phone) {
      // Open phone dialer
      window.open(`tel:${landlordContactInfo.phone}`, '_self');
    } else if (landlordContactInfo?.email) {
      // Open email client
      window.open(`mailto:${landlordContactInfo.email}`, '_self');
    } else {
      toast({
        title: "Contact Information Unavailable",
        description: "Landlord contact information is not available for this property.",
        variant: "destructive"
      });
    }
  };

  // Handle Delete/Cancel Button Click
  const handleDeleteOrCancelClick = (request: MaintenanceRequest, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    setRequestToDelete(request);
    
    if (request.status === 'submitted' || request.status === 'completed' || request.status === 'cancelled') {
      setShowDeleteConfirm(true);
    } else if (request.status === 'in_progress') {
      setShowCancelModal(true);
    } else {
      toast({
        title: "Cannot Cancel",
        description: "Only submitted or in-progress requests can be deleted or cancelled.",
        variant: "destructive"
      });
    }
  };

  // Handle Delete Confirmation (for submitted/completed/cancelled requests)
  const handleConfirmDelete = async () => {
    if (!requestToDelete || !user) return;

    const request = requestToDelete;
    setIsDeleting(true);

    try {
      // Delete the request (pass userId for verification)
      const result = await maintenanceService.deleteMaintenanceRequest(request.id, user.uid);
      
      if (result.success) {
        // Remove from local state immediately
        setRequests(prev => prev.filter(r => r.id !== request.id));
        
        // Close modals
        setShowDeleteConfirm(false);
        setRequestToDelete(null);
        if (selectedRequest?.id === request.id) {
          setSelectedRequest(null);
          setLandlordContactInfo(null);
        }

        // Only notify landlord if it was a submitted request
        // Completed/cancelled requests don't need notification on deletion
        if (request.status === 'submitted') {
          try {
            // Notify landlord about deletion of submitted request
            await notificationService.notifyLandlordMaintenanceRequestDeleted(
              request.landlordId,
              request.id,
              request.propertyId,
              request.propertyAddress || 'Property',
              user.displayName || user.email?.split('@')[0] || 'Tenant',
              request.title
            );
          } catch (notificationError) {
            console.error('Error sending landlord notification:', notificationError);
            // Don't fail the deletion if notification fails
          }
        }

        toast({
          title: "Request Deleted",
          description: "Your maintenance request has been deleted successfully.",
        });
      } else {
        throw new Error(result.error || 'Failed to delete request');
      }
    } catch (error) {
      console.error('Error deleting maintenance request:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete maintenance request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Cancel Confirmation (for in_progress requests)
  const handleConfirmCancel = async () => {
    if (!requestToDelete || !user || !cancellationReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for cancelling the maintenance request.",
        variant: "destructive"
      });
      return;
    }

    const request = requestToDelete;
    setIsCancelling(true);

    try {
      // Cancel the request with reason
      const result = await maintenanceService.cancelMaintenanceRequest(
        request.id,
        user.uid,
        cancellationReason.trim()
      );
      
      if (result.success) {
        // Update local state
        setRequests(prev => 
          prev.map(r => 
            r.id === request.id 
              ? { ...r, status: 'cancelled' as const }
              : r
          )
        );

        // Close modals and reset form
        setShowCancelModal(false);
        setCancellationReason('');
        setRequestToDelete(null);
        if (selectedRequest?.id === request.id) {
          setSelectedRequest(prev => prev ? { ...prev, status: 'cancelled' as const } : null);
        }

        // Notify landlord about cancellation with reason
        try {
          await notificationService.notifyLandlordMaintenanceRequestCancelledByTenant(
            request.landlordId,
            request.id,
            request.propertyId,
            request.propertyAddress || 'Property',
            user.displayName || user.email?.split('@')[0] || 'Tenant',
            request.title,
            cancellationReason.trim()
          );
        } catch (notificationError) {
          console.error('Error sending landlord notification:', notificationError);
          // Don't fail the cancellation if notification fails
        }

        toast({
          title: "Request Cancelled",
          description: "Your maintenance request has been cancelled and the landlord has been notified.",
        });
      } else {
        throw new Error(result.error || 'Failed to cancel request');
      }
    } catch (error) {
      console.error('Error cancelling maintenance request:', error);
      toast({
        title: "Cancel Failed",
        description: error instanceof Error ? error.message : "Failed to cancel maintenance request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // Fetch maintenance requests from Firebase
  const fetchRequests = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userRequests = await maintenanceService.getMaintenanceRequestsByTenant(user.uid);
      setRequests(userRequests);
      
      console.log("userRequests",userRequests);
      
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      toast({
        title: "Error",
        description: "Failed to load maintenance requests. Please try again.",
        variant: "destructive"
      });
    } finally {
    setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Fetch approved applications for property selection
  useEffect(() => {
    const loadApprovedApplications = async () => {
      if (!user) return;
      
      try {
        const applications = await getUserApprovedApplications(user.uid);
        setApprovedApplications(applications);
        
        // Auto-select first property if only one is available
        if (applications.length === 1) {
          setSelectedProperty(applications[0]);
        }
      } catch (error) {
        console.error('Error loading approved applications:', error);
        toast({
          title: "Error",
          description: "Failed to load your approved properties.",
          variant: "destructive"
        });
      }
    };

    loadApprovedApplications();
  }, [user, toast]);

  // Fetch landlord contact info when a request is selected
  useEffect(() => {
    if (selectedRequest?.landlordId) {
      fetchLandlordContactInfo(selectedRequest.landlordId);
    }
  }, [selectedRequest, fetchLandlordContactInfo]);

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

  const handleSubmitRequest = async () => {
    if (!newRequest.title || !newRequest.description) {
      toast({
        title: "Missing information",
        description: "Please fill in the title and description.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.uid) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a maintenance request.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedProperty) {
      toast({
        title: "Property selection required",
        description: "Please select a property for this maintenance request.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
console.log("selectedProperty",selectedProperty);

      // For now, we'll store image URLs as empty array
      // In a real implementation, you'd upload images to Firebase Storage first

      const requestData = {
        title: newRequest.title,
        description: newRequest.description,
        category: newRequest.category,
        priority: newRequest.priority,
        status: 'submitted' as const,
        images: [], // Will be populated after image upload
        propertyAddress: selectedProperty.propertyName,
        unitNumber: selectedProperty.unitNumber || 'N/A',
        tenantId: user.uid,
        landlordId: selectedProperty.landlordId || 'unknown', // This will be updated when we have landlord info
        propertyId: selectedProperty.propertyId
      };

      const requestId = await maintenanceService.createMaintenanceRequest(requestData);
    
      // Add the new request to the local state
      const newRequestWithId: MaintenanceRequest = {
        id: requestId,
        ...requestData,
        submittedAt: new Date()
      };

      setRequests(prev => [newRequestWithId, ...prev]);
      
      // Reset form
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

    // Refresh the requests list to ensure we have the latest data
    await fetchRequests();

    toast({
      title: "Request submitted",
      description: "Your maintenance request has been submitted successfully.",
    });
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
      toast({
        title: "Error",
        description: "Failed to submit maintenance request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
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
          className="w-full p-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-green-200 bg-white text-left flex items-center justify-between"
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
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
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
      <Loader 
        message="Loading Maintenance Requests" 
        subMessage="Retrieving your maintenance requests..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header Banner */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold">Maintenance Requests</h1>
            </div>
            <Button
              onClick={() => setShowNewRequestForm(true)}
              size="sm"
              className="bg-white text-green-600 hover:bg-green-50 font-semibold transition-all duration-200 shadow-lg"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Wrench className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Maintenance Requests</h1>
                <p className="text-sm text-green-50">
                  Submit and track maintenance requests for your property
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchRequests}
                variant="outline"
                className="border-white text-white hover:bg-white/20 font-semibold transition-all duration-200"
              >
                <Search className="h-4 w-4 mr-2" />
                Refresh
              </Button>
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
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search maintenance requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-200 w-full"
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
                  className={`text-xs sm:text-sm ${filterStatus === filter.key 
                    ? "bg-green-600 hover:bg-green-700 text-white" 
                    : "border-gray-200 hover:bg-green-50 text-gray-700"
                  }`}
                >
                  {filter.label}
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
              {/* Property Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Property *
                </label>
                {approvedApplications.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">No Approved Properties</p>
                        <p className="text-sm text-yellow-700">You need to have an approved application to submit maintenance requests.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative property-dropdown">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full p-4 border border-gray-200 rounded-lg cursor-pointer transition-all hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1 text-left">
                            {selectedProperty ? (
                              <>
                                <p className="text-sm font-medium text-gray-900">{selectedProperty.propertyName}</p>
                                <p className="text-sm text-gray-600">
                                  Unit {selectedProperty.unitNumber || 'N/A'} • Status: {selectedProperty.status}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-gray-500">Select a property...</p>
                            )}
                          </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    
                    {isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {approvedApplications.map((application) => (
                          <div
                            key={application.id}
                            onClick={() => {
                              setSelectedProperty(application);
                              setIsDropdownOpen(false);
                            }}
                            className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                              selectedProperty?.id === application.id ? 'bg-green-50' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                selectedProperty?.id === application.id
                                  ? 'bg-green-100'
                                  : 'bg-gray-100'
                              }`}>
                                <MapPin className={`h-4 w-4 ${
                                  selectedProperty?.id === application.id
                                    ? 'text-green-600'
                                    : 'text-gray-600'
                                }`} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{application.propertyName}</p>
                                <p className="text-sm text-gray-600">
                                  Unit {application.unitNumber || 'N/A'} • Status: {application.status}
                                </p>
                              </div>
                              {selectedProperty?.id === application.id && (
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4 text-white" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 hover:bg-green-50 transition-colors">
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
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
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
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white px-6 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                <Wrench className="h-4 w-4 mr-2" />
                )}
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Wrench className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm ? 'No requests found' : 'No maintenance requests yet'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div 
                  className="bg-white rounded-lg shadow-sm border-l-4 border-r border-t border-b border-gray-200 hover:shadow-md transition-all duration-300 cursor-pointer group overflow-hidden"
                  style={{
                    borderLeftColor: request.status === 'submitted' ? '#3b82f6' :
                                    request.status === 'in_progress' ? '#eab308' :
                                    request.status === 'completed' ? '#22c55e' :
                                    '#ef4444'
                  }}
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="p-5">
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                            {request.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {request.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1.5" />
                            <span>{request.propertyAddress} {request.unitNumber}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1.5" />
                            <span>{request.submittedAt.toLocaleDateString()}</span>
                          </div>
                          {request.scheduledDate && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1.5" />
                              <span>Scheduled: {request.scheduledDate.toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Status and Priority Badges */}
                      <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="capitalize whitespace-nowrap">{request.status.replace('_', ' ')}</span>
                        </span>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getPriorityColor(request.priority)} whitespace-nowrap`}>
                          {request.priority} priority
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row - Category and Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium flex items-center gap-1.5">
                          <Wrench className="h-3.5 w-3.5" />
                          <span className="capitalize">{request.category}</span>
                        </span>
                        {request.images && request.images.length > 0 && (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {request.images.length} {request.images.length === 1 ? 'photo' : 'photos'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {(request.status === 'submitted' || request.status === 'in_progress' || request.status === 'completed' || request.status === 'cancelled') && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => handleDeleteOrCancelClick(request, e)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            {request.status === 'in_progress' ? (
                              <>
                                <XCircle className="h-4 w-4 mr-1.5" />
                                Cancel
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1.5" />
                                Delete
                              </>
                            )}
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRequest(request);
                          }}
                          className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                        >
                          <Eye className="h-4 w-4 mr-1.5" />
                          View Details
                        </Button>
                      </div>
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
        <Dialog open={!!selectedRequest} onOpenChange={() => {
          setSelectedRequest(null);
          setLandlordContactInfo(null);
        }}>
          <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0 bg-gradient-to-br from-green-50 to-blue-50">
            <DialogHeader className="flex-shrink-0 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl mr-4">
                    <Wrench className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-3xl font-bold text-white">
                      {selectedRequest.title}
                    </DialogTitle>
                    <p className="text-green-100 text-lg">
                      Maintenance Request Details
                    </p>
                  </div>
                </div>
                <div className="flex items-center mr-8 space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs flex gap-1 font-semibold ${getStatusColor(selectedRequest.status)}`}>
                    {getStatusIcon(selectedRequest.status)}
                    <span className="ml-1 capitalize">{selectedRequest.status.replace('_', ' ')}</span>
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(selectedRequest.priority)}`}>
                    {selectedRequest.priority} priority
                  </span>
                </div>
              </div>
            </DialogHeader>

            {/* Security Banner */}
            <div className="flex-shrink-0 px-6 py-3 bg-white/90 backdrop-blur-md border-b border-green-200">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">
                  All maintenance request information is secure and verified
                </span>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-green-50 to-blue-50">
              <div className="space-y-6">
                {/* Request Overview */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 text-xl flex items-center ">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Request Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {selectedRequest.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Request Information Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Category & Priority */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-xl flex items-center">
                      <Settings className="h-5 w-5 mr-2 text-green-600" />
                      Request Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Category</span>
                        <span className="text-sm font-bold text-blue-800 capitalize">
                          {selectedRequest.category}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Priority</span>
                        <span className="text-sm font-bold text-yellow-800 capitalize">
                          {selectedRequest.priority}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Status</span>
                        <span className={`text-sm font-bold capitalize ${getStatusColor(selectedRequest.status)}`}>
                          {selectedRequest.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Property & Timeline */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-xl flex items-center">
                      <Home className="h-5 w-5 mr-2 text-blue-600" />
                      Property & Timeline
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Property</span>
                        <div className="flex items-center text-sm font-bold text-blue-800">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{selectedRequest.propertyAddress}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Unit</span>
                        <span className="text-sm font-bold text-green-800">
                          {selectedRequest.unitNumber}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Submitted</span>
                        <div className="flex items-center text-sm font-bold text-purple-800">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{selectedRequest.submittedAt.toLocaleDateString()}</span>
                        </div>
                      </div>
                      {selectedRequest.scheduledDate && (
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600">Scheduled</span>
                          <div className="flex items-center text-sm font-bold text-orange-800">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{selectedRequest.scheduledDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {selectedRequest.notes && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-4 text-xl flex items-center">
                      <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                      Landlord Notes
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {selectedRequest.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Images Section */}
                {selectedRequest.images && selectedRequest.images.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h4 className="font-bold text-gray-800 mb-4 text-xl flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-blue-600" />
                      Attached Images
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedRequest.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative group cursor-pointer hover:scale-105 transition-transform duration-200"
                        >
                          <img
                            src={image}
                            alt={`Maintenance issue ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modern Action Buttons */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <div>
                  {(selectedRequest.status === 'submitted' || selectedRequest.status === 'in_progress' || selectedRequest.status === 'completed' || selectedRequest.status === 'cancelled') && (
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteOrCancelClick(selectedRequest, e);
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {selectedRequest.status === 'in_progress' ? (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Request
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Request
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div className="flex space-x-4">
                  <Button 
                    onClick={handleContactManager}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Landlord 
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedRequest(null);
                      setLandlordContactInfo(null);
                    }}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal (for submitted/completed/cancelled requests) */}
      {showDeleteConfirm && requestToDelete && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Delete Maintenance Request
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this maintenance request? This action cannot be undone.
                {requestToDelete.status === 'submitted' && ' The landlord will be notified.'}
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Request Details:</p>
                <p className="text-sm text-gray-600">{requestToDelete.title}</p>
                <p className="text-sm text-gray-600">Property: {requestToDelete.propertyAddress}</p>
                <p className="text-sm text-gray-600">Status: <span className="capitalize">{requestToDelete.status.replace('_', ' ')}</span></p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setRequestToDelete(null);
                }}
                disabled={isDeleting}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Request
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Cancel with Reason Modal (for in_progress requests) */}
      {showCancelModal && requestToDelete && (
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Cancel Maintenance Request
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 mb-4">
                Since this maintenance request is in progress, please provide a reason for cancellation. The landlord will be notified with your reason.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Request Details:</p>
                <p className="text-sm text-gray-600">{requestToDelete.title}</p>
                <p className="text-sm text-gray-600">Property: {requestToDelete.propertyAddress}</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Please explain why you need to cancel this in-progress maintenance request..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows={4}
                  className="w-full border-gray-300 focus:border-orange-500 focus:ring-orange-200"
                />
                <p className="text-xs text-gray-500">
                  This reason will be sent to the landlord along with the cancellation notification.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancellationReason('');
                  setRequestToDelete(null);
                }}
                disabled={isCancelling}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmCancel}
                disabled={isCancelling || !cancellationReason.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Request
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 sm:hidden z-50">
        <Button
          onClick={() => setShowNewRequestForm(true)}
          className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

    </div>
  );
}
