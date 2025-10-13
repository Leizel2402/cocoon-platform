// Geocoding service for converting search terms to coordinates
// Uses OpenStreetMap Nominatim API (free, no API key required)

export interface GeocodingResult {
  lat: number;
  lng: number;
  display_name: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    country_code?: string;
  };
}

export interface GeocodingError {
  error: string;
  message: string;
}

// Cache for geocoding results to avoid repeated API calls
const geocodingCache = new Map<string, GeocodingResult | GeocodingError>();

export const geocodeSearchTerm = async (searchTerm: string): Promise<GeocodingResult | GeocodingError> => {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return {
      error: 'INVALID_INPUT',
      message: 'Search term cannot be empty'
    };
  }

  const trimmedTerm = searchTerm.trim();
  
  // Check cache first
  if (geocodingCache.has(trimmedTerm)) {
    const cached = geocodingCache.get(trimmedTerm);
    if (cached && 'error' in cached) {
      return cached;
    }
    return cached as GeocodingResult;
  }

  try {
    // Use OpenStreetMap Nominatim API - worldwide search
    const encodedTerm = encodeURIComponent(trimmedTerm);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedTerm}&limit=1&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Cocoon-Platform/1.0 (Property Search)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      const error: GeocodingError = {
        error: 'NO_RESULTS',
        message: `No location found for "${trimmedTerm}". Try searching for a city, address, or landmark anywhere in the world.`
      };
      geocodingCache.set(trimmedTerm, error);
      return error;
    }

    const result = data[0];
    const geocodingResult: GeocodingResult = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      display_name: result.display_name,
      address: {
        city: result.address?.city || result.address?.town || result.address?.village || result.address?.municipality,
        state: result.address?.state || result.address?.province || result.address?.region,
        country: result.address?.country,
        postcode: result.address?.postcode,
        country_code: result.address?.country_code
      }
    };

    // Cache the successful result
    geocodingCache.set(trimmedTerm, geocodingResult);
    
    return geocodingResult;
  } catch (error) {
    console.error('Geocoding error:', error);
    const geocodingError: GeocodingError = {
      error: 'GEOCODING_FAILED',
      message: `Failed to find location for "${trimmedTerm}". Please try a different search term.`
    };
    geocodingCache.set(trimmedTerm, geocodingError);
    return geocodingError;
  }
};

// Function to search for properties by name
export const searchPropertiesByName = (properties: any[], searchTerm: string): any[] => {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return properties;
  }

  const trimmedTerm = searchTerm.trim().toLowerCase();
  
  return properties.filter(property => {
    // Search in property name
    if (property.name && property.name.toLowerCase().includes(trimmedTerm)) {
      return true;
    }
    
    // Search in property title (alternative field)
    if (property.title && property.title.toLowerCase().includes(trimmedTerm)) {
      return true;
    }
    
    // Search in address
    if (property.address && property.address.toLowerCase().includes(trimmedTerm)) {
      return true;
    }
    
    // Search in city
    if (property.city && property.city.toLowerCase().includes(trimmedTerm)) {
      return true;
    }
    
    // Search in state
    if (property.state && property.state.toLowerCase().includes(trimmedTerm)) {
      return true;
    }
    
    return false;
  });
};

// Function to determine if a search term is likely a location vs property name
export const isLocationSearch = (searchTerm: string): boolean => {
  const trimmedTerm = searchTerm.trim().toLowerCase();
  
  // If the search term is empty or very short, treat it as a property search
  if (trimmedTerm.length < 2) {
    return false;
  }
  
  // Common location indicators - these suggest it's a location search
  const locationIndicators = [
    'street', 'avenue', 'road', 'drive', 'lane', 'boulevard', 'way', 'place', 'court',
    'city', 'town', 'village', 'neighborhood', 'district', 'area', 'region', 'county',
    'state', 'province', 'zip', 'postal', 'code', 'address', 'location', 'place',
    'north', 'south', 'east', 'west', 'central', 'downtown', 'uptown', 'midtown'
  ];
  
  // Check if the term contains location indicators
  const hasLocationIndicators = locationIndicators.some(indicator => 
    trimmedTerm.includes(indicator)
  );
  
  // Check if it's a city/state pattern (e.g., "Austin, TX", "New York, NY", "London, UK")
  const cityStatePattern = /^[a-z\s]+,\s*[a-z]{2,3}$/i;
  const isCityStatePattern = cityStatePattern.test(trimmedTerm);
  
  // Check if it's a full address pattern (contains numbers and street indicators)
  const addressPattern = /^\d+\s+[a-z\s]+(street|avenue|road|drive|lane|boulevard|way|place|court)/i;
  const isAddressPattern = addressPattern.test(trimmedTerm);
  
  // Check if it contains postal code patterns (US ZIP, Canadian postal, UK postal, etc.)
  const postalCodePattern = /\b\d{5}(-\d{4})?\b|\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b|\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i;
  const hasPostalCode = postalCodePattern.test(trimmedTerm);
  
  // Check if it's likely a geographic coordinate (lat, lng)
  const coordinatePattern = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/;
  const isCoordinate = coordinatePattern.test(trimmedTerm);
  
  // If it contains numbers and location words, it's likely an address
  const hasNumbersAndLocationWords = /\d/.test(trimmedTerm) && 
    (trimmedTerm.includes('street') || trimmedTerm.includes('avenue') || 
     trimmedTerm.includes('road') || trimmedTerm.includes('drive') ||
     trimmedTerm.includes('lane') || trimmedTerm.includes('boulevard'));
  
  // If it's a single word that doesn't look like a property name, it might be a city
  // Property names often contain words like "apartments", "complex", "towers", "plaza", etc.
  const propertyNameIndicators = [
    'apartments', 'apartment', 'complex', 'towers', 'tower', 'plaza', 'plaza',
    'residence', 'residences', 'manor', 'heights', 'hills', 'view', 'views',
    'garden', 'gardens', 'park', 'parks', 'court', 'courts', 'place', 'places',
    'village', 'villages', 'commons', 'square', 'squares', 'terrace', 'terraces',
    'condo', 'condos', 'condominium', 'condominiums', 'loft', 'lofts', 'studio',
    'studios', 'suite', 'suites', 'building', 'buildings', 'center', 'centre'
  ];
  
  const looksLikePropertyName = propertyNameIndicators.some(indicator => 
    trimmedTerm.includes(indicator)
  );
  
  // If it looks like a property name, it's probably not a location search
  if (looksLikePropertyName) {
    return false;
  }
  
  // If it's a single word (no spaces) and doesn't contain numbers, it could be a city
  const isSingleWord = !trimmedTerm.includes(' ') && !trimmedTerm.includes(',');
  const isLikelyCity = isSingleWord && !/\d/.test(trimmedTerm) && trimmedTerm.length > 2;
  
  return hasLocationIndicators || 
         isCityStatePattern || 
         isAddressPattern || 
         hasPostalCode || 
         isCoordinate || 
         hasNumbersAndLocationWords ||
         isLikelyCity;
};

// Interface for search suggestions
export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'location' | 'property';
  coordinates?: [number, number];
  property?: any;
}

// Function to get auto-suggestions as user types
export const getSearchSuggestions = async (
  searchTerm: string, 
  properties: any[], 
  maxSuggestions: number = 8
): Promise<SearchSuggestion[]> => {
  const trimmedTerm = searchTerm.trim().toLowerCase();
  
  if (trimmedTerm.length < 2) {
    return [];
  }

  const suggestions: SearchSuggestion[] = [];

  try {
    // Get location suggestions from geocoding API
    const encodedTerm = encodeURIComponent(trimmedTerm);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedTerm}&limit=5&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Cocoon-Platform/1.0 (Property Search)'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        data.forEach((result: any, index: number) => {
          suggestions.push({
            id: `location-${index}`,
            text: result.display_name,
            type: 'location',
            coordinates: [parseFloat(result.lon), parseFloat(result.lat)]
          });
        });
      }
    }
  } catch (error) {
    console.warn('Error fetching location suggestions:', error);
  }

  // Get property suggestions from local data
  const propertySuggestions = properties
    .filter(property => {
      const searchFields = [
        property.name,
        property.title,
        property.address,
        property.city,
        property.state
      ].filter(Boolean).map(field => field.toLowerCase());
      
      return searchFields.some(field => field.includes(trimmedTerm));
    })
    .slice(0, 3) // Limit property suggestions
    .map((property, index) => ({
      id: `property-${property.id || index}`,
      text: property.name || property.title || property.address || 'Unknown Property',
      type: 'property' as const,
      property: property
    }));

  suggestions.push(...propertySuggestions);

  return suggestions.slice(0, maxSuggestions);
};

// Debounce function for search input
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
