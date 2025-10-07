import React, { useEffect, useState } from 'react';
import { X, Bed, Bath, Heart, Share, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyDetailsModal from '../components/rentar/unitSelecttion/PropertyDetailsModal';
import { useAuth } from '../hooks/useAuth';
import { formatPropertyAddress } from '../lib/utils';
import { useToast } from '../hooks/use-toast';
import { saveProperty, isPropertySaved, removeSavedProperty, SavePropertyData } from '../services/savedPropertiesService';

// React Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Try to import FullscreenControl, fallback if not available
let FullscreenControl: any = null;
try {
  const fullscreenModule = require('react-leaflet-fullscreen');
  FullscreenControl = fullscreenModule.FullscreenControl || fullscreenModule.default;
} catch (error) {
  console.warn('FullscreenControl not available:', error);
}

// Import CSS
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

interface Property {
  id: string | number;
  name: string;
  address: string;
  priceRange: string;
  beds: string;
  rating: number;
  coordinates: [number, number];
  rent_amount?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  isRentWiseNetwork?: boolean;
  amenities?: string[];
  image?: string;
}

interface PropertyMapProps {
  properties: Property[];
  isPrequalified?: boolean;
  onPropertySelect?: (property: Property) => void;
  language?: 'EN' | 'ES' | 'FR' | 'DE';
}

// Fix for default markers in react-leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to update map center and zoom - Fixed for React-Leaflet v3+
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = L.map ? null : require('react-leaflet').useMap?.() || null;
  
  useEffect(() => {
    if (map) {
      try {
        console.log('MapUpdater: Setting view to', center, 'zoom', zoom);
        map.setView(center, zoom);
      } catch (error) {
        console.warn('Error updating map view:', error);
      }
    }
  }, [center, zoom, map]);
  
  return null;
};

// Custom property marker icon - Modern, clean design
const createPropertyIcon = (property: Property) => {
  const isMatching = property.isRentWiseNetwork;
  const rent = property.rent_amount || 2000;
  
  // Modern color palette matching UI theme
  let color = '#ef4444'; // Red
  
  if (isMatching) {
    color = '#3d75ef'; // Green
  } else if (rent < 2000) {
    color = '#ef4444'; // Red
  } else if (rent < 4000) {
    color = '#3b82f6'; // Blue
  } else {
    color = '#8b5cf6'; // Purple
  }

  const priceText = rent >= 1000 ? `$${(rent / 1000).toFixed(1)}k` : `$${rent}`;

  // Get property icon based on type
  const getPropertyIcon = (propertyType: string) => {
    switch (propertyType?.toLowerCase()) {
      case 'apartment':
        return 'Building';
      case 'luxury apartment':
        return 'Building2';
      case 'loft':
        return 'Home';
      default:
        return 'Home';
    }
  };

  const iconType = getPropertyIcon(property.propertyType || '');
  
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        cursor: pointer;
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <!-- Main Marker -->
        <div style="
          background: ${color};
          border: 3px solid white;
          border-radius: 20px;
          padding: 8px 12px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 60px;
          justify-content: center;
        ">
          <!-- Lucide Icon -->
          <div style="
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          ">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${iconType === 'Building' ? `
                <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
                <path d="M9 22v-4h6v4"/>
                <path d="M8 6h.01"/>
                <path d="M16 6h.01"/>
                <path d="M12 6h.01"/>
                <path d="M12 10h.01"/>
                <path d="M12 14h.01"/>
                <path d="M16 10h.01"/>
                <path d="M16 14h.01"/>
                <path d="M8 10h.01"/>
                <path d="M8 14h.01"/>
              ` : iconType === 'Building2' ? `
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                <path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2"/>
                <path d="M18 9v3"/>
                <path d="M13 9v3"/>
                <path d="M9 9v3"/>
                <path d="M9 18v3"/>
                <path d="M13 18v3"/>
                <path d="M18 18v3"/>
              ` : `
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              `}
            </svg>
          </div>
          <!-- Price Text -->
          <span style="
            color: white;
            font-weight: 600;
            font-size: 12px;
            line-height: 1;
          ">
            ${priceText}
          </span>
        </div>
        <!-- Bottom Pointer -->
        <div style="
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid ${color};
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
        "></div>
      </div>
    `,
    className: 'custom-property-marker',
    iconSize: [80, 40],
    iconAnchor: [40, 40],
  });
};

// Function to calculate bounds that fit all properties
const calculateBounds = (properties: Property[]) => {
  const validProperties = properties.filter(property => 
    property.coordinates && 
    Array.isArray(property.coordinates) && 
    property.coordinates.length === 2 &&
    !isNaN(property.coordinates[0]) &&
    !isNaN(property.coordinates[1])
  );

  if (validProperties.length === 0) return null;

  const lats = validProperties.map(p => p.coordinates[1]);
  const lngs = validProperties.map(p => p.coordinates[0]);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Add padding
  const padding = 0.01; // Adjust this value as needed
  return [
    [minLat - padding, minLng - padding],
    [maxLat + padding, maxLng + padding]
  ];
};

const DashboardMap: React.FC<PropertyMapProps> = ({ 
  properties, 
  onPropertySelect
}) => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.2672, -97.7431]); // Austin, TX
  const [zoom, setZoom] = useState(12);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = React.useRef<any>(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [selectedPropertyForDetails, setSelectedPropertyForDetails] = useState<Property | null>(null);
  
  // Save property functionality
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedProperties, setSavedProperties] = useState<Set<string>>(new Set());
  const [savedPropertyIds, setSavedPropertyIds] = useState<Map<string, string>>(new Map());
  const [savingProperties, setSavingProperties] = useState<Set<string>>(new Set());

  const handleViewDetails = (property: Property) => {
    setSelectedPropertyForDetails(property);
    setShowPropertyDetails(true);
  };

  const handleClosePropertyDetails = () => {
    setShowPropertyDetails(false);
    setSelectedPropertyForDetails(null);
  };

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
              title: "Property unsave",
              description: "Property has been saved from your saved list.",
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
        const formatBedrooms = () => {
          if (property.bedrooms) return property.bedrooms;
          const bedMatch = property.beds?.match(/(\d+)/);
          return bedMatch ? parseInt(bedMatch[1]) : 1;
        };

        const formatBathrooms = () => {
          return property.bathrooms || 1;
        };

        const formatSqft = () => {
          return property.sqft || 900; // Default fallback
        };

        const propertyData: SavePropertyData = {
          propertyId: propertyId,
          propertyName: property.name,
          propertyAddress: property.address,
          propertyPrice: property.priceRange || (property.rent_amount ? `$${property.rent_amount.toLocaleString()}/month` : 'Price on request'),
          propertyBeds: formatBedrooms(),
          propertyBaths: formatBathrooms(),
          propertySqft: formatSqft(),
          propertyRating: property.rating,
          propertyImage: property.image || '',
          propertyType: property.propertyType || 'Property',
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

  // Function to fit all properties in view
  const fitAllProperties = () => {
    const bounds = calculateBounds(properties);
    if (bounds && mapRef.current) {
      try {
        mapRef.current.fitBounds(bounds, { 
          padding: [50, 50], // More padding
          maxZoom: 10 // Prevent zooming in too much for spread out properties
        });
      } catch (error) {
        console.warn('Error fitting bounds:', error);
      }
    }
  };
  
  // Calculate map center and zoom to fit all properties
  useEffect(() => {
    if (properties.length === 0) {
      setMapCenter([37.7749, -122.4194]);
      return;
    }

    const validCoords = properties.filter(
      (p) =>
        p.coordinates &&
        Array.isArray(p.coordinates) &&
        p.coordinates.length === 2 &&
        !isNaN(p.coordinates[0]) &&
        !isNaN(p.coordinates[1])
    );

    if (validCoords.length === 0) {
      setMapCenter([37.7749, -122.4194]);
      return;
    }

    const avgLat = validCoords.reduce((sum, p) => sum + p.coordinates[1], 0) / validCoords.length;
    const avgLng = validCoords.reduce((sum, p) => sum + p.coordinates[0], 0) / validCoords.length;
    setMapCenter([avgLat, avgLng]);
    
    // Dynamic zoom based on property count and geographic spread - scales for any number
    let calculatedZoom;
    if (validCoords.length === 1) {
      calculatedZoom = 15;
    } else {
      // Calculate geographic spread to determine appropriate zoom
      const lats = validCoords.map(p => p.coordinates[1]);
      const lngs = validCoords.map(p => p.coordinates[0]);
      
      const latSpread = Math.max(...lats) - Math.min(...lats);
      const lngSpread = Math.max(...lngs) - Math.min(...lngs);
      const maxSpread = Math.max(latSpread, lngSpread);
    
      
      // Zoom based on geographic spread
      if (maxSpread > 50) {
        calculatedZoom = 3; // Continental view
      } else if (maxSpread > 20) {
        calculatedZoom = 4; // Multi-state view  
      } else if (maxSpread > 10) {
        calculatedZoom = 5; // Regional view
      } else if (maxSpread > 5) {
        calculatedZoom = 6; // State view
      } else if (maxSpread > 2) {
        calculatedZoom = 7; // Metro area view
      } else if (maxSpread > 0.5) {
        calculatedZoom = 9; // City view
      } else {
        calculatedZoom = 11; // Local area view
      }
    }
    
    setZoom(calculatedZoom);

    // After map loads, fit bounds to show all properties - with shorter delay
    setTimeout(() => {
      fitAllProperties();
    }, 500);
  }, [properties]);

  // Filter properties with valid coordinates
  const validProperties = properties.filter(property => 
    property.coordinates && 
    Array.isArray(property.coordinates) && 
    property.coordinates.length === 2 &&
    !isNaN(property.coordinates[0]) &&
    !isNaN(property.coordinates[1])
  );

  // Log first few properties with coordinates
  // properties.slice(0, 3).forEach((prop, index) => {
  //   console.log(`Property ${index + 1}:`, {
  //     id: prop.id,
  //     name: prop.name,
  //     coordinates: prop.coordinates,
  //     coordinateValues: prop.coordinates ? `[${prop.coordinates[0]}, ${prop.coordinates[1]}]` : 'null',
  //     lat: prop.coordinates ? prop.coordinates[1] : 'undefined',
  //     lng: prop.coordinates ? prop.coordinates[0] : 'undefined',
  //     isValid: prop.coordinates && 
  //       Array.isArray(prop.coordinates) && 
  //       prop.coordinates.length === 2 &&
  //       !isNaN(prop.coordinates[0]) &&
  //       !isNaN(prop.coordinates[1])
  //   });
  // });

  // Check if coordinates are in expected format [lng, lat] vs [lat, lng]
  const sampleCoords = validProperties[0]?.coordinates;
 

  // Calculate bounds for debugging
  if (validProperties.length > 0) {
    const bounds = calculateBounds(validProperties);
   
  }

  if (validProperties.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 max-w-md">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <div className="text-blue-600 text-2xl">🗺️</div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Loading Property Map</h3>
          <p className="text-gray-600 mb-6">
            {properties.length === 0 
              ? "No properties available to display on map"
              : "Properties are loading with location data..."
            }
          </p>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center p-8 max-w-md">
          <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <div className="text-red-600 text-2xl">⚠️</div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Map Loading Error</h3>
          <p className="text-gray-600 mb-6">
            There was an issue loading the interactive map. Please refresh the page or try again later.
          </p>
          <button 
            onClick={() => setMapError(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="relative w-full h-full">
        <MapContainer 
          ref={mapRef}
          center={mapCenter} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          zoomControl={true}
        >
          <MapUpdater center={mapCenter} zoom={zoom} mapRef={mapRef} />
          
          {/* Fullscreen Control */}
          {FullscreenControl && <FullscreenControl position="topleft" />}
          
          {/* Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Individual Property Markers - No Clustering */}
          {validProperties.map((property) => {
            // Extra validation and debugging for each marker
            const lat = property.coordinates[1];
            const lng = property.coordinates[0];
            
            // Ensure coordinates are valid numbers
            if (isNaN(lat) || isNaN(lng)) {
              console.warn(`Invalid coordinates for property ${property.id}:`, property.coordinates);
              return null;
            }

            // Log marker creation for first few properties
          

            return (
              <Marker
                key={`marker-${property.id}`}
                position={[lat, lng]}
                icon={createPropertyIcon(property)}
                eventHandlers={{
                  click: (e) => {
                    e.originalEvent.stopPropagation();
                    setSelectedProperty(property);
                  },
                }}
              >
                <Popup maxWidth={280} minWidth={260}>
                  <div className="p-0 font-sans bg-white m-1.5 rounded-xl overflow-hidden shadow-2xl border border-gray-100">
                    {/* Property Image */}
                    <div className="w-full h-26 overflow-hidden relative bg-gray-100">
                      {property.image ? (
                        <img 
                          src={property.image} 
                          alt={property.name}
                          className="w-full h-full object-cover transition-opacity duration-300"
                          onLoad={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gray-100 ${property.image ? 'hidden' : 'flex'} items-center justify-center text-gray-500 text-xs absolute top-0 left-0`}>
                        <div className="text-center">
                          <div className="text-xl mb-1">🏠</div>
                          <div>Property Image</div>
                        </div>
                      </div>
                      
                      {/* Property Type Badge */}
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-xl text-xs font-semibold uppercase tracking-wider">
                        {property.propertyType || 'Property'}
                      </div>
                      
                      {/* Heart Icon - Save Property */}
                      <motion.div 
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                          savedProperties.has(property.id.toString())
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-200'
                            : 'bg-white bg-opacity-90 hover:bg-opacity-100'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveProperty(property);
                        }}
                      >
                        <Heart 
                          size={16} 
                          color={savedProperties.has(property.id.toString()) ? "#ffffff" : "#ef4444"} 
                          fill={savedProperties.has(property.id.toString()) ? "#ffffff" : "none"}
                          className={`transition-all duration-300 ${
                            savingProperties.has(property.id.toString()) ? 'animate-pulse' : ''
                          }`}
                        />
                      </motion.div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-3">
                      {/* Property Name */}
                      <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">
                        {property.name}
                      </h3>
                      
                      {/* Price */}
                      <div className="mb-1">
                        <p className="!m-0 text-lg font-bold text-gray-900 tracking-tight">
                          {property.priceRange || (property.rent_amount ? `${property.rent_amount.toLocaleString()}/month` : 'Price on request')}
                        </p>
                      </div>
                      
                      {/* Bed/Bath Summary */}
                      <div className="flex items-center mb-1 gap-3 text-sm text-gray-500">
                        <span>
                          {property.beds || `${property.bedrooms} bd`} | {property.bathrooms || 'N/A'} ba
                        </span>
                        <span>•</span>
                        <span>{property.propertyType || 'Property'} for {property.rent_amount ? 'rent' : 'sale'}</span>
                      </div>
                      
                      {/* Address */}
                      <div className="flex items-start gap-1 mt-2">
                        <MapPin size={12} color="#6b7280" className="mt-0.5 flex-shrink-0" />
                        <p className="!m-0 text-xs text-gray-500 leading-tight">
                          {typeof property.address === 'string' 
                            ? property.address
                            : formatPropertyAddress(property.address)
                          }
                        </p>
                      </div>
                      
                      {/* Debug info - temporary */}
                      {/* <div className="text-xs text-blue-600 mt-1">
                        Coords: [{lat.toFixed(4)}, {lng.toFixed(4)}]
                      </div> */}
                      
                      {/* Divider */}
                      <div className="border-t border-gray-100 my-2"></div>
                      
                      {/* Action Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Navigate to property details URL which will open the modal
                          navigate(`/property-details/${property.id}`);
                        }}
                        // onClick={(e) => {
                        //   e.stopPropagation();
                        //   handleViewDetails(property);
                        // }}
                        className="relative w-full py-2 px-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 overflow-hidden group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                        <span className="relative">View Details</span>
                      </motion.button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          }).filter(Boolean)}
        </MapContainer>

        {/* Controls */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 z-40 border border-gray-200">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-semibold text-gray-900">{validProperties.length} properties</span>
            </div>
            <button
              onClick={fitAllProperties}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Fit All
            </button>
          </div>
        </div>

        {/* Map Attribution */}
        <div className="absolute bottom-2 left-2 text-xs text-gray-500 z-30">
          Map data ©2025 OpenStreetMap contributors
        </div>
        
        {/* PropertyDetailsModal */}
        {selectedPropertyForDetails && (
          <PropertyDetailsModal
            property={{
              ...selectedPropertyForDetails,
              id: String(selectedPropertyForDetails.id),
              amenities: selectedPropertyForDetails.amenities || []
            }}
            isOpen={showPropertyDetails}
            onClose={handleClosePropertyDetails}
            onScheduleTour={() => {
              handleClosePropertyDetails();
            }}
            onApplyNow={() => {
              handleClosePropertyDetails();
            }}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('Error rendering map:', error);
    setMapError('Failed to initialize map');
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center p-8 max-w-md">
          <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <div className="text-red-600 text-2xl">⚠️</div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Map Loading Error</h3>
          <p className="text-gray-600 mb-6">
            There was an issue loading the interactive map. Please refresh the page or try again later.
          </p>
          <button 
            onClick={() => setMapError(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
};

export default DashboardMap;