import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { Button } from './ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Settings, Square, Satellite, Car, Map as MapIcon, Layers } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslations';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Property {
  id: number;
  name: string;
  address: string;
  priceRange: string;
  beds: string;
  rating: number;
  coordinates: [number, number];
}

interface PropertyMapProps {
  properties: Property[];
  isPrequalified?: boolean;
  onPropertySelect?: (property: Property) => void;
  language?: 'EN' | 'ES' | 'FR' | 'DE';
}

const DashboardMap = ({ properties, isPrequalified = false, onPropertySelect, language = 'EN' }: PropertyMapProps) => {
  const { t } = useTranslation(language);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenError, setTokenError] = useState<string>('');
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/light-v11');
  const [showTraffic, setShowTraffic] = useState(false);
  const [showSchools, setShowSchools] = useState(false);
  const [showCampuses, setShowCampuses] = useState(false);
  const [showRestaurants, setShowRestaurants] = useState(false);
  const [showTransit, setShowTransit] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const previousView = useRef<{ center: [number, number]; zoom: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        console.log('Fetching Mapbox token...');
        
        // First try to get token from environment variable
        const envToken = import.meta.env.VITE_MAPBOX_TOKEN;
        if (envToken) {
          console.log('Using Mapbox token from environment variable');
          setMapboxToken(envToken);
          return;
        }
        
        // If no env token, try to get from Firebase Firestore
        const configDoc = await getDoc(doc(db, 'config', 'mapbox'));
        if (configDoc.exists()) {
          const configData = configDoc.data();
          if (configData?.token) {
            console.log('Using Mapbox token from Firebase');
            setMapboxToken(configData.token);
            return;
          }
        }
        
        // If no token found anywhere
        console.error('No Mapbox token found');
        setTokenError('Mapbox token not configured. Please add VITE_MAPBOX_TOKEN to environment variables or configure in Firebase.');
        
      } catch (error) {
        console.error('Error fetching Mapbox token:', error);
        setTokenError('Map service temporarily unavailable.');
      }
    };

    getMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [-97.7431, 30.2672], // Austin, TX
      zoom: 11
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Initialize drawing controls
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
      modes: {
        ...MapboxDraw.modes,
        draw_polygon: MapboxDraw.modes.draw_polygon
      }
    });

    map.current.addControl(draw.current, 'top-left');

    // Handle drawing events
    map.current.on('draw.create', (e: { features?: Array<{ geometry: { type: string; coordinates: number[][][] } }> }) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        if (feature.geometry.type === 'Polygon') {
          const coordinates = feature.geometry.coordinates[0] as [number, number][];
          const bounds = coordinates.reduce((b: mapboxgl.LngLatBounds, coord: [number, number]) => {
            return b.extend(coord);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
          map.current?.fitBounds(bounds, { padding: 50 });
        }
        setIsDrawingMode(false);
      }
    });

    setMapReady(true);

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Handle map style changes
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(mapStyle);
  }, [mapStyle]);

  // Handle overlay layers (traffic, schools, campuses, restaurants, transit)
  useEffect(() => {
    if (!map.current) return;

    const applyOverlays = () => {
      if (!map.current) return;

      // Traffic (vector tiles)
      if (showTraffic) {
        if (!map.current.getSource('mapbox-traffic')) {
          map.current.addSource('mapbox-traffic', {
            type: 'vector',
            url: 'mapbox://mapbox.mapbox-traffic-v1'
          });
        }
        if (!map.current.getLayer('overlay-traffic')) {
          map.current.addLayer({
            id: 'overlay-traffic',
            type: 'line',
            source: 'mapbox-traffic',
            'source-layer': 'traffic',
            paint: {
              'line-color': [
                'case',
                ['==', ['get', 'congestion'], 'low'], '#4CAF50',
                ['==', ['get', 'congestion'], 'moderate'], '#FF9800',
                ['==', ['get', 'congestion'], 'heavy'], '#F44336',
                ['==', ['get', 'congestion'], 'severe'], '#9C27B0',
                '#000000'
              ],
              'line-width': 2
            }
          });
        }
      } else {
        if (map.current.getLayer('overlay-traffic')) map.current.removeLayer('overlay-traffic');
        if (map.current.getSource('mapbox-traffic')) map.current.removeSource('mapbox-traffic');
      }

      // Helper to add/remove POI circle overlays from composite source
      const addPoiCircle = (id: string, classes: string[], color: string) => {
        if (!map.current?.getLayer(id)) {
          map.current?.addLayer({
            id,
            type: 'circle',
            source: 'composite',
            'source-layer': 'poi_label',
            filter: ['match', ['get', 'class'], classes, true, false],
            paint: {
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 2, 14, 4, 18, 8],
              'circle-color': color,
              'circle-opacity': 0.8
            }
          });
        }
      };
      const removeLayer = (id: string) => {
        if (map.current?.getLayer(id)) map.current.removeLayer(id);
      };

      if (showSchools) addPoiCircle('overlay-schools', ['school'], '#1E3A8A'); else removeLayer('overlay-schools');
      if (showCampuses) addPoiCircle('overlay-campuses', ['college', 'university'], '#7C3AED'); else removeLayer('overlay-campuses');
      if (showRestaurants) addPoiCircle('overlay-restaurants', ['restaurant', 'cafe', 'fast_food'], '#EF4444'); else removeLayer('overlay-restaurants');
      if (showTransit) addPoiCircle('overlay-transit', ['bus', 'rail', 'subway', 'tram'], '#0EA5E9'); else removeLayer('overlay-transit');
    };

    // Initial apply and re-apply on style changes
    applyOverlays();
    const onStyleLoad = () => applyOverlays();
    map.current.on('style.load', onStyleLoad);

    return () => {
      map.current?.off('style.load', onStyleLoad);
    };
  }, [showTraffic, showSchools, showCampuses, showRestaurants, showTransit]);

  // Property markers effect (kept separate so map isn't recreated)
  useEffect(() => {
    if (!map.current || !mapReady) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    properties.forEach((property) => {
      if (!map.current) return;

      const isMatching = isPrequalified && property.id % 2 === 1;

      const markerElement = document.createElement('div');
      markerElement.className = 'property-marker-dot';

      const dotColor = isMatching ? '#007bff' : '#10b981';
      const dotSize = '16px';

      markerElement.style.cssText = `
        width: ${dotSize};
        height: ${dotSize};
        background: ${dotColor};
        border: 3px solid white;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
        position: relative;
      `;

      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.5)';
        markerElement.style.zIndex = '1000';
      });
      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
        markerElement.style.zIndex = '1';
      });

      markerElement.addEventListener('click', () => {
        onPropertySelect?.(property);
      });

      const popup = new mapboxgl.Popup({ offset: 15, closeButton: false }).setHTML(`
        <div class="property-popup" style="padding: 12px; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #1a1a1a;">${property.name}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${property.address}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${property.beds}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: ${isMatching ? '#007bff' : '#10b981'};">${property.priceRange}</p>
          ${isMatching ? '<div style="background: #e3f2fd; color: #1976d2; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">✓ MATCHES YOUR CRITERIA</div>' : ''}
        </div>
      `);

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(property.coordinates)
        .setPopup(popup)
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  }, [properties, isPrequalified, onPropertySelect, mapReady]);

  const handleApplyBoundary = () => {
    if (!draw.current || !map.current) return;
    
    // Save current view to restore on clear
    const center = map.current.getCenter();
    previousView.current = { center: [center.lng, center.lat], zoom: map.current.getZoom() };
    
    // Clear any existing drawings
    draw.current.deleteAll();
    
    // Start polygon drawing mode
    draw.current.changeMode('draw_polygon');
    setIsDrawingMode(true);
  };

  const handleClearBoundary = () => {
    if (!draw.current || !map.current) return;
    draw.current.deleteAll();
    setIsDrawingMode(false);
    if (previousView.current) {
      map.current.flyTo({ center: previousView.current.center, zoom: previousView.current.zoom });
      previousView.current = null;
    }
  };

  const mapStyleOptions = [
    { label: 'Default', value: 'mapbox://styles/mapbox/light-v11', icon: MapIcon },
    { label: 'Satellite', value: 'mapbox://styles/mapbox/satellite-v9', icon: Satellite },
    { label: 'Dark', value: 'mapbox://styles/mapbox/dark-v11', icon: Layers },
    { label: 'Streets', value: 'mapbox://styles/mapbox/streets-v12', icon: MapIcon }
  ];

  if (tokenError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 max-w-md">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <MapIcon className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Interactive Map Coming Soon</h3>
          <p className="text-gray-600 mb-6">The map feature is being configured. In the meantime, you can browse properties using the listings on the right.</p>
          
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <h4 className="font-semibold text-gray-800 mb-3">To enable the map:</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-start space-x-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                <span>Get your Mapbox token from <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">mapbox.com</a></span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                <span>Add it as <code className="bg-gray-100 px-1 rounded">VITE_MAPBOX_TOKEN</code> in your .env file</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                <span>Restart your development server</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading interactive map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Map Controls Overlay */}
      <div className="absolute top-4 left-4 space-y-2 z-30">
        {/* Apply Boundary Tool */}
        <div className="bg-white rounded-lg shadow-lg p-2">
          <Button
            onClick={handleApplyBoundary}
            disabled={isDrawingMode}
            size="sm"
            variant={isDrawingMode ? "default" : "outline"}
            className="w-full text-xs font-medium"
          >
            <Square className="h-3 w-3 mr-1" />
            {isDrawingMode ? t('drawing') : t('applyBoundary')}
          </Button>
          {(isDrawingMode || (draw.current && draw.current.getAll().features.length > 0)) && (
            <Button
              onClick={handleClearBoundary}
              size="sm"
              variant="ghost"
              className="w-full text-xs mt-1 text-red-600 hover:text-red-700"
            >
              {t('clear')}
            </Button>
          )}
        </div>

        {/* Map Options */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="bg-white shadow-lg hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 mr-1" />
              {t('options')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="z-50 w-64 p-4" side="right">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3 text-sm">{t('mapStyle')}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {mapStyleOptions.map((style) => (
                    <Button
                      key={style.value}
                      onClick={() => setMapStyle(style.value)}
                      variant={mapStyle === style.value ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-8 justify-start"
                    >
                      <style.icon className="h-3 w-3 mr-1" />
                      {style.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3 text-sm">{t('overlays')}</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => setShowTraffic(!showTraffic)}
                    variant={showTraffic ? "default" : "outline"}
                    size="sm"
                    className="w-full text-xs h-8 justify-start"
                  >
                    <Car className="h-3 w-3 mr-2" />
                    {t('traffic')}
                  </Button>
                  <Button
                    onClick={() => setShowSchools(!showSchools)}
                    variant={showSchools ? "default" : "outline"}
                    size="sm"
                    className="w-full text-xs h-8 justify-start"
                  >
                    🏫 {t('schools')}
                  </Button>
                  <Button
                    onClick={() => setShowCampuses(!showCampuses)}
                    variant={showCampuses ? "default" : "outline"}
                    size="sm"
                    className="w-full text-xs h-8 justify-start"
                  >
                    🎓 {t('campuses')}
                  </Button>
                  <Button
                    onClick={() => setShowRestaurants(!showRestaurants)}
                    variant={showRestaurants ? "default" : "outline"}
                    size="sm"
                    className="w-full text-xs h-8 justify-start"
                  >
                    🍴 {t('restaurants')}
                  </Button>
                  <Button
                    onClick={() => setShowTransit(!showTransit)}
                    variant={showTransit ? "default" : "outline"}
                    size="sm"
                    className="w-full text-xs h-8 justify-start"
                  >
                    🚇 {t('transit')}
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Drawing Instructions Overlay */}
      {isDrawingMode && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-10">
          <p className="text-sm font-medium">Click to draw boundary points, double-click to finish</p>
        </div>
      )}
    </div>
  );
};

export default DashboardMap;