// Cocoon Platform Types - Based on Firebase + React.js specification

// User roles as per specification
export type UserRole = 'prospect' | 'renter' | 'landlord_employee' | 'cocoon_employee' | 'landlord_admin' | 'cocoon_admin';

// Core User interface matching specification
export interface User {
  uid: string;
  role: UserRole;
  displayName: string;
  email: string;
  phone?: string;
  landlordId?: string; // for employees and renters
  customClaims?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
}

// Landlord interface
export interface Landlord {
  id: string;
  name: string;
  country: string;
  employees: string[]; // user UIDs
  createdAt: Date;
  updatedAt?: Date;
}

// Property interface matching specification
export interface Properties {
  id: string;
  landlordId: string;
  name: string;
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
  socialFeeds?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  createdAt: Date;
  updatedAt?: Date;
}

// Unit interface for property units
export interface Unit {
  id: string;
  propertyId: string;
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
  createdAt: Date;
  updatedAt?: Date;
}

// Listing interface for public property listings
export interface Listing {
  id: string;
  propertyId: string;
  unitId: string;
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
  publishedAt: Date;
  updatedAt?: Date;
}

// Application interface with PII security
export interface Application {
  id: string;
  prospectId: string;
  landlordId: string;
  propertyId: string;
  listingId?: string;
  status: 'started' | 'submitted' | 'screening' | 'approved' | 'rejected';
  appFeeCents: number;
  stripePaymentIntentId?: string;
  piiTokens: {
    ssnToken?: string;
    ssnLast4?: string;
  };
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  employmentInfo: {
    employer: string;
    position: string;
    monthlyIncome: number;
    employmentLength: number;
  };
  references: {
    personal: {
      name: string;
      phone: string;
      relationship: string;
    };
    professional: {
      name: string;
      phone: string;
      position: string;
    };
  };
  moveInDate: Date;
  leaseLength: number; // months
  notes?: string;
  documents: string[]; // Firebase Storage URLs
  createdAt: Date;
  updatedAt: Date;
}

// AI Conversation interface
export interface AIConversation {
  id: string;
  userId: string;
  persona: UserRole;
  messages: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }[];
  context?: {
    propertyId?: string;
    applicationId?: string;
    searchFilters?: SearchFilters;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Property interface for property cards and listings
export interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  rent: number;
  beds: number;
  baths: number;
  sqft?: number;
  rating: number;
  available: string;
  image: string;
  amenities?: string[];
  description?: string;
}

// Search filters interface
export interface SearchFilters {
  keyword?: string;
  city?: string;
  state?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  amenities?: string[];
  moveInDate?: Date;
  minSqft?: number;
  maxSqft?: number;
  petFriendly?: boolean;
  furnished?: boolean;
}

// Saved search interface
export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: SearchFilters;
  notificationEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Favorite property interface
export interface FavoriteProperty {
  id: string;
  userId: string;
  propertyId: string;
  listingId?: string;
  notes?: string;
  createdAt: Date;
}

// Maintenance request interface
export interface MaintenanceRequest {
  id: string;
  renterId: string;
  landlordId: string;
  propertyId: string;
  unitId?: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'submitted' | 'in_progress' | 'completed' | 'cancelled';
  images: string[];
  scheduledDate?: Date;
  completedDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment interface
export interface Payment {
  id: string;
  renterId: string;
  landlordId: string;
  propertyId: string;
  amount: number; // in cents
  currency: string;
  type: 'rent' | 'deposit' | 'fee' | 'maintenance';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripePaymentIntentId: string;
  dueDate: Date;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Audit log interface
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Map bounds interface
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination interface
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Additional types for enhanced functionality
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PropertyFilters extends SearchFilters {
  savedSearch?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'beds' | 'distance';
  viewMode?: 'list' | 'map' | 'grid';
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: SearchFilters;
  created_at: Date;
  notification_enabled?: boolean;
}

export interface FavoriteProperty {
  id: string;
  user_id: string;
  property_id: string | number;
  created_at: Date;
  notes?: string;
}