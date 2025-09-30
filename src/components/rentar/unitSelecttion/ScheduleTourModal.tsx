import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/lable';
import { Textarea } from '../../ui/textarea';
import { Calendar, CheckCircle, MapPin, Bed, Bath, DollarSign, Home, Shield, Clock, User, Mail, Phone, Square, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../../hooks/use-toast';
import { useAuth } from '../../../hooks/useAuth';
import { submitTourBooking } from '../../../services/submissionService';

interface LeaseTerm {
  months: number;
  rent: number;
  popular: boolean;
  savings: number | null;
  concession: string | null;
}

interface Unit {
  id: string;
  unitNumber: string;
  type: string;
  bedrooms: number;
  sqft: number;
  available: boolean;
  qualified: boolean;
  leaseTerms: LeaseTerm[];
  floorLevel: string;
  unitAmenities: string[];
  floorPlan: string;
}

interface ScheduleTourModalProps {
  property: {
    id: string;
    name: string;
    address: string;
    priceRange?: string;
    rating?: number;
    beds?: string;
    amenities?: string[];
    image?: string;
    rent_amount?: number;
    bedrooms?: number;
    bathrooms?: number;
    description?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    propertyType?: string;
    isRentWiseNetwork?: boolean;
    pet_friendly?: boolean;
    available_date?: string;
  };
  unit?: Unit | null;
  isOpen: boolean;
  onClose: () => void;
}

const ScheduleTourModal = ({ property, unit, isOpen, onClose }: ScheduleTourModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  console.log("property", property);
  console.log("unit", unit);
  
  // Get today's date string once for performance
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    preferredDate: today,
    apartmentPreferences: '',
    moveInDate: today
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };


  const isFormValid = () => {
    return formData.firstName && 
           formData.lastName && 
           formData.email && 
           formData.phone.replace(/\D/g, '').length === 10 &&
           formData.preferredDate &&
           formData.moveInDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      toast({
        title: "Please fill all required fields",
        description: "All fields marked with * are required.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a tour request.",
        variant: "destructive"
      });
      return;
    }

    try {
      const tourData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        preferredDate: formData.preferredDate,
        apartmentPreferences: formData.apartmentPreferences,
        moveInDate: formData.moveInDate,
        propertyId: property?.id || 'general-tour',
        propertyName: property?.name || 'General Tour Request',
        unitId: unit?.id || null,
        unitNumber: unit?.unitNumber || null,
        submittedBy: user.uid,
      };

      const result = await submitTourBooking(tourData);
      
      if (result.success) {
        setSubmissionId(result.id);
        setShowSuccess(true);
        toast({
          title: "Tour Request Submitted Successfully!",
          description: "Your tour request has been sent to the property management team. You'll receive a confirmation within 24 hours.",
        });
      } else {
        throw new Error(result.error || 'Failed to submit tour request');
      }
    } catch (error) {
      console.error('Error submitting tour booking:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your tour request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      preferredDate: today,
      apartmentPreferences: '',
      moveInDate: today
    });
    setShowSuccess(false);
    setSubmissionId(null);
    onClose();
  };

  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-3xl h-[70vh] overflow-hidden p-0 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
        {/* Modern Header with Gradient Background */}
        <DialogHeader className="relative bg-gradient-to-r from-green-600 via-emerald-400 to-green-400 p-6 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between mr-[50px]">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl"
              >
                {showSuccess ? <CheckCircle className="h-6 w-6 text-white" /> : <Calendar className="h-6 w-6 text-white" />}
              </motion.div>
              <div>
                <DialogTitle className="text-3xl font-bold text-white mb-1">
                  {showSuccess ? "Tour Request Submitted!" : "Schedule a Tour"}
                </DialogTitle>
                <div className="flex items-center space-x-4 text-white/90">
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.name || 'Property Tour'}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-sm">{showSuccess ? 'Request Confirmed' : 'Available 24/7'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Security Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 px-6 py-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">Your tour request is secure and will be processed within 24 hours</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {showSuccess ? (
            <div className="text-center space-y-8 py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full mb-6 shadow-2xl"
              >
                <CheckCircle className="h-12 w-12 text-green-600" />
              </motion.div>
              
              <div className="space-y-6">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Tour Request Submitted Successfully!
                </h3>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Your tour request for <strong className="text-gray-800">{property.name || 'this property'}</strong> has been submitted. 
                  The property manager will contact you within 24 hours to confirm your appointment.
                </p>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-left max-w-2xl mx-auto">
                <h4 className="font-bold text-gray-800 mb-4 text-xl flex items-center">
                  <User className="h-5 w-5 mr-2 text-green-600" />
                  Your Request Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p><strong className="text-gray-700">Name:</strong> <span className="text-gray-600">{formData.firstName} {formData.lastName}</span></p>
                    <p><strong className="text-gray-700">Email:</strong> <span className="text-gray-600">{formData.email}</span></p>
                    <p><strong className="text-gray-700">Phone:</strong> <span className="text-gray-600">{formData.phone}</span></p>
                  </div>
                  <div className="space-y-2">
                    <p><strong className="text-gray-700">Preferred Tour Date:</strong> <span className="text-gray-600">{new Date(formData.preferredDate).toLocaleDateString()}</span></p>
                    <p><strong className="text-gray-700">Move-in Date:</strong> <span className="text-gray-600">{new Date(formData.moveInDate).toLocaleDateString()}</span></p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 rounded-xl p-4 max-w-2xl mx-auto">
                  <p className="text-sm text-green-800">
                    <strong>Next Steps:</strong> Your tour request has been submitted to the property management team. 
                    They will contact you within 24 hours to confirm your appointment and provide tour details.
                    {submissionId && (
                      <span className="block mt-2 text-xs text-green-700">
                        <strong>Reference ID:</strong> {submissionId}
                      </span>
                    )}
                  </p>
                </div>
              
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button onClick={handleClose} className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                    Close
                  </Button>
                </motion.div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Property & Unit Summary Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 text-xl flex items-center">
                  <Home className="h-5 w-5 mr-2 text-blue-600" />
                  {unit ? 'Selected Unit Details' : 'Property Details'}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{property.address}</span>
                  </div>
                  
                  {unit ? (
                    // Unit-specific details
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                        <Building className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          Unit {unit.unitNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                        <Bed className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {unit.bedrooms} bed{unit.bedrooms !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                        <Square className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {unit.sqft} sq ft
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                        <Building className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {unit.floorLevel}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Property general details
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                        <Bed className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {property.beds || 'Various bedrooms'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                        <Bath className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {property.bathrooms ? `${property.bathrooms} bath${property.bathrooms !== 1 ? 's' : ''}` : 'Various bathrooms'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {property.priceRange || 'Contact for pricing'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Unit amenities if available */}
                  {unit && unit.unitAmenities.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-700 mb-2 text-sm">Unit Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {unit.unitAmenities.slice(0, 4).map((amenity, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {amenity}
                          </span>
                        ))}
                        {unit.unitAmenities.length > 4 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{unit.unitAmenities.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tour Request Form */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-6 text-xl flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Contact Information
                </h3>
                
                <form id="tour-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                        placeholder="Enter first name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                        placeholder="Enter last name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        placeholder="Enter email address"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          setFormData(prev => ({...prev, phone: formatted}));
                        }}
                        placeholder="(555) 123-4567"
                        maxLength={14}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="preferredDate" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Preferred Tour Date *
                      </Label>
                      <Input
                        id="preferredDate"
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData(prev => ({...prev, preferredDate: e.target.value}))}
                        min={today}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="moveInDate" className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Desired Move-in Date *
                      </Label>
                      <Input
                        id="moveInDate"
                        type="date"
                        value={formData.moveInDate}
                        onChange={(e) => setFormData(prev => ({...prev, moveInDate: e.target.value}))}
                        min={today}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="apartmentPreferences" className="text-sm font-medium text-gray-700 mb-2 block">Apartment Preferences (Optional)</Label>
                    <Textarea
                      id="apartmentPreferences"
                      value={formData.apartmentPreferences}
                      onChange={(e) => setFormData(prev => ({...prev, apartmentPreferences: e.target.value}))}
                      placeholder="Any specific preferences? (floor preference, parking needs, pet accommodations, etc.)"
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white/50 backdrop-blur-sm resize-none"
                    />
                  </div>

                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer Section */}
        {!showSuccess && (
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex space-x-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose} 
                  className="w-full h-12 text-base font-semibold border-2 border-gray-300 hover:border-gray-500 hover:bg-gray-50 rounded-xl transition-all duration-200"
                >
                  Cancel
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                <Button 
                  type="submit" 
                  form="tour-form"
                  disabled={!isFormValid()} 
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Tour
                </Button>
              </motion.div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleTourModal;