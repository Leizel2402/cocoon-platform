// Landlord Property Form Types

// Property form data interface
export interface PropertyFormData {
  // Basic Property Information
  name: string;
  title: string; // Property title for listings
  address: {
    line1: string;
    line2?: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  location: {
    lat: number;
    lng: number;
  };
  // Property Details for Dashboard
  rent_amount: number; // Base rent amount
  bedrooms: number; // Number of bedrooms
  bathrooms: number; // Number of bathrooms
  square_feet: number; // Square footage
  property_type: string; // Property type
  propertyType: string; // Alternative property type field
  is_available: boolean; // Availability status
  available_date: string | null; // Available date
  amenities: string[]; // Property amenities
  pet_friendly: boolean; // Pet friendly status
  images: string[]; // Multiple property images
  description: string; // Property description
  rating: number; // Property rating
  isRentWiseNetwork: boolean; // RentWise Network status
  socialFeeds?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
}

// Unit form data interface
export interface UnitFormData {
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  rent: number;
  deposit: number;
  available: boolean;
  availableDate?: Date;
  amenities: string[];
  images: string[];
  description: string;
}

// Listing form data interface
export interface ListingFormData {
  title: string;
  description: string;
  rent: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  images: string[];
  amenities: string[];
  available: boolean;
  availableDate?: Date;
}

// Complete property creation data
export interface PropertyCreationData {
  property: PropertyFormData;
  units: UnitFormData[];
  listings: ListingFormData[];
}

// Form validation errors
export interface PropertyFormErrors {
  property?: {
    name?: string;
    title?: string;
    address?: {
      line1?: string;
      city?: string;
      region?: string;
      postalCode?: string;
      country?: string;
    };
    location?: {
      lat?: string;
      lng?: string;
    };
    rent_amount?: string;
    bedrooms?: string;
    bathrooms?: string;
    square_feet?: string;
    property_type?: string;
    description?: string;
    rating?: string;
  };
  units?: {
    unitNumber?: string;
    bedrooms?: string;
    bathrooms?: string;
    squareFeet?: string;
    rent?: string;
    deposit?: string;
    description?: string;
  };
  listings?: {
    title?: string;
    description?: string;
    rent?: string;
    deposit?: string;
    bedrooms?: string;
    bathrooms?: string;
    squareFeet?: string;
  };
}

// Form step types
export type PropertyFormStep = 'property' | 'units' | 'listings' | 'review';

// Form state interface
export interface PropertyFormState {
  currentStep: PropertyFormStep;
  data: PropertyCreationData;
  errors: PropertyFormErrors;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Form validation rules
export interface PropertyFormValidationRules {
  property: {
    name: { required: boolean; minLength: number; maxLength: number };
    address: {
      line1: { required: boolean; minLength: number };
      city: { required: boolean; minLength: number };
      region: { required: boolean; minLength: number };
      postalCode: { required: boolean; pattern: RegExp };
      country: { required: boolean; minLength: number };
    };
    location: {
      lat: { required: boolean; min: number; max: number };
      lng: { required: boolean; min: number; max: number };
    };
  };
  units: {
    unitNumber: { required: boolean; minLength: number };
    bedrooms: { required: boolean; min: number; max: number };
    bathrooms: { required: boolean; min: number; max: number };
    squareFeet: { required: boolean; min: number; max: number };
    rent: { required: boolean; min: number; max: number };
    deposit: { required: boolean; min: number; max: number };
    description: { required: boolean; minLength: number; maxLength: number };
  };
  listings: {
    title: { required: boolean; minLength: number; maxLength: number };
    description: { required: boolean; minLength: number; maxLength: number };
    rent: { required: boolean; min: number; max: number };
    deposit: { required: boolean; min: number; max: number };
    bedrooms: { required: boolean; min: number; max: number };
    bathrooms: { required: boolean; min: number; max: number };
    squareFeet: { required: boolean; min: number; max: number };
  };
}

// Amenities options
export const PROPERTY_AMENITIES = [
  'Air Conditioning',
  'Heating',
  'Dishwasher',
  'In-Unit Laundry',
  'Balcony',
  'Patio',
  'Garden',
  'Pool',
  'Gym',
  'Parking',
  'Pet Friendly',
  'Furnished',
  'Hardwood Floors',
  'Carpet',
  'Tile',
  'Granite Countertops',
  'Stainless Steel Appliances',
  'Walk-in Closet',
  'High Ceilings',
  'Natural Light',
  'Security System',
  'Doorman',
  'Elevator',
  'Rooftop Access',
  'Storage',
  'Utilities Included',
  'Internet Included',
  'Cable Included',
  'Near Public Transit',
  'Near Shopping',
  'Near Restaurants',
  'Near Schools',
  'Near Parks',
  'Quiet Neighborhood',
  'Safe Neighborhood',
  'Historic Building',
  'New Construction',
  'Renovated',
  'Energy Efficient',
  'Green Building',
  'Wheelchair Accessible',
  'Senior Friendly',
  'Student Friendly',
  'Family Friendly',
  'Pet Friendly',
  'Smoking Allowed',
  'No Smoking',
  'Other'
] as const;

export type PropertyAmenity = typeof PROPERTY_AMENITIES[number];

// Property types
export const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Condo',
  'Townhouse',
  'Studio',
  'Loft',
  'Duplex',
  'Triplex',
  'Fourplex',
  'Mobile Home',
  'Other'
] as const;

export type PropertyType = typeof PROPERTY_TYPES[number];

// US States for address form
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const;

export type USState = typeof US_STATES[number];
