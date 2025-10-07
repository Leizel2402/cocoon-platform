// Property Form Validation Utilities
import { PropertyFormData, UnitFormData, ListingFormData, PropertyFormErrors } from '../types/propertyForm';

// Validation rules
export const VALIDATION_RULES = {
  property: {
    name: { minLength: 3, maxLength: 100 },
    address: {
      line1: { minLength: 5, maxLength: 200 },
      city: { minLength: 2, maxLength: 100 },
      region: { minLength: 2, maxLength: 50 },
      postalCode: { pattern: /^\d{5}(-\d{4})?$/ },
      country: { minLength: 2, maxLength: 100 }
    },
    location: {
      lat: { min: -90, max: 90 },
      lng: { min: -180, max: 180 }
    }
  },
  unit: {
    unitNumber: { minLength: 1, maxLength: 20 },
    bedrooms: { min: 0, max: 10 },
    bathrooms: { min: 0, max: 10 },
    squareFeet: { min: 0, max: 10000 },
    rent: { min: 0, max: 50000 },
    deposit: { min: 0, max: 100000 },
    description: { minLength: 10, maxLength: 1000 }
  },
  listing: {
    title: { minLength: 5, maxLength: 200 },
    description: { minLength: 20, maxLength: 2000 },
    rent: { min: 0, max: 50000 },
    deposit: { min: 0, max: 100000 },
    bedrooms: { min: 0, max: 10 },
    bathrooms: { min: 0, max: 10 },
    squareFeet: { min: 0, max: 10000 }
  }
};

// Property validation
export const validateProperty = (data: PropertyFormData): PropertyFormErrors['property'] => {
  const errors: PropertyFormErrors['property'] = {};
  const rules = VALIDATION_RULES.property;

  // Name validation
  if (!data.name.trim()) {
    errors.name = 'Property name is required';
  } else if (data.name.length < rules.name.minLength) {
    errors.name = `Property name must be at least ${rules.name.minLength} characters`;
  } else if (data.name.length > rules.name.maxLength) {
    errors.name = `Property name must be no more than ${rules.name.maxLength} characters`;
  }

  // Title validation
  if (!data.title.trim()) {
    errors.title = 'Property title is required';
  } else if (data.title.length < 5) {
    errors.title = 'Property title must be at least 5 characters';
  } else if (data.title.length > 200) {
    errors.title = 'Property title must be no more than 200 characters';
  }

  // Address validation
  if (!data.address.line1.trim()) {
    errors.address = { ...errors.address, line1: 'Street address is required' };
  } else if (data.address.line1.length < rules.address.line1.minLength) {
    errors.address = { ...errors.address, line1: 'Street address is too short' };
  }

  if (!data.address.city.trim()) {
    errors.address = { ...errors.address, city: 'City is required' };
  } else if (data.address.city.length < rules.address.city.minLength) {
    errors.address = { ...errors.address, city: 'City name is too short' };
  }

  if (!data.address.region.trim()) {
    errors.address = { ...errors.address, region: 'State/Region is required' };
  } else if (data.address.region.length < rules.address.region.minLength) {
    errors.address = { ...errors.address, region: 'State/Region is too short' };
  }

  if (!data.address.postalCode.trim()) {
    errors.address = { ...errors.address, postalCode: 'ZIP/Postal code is required' };
  } else if (!rules.address.postalCode.pattern.test(data.address.postalCode)) {
    errors.address = { ...errors.address, postalCode: 'Invalid ZIP code format' };
  }

  if (!data.address.country.trim()) {
    errors.address = { ...errors.address, country: 'Country is required' };
  } else if (data.address.country.length < rules.address.country.minLength) {
    errors.address = { ...errors.address, country: 'Country name is too short' };
  }

  // Location validation
  if (data.location.lat === 0 && data.location.lng === 0) {
    errors.location = { 
      lat: 'Location coordinates are required', 
      lng: 'Location coordinates are required' 
    };
  } else {
    if (data.location.lat < rules.location.lat.min || data.location.lat > rules.location.lat.max) {
      errors.location = { ...errors.location, lat: 'Invalid latitude value' };
    }
    if (data.location.lng < rules.location.lng.min || data.location.lng > rules.location.lng.max) {
      errors.location = { ...errors.location, lng: 'Invalid longitude value' };
    }
  }

  // Property type validation
  if (!data.property_type.trim()) {
    errors.property_type = 'Property type is required';
  }

  // Rent amount validation
  if (data.rent_amount <= 0) {
    errors.rent_amount = 'Rent amount must be greater than 0';
  } else if (data.rent_amount > 50000) {
    errors.rent_amount = 'Rent amount must be less than $50,000';
  }

  // Bedrooms validation
  if (data.bedrooms < 0 || data.bedrooms > 10) {
    errors.bedrooms = 'Bedrooms must be between 0 and 10';
  }

  // Bathrooms validation
  if (data.bathrooms < 0 || data.bathrooms > 10) {
    errors.bathrooms = 'Bathrooms must be between 0 and 10';
  }

  // Square feet validation
  if (data.square_feet <= 0) {
    errors.square_feet = 'Square feet must be greater than 0';
  } else if (data.square_feet > 10000) {
    errors.square_feet = 'Square feet must be less than 10,000';
  }

  // Description validation
  if (!data.description.trim()) {
    errors.description = 'Property description is required';
  } else if (data.description.length < 20) {
    errors.description = 'Description must be at least 20 characters';
  } else if (data.description.length > 2000) {
    errors.description = 'Description must be no more than 2,000 characters';
  }

  // Rating validation
  if (data.rating < 1 || data.rating > 5) {
    errors.rating = 'Rating must be between 1 and 5';
  }

  return errors;
};

// Unit validation
export const validateUnit = (data: UnitFormData): PropertyFormErrors['units'] => {
  const errors: PropertyFormErrors['units'] = {};
  const rules = VALIDATION_RULES.unit;

  // Unit number validation
  if (!data.unitNumber.trim()) {
    errors.unitNumber = 'Unit number is required';
  } else if (data.unitNumber.length < rules.unitNumber.minLength) {
    errors.unitNumber = 'Unit number is too short';
  } else if (data.unitNumber.length > rules.unitNumber.maxLength) {
    errors.unitNumber = 'Unit number is too long';
  }

  // Bedrooms validation
  if (data.bedrooms < rules.bedrooms.min || data.bedrooms > rules.bedrooms.max) {
    errors.bedrooms = `Bedrooms must be between ${rules.bedrooms.min} and ${rules.bedrooms.max}`;
  }

  // Bathrooms validation
  if (data.bathrooms < rules.bathrooms.min || data.bathrooms > rules.bathrooms.max) {
    errors.bathrooms = `Bathrooms must be between ${rules.bathrooms.min} and ${rules.bathrooms.max}`;
  }

  // Square feet validation
  if (data.squareFeet < rules.squareFeet.min || data.squareFeet > rules.squareFeet.max) {
    errors.squareFeet = `Square feet must be between ${rules.squareFeet.min} and ${rules.squareFeet.max}`;
  }

  // Rent validation
  if (data.rent < rules.rent.min || data.rent > rules.rent.max) {
    errors.rent = `Rent must be between $${rules.rent.min} and $${rules.rent.max}`;
  }

  // Deposit validation
  if (data.deposit < rules.deposit.min || data.deposit > rules.deposit.max) {
    errors.deposit = `Deposit must be between $${rules.deposit.min} and $${rules.deposit.max}`;
  }

  // Description validation
  if (!data.description.trim()) {
    errors.description = 'Unit description is required';
  } else if (data.description.length < rules.description.minLength) {
    errors.description = `Description must be at least ${rules.description.minLength} characters`;
  } else if (data.description.length > rules.description.maxLength) {
    errors.description = `Description must be no more than ${rules.description.maxLength} characters`;
  }

  return errors;
};

// Listing validation
export const validateListing = (data: ListingFormData): PropertyFormErrors['listings'] => {
  const errors: PropertyFormErrors['listings'] = {};
  const rules = VALIDATION_RULES.listing;

  // Title validation
  if (!data.title.trim()) {
    errors.title = 'Listing title is required';
  } else if (data.title.length < rules.title.minLength) {
    errors.title = `Title must be at least ${rules.title.minLength} characters`;
  } else if (data.title.length > rules.title.maxLength) {
    errors.title = `Title must be no more than ${rules.title.maxLength} characters`;
  }

  // Description validation
  if (!data.description.trim()) {
    errors.description = 'Listing description is required';
  } else if (data.description.length < rules.description.minLength) {
    errors.description = `Description must be at least ${rules.description.minLength} characters`;
  } else if (data.description.length > rules.description.maxLength) {
    errors.description = `Description must be no more than ${rules.description.maxLength} characters`;
  }

  // Rent validation
  if (data.rent < rules.rent.min || data.rent > rules.rent.max) {
    errors.rent = `Rent must be between $${rules.rent.min} and $${rules.rent.max}`;
  }

  // Deposit validation
  if (data.deposit < rules.deposit.min || data.deposit > rules.deposit.max) {
    errors.deposit = `Deposit must be between $${rules.deposit.min} and $${rules.deposit.max}`;
  }

  // Bedrooms validation
  if (data.bedrooms < rules.bedrooms.min || data.bedrooms > rules.bedrooms.max) {
    errors.bedrooms = `Bedrooms must be between ${rules.bedrooms.min} and ${rules.bedrooms.max}`;
  }

  // Bathrooms validation
  if (data.bathrooms < rules.bathrooms.min || data.bathrooms > rules.bathrooms.max) {
    errors.bathrooms = `Bathrooms must be between ${rules.bathrooms.min} and ${rules.bathrooms.max}`;
  }

  // Square feet validation
  if (data.squareFeet < rules.squareFeet.min || data.squareFeet > rules.squareFeet.max) {
    errors.squareFeet = `Square feet must be between ${rules.squareFeet.min} and ${rules.squareFeet.max}`;
  }

  return errors;
};

// Check if property data is valid
export const isPropertyValid = (data: PropertyFormData): boolean => {
  const errors = validateProperty(data);
  return errors ? Object.keys(errors).length === 0 : true;
};

// Check if unit data is valid
export const isUnitValid = (data: UnitFormData): boolean => {
  const errors = validateUnit(data);
  return errors ? Object.keys(errors).length === 0 : true;
};

// Check if listing data is valid
export const isListingValid = (data: ListingFormData): boolean => {
  const errors = validateListing(data);
  return errors ? Object.keys(errors).length === 0 : true;
};

// Get validation summary
export const getValidationSummary = (errors: PropertyFormErrors) => {
  const totalErrors = Object.values(errors).reduce((count, section) => {
    if (typeof section === 'object' && section !== null) {
      return count + Object.keys(section).length;
    }
    return count;
  }, 0);

  return {
    totalErrors,
    hasErrors: totalErrors > 0,
    sections: {
      property: errors.property ? Object.keys(errors.property).length : 0,
      units: errors.units ? Object.keys(errors.units).length : 0,
      listings: errors.listings ? Object.keys(errors.listings).length : 0,
    }
  };
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Parse currency from string
export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  const digits = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digits.length >= 10 && digits.length <= 15;
};

// Validate ZIP code format
export const isValidZipCode = (zipCode: string): boolean => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
};

// Validate coordinates
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};