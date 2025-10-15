import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';

// Types for unit data
export interface LeaseTerm {
  months: number;
  rent: number;
  popular: boolean;
  savings: number | null;
  concession: string | null;
}

export interface UnitData {
  id: string;
  propertyId: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  rent: number;
  deposit: number;
  available: boolean;
  availableDate?: string;
  amenities: string[];
  images: string[];
  description: string;
  floor?: number;
  view?: string;
  parkingIncluded?: boolean;
  petFriendly?: boolean;
  furnished?: boolean;
  floorPlan?: string;
  leaseTerms?: LeaseTerm[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Types for property lease term options
export interface PropertyLeaseOptions {
  propertyId: string;
  lease_term_options: string[];
  lease_term_months: number;
  security_deposit_months: number;
  first_month_rent_required: boolean;
  last_month_rent_required: boolean;
}

// Combined response type
export interface UnitWithLeaseOptions extends UnitData {
  propertyLeaseOptions?: PropertyLeaseOptions;
}

/**
 * Fetch all units from the units collection
 */
export const fetchAllUnits = async (): Promise<UnitData[]> => {
  try {
    const unitsQuery = query(
      collection(db, 'units'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(unitsQuery);
    
    if (querySnapshot.empty) {
      console.log('No units found');
      return [];
    }

    const units = querySnapshot.docs.map((doc) => {
      const unit = doc.data();
      return {
        id: doc.id,
        propertyId: unit.propertyId || '',
        unitNumber: unit.unitNumber || `Unit ${doc.id.slice(-4)}`,
        bedrooms: unit.bedrooms || 0,
        bathrooms: unit.bathrooms || 0,
        squareFeet: unit.squareFeet || unit.sqft || 0,
        rent: unit.rent || unit.rentAmount || 0,
        deposit: unit.deposit || 0,
        available: unit.available !== false,
        availableDate: unit.availableDate || new Date().toISOString(),
        amenities: unit.amenities || [],
        images: unit.images || [],
        description: unit.description || '',
        floor: unit.floor || 0,
        view: unit.view || '',
        parkingIncluded: unit.parkingIncluded || false,
        petFriendly: unit.petFriendly || false,
        furnished: unit.furnished || false,
        floorPlan: unit.floorPlan || '',
        leaseTerms: unit.leaseTerms ? unit.leaseTerms.map((term: any) => ({
          months: Number(term.months) || 12,
          rent: Number(term.rent) || 0,
          popular: Boolean(term.popular),
          savings: term.savings ? Number(term.savings) : null,
          concession: term.concession ? String(term.concession) : null,
        })) : [{
          months: 12,
          rent: unit.rent || unit.rentAmount || 0,
          popular: true,
          savings: null,
          concession: null,
        }],
        createdAt: unit.createdAt?.toDate() || new Date(),
        updatedAt: unit.updatedAt?.toDate(),
      };
    });

    return units;
  } catch (error) {
    console.error('Error fetching all units:', error);
    throw new Error('Failed to fetch units');
  }
};

/**
 * Fetch units for a specific property
 */
export const fetchUnitsByProperty = async (propertyId: string): Promise<UnitData[]> => {
  try {
    const unitsQuery = query(
      collection(db, 'units'),
      where('propertyId', '==', propertyId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(unitsQuery);
    
    if (querySnapshot.empty) {
      console.log(`No units found for property ${propertyId}`);
      return [];
    }

    const units = querySnapshot.docs.map((doc) => {
      const unit = doc.data();
      return {
        id: doc.id,
        propertyId: unit.propertyId || '',
        unitNumber: unit.unitNumber || `Unit ${doc.id.slice(-4)}`,
        bedrooms: unit.bedrooms || 0,
        bathrooms: unit.bathrooms || 0,
        squareFeet: unit.squareFeet || unit.sqft || 0,
        rent: unit.rent || unit.rentAmount || 0,
        deposit: unit.deposit || 0,
        available: unit.available !== false,
        availableDate: unit.availableDate || new Date().toISOString(),
        amenities: unit.amenities || [],
        images: unit.images || [],
        description: unit.description || '',
        floor: unit.floor || 0,
        view: unit.view || '',
        parkingIncluded: unit.parkingIncluded || false,
        petFriendly: unit.petFriendly || false,
        furnished: unit.furnished || false,
        floorPlan: unit.floorPlan || '',
        leaseTerms: unit.leaseTerms ? unit.leaseTerms.map((term: any) => ({
          months: Number(term.months) || 12,
          rent: Number(term.rent) || 0,
          popular: Boolean(term.popular),
          savings: term.savings ? Number(term.savings) : null,
          concession: term.concession ? String(term.concession) : null,
        })) : [{
          months: 12,
          rent: unit.rent || unit.rentAmount || 0,
          popular: true,
          savings: null,
          concession: null,
        }],
        createdAt: unit.createdAt?.toDate() || new Date(),
        updatedAt: unit.updatedAt?.toDate(),
      };
    });

    return units;
  } catch (error) {
    console.error(`Error fetching units for property ${propertyId}:`, error);
    throw new Error(`Failed to fetch units for property ${propertyId}`);
  }
};

/**
 * Fetch a single unit by ID
 */
export const fetchUnitById = async (unitId: string): Promise<UnitData | null> => {
  try {
    const unitDoc = await getDoc(doc(db, 'units', unitId));
    
    if (!unitDoc.exists()) {
      console.log(`Unit ${unitId} not found`);
      return null;
    }

    const unit = unitDoc.data();
    return {
      id: unitDoc.id,
      propertyId: unit.propertyId || '',
      unitNumber: unit.unitNumber || `Unit ${unitDoc.id.slice(-4)}`,
      bedrooms: unit.bedrooms || 0,
      bathrooms: unit.bathrooms || 0,
      squareFeet: unit.squareFeet || unit.sqft || 0,
      rent: unit.rent || unit.rentAmount || 0,
      deposit: unit.deposit || 0,
      available: unit.available !== false,
      availableDate: unit.availableDate || new Date().toISOString(),
      amenities: unit.amenities || [],
      images: unit.images || [],
      description: unit.description || '',
      floor: unit.floor || 0,
      view: unit.view || '',
      parkingIncluded: unit.parkingIncluded || false,
      petFriendly: unit.petFriendly || false,
      furnished: unit.furnished || false,
      floorPlan: unit.floorPlan || '',
      leaseTerms: unit.leaseTerms ? unit.leaseTerms.map((term: any) => ({
        months: Number(term.months) || 12,
        rent: Number(term.rent) || 0,
        popular: Boolean(term.popular),
        savings: term.savings ? Number(term.savings) : null,
        concession: term.concession ? String(term.concession) : null,
      })) : [{
        months: 12,
        rent: unit.rent || unit.rentAmount || 0,
        popular: true,
        savings: null,
        concession: null,
      }],
      createdAt: unit.createdAt?.toDate() || new Date(),
      updatedAt: unit.updatedAt?.toDate(),
    };
  } catch (error) {
    console.error(`Error fetching unit ${unitId}:`, error);
    throw new Error(`Failed to fetch unit ${unitId}`);
  }
};

/**
 * Fetch lease term options from a property
 */
export const fetchPropertyLeaseOptions = async (propertyId: string): Promise<PropertyLeaseOptions | null> => {
  try {
    const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
    
    if (!propertyDoc.exists()) {
      console.log(`Property ${propertyId} not found`);
      return null;
    }

    const property = propertyDoc.data();
    return {
      propertyId: propertyDoc.id,
      lease_term_options: property.lease_term_options || ['12 Months'],
      lease_term_months: property.lease_term_months || 12,
      security_deposit_months: property.security_deposit_months || 1,
      first_month_rent_required: property.first_month_rent_required !== false,
      last_month_rent_required: property.last_month_rent_required || false,
    };
  } catch (error) {
    console.error(`Error fetching lease options for property ${propertyId}:`, error);
    throw new Error(`Failed to fetch lease options for property ${propertyId}`);
  }
};

/**
 * Fetch units with their property's lease term options
 */
export const fetchUnitsWithLeaseOptions = async (propertyId: string): Promise<UnitWithLeaseOptions[]> => {
  try {
    // Fetch units and property lease options in parallel
    const [units, propertyLeaseOptions] = await Promise.all([
      fetchUnitsByProperty(propertyId),
      fetchPropertyLeaseOptions(propertyId)
    ]);

    // Combine the data
    return units.map(unit => ({
      ...unit,
      propertyLeaseOptions: propertyLeaseOptions || undefined,
    }));
  } catch (error) {
    console.error(`Error fetching units with lease options for property ${propertyId}:`, error);
    throw new Error(`Failed to fetch units with lease options for property ${propertyId}`);
  }
};

/**
 * Fetch all units with their property's lease term options
 */
export const fetchAllUnitsWithLeaseOptions = async (): Promise<UnitWithLeaseOptions[]> => {
  try {
    const units = await fetchAllUnits();
    
    // Get unique property IDs
    const propertyIds = [...new Set(units.map(unit => unit.propertyId))];
    
    // Fetch lease options for all properties in parallel
    const leaseOptionsPromises = propertyIds.map(propertyId => 
      fetchPropertyLeaseOptions(propertyId)
    );
    
    const leaseOptionsResults = await Promise.all(leaseOptionsPromises);
    
    // Create a map of property ID to lease options
    const leaseOptionsMap = new Map<string, PropertyLeaseOptions>();
    propertyIds.forEach((propertyId, index) => {
      const leaseOptions = leaseOptionsResults[index];
      if (leaseOptions) {
        leaseOptionsMap.set(propertyId, leaseOptions);
      }
    });

    // Combine units with their property lease options
    return units.map(unit => ({
      ...unit,
      propertyLeaseOptions: leaseOptionsMap.get(unit.propertyId),
    }));
  } catch (error) {
    console.error('Error fetching all units with lease options:', error);
    throw new Error('Failed to fetch all units with lease options');
  }
};

/**
 * Fetch available units only
 */
export const fetchAvailableUnits = async (propertyId?: string): Promise<UnitData[]> => {
  try {
    const units = propertyId 
      ? await fetchUnitsByProperty(propertyId)
      : await fetchAllUnits();
    
    return units.filter(unit => unit.available);
  } catch (error) {
    console.error('Error fetching available units:', error);
    throw new Error('Failed to fetch available units');
  }
};

/**
 * Fetch units by specific criteria
 */
export const fetchUnitsByCriteria = async (criteria: {
  propertyId?: string;
  bedrooms?: number;
  bathrooms?: number;
  minRent?: number;
  maxRent?: number;
  available?: boolean;
  limit?: number;
}): Promise<UnitData[]> => {
  try {
    let units: UnitData[] = [];
    
    if (criteria.propertyId) {
      units = await fetchUnitsByProperty(criteria.propertyId);
    } else {
      units = await fetchAllUnits();
    }

    // Apply filters
    let filteredUnits = units;

    if (criteria.bedrooms !== undefined) {
      filteredUnits = filteredUnits.filter(unit => unit.bedrooms === criteria.bedrooms);
    }

    if (criteria.bathrooms !== undefined) {
      filteredUnits = filteredUnits.filter(unit => unit.bathrooms === criteria.bathrooms);
    }

    if (criteria.minRent !== undefined) {
      filteredUnits = filteredUnits.filter(unit => unit.rent >= criteria.minRent!);
    }

    if (criteria.maxRent !== undefined) {
      filteredUnits = filteredUnits.filter(unit => unit.rent <= criteria.maxRent!);
    }

    if (criteria.available !== undefined) {
      filteredUnits = filteredUnits.filter(unit => unit.available === criteria.available);
    }

    // Apply limit
    if (criteria.limit) {
      filteredUnits = filteredUnits.slice(0, criteria.limit);
    }

    return filteredUnits;
  } catch (error) {
    console.error('Error fetching units by criteria:', error);
    throw new Error('Failed to fetch units by criteria');
  }
};
