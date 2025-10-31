import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  MapPin,
  Search,
  Eye,
  Phone,
  Mail,
  Home,
  Building,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { getTourBookingsByUser, TourBookingData, deleteTourBooking, cancelTourBooking } from '../services/submissionService';
import { landlordService, LandlordContactInfo } from '../services/landlordService';
import { notificationService } from '../services/notificationService';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader } from '../components/ui/Loader';

export function TourBookings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<(TourBookingData & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [selectedBooking, setSelectedBooking] = useState<(TourBookingData & { id: string }) | null>(null);
  const [landlordContactInfo, setLandlordContactInfo] = useState<LandlordContactInfo | null>(null);
  const [loadingLandlordInfo, setLoadingLandlordInfo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<(TourBookingData & { id: string }) | null>(null);

  // Fetch tour bookings from Firebase
  const fetchBookings = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userBookings = await getTourBookingsByUser(user.uid);
      setBookings(userBookings);
    } catch (error) {
      console.error('Error fetching tour bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load tour bookings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Fetch landlord contact info when a booking is selected
  const fetchLandlordContactInfo = useCallback(async (propertyId: string) => {
    if (!propertyId || propertyId === 'general-tour') {
      setLandlordContactInfo(null);
      return;
    }

    try {
      setLoadingLandlordInfo(true);
      // Get property to find landlordId
      const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
      if (propertyDoc.exists()) {
        const propertyData = propertyDoc.data();
        const landlordId = propertyData.landlordId;
        
        if (landlordId) {
          const contactInfo = await landlordService.getLandlordContactInfo(landlordId);
          setLandlordContactInfo(contactInfo);
        } else {
          setLandlordContactInfo(null);
        }
      } else {
        setLandlordContactInfo(null);
      }
    } catch (error) {
      console.error('Error fetching landlord contact info:', error);
      setLandlordContactInfo(null);
    } finally {
      setLoadingLandlordInfo(false);
    }
  }, []);

  // Fetch landlord info when booking is selected
  useEffect(() => {
    if (selectedBooking?.propertyId) {
      fetchLandlordContactInfo(selectedBooking.propertyId);
    } else {
      setLandlordContactInfo(null);
    }
  }, [selectedBooking, fetchLandlordContactInfo]);

  // Handle Contact Landlord button click
  const handleContactLandlord = () => {
    if (landlordContactInfo?.phone) {
      window.open(`tel:${landlordContactInfo.phone}`, '_self');
    } else if (landlordContactInfo?.email) {
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
  const handleDeleteOrCancelClick = (booking: TourBookingData & { id: string }, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    setBookingToDelete(booking);
    
    if (booking.status === 'pending') {
      setShowDeleteConfirm(true);
    } else if (booking.status === 'confirmed') {
      setShowCancelModal(true);
    } else if (booking.status === 'cancelled' || booking.status === 'completed') {
      // Allow deletion of cancelled or completed bookings
      setShowDeleteConfirm(true);
    } else {
      toast({
        title: "Cannot Cancel",
        description: "Only pending or confirmed bookings can be cancelled.",
        variant: "destructive"
      });
    }
  };

  // Handle Delete Confirmation (for pending, cancelled, or completed bookings)
  const handleConfirmDelete = async () => {
    if (!bookingToDelete || !user) return;

    const booking = bookingToDelete;
    setIsDeleting(true);

    try {
      // Delete the booking (pass userId for verification)
      const result = await deleteTourBooking(booking.id, user.uid);
      
      if (result.success) {
        // Remove from local state immediately
        setBookings(prev => prev.filter(b => b.id !== booking.id));
        
        // Close modals
        setShowDeleteConfirm(false);
        setBookingToDelete(null);
        if (selectedBooking?.id === booking.id) {
          setSelectedBooking(null);
          setLandlordContactInfo(null);
        }

        // Only notify landlord if it was a pending booking
        // Cancelled/completed bookings don't need notification on deletion
        if (booking.status === 'pending') {
          try {
            const propertyDoc = await getDoc(doc(db, 'properties', booking.propertyId));
            if (propertyDoc.exists()) {
              const propertyData = propertyDoc.data();
              const landlordId = propertyData.landlordId;
              
              if (landlordId) {
                // Notify landlord about deletion of pending booking
                await notificationService.notifyLandlordTourBookingDeleted(
                  landlordId,
                  booking.id,
                  booking.propertyId,
                  booking.propertyName || 'Property',
                  `${booking.firstName} ${booking.lastName}`.trim(),
                  booking.preferredDate,
                  booking.unitNumber || null
                );
              }
            }
          } catch (notificationError) {
            console.error('Error sending landlord notification:', notificationError);
            // Don't fail the deletion if notification fails
          }
        }

        toast({
          title: "Booking Deleted",
          description: "Your tour booking request has been deleted successfully.",
        });
      } else {
        throw new Error(result.error || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting tour booking:', error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete tour booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Cancel Confirmation (for confirmed bookings)
  const handleConfirmCancel = async () => {
    if (!bookingToDelete || !user || !cancellationReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for cancelling the tour booking.",
        variant: "destructive"
      });
      return;
    }

    const booking = bookingToDelete;
    setIsCancelling(true);

    try {
      // Cancel the booking with reason
      const result = await cancelTourBooking(booking.id, cancellationReason.trim());
      
      if (result.success) {
        // Update local state
        setBookings(prev => 
          prev.map(b => 
            b.id === booking.id 
              ? { ...b, status: 'cancelled' as const }
              : b
          )
        );

        // Close modals and reset form
        setShowCancelModal(false);
        setCancellationReason('');
        setBookingToDelete(null);
        if (selectedBooking?.id === booking.id) {
          setSelectedBooking(prev => prev ? { ...prev, status: 'cancelled' as const } : null);
        }

        // Get property to find landlordId for notification
        try {
          const propertyDoc = await getDoc(doc(db, 'properties', booking.propertyId));
          if (propertyDoc.exists()) {
            const propertyData = propertyDoc.data();
            const landlordId = propertyData.landlordId;
            
            if (landlordId) {
              // Notify landlord about cancellation with reason
              await notificationService.notifyLandlordTourBookingCancelledByUser(
                landlordId,
                booking.id,
                booking.propertyId,
                booking.propertyName || 'Property',
                `${booking.firstName} ${booking.lastName}`.trim(),
                booking.preferredDate,
                cancellationReason.trim(),
                booking.unitNumber || null
              );
            }
          }
        } catch (notificationError) {
          console.error('Error sending landlord notification:', notificationError);
          // Don't fail the cancellation if notification fails
        }

        // Notify user
        await notificationService.notifyTourBookingCancelled(
          booking.submittedBy,
          booking.id,
          booking.propertyId,
          booking.propertyName || 'Property',
          booking.preferredDate,
          booking.unitNumber || null
        );

        toast({
          title: "Booking Cancelled",
          description: "Your tour booking has been cancelled and the landlord has been notified.",
        });
      } else {
        throw new Error(result.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling tour booking:', error);
      toast({
        title: "Cancel Failed",
        description: error instanceof Error ? error.message : "Failed to cancel tour booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: TourBookingData['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: TourBookingData['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
    }
  };

  const formatDate = (date: string | Date | { seconds: number; nanoseconds: number }) => {
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date && typeof date === 'object' && 'seconds' in date) {
      dateObj = new Date(date.seconds * 1000);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return 'N/A';
    }

    if (isNaN(dateObj.getTime())) return 'N/A';
    
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header Banner */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-4 sm:hidden">
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold">Tour Bookings</h1>
            </div>
            <Button
              onClick={fetchBookings}
              size="sm"
              className="bg-white text-green-600 hover:bg-green-50 font-semibold transition-all duration-200 shadow-lg"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Tour Bookings</h1>
                <p className="text-sm text-green-50">
                  View and track your property tour booking history
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={fetchBookings}
                variant="outline"
                className="border-white text-white hover:bg-white/20 font-semibold transition-all duration-200"
              >
                <Search className="h-4 w-4 mr-2" />
                Refresh
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
                  placeholder="Search tour bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-200 w-full"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'All', count: bookings.length },
                { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
                { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
                { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
                { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length }
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={filterStatus === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(filter.key as 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled')}
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

        {/* Loading State */}
        {loading && (
          <Loader 
            message="Loading Tour Bookings" 
            subMessage="Retrieving your tour booking history..."
          />
        )}

        {/* Bookings List */}
        {!loading && (
          <div>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-12 w-12 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchTerm ? 'No bookings found' : 'No tour bookings yet'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'You haven\'t booked any property tours yet. Browse properties to schedule your first tour!'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div 
                      className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      {/* Status Indicator Bar */}
                      <div className={`h-1 ${
                        booking.status === 'pending' ? 'bg-yellow-500' :
                        booking.status === 'confirmed' ? 'bg-blue-500' :
                        booking.status === 'completed' ? 'bg-green-500' :
                        'bg-red-500'
                      }`} />
                      
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                              {booking.propertyName || 'Property'}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                              <span>{booking.propertyName || 'Property'}</span>
                              {booking.unitNumber && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Unit {booking.unitNumber}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="capitalize">{booking.status}</span>
                          </span>
                        </div>

                        {/* Dates */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                              <Calendar className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Preferred Date</p>
                              <p className="font-medium">{formatDate(booking.preferredDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                              <Home className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Move-in Date</p>
                              <p className="font-medium">{formatDate(booking.moveInDate)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Submitted {formatDate(booking.submittedAt)}
                          </div>
                          <div className="flex items-center gap-2">
                            {(booking.status === 'pending' || booking.status === 'confirmed') && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => handleDeleteOrCancelClick(booking, e)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                {booking.status === 'pending' ? (
                                  <>
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Cancel
                                  </>
                                )}
                              </Button>
                            )}
                            {(booking.status === 'cancelled' || booking.status === 'completed') && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => handleDeleteOrCancelClick(booking, e)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBooking(booking);
                              }}
                              className="text-green-600 border-green-200 hover:bg-green-50"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
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
        )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col p-0 bg-gradient-to-br from-green-50 to-blue-50">
            <DialogHeader className="flex-shrink-0 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl mr-4">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-3xl font-bold text-white">
                      Tour Booking Details
                    </DialogTitle>
                    <p className="text-green-100 text-lg">
                      {selectedBooking.propertyName || 'Property'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center mr-8 space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs flex gap-1 font-semibold ${getStatusColor(selectedBooking.status)}`}>
                    {getStatusIcon(selectedBooking.status)}
                    <span className="ml-1 capitalize">{selectedBooking.status}</span>
                  </span>
                </div>
              </div>
            </DialogHeader>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-green-50 to-blue-50">
              <div className="space-y-6">
                {/* Booking Overview */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4 text-xl flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                    Property Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Property</span>
                      <div className="flex items-center text-sm font-bold text-blue-800">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{selectedBooking.propertyName || 'Property'}</span>
                      </div>
                    </div>
                    {selectedBooking.unitNumber && (
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Unit Number</span>
                        <span className="text-sm font-bold text-green-800">
                          {selectedBooking.unitNumber}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Submitted</span>
                      <div className="flex items-center text-sm font-bold text-purple-800">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatDate(selectedBooking.submittedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Information Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Date Information */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-xl flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-green-600" />
                      Date Information
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Preferred Date</span>
                        <div className="flex items-center text-sm font-bold text-blue-800">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{formatDate(selectedBooking.preferredDate)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Move-in Date</span>
                        <div className="flex items-center text-sm font-bold text-green-800">
                          <Home className="h-4 w-4 mr-1" />
                          <span>{formatDate(selectedBooking.moveInDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Preferences */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h4 className="font-bold text-gray-900 mb-4 text-xl flex items-center">
                      <Eye className="h-5 w-5 mr-2 text-blue-600" />
                      Preferences & Contact
                    </h4>
                    <div className="space-y-4">
                      {selectedBooking.apartmentPreferences && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-600 block mb-1">Apartment Preferences</span>
                          <p className="text-sm text-gray-800">
                            {selectedBooking.apartmentPreferences}
                          </p>
                        </div>
                      )}
                      
                      {/* Landlord Contact Information */}
                      <div className="pt-3 border-t border-gray-200">
                        <span className="text-sm font-medium text-gray-700 block mb-3">Contact Landlord</span>
                        {loadingLandlordInfo ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                            <span className="ml-2 text-sm text-gray-500">Loading contact info...</span>
                          </div>
                        ) : landlordContactInfo ? (
                          <div className="space-y-3">
                            {landlordContactInfo.name && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Building className="h-4 w-4 mr-2 text-gray-400" />
                                <span className="font-medium">{landlordContactInfo.name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-3">
                              {landlordContactInfo.email && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    window.location.href = `mailto:${landlordContactInfo.email}`;
                                  }}
                                  className="flex items-center"
                                >
                                  <Mail className="h-4 w-4 mr-2" />
                                  Email
                                </Button>
                              )}
                              {landlordContactInfo.phone && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    window.location.href = `tel:${landlordContactInfo.phone}`;
                                  }}
                                  className="flex items-center"
                                >
                                  <Phone className="h-4 w-4 mr-2" />
                                  Call
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                              Landlord contact information is not available for this property.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4 text-xl flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                    Booking Status
                  </h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Current Status</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(selectedBooking.status)}`}>
                        {getStatusIcon(selectedBooking.status)}
                        <span className="ml-1 capitalize">{selectedBooking.status}</span>
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {selectedBooking.status === 'pending' && (
                        <p className="text-sm text-gray-600">
                          Your tour booking request is pending approval. The landlord will review your request and confirm the tour date.
                        </p>
                      )}
                      {selectedBooking.status === 'confirmed' && (
                        <p className="text-sm text-green-700 font-medium">
                          ✓ Your tour has been confirmed! The landlord has approved your tour request. Please arrive on time for your scheduled tour.
                        </p>
                      )}
                      {selectedBooking.status === 'completed' && (
                        <p className="text-sm text-green-700 font-medium">
                          ✓ Tour completed! Thank you for visiting the property.
                        </p>
                      )}
                      {selectedBooking.status === 'cancelled' && (
                        <p className="text-sm text-red-700 font-medium">
                          This tour booking has been cancelled. If you have any questions, please contact the landlord.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <div>
                  {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteOrCancelClick(selectedBooking, e);
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      {selectedBooking.status === 'pending' ? (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Booking
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Booking
                        </>
                      )}
                    </Button>
                  )}
                  {(selectedBooking.status === 'cancelled' || selectedBooking.status === 'completed') && (
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteOrCancelClick(selectedBooking, e);
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Booking
                    </Button>
                  )}
                </div>
                <div className="flex space-x-4">
                  {landlordContactInfo && (landlordContactInfo.email || landlordContactInfo.phone) && (
                    <Button
                      onClick={handleContactLandlord}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Landlord
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedBooking(null);
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

      {/* Delete Confirmation Modal (for pending bookings) */}
      {showDeleteConfirm && bookingToDelete && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    Delete Tour Booking
                  </DialogTitle>
                </div>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this tour booking? This action cannot be undone.
                  {bookingToDelete.status === 'pending' && ' The landlord will be notified.'}
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Booking Details:</p>
                  <p className="text-sm text-gray-600">{bookingToDelete.propertyName || 'Property'}</p>
                  <p className="text-sm text-gray-600">Preferred Date: {formatDate(bookingToDelete.preferredDate)}</p>
                  <p className="text-sm text-gray-600">Status: <span className="capitalize">{bookingToDelete.status}</span></p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setBookingToDelete(null);
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
                      Delete Booking
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
      )}

      {/* Cancel with Reason Modal (for confirmed bookings) */}
      {showCancelModal && bookingToDelete && (
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-orange-600" />
                  </div>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    Cancel Tour Booking
                  </DialogTitle>
                </div>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-600 mb-4">
                  Since this tour booking has been confirmed by the landlord, please provide a reason for cancellation. The landlord will be notified with your reason.
                </p>
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Booking Details:</p>
                  <p className="text-sm text-gray-600">{bookingToDelete.propertyName || 'Property'}</p>
                  <p className="text-sm text-gray-600">Confirmed Date: {formatDate(bookingToDelete.preferredDate)}</p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Reason <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Please explain why you need to cancel this confirmed tour booking..."
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
                    setBookingToDelete(null);
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
                      Cancel Booking
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
      )}
      </div>
    </div>
  );
}

