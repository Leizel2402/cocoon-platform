import React, { useEffect, useState } from 'react';
import { X, Bed, Bath, Heart, Share, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyDetailsModal from '../components/rentar/unitSelecttion/PropertyDetailsModal';

// React Leaflet imports
import { Map, TileLayer, Marker, Popup, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import FullscreenControl from 'react-leaflet-fullscreen';
import L from 'leaflet';

// Import CSS
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-fullscreen/dist/styles.css';

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

interface Cluster {
  id: string;
  center: [number, number];
  properties: Property[];
  count: number;
}

// Fix for default markers in react-leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to update map center and zoom (using ref approach for react-leaflet 2.x)
const MapUpdater: React.FC<{ center: [number, number]; zoom: number; mapRef: any }> = ({ center, zoom, mapRef }) => {
  useEffect(() => {
    if (mapRef.current && mapRef.current.leafletElement) {
      try {
        mapRef.current.leafletElement.setView(center, zoom);
      } catch (error) {
        console.warn('Error updating map view:', error);
      }
    }
  }, [center, zoom, mapRef]);
  return null;
};

// Custom property marker icon - Modern, clean design
const createPropertyIcon = (property: Property, isCluster: boolean = false, clusterCount?: number) => {
  const isMatching = property.isRentWiseNetwork;
  const rent = property.rent_amount || 2000;
  
  // Modern color palette matching UI theme
  let color = '#ef4444'; // Red
  
  if (isMatching) {
    color = '#10b981'; // Green
  } else if (rent < 2000) {
    color = '#ef4444'; // Red
  } else if (rent < 4000) {
    color = '#3b82f6'; // Blue
  } else {
    color = '#8b5cf6'; // Purple
  }

  const priceText = rent >= 1000 ? `$${(rent / 1000).toFixed(1)}k` : `$${rent}`;
  const displayText = isCluster ? clusterCount?.toString() || '1' : priceText;

  if (isCluster) {
    // Cluster marker - modern circular design
    return L.divIcon({
      html: `
        <div style="
          width: 48px;
          height: 48px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          font-size: 14px;
          color: white;
          position: relative;
          z-index: 1000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          ${displayText}
        </div>
      `,
      className: 'custom-property-marker',
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
  } else {
    // Individual property marker - modern pill design with Lucide icons
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
  }
};

// Clustering algorithm
const createClusters = (properties: Property[], zoom: number): Cluster[] => {
  const validProperties = properties.filter(property => 
    property.coordinates && 
    Array.isArray(property.coordinates) && 
    property.coordinates.length === 2 &&
    !isNaN(property.coordinates[0]) &&
    !isNaN(property.coordinates[1])
  );

  if (validProperties.length === 0) return [];

  // Cluster distance based on zoom level
  const clusterDistance = zoom > 14 ? 0.001 : zoom > 12 ? 0.005 : 0.01;
  const clusters: Cluster[] = [];
  const processed = new Set<string>();

  validProperties.forEach((property, index) => {
    if (processed.has(property.id.toString())) return;

    const cluster: Cluster = {
      id: `cluster-${index}`,
      center: [property.coordinates[1], property.coordinates[0]],
      properties: [property],
      count: 1
    };

    // Find nearby properties to cluster
    validProperties.forEach((otherProperty, otherIndex) => {
      if (otherIndex === index || processed.has(otherProperty.id.toString())) return;

      const distance = Math.sqrt(
        Math.pow(property.coordinates[1] - otherProperty.coordinates[1], 2) +
        Math.pow(property.coordinates[0] - otherProperty.coordinates[0], 2)
      );

      if (distance < clusterDistance) {
        cluster.properties.push(otherProperty);
        cluster.count++;
        processed.add(otherProperty.id.toString());
      }
    });

    // Calculate cluster center
    const avgLat = cluster.properties.reduce((sum, p) => sum + p.coordinates[1], 0) / cluster.properties.length;
    const avgLng = cluster.properties.reduce((sum, p) => sum + p.coordinates[0], 0) / cluster.properties.length;
    cluster.center = [avgLat, avgLng];

    clusters.push(cluster);
    processed.add(property.id.toString());
  });

  return clusters;
};

// Drawing tools component
const DrawTools: React.FC<{ onGeometryChange?: (geojson: any) => void }> = ({ onGeometryChange }) => {
  const _onEdited = (e: any) => {
    let numEdited = 0;
    e.layers.eachLayer(() => {
      numEdited += 1;
    });
    console.log(`_onEdited: edited ${numEdited} layers`, e);
    if (onGeometryChange) {
      onGeometryChange(e.layers.toGeoJSON());
    }
  };

  const _onCreated = (e: any) => {
    let type = e.layerType;
    if (type === "marker") {
      console.log("_onCreated: marker created", e);
    } else {
      console.log("_onCreated: something else created:", type, e);
    }
    console.log("Geojson", e.layer.toGeoJSON());
    if (onGeometryChange) {
      onGeometryChange(e.layer.toGeoJSON());
    }
  };

  const _onDeleted = (e: any) => {
    let numDeleted = 0;
    e.layers.eachLayer(() => {
      numDeleted += 1;
    });
    console.log(`onDeleted: removed ${numDeleted} layers`, e);
    if (onGeometryChange) {
      onGeometryChange(e.layers.toGeoJSON());
    }
  };

  const _onMounted = (drawControl: any) => {
    console.log("_onMounted", drawControl);
  };

  const _onEditStart = (e: any) => {
    console.log("_onEditStart", e);
  };

  const _onEditStop = (e: any) => {
    console.log("_onEditStop", e);
  };

  const _onDeleteStart = (e: any) => {
    console.log("_onDeleteStart", e);
  };

  const _onDeleteStop = (e: any) => {
    console.log("_onDeleteStop", e);
  };

  const _onDrawStart = (e: any) => {
    console.log("_onDrawStart", e);
  };

  return (
    <FeatureGroup>
      <EditControl
        onDrawStart={_onDrawStart}
        position="topleft"
        onEdited={_onEdited}
        onCreated={_onCreated}
        onDeleted={_onDeleted}
        onMounted={_onMounted}
        onEditStart={_onEditStart}
        onEditStop={_onEditStop}
        onDeleteStart={_onDeleteStart}
        onDeleteStop={_onDeleteStop}
        draw={{
          polyline: {
            icon: new L.DivIcon({
              iconSize: new L.Point(8, 8),
              className: "leaflet-div-icon leaflet-editing-icon"
            }),
            shapeOptions: {
              guidelineDistance: 10,
              color: "navy",
              weight: 3
            }
          },
          rectangle: false,
          circlemarker: false,
          circle: false,
          polygon: false,
          marker: true
        }}
      />
    </FeatureGroup>
  );
};

const DashboardMap: React.FC<PropertyMapProps> = ({ 
  properties, 
  onPropertySelect
}) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.2672, -97.7431]); // Austin, TX
  const [zoom, setZoom] = useState(12);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [, setDrawnGeometry] = useState<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const mapRef = React.useRef<any>(null);
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);
  const [selectedPropertyForDetails, setSelectedPropertyForDetails] = useState<Property | null>(null);

  const handleViewDetails = (property: Property) => {
    setSelectedPropertyForDetails(property);
    setShowPropertyDetails(true);
  };

  const handleClosePropertyDetails = () => {
    setShowPropertyDetails(false);
    setSelectedPropertyForDetails(null);
  };
  
  // Calculate map center based on properties
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
    
    // Adjust zoom based on number of properties
    if (validCoords.length === 1) {
      setZoom(15);
    } else if (validCoords.length < 5) {
      setZoom(13);
    } else {
      setZoom(11);
    }
  }, [properties]);

  // Update clusters when properties or zoom changes
  useEffect(() => {
    const newClusters = createClusters(properties, zoom);
    setClusters(newClusters);
  }, [properties, zoom]);

  // Filter properties with valid coordinates
  const validProperties = properties.filter(property => 
    property.coordinates && 
    Array.isArray(property.coordinates) && 
    property.coordinates.length === 2 &&
    !isNaN(property.coordinates[0]) &&
    !isNaN(property.coordinates[1])
  );

  // Debug logging
  console.log('DashboardMap - Total properties:', properties.length);
  console.log('DashboardMap - Valid properties:', validProperties.length);
  console.log('DashboardMap - Properties data:', properties);

  const handleGeometryChange = (geojson: any) => {
    setDrawnGeometry(geojson);
    console.log('Drawn geometry updated:', geojson);
  };

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

  // Show error state if map failed to load
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
        <Map 
          ref={mapRef}
          center={mapCenter} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          zoomControl={true}
          whenReady={() => console.log('Map is ready')}
        >
        <MapUpdater center={mapCenter} zoom={zoom} mapRef={mapRef} />
        
        {/* Fullscreen Control */}
        <FullscreenControl position="topleft" />
        
        {/* Drawing Tools */}
        <DrawTools onGeometryChange={handleGeometryChange} />
        
        {/* Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Property Markers */}
        {clusters.map((cluster) => {
          if (cluster.count === 1) {
            // Single property marker
            const property = cluster.properties[0];
          return (
            <Marker
                key={cluster.id}
                position={[cluster.center[0], cluster.center[1]]}
                icon={createPropertyIcon(property)}
            eventHandlers={{
                  click: () => {
                    setSelectedProperty(property);
                    onPropertySelect?.(property);
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
                    
                    {/* Heart Icon */}
                    <div className="absolute top-2 right-2 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200">
                      <Heart size={16} color="#ef4444" fill="none" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-3">
                    {/* Property Name */}
                    <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">
                      {property.name}
                    </h3>
                    
                    {/* Price */}
                    <div className="mb-1">
                      <p className="!m-0 text-lg  font-bold text-gray-900 tracking-tight">
                        {property.priceRange || (property.rent_amount ? `$${property.rent_amount.toLocaleString()}/month` : 'Price on request')}
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
                        {property.address}
                      </p>
                    </div>
                    
                    {/* Amenities */}
                    {/* {property.amenities && property.amenities.length > 0 && (
                      <div className="mb-2">
                        <h4 className="text-xs font-semibold text-gray-800 mb-1">Amenities</h4>
                        <div className="flex flex-wrap gap-1">
                          {property.amenities.slice(0, 4).map((amenity, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200"
                            >
                              {amenity}
                            </span>
                          ))}
                          {property.amenities.length > 4 && (
                            <span className="px-2 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                              +{property.amenities.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )} */}
                    
                    {/* Divider */}
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    {/* Action Button */}
                    <button
                      onClick={() => handleViewDetails(property)}
                      className="w-full py-2 px-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </Popup>
              </Marker>
            );
          } else {
            // Cluster marker
            return (
              <Marker
                key={cluster.id}
                position={[cluster.center[0], cluster.center[1]]}
                icon={createPropertyIcon(cluster.properties[0], true, cluster.count)}
                eventHandlers={{
                  click: () => {
                    // Zoom in to show individual properties
                    setZoom(prev => Math.min(prev + 2, 18));
                  },
                }}
              >
                <Popup>
                  <div style={{ padding: '12px', minWidth: '200px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#1a1a1a' }}>
                      {cluster.count} Properties
                    </h3>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                      Click to zoom in and see individual properties
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666' }}>
                      Price range: ${Math.min(...cluster.properties.map(p => p.rent_amount || 2000)).toLocaleString()} - ${Math.max(...cluster.properties.map(p => p.rent_amount || 2000)).toLocaleString()}
                    </p>
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      {cluster.properties.slice(0, 3).map((prop, idx) => (
                        <div key={idx} style={{ marginBottom: '2px' }}>
                          • {prop.name} - ${(prop.rent_amount || 0).toLocaleString()}
                    </div>
                      ))}
                      {cluster.properties.length > 3 && (
                        <div>... and {cluster.properties.length - 3} more</div>
                      )}
                    </div>
                </div>
              </Popup>
            </Marker>
          );
          }
        })}
      </Map>

      {/* Selected Property Info Card */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl shadow-2xl p-4 z-30 max-w-sm border border-gray-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{selectedProperty.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{selectedProperty.address}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {selectedProperty.beds || `${selectedProperty.bedrooms} beds`}
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {selectedProperty.bathrooms} baths
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-blue-600">
                {selectedProperty.priceRange || (selectedProperty.rent_amount ? `$${selectedProperty.rent_amount.toLocaleString()}/month` : 'Price on request')}
              </div>
              <div className="flex space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Heart className="h-4 w-4 text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Share className="h-4 w-4 text-gray-400" />
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  onClick={() => onPropertySelect?.(selectedProperty)}
                >
                  View Details
                </button>
              </div>
            </div>

            {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-1">
                  {selectedProperty.amenities.slice(0, 3).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      {amenity}
                    </span>
                  ))}
                  {selectedProperty.amenities.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                      +{selectedProperty.amenities.length - 3} more
                    </span>
                  )}
          </div>
          </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Properties Count */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 z-40 border border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="font-semibold text-gray-900">{validProperties.length} properties</span>
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
            // Handle schedule tour - you can implement this later if needed
            console.log("Schedule tour for property:", selectedPropertyForDetails);
            handleClosePropertyDetails();
          }}
          onApplyNow={() => {
            // Handle apply now - you can implement this later if needed
            console.log("Apply now for property:", selectedPropertyForDetails);
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