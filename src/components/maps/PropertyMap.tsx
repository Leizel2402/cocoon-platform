import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Plus, 
  Minus, 
  Navigation,
  Home,
  DollarSign,
  Bed,
  Bath,
  Square,
  Heart
} from 'lucide-react';
import { Property, Listing } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { saveProperty, isPropertySaved, removeSavedProperty, SavePropertyData } from '../../services/savedPropertiesService';

interface PropertyMapProps {
  properties: Property[];
  listings: Listing[];
  selectedListing: Listing | null;
  onListingSelect: (listing: Listing) => void;
  center: { lat: number; lng: number };
  zoom: number;
  onCenterChange: (center: { lat: number; lng: number }) => void;
  onZoomChange: (zoom: number) => void;
}

export function PropertyMap({
  properties,
  listings,
  selectedListing,
  onListingSelect,
  center,
  zoom,
  onCenterChange,
  onZoomChange
}: PropertyMapProps) {
  
  // Save property functionality
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [savedPropertyIds, setSavedPropertyIds] = useState<Map<string, string>>(new Map());
  const [savingProperties, setSavingProperties] = useState<Set<string>>(new Set());
  const [mapType, setMapType] = useState<'map' | 'satellite' | 'terrain'>('map');
  const [showSchools, setShowSchools] = useState(false);
  const [showTransit, setShowTransit] = useState(false);

  // Check which properties are saved
  useEffect(() => {
    const checkSavedProperties = async () => {
      if (!user?.uid || properties.length === 0) return;
      
      const savedSet = new Set<string>();
      const savedIdsMap = new Map<string, string>();
      
      for (const property of properties) {
        try {
          const result = await isPropertySaved(user.uid, property.id.toString());
          if (result.success && result.isSaved && result.savedPropertyId) {
            savedSet.add(property.id.toString());
            savedIdsMap.set(property.id.toString(), result.savedPropertyId);
          }
        } catch (error) {
          console.error('Error checking if property is saved:', error);
        }
      }
      setSavedProperties(savedSet);
      setSavedPropertyIds(savedIdsMap);
    };

    checkSavedProperties();
  }, [user?.uid, properties]);

  // Handle save/unsave property toggle
  const handleSaveProperty = async (property: Property) => {
    if (!user?.uid) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save properties.",
        variant: "destructive"
      });
      return;
    }

    const propertyId = property.id.toString();
    
    try {
      setSavingProperties(prev => new Set(prev).add(propertyId));
      
      if (savedProperties.has(propertyId)) {
        // Unsave property - remove from saved list
        const savedPropertyId = savedPropertyIds.get(propertyId);
        if (savedPropertyId) {
          const result = await removeSavedProperty(savedPropertyId);
          
          if (result.success) {
            setSavedProperties(prev => {
              const newSet = new Set(prev);
              newSet.delete(propertyId);
              return newSet;
            });
            setSavedPropertyIds(prev => {
              const newMap = new Map(prev);
              newMap.delete(propertyId);
              return newMap;
            });
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
        }
      } else {
        // Save property - add to saved list
        const propertyData: SavePropertyData = {
          propertyId: propertyId,
          propertyName: property.title,
          propertyAddress: `${property.address}, ${property.city}, ${property.state}`,
          propertyPrice: `$${property.rent.toLocaleString()}/month`,
          propertyBeds: property.beds || 1,
          propertyBaths: property.baths || 1,
          propertySqft: property.sqft || 900,
          propertyRating: property.rating || 4.0,
          propertyImage: property.image || '',
          propertyType: 'Property',
          propertyAmenities: property.amenities || []
        };

        const result = await saveProperty(user.uid, propertyData);
        
        if (result.success) {
          setSavedProperties(prev => new Set(prev).add(propertyId));
          if (result.id) {
            setSavedPropertyIds(prev => new Map(prev).set(propertyId, result.id));
          }
          toast({
            title: "Property saved",
            description: "Property has been added to your saved list.",
          });
        } else {
          toast({
            title: "Error saving property",
            description: result.error || "Failed to save property",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error toggling property save:', error);
      toast({
        title: "Error",
        description: "Failed to update property status",
        variant: "destructive"
      });
    } finally {
      setSavingProperties(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
    }
  };

  // Generate mock coordinates for properties
  const getPropertyCoordinates = (property: Property, index: number) => {
    const baseLat = center.lat;
    const baseLng = center.lng;
    const offset = 0.01; // Roughly 1km
    
    return {
      lat: baseLat + (Math.random() - 0.5) * offset * 2,
      lng: baseLng + (Math.random() - 0.5) * offset * 2
    };
  };

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 1, 20));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 1, 1));
  };

  const handleCenterOnLocation = () => {
    // In a real implementation, this would use geolocation API
    onCenterChange({ lat: 37.7749, lng: -122.4194 });
  };

  return (
    <div className="h-full bg-gray-100 relative overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0">
        {mapType === 'map' && (
          <div className="w-full h-full bg-gradient-to-br from-green-100 via-blue-50 to-green-100">
            {/* Mock map features */}
            <div className="absolute inset-0 opacity-20">
              {/* Roads */}
              <div className="absolute top-1/4 left-0 right-0 h-1 bg-gray-400 transform rotate-12"></div>
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-400 transform -rotate-6"></div>
              <div className="absolute top-3/4 left-0 right-0 h-1 bg-gray-400 transform rotate-3"></div>
              
              {/* Water features */}
              <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-blue-200 rounded-full"></div>
              <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-blue-200 rounded-full"></div>
            </div>
          </div>
        )}
        
        {mapType === 'satellite' && (
          <div className="w-full h-full bg-gradient-to-br from-green-200 via-green-100 to-blue-100">
            {/* Satellite-like patterns */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-300 rounded-full"></div>
              <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-green-300 rounded-full"></div>
            </div>
          </div>
        )}
        
        {mapType === 'terrain' && (
          <div className="w-full h-full bg-gradient-to-br from-yellow-100 via-green-100 to-blue-100">
            {/* Terrain-like patterns */}
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-200 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Property Markers */}
      {listings.map((listing, index) => {
        const property = properties.find(p => p.id === listing.propertyId);
        if (!property) return null;

        const coordinates = getPropertyCoordinates(property, index);
        const isSelected = selectedListing?.id === listing.id;

        return (
          <motion.div
            key={listing.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
              isSelected ? 'z-20' : 'z-10'
            }`}
            style={{
              left: `${50 + (coordinates.lng - center.lng) * 1000}%`,
              top: `${50 + (coordinates.lat - center.lat) * 1000}%`
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onListingSelect(listing)}
          >
            <div className={`relative ${
              isSelected ? 'animate-pulse' : ''
            }`}>
              {/* Marker */}
              <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                isSelected 
                  ? 'bg-red-500' 
                  : 'bg-blue-500'
              }`}>
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              
              {/* Price Label */}
              <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                isSelected 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-800 shadow-md'
              }`}>
                ${listing.rent.toLocaleString()}
              </div>

              {/* Property Details Popup (when selected) */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-10 left-1/2 transform -translate-x-1/2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-30"
                >
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {property.title}
                    </h3>
                    <p className="text-xs text-gray-600 truncate">
                      {property.city}, {property.state}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center">
                        <Bed className="h-3 w-3 mr-1" />
                        <span>{listing.bedrooms}</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-3 w-3 mr-1" />
                        <span>{listing.bathrooms}</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="h-3 w-3 mr-1" />
                        <span>{listing.squareFeet}</span>
                      </div>
                    </div>
                    
                    <div className="text-lg font-bold text-gray-900">
                      ${listing.rent.toLocaleString()}/mo
                    </div>
                    
                    {/* Save Property Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveProperty(property);
                      }}
                      className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        savedProperties.has(property.id.toString())
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200'
                          : 'bg-gradient-to-r from-blue-50 to-green-50 text-gray-700 border-2 border-transparent hover:border-green-200 hover:shadow-md hover:shadow-green-100 hover:from-blue-100 hover:to-green-100'
                      } ${savingProperties.has(property.id.toString()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Heart 
                        size={14} 
                        color={savedProperties.has(property.id.toString()) ? "#ffffff" : "#ef4444"} 
                        fill={savedProperties.has(property.id.toString()) ? "#ffffff" : "none"}
                        className={`transition-all duration-300 ${
                          savingProperties.has(property.id.toString()) ? 'animate-pulse' : ''
                        }`}
                      />
                      <span>
                        {savingProperties.has(property.id.toString()) 
                          ? 'Saving...' 
                          : savedProperties.has(property.id.toString()) 
                            ? 'Saved' 
                            : 'Save Property'
                        }
                      </span>
                      {savedProperties.has(property.id.toString()) && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                          className="w-3 h-3 bg-green-600 rounded-full flex items-center justify-center"
                        >
                          <motion.svg
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="w-2 h-2 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </motion.svg>
                        </motion.div>
                      )}
                    </motion.button>
                  </div>
                  
                  {/* Arrow pointing to marker */}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <button
          onClick={handleZoomIn}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      {/* Map Type Selector */}
      <div className="absolute bottom-4 left-4 z-20">
        <select
          value={mapType}
          onChange={(e) => setMapType(e.target.value as 'map' | 'satellite' | 'terrain')}
          className="bg-white px-3 py-2 rounded-lg shadow-lg text-sm border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="map">Map</option>
          <option value="satellite">Satellite</option>
          <option value="terrain">Terrain</option>
        </select>
      </div>

      {/* Additional Map Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleCenterOnLocation}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          title="Center on my location"
        >
          <Navigation className="h-4 w-4" />
        </button>
      </div>

      {/* Map Overlay Controls */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-white rounded-lg shadow-lg p-2 space-y-2">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showSchools}
              onChange={(e) => setShowSchools(e.target.checked)}
              className="mr-2"
            />
            Schools
          </label>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showTransit}
              onChange={(e) => setShowTransit(e.target.checked)}
              className="mr-2"
            />
            Transit
          </label>
        </div>
      </div>

      {/* Map Attribution */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm text-xs text-gray-600 p-2 z-10">
        <div className="flex items-center justify-between">
          <span>© 2022 rental</span>
          <span>Map data © OpenStreetMap contributors</span>
        </div>
      </div>
    </div>
  );
}
