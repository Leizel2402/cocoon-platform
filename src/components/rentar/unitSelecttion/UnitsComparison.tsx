import React, { useState } from 'react';
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { ScrollArea } from "../../ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { useToast } from "../../../hooks/use-toast";
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import ProductSelection from '../../ProductSelection';
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

interface ComparisonUnit {
  property: QualifiedProperty;
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [detailsUnit, setDetailsUnit] = useState<{ property: QualifiedProperty; unit: Unit } | null>(null);
  const [floorPlanUnit, setFloorPlanUnit] = useState<{ property: QualifiedProperty; unit: Unit } | null>(null);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedForProducts, setSelectedForProducts] = useState<{ property: QualifiedProperty; unit: Unit; leaseTerm: LeaseTerm } | null>(null);
  const [paymentData, setPaymentData] = useState<unknown>(null);
  const [inPaymentStep, setInPaymentStep] = useState(false);

  const handleLeaseTermSelect = (unitKey: string, leaseTerm: LeaseTerm) => {
    setSelectedLeaseTerms(prev => ({
      ...prev,
      [unitKey]: leaseTerm
    }));
    // Automatically select this unit when a lease term is chosen
    setSelectedUnit(unitKey);
    toast({
      title: 'Lease term selected',
      description: `${leaseTerm.months} months at $${leaseTerm.rent}/mo`,
    });
  };

  const openProductsFlow = (property: QualifiedProperty, unit: Unit, leaseTerm: LeaseTerm) => {
    console.log('Opening products flow', { property: property.name, unit: unit.unitNumber, leaseTerm: leaseTerm.months });
    setSelectedForProducts({ property, unit, leaseTerm });
    setShowProductsModal(true);
    setInPaymentStep(false);
    setPaymentData(null);
    console.log('Modal state set to true');
  };

  const handleNext = () => {
    console.log('[UnitsComparison] Proceed bar clicked', { selectedUnit, selectedTerm: selectedUnit ? selectedLeaseTerms[selectedUnit] : null });
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
        onProceedToProducts(comparisonUnit.property, comparisonUnit.unit, selectedTerm);
      } else {
        openProductsFlow(comparisonUnit.property, comparisonUnit.unit, selectedTerm);
      }
    }
  };

  const handleShowDetails = (property: QualifiedProperty, unit: Unit) => {
    setDetailsUnit({ property, unit });
    setShowDetailsModal(true);
  };

  const handleShowFloorPlan = (property: QualifiedProperty, unit: Unit) => {
    setFloorPlanUnit({ property, unit });
    setShowFloorPlanModal(true);
  };

  const getCanProceed = () => {
    return selectedUnit && selectedLeaseTerms[selectedUnit];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white p-6 shadow-2xl">
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

      {/* Summary Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-6 text-xl flex items-center">
            <Star className="h-5 w-5 mr-2 text-blue-600" />
            Comparison Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-bold text-blue-800 mb-2 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Price Range
              </h4>
              <p className="text-blue-700 font-medium">
                {(() => {
                  const rents = comparisonUnits.map(({ unit }) => {
                    const lt = Array.isArray(unit.leaseTerms) && unit.leaseTerms.length ? unit.leaseTerms[0] : null;
                    return lt ? lt.rent : (unit.rent || 0);
                  });
                  return `$${Math.min(...rents)} - $${Math.max(...rents)} per month`;
                })()}
              </p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <h4 className="font-bold text-purple-800 mb-2 flex items-center">
                <Square className="h-4 w-4 mr-1" />
                Size Range
              </h4>
              <p className="text-purple-700 font-medium">
                {Math.min(...comparisonUnits.map(({ unit }) => unit.sqft))} - 
                {Math.max(...comparisonUnits.map(({ unit }) => unit.sqft))} sqft
              </p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <h4 className="font-bold text-green-800 mb-2 flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                Bedroom Types
              </h4>
              <p className="text-green-700 font-medium">
                {[...new Set(comparisonUnits.map(({ unit }) => `${unit.bedrooms} bed`))].join(', ')}
              </p>
            </div>
          </div>
          {selectedUnit && selectedLeaseTerms[selectedUnit] && (
            <>
              <Separator className="my-6" />
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
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
        <div className="grid gap-6 pb-24" style={{ gridTemplateColumns: `repeat(${Math.min(comparisonUnits.length, 3)}, 1fr)` }}>
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
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
                  isSelected ? 'border-blue-500 shadow-blue-200 bg-blue-50/30' : 'border-gray-200 hover:border-blue-300 hover:shadow-xl'
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
                        <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-1">Unit {unit.unitNumber}</Badge>
                        <Badge className="bg-purple-100 text-purple-700 text-xs px-2 py-1">Floor {unit.floor}</Badge>
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
                        className="border-gray-300 hover:border-blue-500 hover:bg-blue-50"
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

                {/* Lease Terms */}
                <div>
                    <h4 className="font-bold text-gray-800 mb-3 text-sm flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                      Select Lease Term & Rent
                    </h4>
                  <ScrollArea className="h-32">
                    <div className="space-y-2 pr-2">
                      {Array.from({ length: 24 }, (_, i) => i + 1).map((months) => {
                        // Find if there's a specific lease term for this month count
                        const specificTerm = leaseTerms.find(term => term.months === months);
                        
                        // If no specific term, calculate based on 12-month term or first available
                        const baseTerm = leaseTerms.find(term => term.months === 12) || leaseTerms[0];
                        const baseRent = baseTerm?.rent || 1200;
                        
                        // Calculate rent - shorter terms cost more, longer terms cost less
                        let calculatedRent = baseRent;
                        if (months < 12) {
                          calculatedRent = Math.round(baseRent * (1 + (12 - months) * 0.05)); // 5% increase per month under 12
                        } else if (months > 12) {
                          calculatedRent = Math.round(baseRent * (1 - (months - 12) * 0.02)); // 2% decrease per month over 12
                        }
                        
                        const currentTerm = specificTerm || {
                          months,
                          rent: calculatedRent,
                          popular: months === 12,
                          savings: months > 12 ? Math.round((baseRent - calculatedRent)) : null,
                          concession: null
                        };

                          return (
                            <div 
                              key={months}
                              className={`p-3 border-2 rounded-xl cursor-pointer transition-all ${
                                selectedLeaseTerms[unitKey]?.months === months 
                                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                                  : currentTerm.popular 
                                    ? 'border-blue-300 bg-blue-25' 
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                              }`}
                              onClick={(e) => { e.stopPropagation(); handleLeaseTermSelect(unitKey, currentTerm); }}
                            >
                            <div className="flex justify-between items-center">
                              <div>
                                  <span className="font-bold text-sm text-gray-800">{months} months</span>
                                {selectedLeaseTerms[unitKey]?.months === months && (
                                    <Badge className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5">
                                    Selected
                                  </Badge>
                                )}
                                {currentTerm.popular && selectedLeaseTerms[unitKey]?.months !== months && (
                                    <Badge className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5">
                                    Popular
                                  </Badge>
                                )}
                              </div>
                                <span className="font-bold text-blue-600 text-sm">${currentTerm.rent}/mo</span>
                            </div>
                            {currentTerm.savings && (
                                <div className="text-xs text-green-600 mt-1 font-medium">
                                <span>Save ${currentTerm.savings}/month</span>
                              </div>
                            )}
                            {currentTerm.concession && (
                                <div className="text-xs text-blue-600 mt-1 font-medium">
                                💎 {currentTerm.concession}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  
                  {/* Selected Lease Term Display */}
                  {selectedLeaseTerms[unitKey] && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                        <div className="text-sm font-bold text-blue-800">
                        Selected: {selectedLeaseTerms[unitKey].months} months at ${selectedLeaseTerms[unitKey].rent}/mo
                      </div>
                      {selectedLeaseTerms[unitKey].concession && (
                          <div className="text-xs text-blue-600 mt-1 font-medium">
                          💎 {selectedLeaseTerms[unitKey].concession}
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
                        <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-1 border border-blue-200">
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
                      className="flex-shrink-0 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
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
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl" 
                      onClick={(e) => {
                        e.stopPropagation();
                        const term = selectedLeaseTerms[unitKey];
                        if (!term) {
                          toast({ title: 'Please select a lease term', description: 'Choose a term above to continue.' });
                          return;
                        }
                        if (onProceedToProducts) {
                          console.log('[UnitsComparison] Next -> parent flow');
                          onProceedToProducts(property, unit, term);
                        } else {
                          console.log('[UnitsComparison] Next -> local modal flow');
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
                console.log('[UnitsComparison] Rendering dialog content', { inPaymentStep, paymentData: !!paymentData });
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
                         console.log('[UnitsComparison] onPaymentProcess called', { data });
                         setPaymentData(data); 
                         setInPaymentStep(true); 
                       }}
                     />
                  </div>
                ) : (
                    <></>
                //   <PaymentProcess
                //     paymentData={paymentData}
                //     onPaymentComplete={(success, details) => {
                //       console.log('[UnitsComparison] Payment complete', { success, details });
                //     }}
                //   />
                );
              })()}
            </DialogContent>
          </Dialog>
        )}

       {/* Fixed Bottom Action Bar */}
       {getCanProceed() && (
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t border-gray-200 p-4 shadow-2xl">
           <div className="container mx-auto flex justify-end">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button onClick={handleNext} size="lg" className="min-w-[200px] h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
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