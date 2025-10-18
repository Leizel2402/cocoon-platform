import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/badge";
import {
  Bed,
  Square,
  Calendar,
  Building,
  Home,
  Star,
  DollarSign,
  FileText,
  Shield,
  User,
  Mail,
  Phone,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { ImageModal } from "./ImageModal";

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
  bathrooms: number;
  sqft: number;
  available: boolean;
  qualified: boolean;
  leaseTerms: LeaseTerm[];
  floorLevel: string;
  unitAmenities: string[];
  floorPlan: string;
  propertyId: string;
  description: string;
  deposit: number;
  images: string[];
  availableDate: string;
  lease_term_options?: string[];
  // Additional Firebase fields
  pet_deposit?: number;
  application_fee?: number;
  security_deposit_months?: number;
  first_month_rent_required?: boolean;
  last_month_rent_required?: boolean;
  landlordId?: string;
  userDetails?: {
    email: string;
    phone: string;
    name: string;
  };
  // Missing Firebase fields
  updatedAt?: string;
  createdAt?: string;
  lease_term_months?: number;
  floorImage?: string;
}

export interface UnitDetailsModalProps {
  unit: Unit | null;
  propertyName: string;
  propertyLeaseTermOptions?: string[];
  isOpen: boolean;
  onClose: () => void;
  onScheduleTour?: (unit: Unit) => void;
  onApply?: (unit: Unit) => void;
  onLeaseTermSelect?: (unitId: string, leaseTerm: LeaseTerm) => void;
  currentSelectedLeaseTerm?: LeaseTerm | null;
}

export const UnitDetailsModal: React.FC<UnitDetailsModalProps> = ({
  unit,
  propertyName,
  propertyLeaseTermOptions,
  isOpen,
  onClose,
  onScheduleTour,
  onApply,
  onLeaseTermSelect,
  currentSelectedLeaseTerm,
}) => {
  const [selectedLeaseTerm, setSelectedLeaseTerm] = useState<LeaseTerm | null>(
    null
  );

  // Image modal state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Generate available lease terms (same logic as dropdown)
  const getAvailableLeaseTerms = React.useCallback((unit: Unit): LeaseTerm[] => {
    // If unit already has generated lease terms, use them
    if (unit.leaseTerms && unit.leaseTerms.length > 0) {
      return unit.leaseTerms;
    }
    
    const terms: LeaseTerm[] = [];

    // Use property lease term options, fallback to unit data, then default
    const leaseTermOptions = propertyLeaseTermOptions || ['12 Months'];
    
    // Remove duplicates from lease term options
    const uniqueLeaseTermOptions = [...new Set(leaseTermOptions)];
    
    // Get base rent from the first available term or use a default
    const baseRent = unit.leaseTerms?.[0]?.rent || 1200;

    uniqueLeaseTermOptions.forEach(termOption => {
      // Parse the term option to extract months (e.g., "12 Months" -> 12)
      const months = parseInt(termOption.replace(/\D/g, '')) || 12;
      
      // Use existing lease terms if available, otherwise calculate based on base rent
      const existingTerm = unit.leaseTerms?.find(term => term.months === months);
      
      let calculatedRent = baseRent;
      let savings = null;
      let isPopular = months === 12;
      
      if (existingTerm) {
        // Use existing term data if available
        calculatedRent = existingTerm.rent;
        savings = existingTerm.savings;
        isPopular = existingTerm.popular || months === 12;
      } else {
        // Calculate rent based on term length if no existing data
        if (months < 12) {
          calculatedRent = Math.round(baseRent * (1 + (12 - months) * 0.05));
        } else if (months > 12) {
          calculatedRent = Math.round(baseRent * (1 - (months - 12) * 0.02));
          savings = Math.round(baseRent - calculatedRent);
        }
      }
      
      // Check if we already have a term with this number of months
      const existingTermWithSameMonths = terms.find(term => term.months === months);
      if (!existingTermWithSameMonths) {
        terms.push({
          months,
          rent: calculatedRent,
          popular: isPopular,
          savings,
          concession: existingTerm?.concession || null
        });
      }
    });

    return terms;
  }, [propertyLeaseTermOptions]);

  const availableLeaseTerms = React.useMemo(() => {
    return unit ? getAvailableLeaseTerms(unit) : [];
  }, [unit, getAvailableLeaseTerms]);

  React.useEffect(() => {
    if (availableLeaseTerms.length > 0) {
      // Use currentSelectedLeaseTerm if available, otherwise set default
      if (currentSelectedLeaseTerm) {
        setSelectedLeaseTerm(currentSelectedLeaseTerm);
      } else if (!selectedLeaseTerm) {
        // Set default to popular term or 12 months or first available
        const defaultTerm =
          availableLeaseTerms.find((term) => term.popular) ||
          availableLeaseTerms.find((term) => term.months === 12) ||
          availableLeaseTerms[0];
        setSelectedLeaseTerm(defaultTerm);
      }
    }
  }, [availableLeaseTerms, currentSelectedLeaseTerm, selectedLeaseTerm]);

  // Image modal handlers
  const openImageModal = (imageIndex: number) => {
    setCurrentImageIndex(imageIndex);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setCurrentImageIndex(0);
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const goToNextImage = () => {
    if (currentImageIndex < (unit?.images?.length || 0) - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const selectImage = (index: number) => {
    console.log("Selecting image in modal:", index);
    setCurrentImageIndex(index);
  };

  if (!unit) return null;

  const getAvailabilityText = () => {
    if (!unit.available) return "Not Available";
    if (!unit.qualified) return "Not Qualified";
    return "Available Now";
  };

  const getAvailabilityColor = () => {
    if (!unit.available) return "bg-red-100 text-red-800 border-red-200";
    if (!unit.qualified)
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] overflow-hidden p-0 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
        {/* Modern Header with Gradient Background */}
        <DialogHeader className="relative bg-gradient-to-r from-green-600 via-emerald-400 to-green-400 p-6 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col sm:flex-row  items-center justify-between mr-[50px]">
            <div className="flex  items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl"
              >
                <Home className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <DialogTitle className="text-xl md:text-3xl font-bold text-white mb-1">
                  Unit {unit.unitNumber} - {propertyName}
                </DialogTitle>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-4 text-white/90">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {unit.bedrooms}{" "}
                      {unit.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Square className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {unit.sqft.toLocaleString()} sq ft
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    <span className="text-sm">{unit.floorLevel}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center mt-0 sm:mt-3 space-x-0 sm:space-x-3">
              <Badge
                className={`${getAvailabilityColor()} text-sm font-semibold`}
              >
                {getAvailabilityText()}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Security Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 px-6 py-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">
              All unit information is secure and verified
            </span>
          </div>
        </div>

        {/* Main Content Area - Single Column Layout */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Unit Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {propertyName}
                    </h3>
                    {/* <Badge className={`${getAvailabilityColor()} text-sm font-semibold`}>
                    {getAvailabilityText()}
                  </Badge> */}
                  </div>
                  <div className="flex items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span className="text-sm">
                        {unit.bedrooms}{" "}
                        {unit.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="h-4 w-4" />
                      <span className="text-sm">{unit.sqft} sq ft</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span className="text-sm">{unit.floorLevel}</span>
                    </div>
                  </div>

                  {/* Current Lease Term & Price */}
                  {selectedLeaseTerm && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-1">
                        ${selectedLeaseTerm.rent.toLocaleString()}/mo
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedLeaseTerm.months} month lease
                      </div>
                      {selectedLeaseTerm.concession && (
                        <Badge className="bg-green-100 text-green-700 border-green-200 mt-2">
                          {selectedLeaseTerm.concession}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Floor Plan */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  Floor Plan
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  {(unit.floorPlan || unit.floorImage) ? (
                    <img
                      src={unit.floorPlan || unit.floorImage}
                      alt={`${unit.bedrooms} bedroom floor plan`}
                      className="w-full h-auto rounded-lg border border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex flex-col items-center justify-center py-8 text-gray-500">
                              <Building class="h-12 w-12 mb-2 text-gray-400" />
                              <p class="text-sm font-medium">Floor plan not available</p>
                              <p class="text-xs text-gray-400 mt-1">Contact landlord for details</p>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <Building className="h-12 w-12 mb-2 text-gray-400" />
                      <p className="text-sm font-medium">Floor plan not available</p>
                      <p className="text-xs text-gray-400 mt-1">Contact landlord for details</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lease Terms Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h4 className="font-bold text-gray-800 mb-6 text-xl flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                Available Lease Terms
              </h4>
              <div
                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${
                  availableLeaseTerms.length > 5
                    ? "max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2"
                    : ""
                }`}
              >
                {availableLeaseTerms.map((term) => (
                  <>
                    <motion.button
                      key={`${term.months}-${term.rent}`}
                      onClick={() => {
                        setSelectedLeaseTerm(term);
                        // Notify parent component about the selection
                        if (onLeaseTermSelect && unit) {
                          onLeaseTermSelect(unit.id, term);
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                        selectedLeaseTerm?.months === term.months &&
                        selectedLeaseTerm?.rent === term.rent
                          ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg"
                          : "border-gray-200 bg-white hover:border-green-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-bold text-gray-900 text-lg">
                            {term.months} month{term.months !== 1 ? "s" : ""}
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            ${term.rent.toLocaleString()}/mo
                          </div>
                        </div>
                        {term.popular && (
                          <Badge className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            <Star className="h-4 w-4 mr-2 " />
                            Popular
                          </Badge>
                        )}
                      </div>
                      {term.savings && (
                        <div className="text-xs text-green-600 font-semibold mt-2">
                          Save ${term.savings}/month
                        </div>
                      )}
                      {term.concession && (
                        <div className="text-xs text-green-600 font-semibold mt-2 px-2 py-1 rounded-full">
                          {term.concession}
                        </div>
                      )}
                    </motion.button>
                  </>
                ))}
              </div>
            </div>

            {/* Unit Images Gallery */}
            {unit.images && unit.images.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-6 text-xl flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-blue-600" />
                  Unit Images
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {unit.images.map((image, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="relative group cursor-pointer"
                    >
                      <img
                        src={image}
                        alt={`Unit ${unit.unitNumber} - Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                        onClick={() => openImageModal(index)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {unit.images.length > 1 && (
                  <div className="text-center mt-4">
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {unit.images.length} images • Click any image to view full screen
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Unit Amenities */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h4 className="font-bold text-gray-800 mb-6 text-xl flex items-center">
                <Star className="h-5 w-5 mr-2 text-green-600" />
                Unit Features & Amenities
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {unit.unitAmenities.map((amenity, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-green-300 transition-all duration-200"
                  >
                    {/* <div className="w-2 h-2 bg-green-500 rounded-full"></div> */}
                    <span className="text-sm font-medium text-gray-700">
                      {amenity}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Additional Unit Information */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h4 className="font-bold text-gray-800 mb-6 text-xl flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Additional Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Financial Information */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-700 mb-3">Financial Details</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Security Deposit</span>
                      <span className="text-sm font-bold text-blue-800">
                        ${unit.deposit?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    {unit.pet_deposit && unit.pet_deposit > 0 && (
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Pet Deposit</span>
                        <span className="text-sm font-bold text-green-800">
                          ${unit.pet_deposit.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {unit.application_fee && unit.application_fee > 0 && (
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Application Fee</span>
                        <span className="text-sm font-bold text-purple-800">
                          ${unit.application_fee.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lease Requirements */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-700 mb-3">Lease Requirements</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Security Deposit</span>
                      <span className="text-sm font-bold text-gray-800">
                        {unit.security_deposit_months || 1} month{unit.security_deposit_months !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {unit.first_month_rent_required && (
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">First Month Required</span>
                        <span className="text-sm font-bold text-yellow-800">Yes</span>
                      </div>
                    )}
                    {unit.last_month_rent_required && (
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Last Month Required</span>
                        <span className="text-sm font-bold text-orange-800">Yes</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Unit Description */}
              {unit.description && (
                <div className="mt-6">
                  <h5 className="font-semibold text-gray-700 mb-3">Description</h5>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {unit.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Landlord Information */}
              {unit.userDetails && (
                <div className="mt-6">
                  <h5 className="font-semibold text-gray-700 mb-3">Landlord Information</h5>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                          {unit.userDetails.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700">
                          {unit.userDetails.email}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-700">
                          {unit.userDetails.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modern Action Buttons */}
        <div className="bg-white border-t border-gray-200 p-2 sm:p-4">
          <div className="flex sm:flex-row flex-col gap-y-2 sm:gap-y-0 space-x-0 sm:space-x-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1"
            >
              <Button
                onClick={() => onScheduleTour?.(unit)}
                variant="outline"
                className="w-full h-12 text-base font-semibold border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Tour
              </Button>
            </motion.div>
            {unit.qualified && unit.available && selectedLeaseTerm && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={() => {
                    // Pass unit with selected lease term attached
                    const unitWithSelectedLeaseTerm = {
                      ...unit,
                      selectedLeaseTerm: selectedLeaseTerm
                    };
                    onApply?.(unitWithSelectedLeaseTerm);
                  }}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Apply Now - {selectedLeaseTerm.months} months
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={closeImageModal}
        images={unit.images}
        currentIndex={currentImageIndex}
        onPrevious={goToPreviousImage}
        onNext={goToNextImage}
        onImageSelect={selectImage}
        unitNumber={unit.unitNumber}
      />
    </Dialog>
  );
};
