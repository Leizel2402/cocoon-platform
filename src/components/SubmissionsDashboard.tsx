import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/Button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Eye,
  Download,
  DollarSign
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { getTourBookings, getApplications, updateTourBookingStatus, updateApplicationStatus } from '../services/submissionService';
import { getApplicationDocuments, DocumentUpload, formatFileSize, getFileTypeIcon } from '../services/documentService';
import { format } from 'date-fns';

interface SubmissionsDashboardProps {
  userRole: 'landlord' | 'staff' | 'employee';
  userId?: string;
}

const SubmissionsDashboard: React.FC<SubmissionsDashboardProps> = ({ userRole, userId }) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'tours'>('applications');
  const [applications, setApplications] = useState<any[]>([]);
  const [tourBookings, setTourBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [applicationDocuments, setApplicationDocuments] = useState<DocumentUpload[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appsResult, toursResult] = await Promise.all([
        getApplications(userId),
        getTourBookings(userId)
      ]);

      if (appsResult.success) {
        setApplications(appsResult.data);
      }
      if (toursResult.success) {
        setTourBookings(toursResult.data);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast({
        title: "Error Loading Data",
        description: "Failed to load submissions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationDocuments = async (applicationId: string) => {
    setLoadingDocuments(true);
    try {
      const result = await getApplicationDocuments(applicationId);
      if (result.success && result.documents) {
        setApplicationDocuments(result.documents);
      } else {
        setApplicationDocuments([]);
        toast({
          title: "No Documents",
          description: "No documents found for this application",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load application documents",
        variant: "destructive"
      });
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleViewDocuments = (application: any) => {
    setSelectedApplication(application);
    loadApplicationDocuments(application.id);
  };

  const handleStatusUpdate = async (type: 'application' | 'tour', id: string, newStatus: string) => {
    try {
      let result;
      if (type === 'application') {
        result = await updateApplicationStatus(id, newStatus as any);
      } else {
        result = await updateTourBookingStatus(id, newStatus as any);
      }

      if (result.success) {
        toast({
          title: "Status Updated",
          description: `${type === 'application' ? 'Application' : 'Tour booking'} status updated successfully.`,
        });
        loadData(); // Reload data
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.propertyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredTours = tourBookings.filter(tour => {
    const matchesSearch = 
      tour.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.propertyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tour.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {userRole === 'landlord' ? 'Property Management' : 'Cocoon Staff'} Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage applications and tour bookings
          </p>
        </div>
        <Button onClick={loadData} variant="outline">
          <Clock className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'applications'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('tours')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'tours'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tour Bookings ({tourBookings.length})
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or property..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                <p className="text-gray-500">No applications match your current filters.</p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((app) => (
              <Card key={app.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {app.firstName} {app.lastName}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {app.propertyName} - Unit {app.unitNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(app.status)}>
                        {app.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDocuments(app)}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        View Documents
                      </Button>
                      <Select
                        value={app.status}
                        onValueChange={(value) => handleStatusUpdate('application', app.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="withdrawn">Withdrawn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {app.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {app.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Annual Income: ${app.annualIncome?.toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="h-4 w-4 mr-2" />
                        {app.employer}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {app.city}, {app.state}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Submitted: {app.submittedAt ? format(app.submittedAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {app.hasPets && (
                        <div className="flex items-center text-sm text-gray-600">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Has Pets: {app.petDetails}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        Emergency: {app.emergencyContactName}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {app.emergencyContactPhone}
                      </div>
                    </div>
                  </div>
                  {app.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {app.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tours Tab */}
      {activeTab === 'tours' && (
        <div className="space-y-4">
          {filteredTours.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Tour Bookings Found</h3>
                <p className="text-gray-500">No tour bookings match your current filters.</p>
              </CardContent>
            </Card>
          ) : (
            filteredTours.map((tour) => (
              <Card key={tour.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {tour.firstName} {tour.lastName}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {tour.propertyName} - Unit {tour.unitNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(tour.status)}>
                        {tour.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Select
                        value={tour.status}
                        onValueChange={(value) => handleStatusUpdate('tour', tour.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {tour.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {tour.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Preferred Date: {format(new Date(tour.preferredDate), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Move-in Date: {format(new Date(tour.moveInDate), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Submitted: {tour.submittedAt ? format(tour.submittedAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    </div>
                  </div>
                  {tour.apartmentPreferences && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Preferences:</strong> {tour.apartmentPreferences}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                Documents for {selectedApplication.firstName} {selectedApplication.lastName}
              </h2>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedApplication(null);
                  setApplicationDocuments([]);
                }}
              >
                Close
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {loadingDocuments ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading documents...</p>
                </div>
              ) : applicationDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No documents found for this application.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group documents by category */}
                  {['id', 'payStubs', 'bankStatements', 'taxReturns', 'references', 'other'].map((category) => {
                    const categoryDocs = applicationDocuments.filter(doc => doc.category === category);
                    if (categoryDocs.length === 0) return null;
                    
                    const categoryLabels = {
                      id: 'Government ID',
                      payStubs: 'Pay Stubs',
                      bankStatements: 'Bank Statements',
                      taxReturns: 'Tax Returns',
                      references: 'References',
                      other: 'Additional Documents'
                    };
                    
                    return (
                      <div key={category} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-4 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-green-600" />
                          {categoryLabels[category as keyof typeof categoryLabels]}
                          <span className="ml-2 text-sm text-gray-500">({categoryDocs.length} files)</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {categoryDocs.map((doc) => (
                            <div key={doc.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center mb-2">
                                    <span className="text-2xl mr-2">{getFileTypeIcon(doc.type)}</span>
                                    <div>
                                      <p className="font-medium text-sm">{doc.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {formatFileSize(doc.size)} • {format(doc.uploadedAt, 'MMM dd, yyyy')}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(doc.url, '_blank')}
                                    className="flex items-center gap-1"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = doc.url;
                                      link.download = doc.name;
                                      link.click();
                                    }}
                                    className="flex items-center gap-1"
                                  >
                                    <Download className="h-4 w-4" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsDashboard;
