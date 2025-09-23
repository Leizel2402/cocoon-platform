// PropertyMap.tsx component
import React, { useEffect, useRef, useState } from 'react';
import { Property } from '../types';
import { MapPin, X, Bed, Bath, Square, Heart, Share, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PropertyMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onPropertySelect: (property: Property | null) => void;
}

// Mock coordinates for different cities (you can replace with actual coordinates from your data)
const CITY_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  'San Jose': { lat: 37.3382, lng: -121.8863 },
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'Austin': { lat: 30.2672, lng: -97.7431 },
  'Seattle': { lat: 47.6062, lng: -122.3321 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
  'Boston': { lat: 42.3601, lng: -71.0589 },
  'Denver': { lat: 39.7392, lng: -104.9903 },
};

// Generate random coordinates around a city center
const generateCoordinatesAroundCity = (city: string, index: number) => {
  const baseCoords = CITY_COORDINATES[city] || CITY_COORDINATES['San Francisco'];
  const radius = 0.05; // Roughly 5km radius
  const angle = (index * 137.508) % 360; // Golden angle for distribution
  const distance = Math.sqrt(Math.random()) * radius;
  
  return {
    lat: baseCoords.lat + (distance * Math.cos(angle * Math.PI / 180)),
    lng: baseCoords.lng + (distance * Math.sin(angle * Math.PI / 180))
  };
};

export function PropertyMap({ properties, selectedProperty, onPropertySelect }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 }); // Default to SF
  const [zoom, setZoom] = useState(11);

  // Enhanced properties with coordinates
  const enhancedProperties = properties.map((property, index) => ({
    ...property,
    coordinates: generateCoordinatesAroundCity(property.city, index)
  }));

  useEffect(() => {
    if (properties.length > 0) {
      // Calculate center based on properties
      const avgLat = enhancedProperties.reduce((sum, p) => sum + p.coordinates.lat, 0) / enhancedProperties.length;
      const avgLng = enhancedProperties.reduce((sum, p) => sum + p.coordinates.lng, 0) / enhancedProperties.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
    }
  }, [properties]);

  const PropertyPin = ({ property, isSelected, isHovered }: { 
    property: Property & { coordinates: { lat: number; lng: number } }; 
    isSelected: boolean; 
    isHovered: boolean; 
  }) => {
    const pinStyle = {
      position: 'absolute' as const,
      left: `${((property.coordinates.lng - mapCenter.lng) * 1000 * zoom / 11) + 50}%`,
      top: `${(-(property.coordinates.lat - mapCenter.lat) * 1000 * zoom / 11) + 50}%`,
      transform: 'translate(-50%, -100%)',
      zIndex: isSelected || isHovered ? 20 : 10,
    };

    return (
      <motion.div
        style={pinStyle}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isSelected ? 1.2 : isHovered ? 1.1 : 1, 
          opacity: 1 
        }}
        whileHover={{ scale: 1.1 }}
        className="cursor-pointer"
        onMouseEnter={() => setHoveredProperty(property)}
        onMouseLeave={() => setHoveredProperty(null)}
        onClick={() => onPropertySelect(property)}
      >
        <div className={`
          relative px-3 py-2 rounded-lg shadow-lg font-semibold text-sm transition-all duration-200
          ${isSelected 
            ? 'bg-blue-600 text-white ring-4 ring-blue-200' 
            : isHovered
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-900 border border-gray-200'
          }
        `}>
          ${(property.rent / 1000).toFixed(1)}k
          <div className={`
            absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full
            w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent
            ${isSelected 
              ? 'border-t-blue-600' 
              : isHovered
                ? 'border-t-blue-500'
                : 'border-t-white'
            }
          `} />
        </div>
      </motion.div>
    );
  };

  const PropertyInfoCard = ({ property }: { property: Property }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-2xl p-4 z-30 max-w-sm"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{property.title}</h3>
          <p className="text-gray-600 text-sm mb-2">{property.city}, {property.state}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              {property.beds} beds
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              {property.baths} baths
            </div>
            {property.sqft && (
              <div className="flex items-center">
                <Square className="h-4 w-4 mr-1" />
                {property.sqft} sqft
              </div>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPropertySelect(null);
          }}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-blue-600">
          ${property.rent.toLocaleString()}/month
        </div>
        <div className="flex space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Heart className="h-4 w-4 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Share className="h-4 w-4 text-gray-400" />
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            View Details
          </button>
        </div>
      </div>

      {property.amenities && property.amenities.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {property.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );

  const HoverCard = ({ property }: { property: Property }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="absolute z-20 bg-white rounded-lg shadow-xl p-3 min-w-48"
      style={{
        left: '50%',
        bottom: '100%',
        transform: 'translate(-50%, -8px)'
      }}
    >
      <div className="text-sm">
        <div className="font-semibold text-gray-900 mb-1">{property.title}</div>
        <div className="text-gray-600 mb-2">{property.city}, {property.state}</div>
        <div className="flex items-center justify-between">
          <div className="font-bold text-blue-600">
            ${property.rent.toLocaleString()}/mo
          </div>
          <div className="text-xs text-gray-500">
            {property.beds}bd • {property.baths}ba
          </div>
        </div>
      </div>
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
    </motion.div>
  );

  return (
    <div ref={mapRef} className="relative w-full h-full bg-gradient-to-br from-blue-50 to-green-50 overflow-hidden">
      {/* Map Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-gradient-to-br from-blue-100 via-green-50 to-blue-100" />
        {/* Grid lines to simulate map */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={`h-${i}`}
              className="absolute w-full border-t border-gray-300/30"
              style={{ top: `${i * 5}%` }}
            />
          ))}
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={`v-${i}`}
              className="absolute h-full border-l border-gray-300/30"
              style={{ left: `${i * 5}%` }}
            />
          ))}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 z-40">
        <button
          onClick={() => setZoom(Math.min(zoom + 2, 20))}
          className="w-10 h-10 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-gray-700 hover:text-gray-900"
        >
          +
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 2, 8))}
          className="w-10 h-10 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-gray-700 hover:text-gray-900"
        >
          −
        </button>
      </div>

      {/* Properties Count */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md px-4 py-2 z-40">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-gray-900">{properties.length} properties</span>
        </div>
      </div>

      {/* Property Pins */}
      {enhancedProperties.map((property) => (
        <div key={property.id} className="relative">
          <PropertyPin
            property={property}
            isSelected={selectedProperty?.id === property.id}
            isHovered={hoveredProperty?.id === property.id}
          />
          
          {/* Hover Card */}
          <AnimatePresence>
            {hoveredProperty?.id === property.id && !selectedProperty && (
              <div
                className="absolute z-20"
                style={{
                  left: `${((property.coordinates.lng - mapCenter.lng) * 1000 * zoom / 11) + 50}%`,
                  top: `${(-(property.coordinates.lat - mapCenter.lat) * 1000 * zoom / 11) + 50}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <HoverCard property={property} />
              </div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Selected Property Info Card */}
      <AnimatePresence>
        {selectedProperty && (
          <PropertyInfoCard property={selectedProperty} />
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-3 z-40">
        <div className="text-xs text-gray-600 mb-2 font-medium">Price Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-4 bg-green-500 rounded"></div>
            <span>Under $2k</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-4 bg-blue-500 rounded"></div>
            <span>$2k - $4k</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-4 bg-purple-500 rounded"></div>
            <span>Over $4k</span>
          </div>
        </div>
      </div>
    </div>
  );
}