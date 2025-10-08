import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { useToast } from "../../../hooks/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Car, 
  Building,
  Calendar,
  DollarSign,
  Waves,
  Dumbbell,
  Shirt,
  Snowflake,
  Flame,
  Utensils,
  ArrowUp,
  Archive,
  Bell,
  Trees,
  Briefcase,
  Eye,
  ArrowRight,
  Home,
  Star,
  CheckCircle,
  ChevronDown,
} from 'lucide-react';
import ProductSelection from '../../ProductSelection';
import PaymentProcess from '../../payment/PaymentProcess';
// import PaymentProcess from '../payment/PaymentProcess';

interface LeaseTerm {
  months: number;
  rent: number;
  popular?: boolean;
  savings?: number | null;
  concession?: string | null;
}

interface Unit {
  id: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  available: boolean;
  availableDate: string;
  floorPlan: string;
  rent: number;
  deposit: number;
  leaseTerms: LeaseTerm[];
  amenities: string[];
  images: string[];
  qualified: boolean;
  qualifiedStatus?: 'qualified' | 'pending' | 'denied';
  parkingIncluded: boolean;
  petFriendly: boolean;
  furnished: boolean;
  floor: number;
  view: string;
}

interface QualifiedProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  units: Unit[];
  amenities: string[];
  images: string[];
  latitude: number;
  longitude: number;
  petPolicy: {
    allowed: boolean;
    fee: number;
    deposit: number;
  };
}

interface IncomingProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
  images?: string[];
  amenities?: string[];
  latitude?: number;
  longitude?: number;
  petPolicy?: {
    allowed: boolean;
    fee: number;
    deposit: number;
  };
  units?: Unit[];
  isRentWiseNetwork?: boolean;
}

interface ComparisonUnit {
  property: IncomingProperty;
  unit: Unit;
}

interface UnitsComparisonProps {
  comparisonUnits: ComparisonUnit[];
  onBack: () => void;
  onUnitSelect?: (property: QualifiedProperty, unit: Unit, leaseTerm: LeaseTerm) => void;
  selectedUnitId?: string;
  onShowDetails?: (property: QualifiedProperty, unit: Unit) => void;
  onProceedToProducts?: (property: QualifiedProperty, unit: Unit, leaseTerm: LeaseTerm) => void;
}

const amenityIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'pool': Waves,
  'gym': Dumbbell,
  'parking': Car,
  'laundry': Shirt,
  'ac': Snowflake,
  'heating': Flame,
  'dishwasher': Utensils,
  'balcony': Building,
  'elevator': ArrowUp,
  'storage': Archive,
  'concierge': Bell,
  'rooftop': Building,
  'courtyard': Trees,
  'business': Briefcase,
};

const UnitsComparison: React.FC<UnitsComparisonProps> = ({
  comparisonUnits,
  onBack,
  onProceedToProducts
}) => {
  const { toast } = useToast();
  const [selectedLeaseTerms, setSelectedLeaseTerms] = useState<Record<string, LeaseTerm>>({});
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Transform Property to QualifiedProperty format
  const transformPropertyToQualified = (property: IncomingProperty): QualifiedProperty => {
    return {
      id: property.id || '',
      name: property.name || '',
      address: property.address || '',
      city: property.city || '',
      state: property.state || '',
      zip: property.zip || '',
      units: property.units || [],
      amenities: property.amenities || [],
      images: property.images || [],
      latitude: property.latitude || 0,
      longitude: property.longitude || 0,
      petPolicy: property.petPolicy || {
        allowed: false,
        fee: 0,
        deposit: 0
      }
    };
  };
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [detailsUnit, setDetailsUnit] = useState<{ property: QualifiedProperty; unit: Unit } | null>(null);
  const [floorPlanUnit, setFloorPlanUnit] = useState<{ property: QualifiedProperty; unit: Unit } | null>(null);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedForProducts, setSelectedForProducts] = useState<{ property: QualifiedProperty; unit: Unit; leaseTerm: LeaseTerm } | null>(null);
  const [paymentData, setPaymentData] = useState<unknown>(null);
  const [inPaymentStep, setInPaymentStep] = useState(false);

  // Initialize default lease terms when comparison units are loaded
  useEffect(() => {
    if (comparisonUnits.length > 0) {
      const defaultTerms: Record<string, LeaseTerm> = {};
      comparisonUnits.forEach(({ unit }) => {
        const unitKey = `${unit.id}`;
        if (!selectedLeaseTerms[unitKey]) {
          // Default to 12 months or first available term
          const defaultTerm = unit.leaseTerms.find(term => term.months === 12) || unit.leaseTerms[0];
          if (defaultTerm) {
            defaultTerms[unitKey] = defaultTerm;
          }
        }
      });
      if (Object.keys(defaultTerms).length > 0) {
        setSelectedLeaseTerms(prev => ({ ...prev, ...defaultTerms }));
      }
    }
  }, [comparisonUnits, selectedLeaseTerms]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(openDropdowns).forEach(unitKey => {
        if (openDropdowns[unitKey] && dropdownRefs.current[unitKey]) {
          const dropdownElement = dropdownRefs.current[unitKey];
          if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
            setOpenDropdowns(prev => ({
              ...prev,
              [unitKey]: false
            }));
          }
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdowns]);

  const handleLeaseTermSelect = (unitKey: string, leaseTerm: LeaseTerm) => {
    setSelectedLeaseTerms(prev => ({
      ...prev,
      [unitKey]: leaseTerm
    }));
    // Automatically select this unit when a lease term is chosen
    setSelectedUnit(unitKey);
    // Close dropdown after selection
    setOpenDropdowns(prev => ({
      ...prev,
      [unitKey]: false
    }));
    toast({
      title: 'Lease term selected',
      description: `${leaseTerm.months} months at $${leaseTerm.rent}/mo`,
    });
  };

  const toggleDropdown = (unitKey: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [unitKey]: !prev[unitKey]
    }));
  };

  const openProductsFlow = (property: IncomingProperty, unit: Unit, leaseTerm: LeaseTerm) => {
    const qualifiedProperty = transformPropertyToQualified(property);
    setSelectedForProducts({ property: qualifiedProperty, unit, leaseTerm });
    setShowProductsModal(true);
    setInPaymentStep(false);
    setPaymentData(null);
  };

  const handleNext = () => {
    if (!selectedUnit) {
      toast({
        title: "Please select a unit",
        description: "You must select a unit before proceeding.",
        variant: "destructive"
      });
      return;
    }

    const selectedTerm = selectedLeaseTerms[selectedUnit];
    if (!selectedTerm) {
      toast({
        title: "Please select a lease term",
        description: "You must select a lease term before proceeding.",
        variant: "destructive"
      });
      return;
    }

    const comparisonUnit = comparisonUnits.find(({ property, unit }) => 
      
      `${property.id}-${unit.id}` === selectedUnit
    );

    if (comparisonUnit) {
      // Use onProceedToProducts if available (for main flow), otherwise use modal flow
      if (onProceedToProducts) {
        const qualifiedProperty = transformPropertyToQualified(comparisonUnit.property);
        onProceedToProducts(qualifiedProperty, comparisonUnit.unit, selectedTerm);
      } else {
        openProductsFlow(comparisonUnit.property, comparisonUnit.unit, selectedTerm);
      }
    }
  };

  const handleShowDetails = (property: IncomingProperty, unit: Unit) => {
    const qualifiedProperty = transformPropertyToQualified(property);
    setDetailsUnit({ property: qualifiedProperty, unit });
    setShowDetailsModal(true);
  };

  const handleShowFloorPlan = (property: IncomingProperty, unit: Unit) => {
    const qualifiedProperty = transformPropertyToQualified(property);
    setFloorPlanUnit({ property: qualifiedProperty, unit });
    setShowFloorPlanModal(true);
  };

  const getCanProceed = () => {
    return selectedUnit && selectedLeaseTerms[selectedUnit];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <div className="sticky top-16 z-50 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6 shadow-2xl">
        <div className="container mx-auto">
      <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl"
              >
                <Home className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Unit Comparison</h1>
                <div className="flex items-center space-x-4 text-white/90">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    <span className="text-sm">Comparing {comparisonUnits.length} unit{comparisonUnits.length > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Select one to proceed</span>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onBack} 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
            >
            <ArrowLeft className="h-4 w-4" />
            Back to Results
          </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6 space-y-6">

      {/* Summary Section - Sticky */}
        <div className=" bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/30">
          <h2 className="font-bold text-gray-800 mb-6 text-xl flex items-center">
            <Star className="h-5 w-5 mr-2 text-green-600" />
            Comparison Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h4 className="font-bold text-green-800 mb-2 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Price Range
              </h4>
              <p className="text-green-700 font-medium">
                {(() => {
                  const rents = comparisonUnits.map(({ unit }) => {
                    const lt = Array.isArray(unit.leaseTerms) && unit.leaseTerms.length ? unit.leaseTerms[0] : null;
                    return lt ? lt.rent : (unit.rent || 0);
                  });
                  return `$${Math.min(...rents)} - $${Math.max(...rents)} per month`;
                })()}
              </p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <h4 className="font-bold text-emerald-800 mb-2 flex items-center">
                <Square className="h-4 w-4 mr-1" />
                Size Range
              </h4>
              <p className="text-emerald-700 font-medium">
                {Math.min(...comparisonUnits.map(({ unit }) => unit.sqft))} - 
                {Math.max(...comparisonUnits.map(({ unit }) => unit.sqft))} sqft
              </p>
            </div>
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <h4 className="font-bold text-teal-800 mb-2 flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                Bedroom Types
              </h4>
              <p className="text-teal-700 font-medium">
                {[...new Set(comparisonUnits.map(({ unit }) => `${unit.bedrooms} bed`))].join(', ')}
              </p>
            </div>
          </div>
          {selectedUnit && selectedLeaseTerms[selectedUnit] && (
            <>
              <Separator className="my-6" />
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Selected Unit
                </h4>
                <p className="text-gray-700 font-medium">
                  {(() => {
                    const unit = comparisonUnits.find(({ property, unit }) => 
                      `${property.id}-${unit.id}` === selectedUnit
                    );
                    const term = selectedLeaseTerms[selectedUnit];
                    return unit ? 
                      `${unit.property.name} - Unit ${unit.unit.unitNumber} • ${term.months} month lease • $${term.rent}/month` :
                      'No unit selected';
                  })()}
                </p>
              </div>
            </>
          )}
        </div>

      {/* Comparison Grid */}
        <div className="grid gap-6 pb-24 mt-6" style={{ gridTemplateColumns: `repeat(${Math.min(comparisonUnits.length, 3)}, 1fr)` }}>
        {comparisonUnits.map(({ property, unit }) => {
          const unitKey = `${property.id}-${unit.id}`;
          const isSelected = selectedUnit === unitKey;
          const leaseTerms = Array.isArray(unit.leaseTerms) ? unit.leaseTerms : [];

          return (
              <motion.div
                key={unitKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border-2 transition-all duration-300 ${
                  isSelected ? 'border-green-500 shadow-green-200 bg-green-50/30' : 'border-gray-200 hover:border-green-300 hover:shadow-xl'
                }`}
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{property.name}</h3>
                      <div className="flex items-center text-gray-500 text-sm mb-3">
                        <MapPin className="h-4 w-4 mr-1" />
                      <span>{property.address}</span>
                    </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700 text-xs px-2 py-1">Unit {unit.unitNumber}</Badge>
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1">Floor {unit.floor}</Badge>
                        <Badge className={`text-xs px-2 py-1 ${
                          unit.qualified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {unit.qualifiedStatus || 'Qualified'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShowDetails(property, unit);
                      }}
                        className="border-gray-300 hover:border-green-500 hover:bg-green-50"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Floor Plan */}
                  <div className="mt-4">
                  <div 
                      className="bg-gray-50 rounded-xl p-3 flex justify-center cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowFloorPlan(property, unit);
                    }}
                  >
                    <img 
                      src={unit.floorPlan || '/placeholder.svg'} 
                      alt={`${unit.bedrooms} bedroom floor plan`}
                      className="max-w-full max-h-20 object-contain"
                    />
                  </div>
                </div>
                </div>

                {/* Card Content */}
                <div className="px-6 pb-6 space-y-4">
                {/* Unit Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <Bed className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">{unit.bedrooms} bed</span>
                  </div>
                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                      <Bath className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">{unit.bathrooms} bath</span>
                  </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <Square className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">{unit.sqft} sqft</span>
                  </div>
                    <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">{unit.availableDate}</span>
                  </div>
                </div>

                {/* Lease Terms Dropdown */}
                <div>
                    <h4 className="font-bold text-gray-800 mb-3 text-sm flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                      Select Lease Term
                    </h4>
                    
                    {/* Custom Dropdown */}
                    <div 
                      ref={(el) => (dropdownRefs.current[unitKey] = el)}
                      className="relative"
                    >
                      {/* Selected Value Display */}
                      <div
                        onClick={() => toggleDropdown(unitKey)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-gray-300 transition-all duration-200 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <span className="text-gray-900 font-medium">
                            {selectedLeaseTerms[unitKey]?.months || 12}months ${(selectedLeaseTerms[unitKey]?.rent || 1200).toLocaleString()}/mo
                          </span>
                          {(selectedLeaseTerms[unitKey]?.popular || (selectedLeaseTerms[unitKey]?.months || 12) === 12) && (
                            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${openDropdowns[unitKey] ? 'rotate-180' : ''}`} />
                      </div>

                      {/* Dropdown Options */}
                      <AnimatePresence key={unitKey}>
                        {openDropdowns[unitKey] && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden"
                          >
                            {[4, 6, 12, 16, 24].map((months) => {
                        const baseTerm = leaseTerms.find(term => term.months === 12) || leaseTerms[0];
                        const baseRent = baseTerm?.rent || 1200;
                        
                        let calculatedRent = baseRent;
                        if (months < 12) {
                                calculatedRent = Math.round(baseRent * (1 + (12 - months) * 0.05));
                        } else if (months > 12) {
                                calculatedRent = Math.round(baseRent * (1 - (months - 12) * 0.02));
                        }
                        
                              const isPopular = months === 12;
                              const savings = months > 12 ? Math.round((baseRent - calculatedRent)) : null;
                              
                              const term = {
                          months,
                          rent: calculatedRent,
                                popular: isPopular,
                                savings,
                          concession: null
                        };

                          return (
                            <div 
                              key={months}
                                  onClick={() => handleLeaseTermSelect(unitKey, term)}
                                  className={`px-4 py-3 cursor-pointer transition-colors duration-150 flex items-center justify-between ${
                                selectedLeaseTerms[unitKey]?.months === months 
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                      : 'hover:bg-gray-50 text-gray-900'
                                  }`}
                                >
                                  <div className="flex items-center">
                                {selectedLeaseTerms[unitKey]?.months === months && (
                                      <CheckCircle className="h-4 w-4 text-white mr-2" />
                                    )}
                                    <span className="font-medium">
                                      {months}months ${calculatedRent.toLocaleString()}/mo
                                    </span>
                                    {isPopular && (
                                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                        selectedLeaseTerms[unitKey]?.months === months
                                          ? 'bg-white/20 text-white'
                                          : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        Popular
                                      </span>
                                    )}
                                  </div>
                                  {savings && (
                                    <span className={`text-xs ${
                                      selectedLeaseTerms[unitKey]?.months === months
                                        ? 'text-white/80'
                                        : 'text-green-600'
                                    }`}>
                                      Save ${savings}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Selected Term Display */}
                    {selectedLeaseTerms[unitKey] && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm font-semibold text-green-800">
                              {selectedLeaseTerms[unitKey].months}mon
                            </span>
                            {selectedLeaseTerms[unitKey].popular && (
                                    <Badge className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-800">
                              ${selectedLeaseTerms[unitKey].rent.toLocaleString()}
                            </div>
                            <div className="text-xs text-green-600">per month</div>
                          </div>
                        </div>
                        {selectedLeaseTerms[unitKey].savings && (
                          <div className="mt-2 text-xs text-green-600 font-medium">
                            💰 Save ${selectedLeaseTerms[unitKey].savings} per month
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Amenities */}
                <div>
                    <h4 className="font-bold text-gray-800 mb-3 text-sm flex items-center">
                      <Star className="h-4 w-4 mr-2 text-yellow-600" />
                      Unit Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                    {(Array.isArray(unit.amenities) ? unit.amenities : []).slice(0, 4).map((amenity) => {
                      const IconComponent = amenityIconMap[amenity.toLowerCase()] || Building;
                      return (
                          <Badge key={amenity} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 border border-gray-200">
                          <IconComponent className="h-3 w-3 mr-1" />
                          {amenity}
                        </Badge>
                      );
                    })}
                    {Array.isArray(unit.amenities) && unit.amenities.length > 4 && (
                        <Badge className="bg-green-100 text-green-700 text-xs px-2 py-1 border border-green-200">
                        +{unit.amenities.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                      className="flex-shrink-0 border-gray-300 hover:border-green-500 hover:bg-green-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowDetails(property, unit);
                    }}
                  >
                      <Eye className="h-4 w-4 mr-1" />
                    Details
                  </Button>
                  
                  {unit.qualified ? (
                    <Button 
                      size="sm" 
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl" 
                      onClick={(e) => {
                        e.stopPropagation();
                        const term = selectedLeaseTerms[unitKey];
                        if (!term) {
                          toast({ title: 'Please select a lease term', description: 'Choose a term above to continue.' });
                          return;
                        }
                        if (onProceedToProducts) {
                          const qualifiedProperty = transformPropertyToQualified(property);
                          onProceedToProducts(qualifiedProperty, unit, term);
                        } else {
                          openProductsFlow(property, unit, term);
                        }
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Next
                    </Button>
                  ) : (
                    <Button 
                      variant="outline"
                      size="sm" 
                        className="flex-1 border-gray-300 text-gray-500"
                      disabled
                    >
                      Not Qualified
                    </Button>
                  )}
                </div>
                </div>
              </motion.div>
          );
        })}
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {detailsUnit ? `${detailsUnit.property.name} - Unit ${detailsUnit.unit.unitNumber}` : 'Unit Details'}
            </DialogTitle>
          </DialogHeader>
          {detailsUnit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Property</h4>
                  <p className="text-sm text-muted-foreground">{detailsUnit.property.name}</p>
                  <p className="text-sm text-muted-foreground">{detailsUnit.property.address}</p>
                </div>
                <div>
                  <h4 className="font-medium">Unit Details</h4>
                  <p className="text-sm text-muted-foreground">
                    {detailsUnit.unit.bedrooms} bed, {detailsUnit.unit.bathrooms} bath
                  </p>
                  <p className="text-sm text-muted-foreground">{detailsUnit.unit.sqft} sqft</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Property Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {(detailsUnit.property.amenities || []).map((amenity) => {
                    const IconComponent = amenityIconMap[amenity.toLowerCase()] || Building;
                    return (
                      <Badge key={amenity} variant="secondary">
                        <IconComponent className="h-3 w-3 mr-1" />
                        {amenity}
                      </Badge>
                    );
                  })}
                  {(!detailsUnit.property.amenities || detailsUnit.property.amenities.length === 0) && (
                    <p className="text-sm text-muted-foreground">No property amenities listed</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Unit Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {(detailsUnit.unit.amenities || []).map((amenity) => {
                    const IconComponent = amenityIconMap[amenity.toLowerCase()] || Building;
                    return (
                      <Badge key={amenity} variant="outline">
                        <IconComponent className="h-3 w-3 mr-1" />
                        {amenity}
                      </Badge>
                    );
                  })}
                  {(!detailsUnit.unit.amenities || detailsUnit.unit.amenities.length === 0) && (
                    <p className="text-sm text-muted-foreground">No unit amenities listed</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">All Lease Terms</h4>
                <div className="space-y-2">
                  {(detailsUnit.unit.leaseTerms || []).map((term) => (
                    <div key={term.months} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{term.months} months</span>
                          {term.popular && <Badge variant="secondary" className="ml-2 text-xs">Popular</Badge>}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary">${term.rent}/mo</div>
                          {term.savings && (
                            <div className="text-xs text-green-600">Save ${term.savings}/mo</div>
                          )}
                        </div>
                      </div>
                      {term.concession && (
                        <div className="text-xs text-muted-foreground mt-1">{term.concession}</div>
                      )}
                    </div>
                  ))}
                  {(!detailsUnit.unit.leaseTerms || detailsUnit.unit.leaseTerms.length === 0) && (
                    <p className="text-sm text-muted-foreground">No lease terms available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

       {/* Floor Plan Modal */}
       <Dialog open={showFloorPlanModal} onOpenChange={setShowFloorPlanModal}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
           <DialogHeader>
             <DialogTitle>
               {floorPlanUnit ? `${floorPlanUnit.property.name} - Unit ${floorPlanUnit.unit.unitNumber} Floor Plan` : 'Floor Plan'}
             </DialogTitle>
           </DialogHeader>
           {floorPlanUnit && (
             <div className="flex justify-center p-4">
               <img 
                 src={floorPlanUnit.unit.floorPlan || '/placeholder.svg'} 
                 alt={`${floorPlanUnit.unit.bedrooms} bedroom floor plan`}
                 className="max-w-full max-h-[70vh] object-contain"
               />
             </div>
           )}
         </DialogContent>
       </Dialog>
        {selectedForProducts && (
          <Dialog open={showProductsModal} onOpenChange={(open) => { 
            console.log('[UnitsComparison] Dialog onOpenChange', { open, showProductsModal, inPaymentStep });
            setShowProductsModal(open); 
            if (!open) { 
              setInPaymentStep(false); 
              setPaymentData(null); 
            } 
          }}>
            <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedForProducts.property.name} - Unit {selectedForProducts.unit.unitNumber}
                </DialogTitle>
              </DialogHeader>
              {(() => {
                return !inPaymentStep ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-accent/50 rounded-md text-sm">
                      <span className="font-medium">Selected:</span> {selectedForProducts.leaseTerm.months} months at ${selectedForProducts.leaseTerm.rent}/mo
                    </div>
              <ProductSelection
                property={selectedForProducts.property}
                unit={selectedForProducts.unit}
                selectedLeaseTerm={selectedForProducts.leaseTerm.months}
                selectedLeaseTermRent={selectedForProducts.leaseTerm.rent}
                applicantData={{}}
                onBack={() => {
                  setShowProductsModal(false);
                  setSelectedForProducts(null);
                }}
                onPaymentProcess={(data) => {
                         setPaymentData(data); 
                         setInPaymentStep(true); 
                       }}
                     />
                  </div>
                ) : (
                  <PaymentProcess
                    paymentData={paymentData}
                    onPaymentComplete={(_success, _details) => { // eslint-disable-line @typescript-eslint/no-unused-vars
                      // Handle payment completion
                    }}
                  />
                );
              })()}
            </DialogContent>
          </Dialog>
        )}

       {/* Enhanced Fixed Bottom Action Bar */}
       {getCanProceed() && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-gray-200 p-4 shadow-2xl">
           <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-800">
                    {comparisonUnits.length} unit{comparisonUnits.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                {selectedUnit && selectedLeaseTerms[selectedUnit] && (
                  <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <span className="font-medium">Selected:</span> {selectedLeaseTerms[selectedUnit].months} months at ${selectedLeaseTerms[selectedUnit].rent}/mo
                  </div>
                )}
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={handleNext} size="lg" className="min-w-[200px] h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
               Proceed to Products
                  <ArrowRight className="h-5 w-5 ml-2" />
             </Button>
              </motion.div>
           </div>
         </div>
       )}
     </div>
  );
};

export default UnitsComparison;