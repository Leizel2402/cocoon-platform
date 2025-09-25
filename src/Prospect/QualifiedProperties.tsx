import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Home, 
  MapPin, 
  Info, 
  Filter, 
  Search, 
  Wifi, 
  Car, 
  Dumbbell, 
  Dog, 
  Heart,
  Bed,
  Bath,
  Square,
  Calendar,
  DollarSign,
  Star,
  CheckCircle,
  Eye,
  Clock,
  Users,
  Building,
  X,
  ArrowRight
} from 'lucide-react';
import { UnitDetailsModal } from '../components/UnitDetailsModal';
import ScheduleTourModal from '../components/rentar/unitSelecttion/ScheduleTourModal';
import { toast } from '../hooks/use-toast';

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

interface QualifiedProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  images: string[];
  units: Unit[];
  amenities: string[];
  isRentWiseNetwork?: boolean;
}

interface SearchFilters {
  location: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: string;
  bathrooms: string;
  petFriendly: boolean | null;
  propertyType: string;
  leaseLength: string;
  moveInDate: string;
  amenities: string[];
  parking: string;
  laundry: string;
  furnished: string;
  utilities: string;
}

interface QualifiedPropertiesProps {
  onUnitSelect: (property: QualifiedProperty, unit: Unit) => void;
  onBack?: () => void;
  onNavigateToLeaseHolders?: () => void;
  onNavigateToGuarantors?: () => void;
  onCompareUnits?: (units: { property: QualifiedProperty; unit: Unit }[]) => void;
  applicantData: {
    unitType: string;
    desiredTourDate: string;
    moveInDate: string;
    desiredLeaseTerm: string;
    rentalRange: string;
    location: string;
    amenities: string[];
    petFriendly: boolean;
  };
  searchCriteria?: {
    location: string;
    minPrice: number;
    maxPrice: number;
    bedrooms: string;
    bathrooms: string;
    petFriendly: boolean | null;
    moveInDate: string;
    amenities: string[];
  };
  isComparisonView?: boolean;
  comparisonUnits?: { property: QualifiedProperty; unit: Unit }[];
  // Add props for dynamic data
  dynamicProperties?: any[]; // Properties from Dashboard
  useDynamicData?: boolean; // Flag to use dynamic data instead of mock
  // Add props for selected property and units
  selectedProperty?: any; // Selected property from Dashboard
  unitsData?: any[]; // Units data loaded for the selected property
}

// Mock data for qualified properties with individual units and lease terms
const mockQualifiedProperties: QualifiedProperty[] = [
];

const QualifiedProperties: React.FC<QualifiedPropertiesProps> = ({
  onUnitSelect,
  onBack,
  onNavigateToLeaseHolders,
  onNavigateToGuarantors,
  onCompareUnits,
  applicantData,
  searchCriteria,
  isComparisonView = false,
  comparisonUnits: initialComparisonUnits = [],
  dynamicProperties = [],
  useDynamicData = false,
  selectedProperty = null,
  unitsData = []
}) => {
  const [selectedBedroomTypes, setSelectedBedroomTypes] = useState<string[]>(['1', '2', '3']);
  const [comparisonUnits, setComparisonUnits] = useState<{ property: QualifiedProperty; unit: Unit }[]>(initialComparisonUnits);
  const [showFilters, setShowFilters] = useState(false);
  const [showUnitDetails, setShowUnitDetails] = useState(false);
  const [selectedUnitForDetails, setSelectedUnitForDetails] = useState<{ property: QualifiedProperty; unit: Unit } | null>(null);
  const [selectedPropertyForTour, setSelectedPropertyForTour] = useState<QualifiedProperty | null>(null);
  const [selectedUnitForTour, setSelectedUnitForTour] = useState<Unit | null>(null);
  const [scheduleTourModalOpen, setScheduleTourModalOpen] = useState(false);

  const [selectedUnit, setSelectedUnit] = useState<{ property: QualifiedProperty; unit: Unit } | null>(null);
  const [qualifiedProperties, setQualifiedProperties] = useState<QualifiedProperty[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  // Load units data from Firebase
  const loadUnitsData = async () => {
    try {
      const unitsQuery = query(
        collection(db, 'units'),
        limit(100)
      );
      const querySnapshot = await getDocs(unitsQuery);
      
      if (querySnapshot.empty) {
        console.log('No units found in Firebase');
        return [];
      }

      // Transform Firebase units data
      const units = querySnapshot.docs.map((doc) => {
        const unit = doc.data();
        return {
          id: doc.id,
          unitNumber: unit.unitNumber || `Unit ${doc.id.slice(-4)}`,
          type: `${unit.bedrooms || 1} Bedroom`,
          bedrooms: unit.bedrooms || 1,
          sqft: unit.squareFeet || unit.sqft || 1000,
          available: unit.available !== false,
          qualified: true, // Assume qualified for now
          floorLevel: unit.floor ? `Floor ${unit.floor}` : 'First Floor',
          unitAmenities: unit.amenities || ['W/D in unit', 'Balcony', 'Dishwasher'],
          floorPlan: unit.floorPlan || 'Open Floor Plan',
          leaseTerms: [
            { 
              months: 6, 
              rent: Math.round((unit.rent || unit.rentAmount || 2000) * 1.1), 
              popular: false, 
              savings: null, 
              concession: null 
            },
            { 
              months: 12, 
              rent: unit.rent || unit.rentAmount || 2000, 
              popular: true, 
              savings: null, 
              concession: "2 weeks free rent" 
            },
            { 
              months: 18, 
              rent: Math.round((unit.rent || unit.rentAmount || 2000) * 0.95), 
              popular: false, 
              savings: 100, 
              concession: "1 month free rent" 
            }
          ],
          propertyId: unit.propertyId || '',
          description: unit.description || '',
          deposit: unit.deposit || Math.round((unit.rent || unit.rentAmount || 2000) * 1.5),
          images: unit.images || []
        };
      });

      return units;
    } catch (error) {
      console.error('Error loading units from Firebase:', error);
      return [];
    }
  };

  // Transform Firebase data to QualifiedProperty format with real units
  const transformFirebaseToQualifiedProperties = async (firebaseData: any[]): Promise<QualifiedProperty[]> => {
    // Load units data
    const unitsData = await loadUnitsData();
    
    return firebaseData.map((property, index) => {
      // Find units that belong to this property - ONLY match by propertyId
      const propertyUnits = unitsData.filter(unit => 
        unit.propertyId === property.id || 
        unit.propertyId === property.propertyId
      ); // No fallback - only show units that actually belong to this property

      return {
        id: property.id || `prop-${index}`,
        name: property.name || 'Property',
        address: property.address || '123 Main St',
        city: property.city || 'City',
        state: property.state || 'State',
        images: property.image ? [property.image] : ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'],
        amenities: property.amenities || ['Pool', 'Gym', 'Pet Friendly'],
        isRentWiseNetwork: property.isRentWiseNetwork || false,
        units: propertyUnits.length > 0 ? propertyUnits : [
          // Fallback unit if no real units found
          {
            id: `unit-${property.id}-1`,
            unitNumber: '1A',
            type: property.beds || '1 Bedroom',
            bedrooms: property.bedrooms || 1,
            sqft: property.square_feet || 1000,
        available: true,
        qualified: true,
        floorLevel: 'First Floor',
            unitAmenities: property.amenities?.slice(0, 3) || ['W/D in unit', 'Balcony', 'Dishwasher'],
            floorPlan: 'Open Floor Plan',
        leaseTerms: [
              { 
                months: 6, 
                rent: Math.round((property.rent_amount || 2000) * 1.1), 
                popular: false, 
                savings: null, 
                concession: null 
              },
              { 
                months: 12, 
                rent: property.rent_amount || 2000, 
                popular: true, 
                savings: null, 
                concession: "2 weeks free rent" 
              },
              { 
                months: 18, 
                rent: Math.round((property.rent_amount || 2000) * 0.95), 
                popular: false, 
                savings: 100, 
                concession: "1 month free rent" 
              }
            ],
            propertyId: property.id || '',
            description: property.description || '',
            deposit: Math.round((property.rent_amount || 2000) * 1.5),
            images: property.image ? [property.image] : []
          }
        ]
      };
    });
  };

  // Load dynamic properties data
  useEffect(() => {
    const loadData = async () => {
      console.log('QualifiedProperties useEffect triggered');
      console.log('selectedProperty:', selectedProperty);
      console.log('unitsData:', unitsData);
      console.log('unitsData.length:', unitsData.length);
      console.log('useDynamicData:', useDynamicData);
      console.log('dynamicProperties.length:', dynamicProperties.length);
      
      if (selectedProperty && unitsData.length > 0) {
        // Show units for the selected property
        setPropertiesLoading(true);
        try {
          console.log('Selected Property:', selectedProperty);
          console.log('Units Data:', unitsData);
          console.log('Units Data Length:', unitsData.length);
          
          // Create a single property with the loaded units
          const propertyWithUnits: QualifiedProperty = {
            id: selectedProperty.id,
            name: selectedProperty.name || selectedProperty.title,
            address: selectedProperty.address,
            city: selectedProperty.city,
            state: selectedProperty.state,
            images: selectedProperty.image ? [selectedProperty.image] : ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800'],
            amenities: selectedProperty.amenities || ['Pool', 'Gym', 'Pet Friendly'],
            isRentWiseNetwork: selectedProperty.isRentWiseNetwork || false,
            units: unitsData.map(unit => ({
              id: unit.id,
              unitNumber: unit.unitNumber || `Unit ${unit.id.slice(-4)}`,
              type: `${unit.bedrooms || 1} Bedroom`,
              bedrooms: unit.bedrooms || 1,
              sqft: unit.sqft || 1000, // This should already be mapped correctly from Dashboard
              available: unit.available !== false,
              qualified: true,
              floorLevel: unit.floor ? `Floor ${unit.floor}` : 'First Floor',
              unitAmenities: unit.amenities || ['W/D in unit', 'Balcony', 'Dishwasher'],
              floorPlan: unit.floorPlan || 'Open Floor Plan',
              leaseTerms: unit.leaseTerms || [
                { 
                  months: 6, 
                  rent: Math.round((unit.rent || 2000) * 1.1), 
                  popular: false, 
                  savings: null, 
                  concession: null 
                },
                { 
                  months: 12, 
                  rent: unit.rent || 2000, 
                  popular: true, 
                  savings: null, 
                  concession: "2 weeks free rent" 
                },
                { 
                  months: 18, 
                  rent: Math.round((unit.rent || 2000) * 0.95), 
                  popular: false, 
                  savings: 100, 
                  concession: "1 month free rent" 
                }
              ]
            }))
          };
          setQualifiedProperties([propertyWithUnits]);
        } catch (error) {
          console.error('Error creating property with units:', error);
          setQualifiedProperties(mockQualifiedProperties);
        }
        setPropertiesLoading(false);
      } else if (useDynamicData && dynamicProperties.length > 0) {
        console.log('Using dynamic properties data');
        setPropertiesLoading(true);
        try {
          const transformedProperties = await transformFirebaseToQualifiedProperties(dynamicProperties);
          setQualifiedProperties(transformedProperties);
        } catch (error) {
          console.error('Error transforming properties:', error);
          setQualifiedProperties(mockQualifiedProperties);
        }
        setPropertiesLoading(false);
      } else {
        console.log('Using mock properties data');
        setQualifiedProperties(mockQualifiedProperties);
      }
    };

    loadData();
  }, [useDynamicData, dynamicProperties, selectedProperty, unitsData]);

  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    location: searchCriteria?.location || '',
    minPrice: searchCriteria?.minPrice || 500,
    maxPrice: searchCriteria?.maxPrice || 5000, // Increased from 3000 to 5000
    bedrooms: searchCriteria?.bedrooms || 'any',
    bathrooms: 'any',
    petFriendly: searchCriteria?.petFriendly || null,
    propertyType: 'any',
    leaseLength: 'any',
    moveInDate: searchCriteria?.moveInDate || '',
    amenities: searchCriteria?.amenities || [],
    parking: 'any',
    laundry: 'any',
    furnished: 'any',
    utilities: 'any'
  });

  const bedroomOptions = [
    { value: '1', label: '1 Bedroom' },
    { value: '2', label: '2 Bedroom' }, 
    { value: '3', label: '3+ Bedroom' }
  ];

  const amenityOptions = [
    { key: 'pool', label: 'Pool', icon: <Wifi className="h-4 w-4" /> },
    { key: 'gym', label: 'Gym', icon: <Dumbbell className="h-4 w-4" /> },
    { key: 'parking', label: 'Parking', icon: <Car className="h-4 w-4" /> },
    { key: 'pet-friendly', label: 'Pet Friendly', icon: <Dog className="h-4 w-4" /> }
  ];

  const handleBedroomToggle = (value: string) => {
    setSelectedBedroomTypes(prev => 
      prev.includes(value) 
        ? prev.filter(type => type !== value)
        : [...prev, value]
    );
  };

  const getFilteredProperties = () => {
    console.log('getFilteredProperties called with qualifiedProperties:', qualifiedProperties);
    console.log('qualifiedProperties.length:', qualifiedProperties.length);
    const filtered = qualifiedProperties.filter(property => {
      // Location filter
      if (searchFilters.location && !property.name.toLowerCase().includes(searchFilters.location.toLowerCase()) &&
          !property.address.toLowerCase().includes(searchFilters.location.toLowerCase()) &&
          !property.city.toLowerCase().includes(searchFilters.location.toLowerCase())) {
        return false;
      }
      
      // Pet friendly filter
      if (searchFilters.petFriendly !== null) {
        const isPetFriendly = property.amenities.some(amenity => 
          amenity.toLowerCase().includes('pet')
        );
        if (searchFilters.petFriendly && !isPetFriendly) return false;
        if (!searchFilters.petFriendly && isPetFriendly) return false;
      }
      
      return true;
    });
    
    console.log('Filtered properties result:', filtered);
    console.log('Filtered properties length:', filtered.length);
    return filtered;
  };

  const getFilteredUnits = (property: QualifiedProperty) => {
    console.log('getFilteredUnits called for property:', property.name);
    console.log('Property units:', property.units);
    console.log('selectedBedroomTypes:', selectedBedroomTypes);
    console.log('searchFilters:', searchFilters);
    
    const filtered = property.units.filter(unit => {
      console.log('Filtering unit:', unit.unitNumber, 'bedrooms:', unit.bedrooms);
      console.log('Unit leaseTerms:', unit.leaseTerms);
      
      const bedroomMatch = selectedBedroomTypes.includes(unit.bedrooms.toString()) || 
                          (selectedBedroomTypes.includes('3') && unit.bedrooms >= 3);
      
      console.log('Bedroom match:', bedroomMatch);
      
      // Rent range filter - check if leaseTerms exists
      if (unit.leaseTerms && unit.leaseTerms.length > 0) {
      const maxRent = Math.max(...unit.leaseTerms.map(term => term.rent));
      const minRent = Math.min(...unit.leaseTerms.map(term => term.rent));
        
        console.log('Unit lease terms:', unit.leaseTerms);
        console.log('Rent range:', minRent, '-', maxRent);
        console.log('Search filters rent range:', searchFilters.minPrice, '-', searchFilters.maxPrice);
      
      if (maxRent < searchFilters.minPrice || minRent > searchFilters.maxPrice) {
          console.log('Unit filtered out due to rent range');
        return false;
        } else {
          console.log('Unit passed rent range filter');
        }
      } else {
        console.log('No leaseTerms found for unit, skipping rent filter');
      }
      
      console.log('Unit passed all filters:', bedroomMatch);
      return bedroomMatch;
    });
    
    console.log('Filtered units result:', filtered);
    console.log('Filtered units length:', filtered.length);
    return filtered;
  };

  const filteredProperties = getFilteredProperties();
  
  const totalAvailableUnits = filteredProperties.reduce((sum, property) => 
    sum + getFilteredUnits(property).length, 0
  );

  const totalQualifiedUnits = filteredProperties.reduce((sum, property) => 
    sum + getFilteredUnits(property).filter(unit => unit.qualified).length, 0
  );

  const handleUnitSelect = (property: QualifiedProperty, unit: Unit, leaseTerm?: LeaseTerm) => {
    onUnitSelect(property, unit);
  };

  const handleTourClick = (property: QualifiedProperty, unit: Unit) => {
    // console.log("unit",unit);
    // console.log("property",property);
    setSelectedPropertyForTour(property);
    setSelectedUnitForTour(unit);
    setScheduleTourModalOpen(true);
  };

  const handleUnitDetailsClick = (property: QualifiedProperty, unit: Unit) => {
    setSelectedUnitForDetails({ property, unit });
    setShowUnitDetails(true);
  };

  const toggleComparisonUnit = (property: QualifiedProperty, unit: Unit) => {
    const existingIndex = comparisonUnits.findIndex(
      item => item.property.id === property.id && item.unit.id === unit.id
    );

    if (existingIndex >= 0) {
      setComparisonUnits(prev => prev.filter((_, index) => index !== existingIndex));
    } else if (comparisonUnits.length < 5) {
      setComparisonUnits(prev => [...prev, { property, unit }]);
    }
  };

  const isInComparison = (property: QualifiedProperty, unit: Unit) => {
    return comparisonUnits.some(
      item => item.property.id === property.id && item.unit.id === unit.id
    );
  };

  // Show loading state
  if (propertiesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-12 border border-white/20">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <div className="text-lg font-semibold text-gray-700">Loading units data...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* <div className="bg-gradient-to-r from-blue-500 to-emerald-500 p-3 rounded-xl shadow-lg mr-4">
                  <Building className="h-6 w-6 text-white" />
                </div> */}
                <div>
                  <h1 className="text-4xl text-black-600 font-bold">
                  Available Units
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {selectedProperty 
                      ? `Showing ${totalQualifiedUnits} available units for ${selectedProperty.name || selectedProperty.title}`
                      : `Choose from ${totalQualifiedUnits} qualified units that match your criteria`
                    }
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCompareUnits?.(comparisonUnits)}
                disabled={comparisonUnits.length === 0}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                  comparisonUnits.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-gray-400 border border-gray-200 cursor-not-allowed'
                }`}
              >
                <Heart className={`h-5 w-5 mr-2 ${comparisonUnits.length > 0 ? 'fill-current' : ''}`} />
                Compare Units ({comparisonUnits.length}/5)
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Applicant Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-blue-200/50"
        >
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-2 rounded-xl mr-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your Search Summary</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4">
              <p className="font-medium text-gray-600 mb-1">Preferred Unit Type</p>
              <p className="font-bold text-gray-900">{applicantData.unitType || 'Any'}</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4">
              <p className="font-medium text-gray-600 mb-1">Desired Tour Date</p>
              <p className="font-bold text-gray-900">{applicantData.desiredTourDate || 'Flexible'}</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4">
              <p className="font-medium text-gray-600 mb-1">Move-in Date</p>
              <p className="font-bold text-gray-900">{applicantData.moveInDate || 'Flexible'}</p>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4">
              <p className="font-medium text-gray-600 mb-1">Lease Term</p>
              <p className="font-bold text-gray-900">{applicantData.desiredLeaseTerm ? `${applicantData.desiredLeaseTerm} months` : 'Flexible'}</p>
            </div>
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
              <span className="font-semibold">Property Stats:</span> {qualifiedProperties.length} properties • <span className="font-semibold text-blue-600">{totalAvailableUnits}</span> total units • <span className="font-semibold text-green-600">{totalQualifiedUnits}</span> qualified
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-50 p-2 rounded-lg">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <input
                placeholder="Search by location, property name..."
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
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'text-gray-600 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white'
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
              {bedroomOptions.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleBedroomToggle(option.value)}
                  className={`flex items-center px-4 py-2 rounded-lg border  transition-all duration-200 ${
                    selectedBedroomTypes.includes(option.value)
                      ? 'border-blue-200 bg-blue-50 text-gray-700 '
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center ${
                    selectedBedroomTypes.includes(option.value)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
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
                animate={{ height: 'auto', opacity: 1 }}
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
                      value={searchFilters.petFriendly === null ? 'any' : searchFilters.petFriendly.toString()}
                      onChange={(e) => setSearchFilters(prev => ({ 
                        ...prev, 
                        petFriendly: e.target.value === 'any' ? null : e.target.value === 'true' 
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

        {/* Properties and Units */}
        <div className="space-y-8">
          {filteredProperties.map((property, propertyIndex) => {
            const filteredUnits = getFilteredUnits(property);
            if (filteredUnits.length === 0) return null;

            return (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: propertyIndex * 0.1 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20"
              >
                {/* Property Header */}
                <div className="p-6 border-b border-gray-200/50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 mr-3">{property.name}</h3>
                        {property.isRentWiseNetwork && (
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            RentWise Network
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-gray-600 mb-3">
                        <div className="bg-blue-50 p-1 rounded-lg mr-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <span>{property.address}, {property.city}, {property.state}</span>
                      </div>
                      
                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Units Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUnits.map((unit, unitIndex) => (
                      <motion.div
                        key={unit.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: unitIndex * 0.1 }}
                        className={`bg-white rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl  ${
                          unit.qualified 
                            ? 'hover:border-blue-300' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Unit Header */}
                        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900 mb-1">Unit {unit.unitNumber}</h4>
                              <p className="text-sm text-gray-600">{unit.type} • {unit.floorLevel}</p>
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
                                onClick={() => toggleComparisonUnit(property, unit)}
                                className={`p-2 rounded-full transition-colors ${
                                  isInComparison(property, unit)
                                    ? 'text-red-500 bg-red-50 border border-red-200'
                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent'
                                }`}
                              >
                                <Heart className={`h-5 w-5 ${isInComparison(property, unit) ? 'fill-current' : ''}`} />
                              </motion.button>
                            </div>
                          </div>
                          
                          {/* Unit Stats */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center text-sm text-gray-600">
                                <Bed className="h-4 w-4 mr-2 text-blue-600" />
                                <span className="font-medium">{unit.bedrooms} bed{unit.bedrooms !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center text-sm text-gray-600">
                                <Square className="h-4 w-4 mr-2 text-blue-600" />
                                <span className="font-medium">{unit.sqft} sqft</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Lease Terms */}
                        <div className="p-5">
                          <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                            Lease Terms
                          </h5>
                          <div className="space-y-2">
                            {unit.leaseTerms.slice(0, 2).map((term, termIndex) => (
                              <div
                                key={termIndex}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  term.popular 
                                    ? 'border-blue-200 bg-blue-50' 
                                    : 'border-gray-200 bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center">
                                  <span className="font-medium text-gray-900">
                                    {term.months} months
                                  </span>
                                  {term.popular && (
                                    <span className="ml-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                      Popular
                                    </span>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-gray-900">
                                    ${term.rent.toLocaleString()}
                                  </div>
                                  {term.concession && (
                                    <div className="text-xs text-green-600 font-medium">
                                      {term.concession}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {unit.leaseTerms.length > 2 && (
                              <div className="text-center text-sm text-gray-500">
                                +{unit.leaseTerms.length - 2} more lease options
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
                            {/* Primary Action */}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleUnitSelect(property, unit)}
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm px-6 py-2 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              Apply Now
                            </motion.button>
                            
                            {/* Secondary Actions */}
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleTourClick(property, unit)}
                                className="flex-1 border hover:bg-blue-600 hover:text-white border-gray-200 text-gray-600 text-sm px-4 py-2 font-semibold rounded-lg transition-all duration-200"
                              >
                                <Calendar className="h-4 w-4 inline mr-2" />
                                Tour
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleUnitDetailsClick(property, unit)}
                                className="flex-1 border hover:bg-blue-600 hover:text-white border-gray-200 text-gray-600 text-sm px-4 py-2 font-semibold rounded-lg transition-all duration-200"
                              >
                                <Eye className="h-4 w-4 inline mr-2" />
                                Unit Details
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
       <UnitDetailsModal
         unit={selectedUnitForDetails?.unit || null}
         propertyName={selectedUnitForDetails?.property.name || ''}
         isOpen={showUnitDetails}
         onClose={() => {
           setShowUnitDetails(false);
           setSelectedUnitForDetails(null);
         }}
         onScheduleTour={(unit) => {
           setSelectedPropertyForTour(selectedUnitForDetails?.property || null);
           setSelectedUnitForTour(unit);
           setScheduleTourModalOpen(true);
           setShowUnitDetails(false);
         }}
         onApply={(unit, leaseTerm) => {
           if (selectedUnitForDetails) {
             handleUnitSelect(selectedUnitForDetails.property, unit, leaseTerm);
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
             toast({
               title: "Tour Scheduled!",
               description: "You'll receive a confirmation email with the details.",
             });
           }}
           property={selectedPropertyForTour}
           unit={selectedUnitForTour}
         />
       )}
    </div>
  );
};

export default QualifiedProperties;