import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Bed, Bath, Square, MapPin, Calendar, ArrowLeft, Building, Home, Star, DollarSign, FileText, Shield, StarOff } from 'lucide-react';
import { motion } from 'framer-motion';

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

interface UnitDetailsModalProps {
  unit: Unit | null;
  propertyName: string;
  isOpen: boolean;
  onClose: () => void;
  onScheduleTour?: (unit: Unit) => void;
  onApply?: (unit: Unit, leaseTerm: LeaseTerm) => void;
}

export const UnitDetailsModal: React.FC<UnitDetailsModalProps> = ({
  unit,
  propertyName,
  isOpen,
  onClose,
  onScheduleTour,
  onApply
}) => {
  const [selectedLeaseTerm, setSelectedLeaseTerm] = useState<LeaseTerm | null>(null);

  React.useEffect(() => {
    if (unit && unit.leaseTerms.length > 0) {
      // Set default to popular term or 12 months or first available
      const defaultTerm = unit.leaseTerms.find(term => term.popular) || 
        unit.leaseTerms.find(term => term.months === 12) || 
        unit.leaseTerms[0];
      setSelectedLeaseTerm(defaultTerm);
    }
  }, [unit]);

  if (!unit) return null;

  const getAvailabilityText = () => {
    if (!unit.available) return "Not Available";
    if (!unit.qualified) return "Not Qualified";
    return "Available Now";
  };

  const getAvailabilityColor = () => {
    if (!unit.available) return "bg-red-100 text-red-800 border-red-200";
    if (!unit.qualified) return "bg-yellow-100 text-yellow-800 border-yellow-200";
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
                    <span className="text-sm">{unit.bedrooms} {unit.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
                  </div>
                  <div className="flex items-center">
                    <Square className="h-4 w-4 mr-1" />
                    <span className="text-sm">{unit.sqft.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    <span className="text-sm">{unit.floorLevel}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center mt-0 sm:mt-3 space-x-0 sm:space-x-3">
              <Badge className={`${getAvailabilityColor()} text-sm font-semibold`}>
                {getAvailabilityText()}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Security Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 px-6 py-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">All unit information is secure and verified</span>
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
                  <h3 className="text-xl font-semibold text-gray-900">{propertyName}</h3>
                  {/* <Badge className={`${getAvailabilityColor()} text-sm font-semibold`}>
                    {getAvailabilityText()}
                  </Badge> */}
                </div>
                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4" />
                    <span className="text-sm">{unit.bedrooms} {unit.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}</span>
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
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
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
              <div className="bg-gray-50 rounded-xl p-4">
                <img
                  src={unit.floorPlan}
                  alt={`${unit.bedrooms} bedroom floor plan`}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Lease Terms Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-6 text-xl flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
              Available Lease Terms
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unit.leaseTerms.map((term) => (
                <motion.button
                  key={`${term.months}-${term.rent}`}
                  onClick={() => setSelectedLeaseTerm(term)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    selectedLeaseTerm?.months === term.months && selectedLeaseTerm?.rent === term.rent
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-gray-900 text-lg">
                        {term.months} month{term.months !== 1 ? 's' : ''}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        ${term.rent.toLocaleString()}/mo
                      </div>
                    </div>
                    {term.popular && (
                      <Badge className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                       <Star className="h-4 w-4 mr-2 " />Popular
                      </Badge>
                    )}
                  </div>
                  {term.concession && (
                    <div className="text-xs text-green-600 font-semibold mt-2 px-2 py-1 rounded-full">
                      {term.concession}
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

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
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-200"
                >
                  {/* <div className="w-2 h-2 bg-green-500 rounded-full"></div> */}
                  <span className="text-sm font-medium text-gray-700">{amenity}</span>
                </motion.div>
              ))}
            </div>
          </div>

          </div>
          </div>

        {/* Modern Action Buttons */}
        <div className="bg-white border-t border-gray-200 p-2 sm:p-4">
          <div className="flex sm:flex-row flex-col gap-y-2 sm:gap-y-0 space-x-0 sm:space-x-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Button 
              onClick={() => onScheduleTour?.(unit)}
              variant="outline" 
                className="w-full h-12 text-base font-semibold border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200"
            >
                <Calendar className="h-4 w-4 mr-2" />
              Schedule Tour
            </Button>
            </motion.div>
            {unit.qualified && unit.available && selectedLeaseTerm && (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button 
                onClick={() => onApply?.(unit, selectedLeaseTerm)}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                  <FileText className="h-4 w-4 mr-2" />
                Apply Now - {selectedLeaseTerm.months} months
              </Button>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};