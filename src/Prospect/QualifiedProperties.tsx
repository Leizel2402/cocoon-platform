import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  Home,
  MapPin,
  Filter,
  Search,
  Heart,
  Bed,
  Bath,
  Square,
  Calendar,
  DollarSign,
  Star,
  CheckCircle,
  Eye,
  Boxes,
  ChevronDown,
} from "lucide-react";
import { UnitDetailsModal } from "../components/UnitDetailsModal";
import ScheduleTourModal from "../components/rentar/unitSelecttion/ScheduleTourModal";

// Helper function to convert Firebase Timestamp to string
const convertTimestampToString = (timestamp: unknown): string => {
  if (!timestamp) return new Date().toISOString();
  
  // If it's a Firebase Timestamp
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof (timestamp as any).toDate === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (timestamp as any).toDate().toISOString();
  }
  
  // If it's already a string
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  
  // If it's a Date object
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  
  // Fallback
  return new Date().toISOString();
};

// Simple interfaces
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
}

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  images: string[];
  amenities: string[];
  latitude: number;
  longitude: number;
  petPolicy: {
    allowed: boolean;
    fee: number;
    deposit: number;
  };
  units: Unit[];
  isRentWiseNetwork: boolean;
}

// Simplified Unit interface for modals
interface TourUnit {
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

interface QualifiedPropertiesProps {
  onUnitSelect: (property: Property, unit: Unit) => void;
  onBack?: () => void;
  onCompareUnits?: (units: { property: Property; unit: Unit }[]) => void;
  selectedProperty: Property | null; // Only show units for this specific property
}

const QualifiedProperties: React.FC<QualifiedPropertiesProps> = ({
  onUnitSelect,
  onCompareUnits,
  selectedProperty,
}) => {
  // State management
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBedroomTypes, setSelectedBedroomTypes] = useState<string[]>(["1", "2", "3"]);
  const [comparisonUnits, setComparisonUnits] = useState<{ property: Property; unit: Unit }[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showUnitDetails, setShowUnitDetails] = useState(false);
  const [selectedUnitForDetails, setSelectedUnitForDetails] = useState<{ property: Property; unit: Unit } | null>(null);
  const [scheduleTourModalOpen, setScheduleTourModalOpen] = useState(false);
  const [selectedPropertyForTour, setSelectedPropertyForTour] = useState<Property | null>(null);
  const [selectedUnitForTour, setSelectedUnitForTour] = useState<TourUnit | null>(null);
  const [selectedLeaseTerms, setSelectedLeaseTerms] = useState<Record<string, LeaseTerm>>({});
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    minPrice: 500,
    maxPrice: 5000,
    moveInDate: "",
    petFriendly: null as boolean | null,
  });

  // Load units for the specific property from Firebase
  const loadUnitsForProperty = async (propertyId: string) => {
    try {
      setLoading(true);
      
      // Query units that belong to this specific property
      const unitsQuery = query(
        collection(db, "units"),
        where("propertyId", "==", propertyId)
      );
      
      const querySnapshot = await getDocs(unitsQuery);

      if (querySnapshot.empty) {
        console.log("No units found for this property");
        setUnits([]);
        return;
      }

      // Transform Firebase data to Unit format
      const unitsData = querySnapshot.docs.map((doc) => {
        const unit = doc.data();
        return {
          id: doc.id,
          unitNumber: unit.unitNumber || `Unit ${doc.id.slice(-4)}`,
          type: `${unit.bedrooms || 1} Bedroom`,
          bedrooms: unit.bedrooms || 1,
          bathrooms: unit.bathrooms || 1,
          sqft: unit.squareFeet || unit.sqft || 0,
          available: unit.available !== false,
          qualified: unit.qualified !== false,
          floorLevel: unit.floor ? `Floor ${unit.floor}` : "First Floor",
          unitAmenities: Array.isArray(unit.amenities) ? unit.amenities.map(String) : [],
          floorPlan: unit.floorPlan || "",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          leaseTerms: unit.leaseTerms ? unit.leaseTerms.map((term: any) => ({
            months: Number(term.months) || 12,
            rent: Number(term.rent) || 0,
            popular: Boolean(term.popular),
            savings: term.savings ? Number(term.savings) : null,
            concession: term.concession ? String(term.concession) : null,
          })) : [{
              months: 12,
            rent: Number(unit.rent || unit.rentAmount || 0),
              popular: true,
              savings: null,
              concession: null,
          }],
          propertyId: unit.propertyId || "",
          description: unit.description || "",
          deposit: unit.deposit || Math.round((unit.rent || unit.rentAmount || 2000) * 1.5),
          images: Array.isArray(unit.images) ? unit.images.map(String) : [],
          availableDate: convertTimestampToString(unit.availableDate),
        };
      });

      setUnits(unitsData);
    } catch (error) {
      console.error("Error loading units:", error);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  // Load units when selectedProperty changes
  useEffect(() => {
    if (selectedProperty?.id) {
      loadUnitsForProperty(selectedProperty.id);
    }
  }, [selectedProperty]);

  // Initialize default lease terms when units are loaded
  useEffect(() => {
    if (units.length > 0) {
      const defaultTerms: Record<string, LeaseTerm> = {};
      units.forEach(unit => {
        if (!selectedLeaseTerms[unit.id]) {
          // Default to 12 months or first available term
          const defaultTerm = unit.leaseTerms.find(term => term.months === 12) || unit.leaseTerms[0];
          if (defaultTerm) {
            defaultTerms[unit.id] = defaultTerm;
          }
        }
      });
      if (Object.keys(defaultTerms).length > 0) {
        setSelectedLeaseTerms(prev => ({ ...prev, ...defaultTerms }));
      }
    }
  }, [units, selectedLeaseTerms]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(openDropdowns).forEach(unitId => {
        if (openDropdowns[unitId] && dropdownRefs.current[unitId]) {
          const dropdownElement = dropdownRefs.current[unitId];
          if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
            setOpenDropdowns(prev => ({
              ...prev,
              [unitId]: false
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

  // Filter units based on search criteria
  const getFilteredUnits = () => {
    return units.filter((unit) => {
      // Bedroom filter
      const bedroomMatch = selectedBedroomTypes.includes(unit.bedrooms.toString()) ||
        (selectedBedroomTypes.includes("3") && unit.bedrooms >= 3);

      // Price filter
      let rentMatch = true;
      if (unit.leaseTerms && unit.leaseTerms.length > 0) {
        rentMatch = unit.leaseTerms.some(term => 
          term.rent >= searchFilters.minPrice && term.rent <= searchFilters.maxPrice
        );
      }

      // Availability filter
      const availabilityMatch = unit.available !== false;

      // Pet friendly filter
      let petMatch = true;
      if (searchFilters.petFriendly !== null && selectedProperty) {
        const isPetFriendly = selectedProperty.amenities.some((amenity) =>
          amenity.toLowerCase().includes("pet") || 
          amenity.toLowerCase().includes("dog") || 
          amenity.toLowerCase().includes("cat")
        );
        petMatch = searchFilters.petFriendly ? isPetFriendly : !isPetFriendly;
      }

      // Move-in date filter
      let moveInMatch = true;
      if (searchFilters.moveInDate) {
        const desiredMoveInDate = new Date(searchFilters.moveInDate);
        const unitAvailableDate = new Date(unit.availableDate);
        moveInMatch = unitAvailableDate <= desiredMoveInDate;
      }

      return bedroomMatch && rentMatch && availabilityMatch && petMatch && moveInMatch;
    });
  };

  const filteredUnits = getFilteredUnits();
  const qualifiedUnits = filteredUnits.filter(unit => unit.qualified);

  // Event handlers
  const handleUnitSelect = (unit: Unit, leaseTerm?: LeaseTerm) => {
    if (selectedProperty) {
      // Use provided lease term or selected lease term for this unit
      const selectedTerm = leaseTerm || selectedLeaseTerms[unit.id];
      if (selectedTerm) {
        // Create a unit object with the selected lease term
        const unitWithLeaseTerm = {
          ...unit,
          selectedLeaseTerm: selectedTerm
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onUnitSelect(selectedProperty, unitWithLeaseTerm as any);
        } else {
        onUnitSelect(selectedProperty, unit);
      }
    }
  };

  const handleTourClick = (unit: Unit) => {
    setSelectedPropertyForTour(selectedProperty);
    // Convert to the format expected by ScheduleTourModal
    const tourUnit = {
      id: unit.id,
      unitNumber: unit.unitNumber,
      type: unit.type,
      bedrooms: unit.bedrooms,
      sqft: unit.sqft,
      available: unit.available,
      qualified: unit.qualified,
      leaseTerms: unit.leaseTerms,
      floorLevel: unit.floorLevel,
      unitAmenities: unit.unitAmenities,
      floorPlan: unit.floorPlan,
    };
    setSelectedUnitForTour(tourUnit);
    setScheduleTourModalOpen(true);
  };

  const handleUnitDetailsClick = (unit: Unit) => {
    if (selectedProperty) {
      setSelectedUnitForDetails({ property: selectedProperty, unit });
    setShowUnitDetails(true);
    }
  };

  const toggleComparisonUnit = (unit: Unit) => {
    if (!selectedProperty) return;
    
    const existingIndex = comparisonUnits.findIndex(
      (item) => item.property.id === selectedProperty.id && item.unit.id === unit.id
    );

    if (existingIndex >= 0) {
      setComparisonUnits((prev) => prev.filter((_, index) => index !== existingIndex));
    } else if (comparisonUnits.length < 5) {
      // Include the selected lease term in the comparison
      const unitWithLeaseTerm = {
        ...unit,
        selectedLeaseTerm: selectedLeaseTerms[unit.id]
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setComparisonUnits((prev) => [...prev, { property: selectedProperty, unit: unitWithLeaseTerm as any }]);
    }
  };

  const isInComparison = (unit: Unit) => {
    if (!selectedProperty) return false;
    return comparisonUnits.some(
      (item) => item.property.id === selectedProperty.id && item.unit.id === unit.id
    );
  };

  const handleBedroomToggle = (value: string) => {
    setSelectedBedroomTypes((prev) =>
      prev.includes(value)
        ? prev.filter((type) => type !== value)
        : [...prev, value]
    );
  };

  const handleLeaseTermSelect = (unitId: string, leaseTerm: LeaseTerm) => {
    setSelectedLeaseTerms((prev) => ({
      ...prev,
      [unitId]: leaseTerm
    }));
    // Close dropdown after selection
    setOpenDropdowns((prev) => ({
      ...prev,
      [unitId]: false
    }));
  };

  const toggleDropdown = (unitId: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  const getAvailableLeaseTerms = (unit: Unit): LeaseTerm[] => {
    const terms: LeaseTerm[] = [];
    
    // Specific lease terms: 4, 6, 12, 16, 24 months
    const leaseTermMonths = [4, 6, 12, 16, 24];
    
    leaseTermMonths.forEach(months => {
      const baseTerm = unit.leaseTerms.find(term => term.months === 12) || unit.leaseTerms[0];
      const baseRent = baseTerm?.rent || 1200;
      
      let calculatedRent = baseRent;
      if (months < 12) {
        calculatedRent = Math.round(baseRent * (1 + (12 - months) * 0.05));
      } else if (months > 12) {
        calculatedRent = Math.round(baseRent * (1 - (months - 12) * 0.02));
      }
      
      terms.push({
        months,
        rent: calculatedRent,
        popular: months === 12,
        savings: months > 12 ? Math.round((baseRent - calculatedRent)) : null,
        concession: null
      });
    });
    
    return terms;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-12 border border-white/20">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <div className="text-lg font-semibold text-gray-700">Loading units...</div>
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  }

  // No property selected
  if (!selectedProperty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Property Selected</h3>
            <p className="text-gray-600">Please select a property to view its units.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Banner */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Boxes className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Available Units</h1>
                <p className="text-sm text-green-50">
                  {selectedProperty.name} - {qualifiedUnits.length} qualified units available
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCompareUnits?.(comparisonUnits)}
                disabled={comparisonUnits.length === 0}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                  comparisonUnits.length > 0
                    ? "bg-white text-green-600 hover:bg-green-100"
                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                }`}
              >
                <Heart className={`h-5 w-5 mr-2 ${comparisonUnits.length > 0 ? "fill-current" : ""}`} />
                Compare Units ({comparisonUnits.length}/5)
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-4"></div>

        {/* Property Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-green-200/50"
        >
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-2 rounded-xl mr-3">
              <Home className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{selectedProperty.name}</h2>
          </div>
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state}</span>
            </div>
          <div className="flex flex-wrap gap-2">
            {selectedProperty.amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200"
              >
                {amenity}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-white/20"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-xl mr-3">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Search & Filter</h2>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Units:</span>{" "}
              <span className="font-semibold text-blue-600">{filteredUnits.length}</span>{" "}
              total •{" "}
              <span className="font-semibold text-green-600">{qualifiedUnits.length}</span>{" "}
              qualified
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-50 p-2 rounded-lg">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <input
                placeholder="Search by unit number..."
                value={searchFilters.location}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full pl-16 pr-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white/80 backdrop-blur-sm text-sm placeholder-gray-500 transition-all duration-200"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border ${
                showFilters
                  ? "bg-green-600 text-white border-green-600"
                  : "text-gray-600 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white"
              }`}
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </motion.button>
          </div>

          {/* Bedroom Type Filter */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Unit Type</label>
            <div className="flex flex-wrap gap-4">
              {[
                { value: "1", label: "1 Bedroom" },
                { value: "2", label: "2 Bedroom" },
                { value: "3", label: "3+ Bedroom" },
              ].map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBedroomToggle(option.value)}
                  className={`flex items-center px-4 py-2 rounded-lg border transition-all duration-200 ${
                    selectedBedroomTypes.includes(option.value)
                      ? "border-blue-200 bg-blue-50 text-gray-700"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center ${
                      selectedBedroomTypes.includes(option.value)
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedBedroomTypes.includes(option.value) && (
                      <CheckCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                  {option.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-gray-200/50 pt-6 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Rent Range</label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                        <input
                          type="number"
                          placeholder="Min"
                          value={searchFilters.minPrice}
                          onChange={(e) => setSearchFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white/80 backdrop-blur-sm transition-all duration-200"
                        />
                      </div>
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={searchFilters.maxPrice}
                          onChange={(e) => setSearchFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                          className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white/80 backdrop-blur-sm transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Move-in Date</label>
                    <input
                      type="date"
                      value={searchFilters.moveInDate}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, moveInDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white/80 backdrop-blur-sm transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Pet Friendly</label>
                    <select
                      value={searchFilters.petFriendly === null ? "any" : searchFilters.petFriendly.toString()}
                      onChange={(e) => setSearchFilters(prev => ({
                          ...prev,
                        petFriendly: e.target.value === "any" ? null : e.target.value === "true"
                      }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white/80 backdrop-blur-sm transition-all duration-200"
                    >
                      <option value="any">Any</option>
                      <option value="true">Pet Friendly</option>
                      <option value="false">No Pets</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Units Grid */}
        <div className="space-y-8">
          {filteredUnits.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-12 text-center border border-white/20"
            >
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 p-4 rounded-full mb-6">
                  <Home className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Units Found</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  No units match your current search criteria. Try adjusting your filters.
                </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedBedroomTypes(["1", "2", "3"]);
                      setSearchFilters({
                        location: "",
                        minPrice: 500,
                        maxPrice: 5000,
                        moveInDate: "",
                      petFriendly: null,
                    });
                  }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </motion.button>
              </div>
            </motion.div>
          ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
                  className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20"
                >
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                      {filteredUnits.map((unit, unitIndex) => (
                        <motion.div
                          key={unit.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: unitIndex * 0.1 }}
                      className={`bg-white rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl ${
                            unit.qualified
                              ? "hover:border-blue-300"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {/* Unit Header */}
                          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-1">
                                  Unit {unit.unitNumber}
                                </h4>
                                <p className="text-sm text-gray-600">
                              {unit.bedrooms} Bedroom • {unit.floorLevel}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {unit.qualified && (
                                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">
                                    ✓ Qualified
                                  </span>
                                )}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                              onClick={() => toggleComparisonUnit(unit)}
                                  className={`p-2 rounded-full transition-colors ${
                                isInComparison(unit)
                                      ? "text-red-500 bg-red-50 border border-red-200"
                                      : "text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent"
                                  }`}
                                >
                              <Heart className={`h-5 w-5 ${isInComparison(unit) ? "fill-current" : ""}`} />
                                </motion.button>
                              </div>
                            </div>

                            {/* Unit Stats */}
                        <div className="grid grid-cols-3 gap-3">
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Bed className="h-4 w-4 mr-2 text-blue-600" />
                                  <span className="font-medium">
                                {unit.bedrooms} bed{unit.bedrooms !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <div className="flex items-center text-sm text-gray-600">
                              <Bath className="h-4 w-4 mr-2 text-purple-600" />
                                  <span className="font-medium">
                                {unit.bathrooms} bath{unit.bathrooms !== 1 ? "s" : ""}
                                  </span>
                                </div>
                              </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center text-sm text-gray-600">
                              <Square className="h-4 w-4 mr-2 text-green-600" />
                              <span className="font-medium">{unit.sqft} sqft</span>
                                </div>
                              </div>
                            </div>
                          </div>

                      {/* Lease Terms Dropdown */}
                          <div className="p-5">
                            <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                          Select Lease Term
                            </h5>
                        <div className="space-y-3">
                          {/* Custom Dropdown */}
                          <div 
                            ref={(el) => (dropdownRefs.current[unit.id] = el)}
                            className="relative"
                          >
                            {/* Selected Value Display */}
                            <div
                              onClick={() => toggleDropdown(unit.id)}
                              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-gray-300 transition-all duration-200 flex items-center justify-between"
                            >
                              <div className="flex items-center">
                                <span className="text-gray-900 font-medium">
                                  {selectedLeaseTerms[unit.id]?.months || 12}months ${(selectedLeaseTerms[unit.id]?.rent || 1200).toLocaleString()}/mo
                                </span>
                                {(selectedLeaseTerms[unit.id]?.popular || (selectedLeaseTerms[unit.id]?.months || 12) === 12) && (
                                  <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    Popular
                                  </span>
                                )}
                              </div>
                              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${openDropdowns[unit.id] ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Dropdown Options */}
                            <AnimatePresence>
                              {openDropdowns[unit.id] && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                                >
                                  {getAvailableLeaseTerms(unit).map((term) => (
                                  <>
                                  
                                  <div
                                      key={term.months}
                                      onClick={() => handleLeaseTermSelect(unit.id, term)}
                                      className={`px-4 py-2 cursor-pointer transition-colors duration-150 flex items-center justify-between ${
                                        selectedLeaseTerms[unit.id]?.months === term.months
                                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                          : 'hover:bg-gray-50 text-gray-900'
                                    }`}
                                  >
                                    <div className="flex items-center">
                                        {selectedLeaseTerms[unit.id]?.months === term.months && (
                                          <CheckCircle className="h-4 w-4 text-white mr-2" />
                                        )}
                                        <span className="font-medium">
                                          {term.months}months ${term.rent.toLocaleString()}/mo
                                      </span>
                                      {term.popular && (
                                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                            selectedLeaseTerms[unit.id]?.months === term.months
                                              ? 'bg-white/20 text-white'
                                              : 'bg-gray-100 text-gray-600'
                                          }`}>
                                          Popular
                                        </span>
                                      )}
                                    </div>
                                      {term.savings && (
                                        <span className={`text-xs ${
                                          selectedLeaseTerms[unit.id]?.months === term.months
                                            ? 'text-white/80'
                                            : 'text-green-600'
                                        }`}>
                                          Save ${term.savings}
                                        </span>
                                      )}
                                      </div>
                                      </>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                                        </div>
                          
                          {/* Selected Term Display */}
                          {selectedLeaseTerms[unit.id] && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                  <span className="text-sm font-semibold text-green-800">
                                    {selectedLeaseTerms[unit.id].months}months
                                  </span>
                                  {selectedLeaseTerms[unit.id].popular && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                                      Popular
                                    </span>
                                      )}
                                    </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-800">
                                    ${selectedLeaseTerms[unit.id].rent.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-green-600">per month</div>
                                </div>
                              </div>
                              {selectedLeaseTerms[unit.id].savings && (
                                <div className="mt-2 text-xs text-green-600 font-medium">
                                  💰 Save ${selectedLeaseTerms[unit.id].savings} per month
                                </div>
                              )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Unit Amenities */}
                          <div className="p-5 border-t border-gray-100">
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <Star className="h-4 w-4 mr-2 text-blue-600" />
                              Unit Features
                            </h5>
                            <div className="flex flex-wrap gap-1">
                              {unit.unitAmenities.slice(0, 3).map((amenity) => (
                                <span
                                  key={amenity}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {unit.unitAmenities.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                  +{unit.unitAmenities.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="p-4 border-t border-gray-100">
                            <div className="space-y-3">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            onClick={() => handleUnitSelect(unit)}
                            disabled={!selectedLeaseTerms[unit.id]}
                            className={`w-full text-sm px-6 py-2 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ${
                              selectedLeaseTerms[unit.id]
                                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            {selectedLeaseTerms[unit.id] 
                              ? `Apply Now - ${selectedLeaseTerms[unit.id].months}mon at $${selectedLeaseTerms[unit.id].rent.toLocaleString()}/mo`
                              : "Select Lease Term First"
                            }
                              </motion.button>

                              <div className="flex gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                              onClick={() => handleTourClick(unit)}
                                  className="flex-1 border hover:bg-blue-600 hover:text-white border-gray-200 text-gray-600 text-sm px-4 py-2 font-semibold rounded-lg transition-all duration-200"
                                >
                                  <Calendar className="h-4 w-4 inline mr-2" />
                                  Tour
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                              onClick={() => handleUnitDetailsClick(unit)}
                                  className="flex-1 border hover:bg-blue-600 hover:text-white border-gray-200 text-gray-600 text-sm px-4 py-2 font-semibold rounded-lg transition-all duration-200"
                                >
                                  <Eye className="h-4 w-4 inline mr-2" />
                              Details
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
          )}
        </div>
      </div>

      {/* Modals */}
      <UnitDetailsModal
        unit={selectedUnitForDetails?.unit || null}
        propertyName={selectedUnitForDetails?.property.name || ""}
        isOpen={showUnitDetails}
        onClose={() => {
          setShowUnitDetails(false);
          setSelectedUnitForDetails(null);
        }}
        onScheduleTour={(unit) => {
          setSelectedPropertyForTour(selectedUnitForDetails?.property || null);
          // Convert to the format expected by ScheduleTourModal
          const tourUnit = {
            id: unit.id,
            unitNumber: unit.unitNumber,
            type: unit.type,
            bedrooms: unit.bedrooms,
            sqft: unit.sqft,
            available: unit.available,
            qualified: unit.qualified,
            leaseTerms: unit.leaseTerms,
            floorLevel: unit.floorLevel,
            unitAmenities: unit.unitAmenities,
            floorPlan: unit.floorPlan,
          };
          setSelectedUnitForTour(tourUnit);
          setScheduleTourModalOpen(true);
          setShowUnitDetails(false);
        }}
        onLeaseTermSelect={handleLeaseTermSelect}
        currentSelectedLeaseTerm={selectedUnitForDetails?.unit ? selectedLeaseTerms[selectedUnitForDetails.unit.id] : null}
        onApply={(unit) => {
          if (selectedUnitForDetails) {
            // Find the full unit data from our units array
            const fullUnit = units.find(u => u.id === unit.id);
            if (fullUnit) {
              handleUnitSelect(fullUnit);
            }
            setShowUnitDetails(false);
            setSelectedUnitForDetails(null);
          }
        }}
      />

      {selectedPropertyForTour && (
        <ScheduleTourModal
          isOpen={scheduleTourModalOpen}
          onClose={() => {
            setScheduleTourModalOpen(false);
            setSelectedPropertyForTour(null);
            setSelectedUnitForTour(null);
          }}
          property={selectedPropertyForTour}
          unit={selectedUnitForTour}
        />
      )}
    </div>
  );
};

export default QualifiedProperties;