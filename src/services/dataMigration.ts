import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Unit, Listing, Landlord } from '../types';

// Interface for static property data from JSON
interface StaticProperty {
  id: string;
  title: string;
  city: string;
  state: string;
  rent: number;
  beds: number;
  baths: number;
  sqft?: number;
  image: string;
  description: string;
  amenities: string[];
  available: boolean;
}

// Interface for Dashboard-compatible property data
interface DashboardProperty {
  landlordId: string;
  title: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  coordinates: [number, number];
  lat: number;
  lng: number;
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  property_type: string;
  propertyType: string;
  is_available: boolean;
  available_date: string | null;
  amenities: string[];
  pet_friendly: boolean;
  image: string;
  description: string;
  rating: number;
  isRentWiseNetwork: boolean;
  created_at: Date;
  updated_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to get city coordinates
const getCityCoordinates = (city: string): { lat: number; lng: number } => {
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    'San Francisco': { lat: 37.7749, lng: -122.4194 },
    'New York': { lat: 40.7128, lng: -74.0060 },
    'Miami': { lat: 25.7617, lng: -80.1918 },
    'Boston': { lat: 42.3601, lng: -71.0589 },
    'Seattle': { lat: 47.6062, lng: -122.3321 },
    'Denver': { lat: 39.7392, lng: -104.9903 },
    'Chicago': { lat: 41.8781, lng: -87.6298 },
    'Madison': { lat: 43.0731, lng: -89.4012 },
    'Los Angeles': { lat: 34.0522, lng: -118.2437 },
    'Ann Arbor': { lat: 42.2808, lng: -83.7430 },
    'Phoenix': { lat: 33.4484, lng: -112.0740 },
    'Portland': { lat: 45.5152, lng: -122.6784 },
    'Charlotte': { lat: 35.2271, lng: -80.8431 },
    'Nashville': { lat: 36.1627, lng: -86.7816 },
    'Houston': { lat: 29.7604, lng: -95.3698 },
    'Aspen': { lat: 39.1911, lng: -106.8175 },
    'San Diego': { lat: 32.7157, lng: -117.1611 },
  };
  
  return cityCoords[city] || { lat: 37.7749, lng: -122.4194 }; // Default to SF
};

// Sample landlord data for migration
const sampleLandlord: Omit<Landlord, 'id'> = {
  name: 'Cocoon Properties LLC',
  country: 'US',
  employees: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Convert static property data to Firestore format (Dashboard-compatible)
const convertStaticPropertyToFirestore = (staticProp: StaticProperty, landlordId: string): DashboardProperty => {
  const coordinates = getCityCoordinates(staticProp.city);
  const lat = coordinates.lat + (Math.random() - 0.5) * 0.1;
  const lng = coordinates.lng + (Math.random() - 0.5) * 0.1;
  
  return {
    // Core property fields
    landlordId,
    title: staticProp.title,
    name: staticProp.title,
    address: `123 ${staticProp.title.replace(/\s+/g, '')} St`,
    city: staticProp.city,
    state: staticProp.state,
    zip_code: `${Math.floor(Math.random() * 90000) + 10000}`,
    country: 'US',
    
    // Location data
    coordinates: [lng, lat], // [longitude, latitude] format for Dashboard
    lat: lat,
    lng: lng,
    
    // Property details
    rent_amount: staticProp.rent,
    bedrooms: staticProp.beds,
    bathrooms: staticProp.baths,
    square_feet: staticProp.sqft || 1000,
    property_type: 'Apartment', // Default to Apartment
    propertyType: 'Apartment',
    
    // Availability and status
    is_available: staticProp.available,
    available_date: staticProp.available ? new Date().toISOString().split('T')[0] : null,
    
    // Amenities and features
    amenities: staticProp.amenities || [],
    pet_friendly: staticProp.amenities?.includes('Pet Friendly') || false,
    
    // Media and description
    image: staticProp.image || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: staticProp.description || '',
    
    // Rating and network status
    rating: 4.2 + (Math.random() * 0.8), // Random rating between 4.2-5.0
    isRentWiseNetwork: Math.random() > 0.5, // Random RentWise Network status
    
    // Timestamps
    created_at: new Date(),
    updated_at: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

const convertStaticPropertyToUnit = (staticProp: StaticProperty, propertyId: string): Omit<Unit, 'id'> => ({
  propertyId,
  unitNumber: '1', // Default unit number
  bedrooms: staticProp.beds,
  bathrooms: staticProp.baths,
  squareFeet: staticProp.sqft || 1000,
  rent: staticProp.rent,
  deposit: Math.round(staticProp.rent * 1.5), // 1.5x rent as deposit
  available: staticProp.available,
  availableDate: staticProp.available ? new Date() : undefined,
  amenities: staticProp.amenities || [],
  images: staticProp.image ? [staticProp.image] : [],
  description: staticProp.description || '',
  createdAt: new Date(),
  updatedAt: new Date(),
});

const convertStaticPropertyToListing = (staticProp: StaticProperty, propertyId: string, unitId: string): Omit<Listing, 'id'> => ({
  propertyId,
  unitId,
  title: staticProp.title,
  description: staticProp.description || '',
  rent: staticProp.rent,
  deposit: Math.round(staticProp.rent * 1.5),
  bedrooms: staticProp.beds,
  bathrooms: staticProp.baths,
  squareFeet: staticProp.sqft || 1000,
  images: staticProp.image ? [staticProp.image] : [],
  amenities: staticProp.amenities || [],
  available: staticProp.available,
  availableDate: staticProp.available ? new Date() : undefined,
  publishedAt: new Date(),
  updatedAt: new Date(),
});

export const migrateStaticDataToFirestore = async () => {
  try {
    console.log('Starting data migration...');

    // 1. Create sample landlord
    const landlordRef = await addDoc(collection(db, 'landlords'), {
      ...sampleLandlord,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('Created landlord:', landlordRef.id);

    // 2. Load static property data
    const response = await fetch('/data/properties.json');
    const staticProperties = await response.json();
    console.log(`Loaded ${staticProperties.length} static properties`);

    // 3. Convert and migrate each property
    for (const staticProp of staticProperties) {
      // Create property with Dashboard-compatible format
      const propertyData = convertStaticPropertyToFirestore(staticProp, landlordRef.id);
      const propertyRef = await addDoc(collection(db, 'properties'), {
        ...propertyData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log('Created property:', propertyRef.id);

      // Create unit
      const unitData = convertStaticPropertyToUnit(staticProp, propertyRef.id);
      const unitRef = await addDoc(collection(db, 'units'), {
        ...unitData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log('Created unit:', unitRef.id);

      // Create listing
      const listingData = convertStaticPropertyToListing(staticProp, propertyRef.id, unitRef.id);
      await addDoc(collection(db, 'listings'), {
        ...listingData,
        publishedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log('Created listing for property:', propertyRef.id);
    }

    console.log('Data migration completed successfully!');
    return { success: true, message: 'Data migrated successfully' };
  } catch (error) {
    console.error('Error during data migration:', error);
    return { success: false, message: 'Migration failed', error };
  }
};

// Function to check if data already exists
export const checkDataExists = async (): Promise<boolean> => {
  try {
    const { getDocs, collection } = require('firebase/firestore');
    const propertiesSnapshot = await getDocs(collection(db, 'properties'));
    return !propertiesSnapshot.empty;
  } catch (error) {
    console.error('Error checking data existence:', error);
    return false;
  }
};
