import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Star,
  Calendar,
  Search
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  getSavedProperties, 
  removeSavedProperty, 
  SavedProperty 
} from '../services/savedPropertiesService';
import PropertyDetailsModal from '../components/rentar/unitSelecttion/PropertyDetailsModal';
import ScheduleTourModal from '../components/rentar/unitSelecttion/ScheduleTourModal';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function SavedProperties() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'favorites'>('all');
  const [saving, setSaving] = useState(false);
  const [selectedPropertyForDetails, setSelectedPropertyForDetails] = useState<any | null>(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [selectedPropertyForTour, setSelectedPropertyForTour] = useState<any | null>(null);
  const [scheduleTourModalOpen, setScheduleTourModalOpen] = useState(false);

  // Load saved properties from Firebase
  useEffect(() => {
    const loadSavedProperties = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getSavedProperties(user.uid);
        
        if (result.success && result.properties) {
          setSavedProperties(result.properties);
        } else {
          console.error('Error loading saved properties:', result.error);
          toast({
            title: "Error loading properties",
            description: result.error || "Failed to load saved properties",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading saved properties:', error);
        toast({
          title: "Error loading properties",
          description: "Failed to load saved properties",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSavedProperties();
  }, [user?.uid, toast]);

  // Load units for a specific property
  const loadUnitsForProperty = async (propertyId: string) => {
    try {
      console.log("Loading units for property ID:", propertyId);
      const unitsQuery = query(collection(db, "units"));
      const querySnapshot = await getDocs(unitsQuery);

      if (querySnapshot.empty) {
        console.log("No units found in Firebase");
        return [];
      }

      // Filter units for the specific property and transform
      const propertyUnits = querySnapshot.docs
        .filter((doc) => {
          const unit = doc.data();
          return unit.propertyId === propertyId;
        })
        .map((doc) => {
          const unit = doc.data();

          return {
            id: doc.id,
            unitNumber: unit.unitNumber || `Unit ${doc.id.slice(-4)}`,
            bedrooms: unit.bedrooms || 1,
            bathrooms: unit.bathrooms || 1,
            sqft: unit.squareFeet || unit.sqft || 1000,
            available: unit.available !== false,
            availableDate: unit.availableDate || new Date().toISOString(),
            floorPlan: unit.floorPlan || "Open Floor Plan",
            rent: unit.rent || unit.rentAmount || 2000,
            deposit: unit.deposit || Math.round((unit.rent || unit.rentAmount || 2000) * 1.5),
            amenities: unit.amenities || ["Pool", "Gym", "Pet Friendly"],
            images: unit.images || [],
            description: unit.description || "",
            propertyId: unit.propertyId || "",
            floor: unit.floor || Math.floor(Math.random() * 10) + 1,
            view: unit.view || "City View",
            parkingIncluded: unit.amenities?.includes("Garage") || unit.amenities?.includes("Parking") || false,
            petFriendly: unit.amenities?.some((amenity: string) => amenity.toLowerCase().includes("pet") || amenity.toLowerCase().includes("dog")) || false,
            furnished: unit.furnished || false,
            leaseTerms: [
              {
                months: 6,
                rent: Math.round((unit.rent || unit.rentAmount || 2000) * 1.1),
                popular: false,
                savings: null,
                concession: null,
              },
              {
                months: 12,
                rent: unit.rent || unit.rentAmount || 2000,
                popular: true,
                savings: null,
                concession: "2 weeks free rent",
              },
              {
                months: 18,
                rent: Math.round((unit.rent || unit.rentAmount || 2000) * 0.95),
                popular: false,
                savings: 100,
                concession: "1 month free rent",
              },
            ],
          };
        });

       console.log(`Loaded ${propertyUnits.length} units for property ${propertyId}`);
       return propertyUnits;
    } catch (error) {
      console.error("Error loading units for property:", error);
      return [];
    }
  };

  const filteredProperties = savedProperties.filter(property => {
    const matchesSearch = property.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return matchesSearch && property.savedAt >= oneWeekAgo;
    }
    
    return matchesSearch;
  });

  const handleRemoveProperty = async (savedPropertyId: string) => {
    try {
      setSaving(true);
      const result = await removeSavedProperty(savedPropertyId);
      
      if (result.success) {
        setSavedProperties(prev => prev.filter(p => p.id !== savedPropertyId));
        toast({
          title: "Property removed",
          description: "Property has been removed from your saved list.",
        });
      } else {
        toast({
          title: "Error removing property",
          description: result.error || "Failed to remove property",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error removing property:', error);
      toast({
        title: "Error removing property",
        description: "Failed to remove property",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetails = (property: SavedProperty) => {
    // Convert SavedProperty to format expected by PropertyDetailsModal
    const propertyForModal = {
      id: property.propertyId,
      name: property.propertyName,
      address: property.propertyAddress,
      priceRange: property.propertyPrice,
      beds: `${property.propertyBeds} Bed${property.propertyBeds !== 1 ? 's' : ''}`,
      bedrooms: property.propertyBeds,
      bathrooms: property.propertyBaths,
      rating: property.propertyRating,
      amenities: property.propertyAmenities,
      image: property.propertyImage,
      propertyType: property.propertyType,
      coordinates: [0, 0] as [number, number], // Default coordinates
    };
    
    setSelectedPropertyForDetails(propertyForModal);
    setShowPropertyDetails(true);
  };

  const handleViewUnits = async (property: SavedProperty) => {
    // Load units for this property
    await loadUnitsForProperty(property.id);
    // console.log("property",property);
    
  
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your saved properties...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Saved Properties
              </h1>
              <p className="text-gray-600 mt-2">
                {savedProperties.length} properties saved
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Heart className="h-4 w-4 mr-1" />
                {savedProperties.length} Saved
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search saved properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-200"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Properties' },
                { key: 'recent', label: 'Recent' },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={filterType === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(filter.key as 'all' | 'recent' | 'favorites')}
                  className={filterType === filter.key 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "border-gray-200 hover:bg-blue-50"
                  }
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchTerm ? 'No properties found' : 'No saved properties yet'}
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Start saving properties you like to see them here'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Browse Properties
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Property Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={property.propertyImage}
                    alt={property.propertyName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <motion.div 
                    className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 z-10 bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!saving) {
                        handleRemoveProperty(property.id);
                      }
                    }}
                    style={{ pointerEvents: 'auto' }}
                  >
                    <Heart 
                      size={17} 
                      color="#ffffff" 
                      fill="#ffffff"
                      className={`transition-all duration-300 ${saving ? 'animate-pulse' : ''}`}
                    />
                  </motion.div>
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-green-600 text-white">
                      <Heart className="h-3 w-3 mr-1" />
                      Saved
                    </Badge>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {property.propertyName}
                    </h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{property.propertyRating}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm line-clamp-1">{property.propertyAddress}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span>{property.propertyBeds}</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span>{property.propertyBaths}</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        <span>{property.propertySqft.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {property.propertyPrice}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Saved {property.savedAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 hover:text-white border-green-200 text-green-700 hover:bg-green-700"
                      onClick={() => handleViewDetails(property)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 text-white bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700"
                      onClick={() => handleViewUnits(property)}
                    >
                      See Available Units
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      {showPropertyDetails && selectedPropertyForDetails && (
        <PropertyDetailsModal
          property={selectedPropertyForDetails}
          isOpen={showPropertyDetails}
           onClose={() => {
             setShowPropertyDetails(false);
             setSelectedPropertyForDetails(null);
             // Clear URL parameters when closing modal
             navigate('/saved-properties', { replace: true });
           }}
          onScheduleTour={() => {
            setShowPropertyDetails(false);
            setSelectedPropertyForTour(selectedPropertyForDetails);
            setScheduleTourModalOpen(true);
          }}
          onApplyNow={() => {
            setShowPropertyDetails(false);
            // Navigate to dashboard with propertyId parameter to open unit selection
            navigate(`/dashboard?propertyId=${selectedPropertyForDetails.id}`);
          }}
          onViewUnits={async (property) => {
            setShowPropertyDetails(false);
            // Navigate to dashboard with propertyId parameter to open unit selection
            navigate(`/dashboard?propertyId=${property.id}`);
          }}
        />
      )}

      {/* Schedule Tour Modal */}
       <ScheduleTourModal
         property={selectedPropertyForTour}
         isOpen={scheduleTourModalOpen}
         onClose={() => {
           setScheduleTourModalOpen(false);
           setSelectedPropertyForTour(null);
           // Clear URL parameters when closing modal
           navigate('/saved-properties', { replace: true });
         }}
       />
    </div>
  );
}