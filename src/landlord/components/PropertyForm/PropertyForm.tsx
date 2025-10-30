import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { PropertyFormData, UnitFormData, ListingFormData, PropertyFormStep, PropertyFormState, PropertyFormErrors } from '../../types/propertyForm';
import PropertyBasicInfo from './PropertyBasicInfo';
import UnitForm from './UnitForm';
import ListingForm from './ListingForm';
import PropertyFormStepper from './PropertyFormStepper';
import PropertyFormReview from './PropertyFormReview';
import { Button } from '../../../components/ui/Button';
import { useToast } from '../../../hooks/use-toast';
import { Building, Plus, ArrowLeft, List } from 'lucide-react';

interface PropertyFormProps {
  setPropertyFormOpen: (open: boolean) => void;
  // New props for edit mode
  editingProperty?: {
    id: string;
    name: string;
    title: string;
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
    rent_amount: number;
    bedrooms: number;
    bathrooms: number;
    square_feet: number;
    property_type: string;
    is_available: boolean;
    available_date: string | null;
    amenities: string[];
    pet_friendly: boolean;
    images: string[];
    description: string;
    rating: number;
    userDetails: {
      name: string;
      phone: string;
      email: string;
    };
    lease_term_months: number;
    security_deposit_months: number;
    first_month_rent_required: boolean;
    last_month_rent_required: boolean;
  };
  onPropertyUpdate?: (updatedProperty: any) => void;
  // New props for listing edit mode
  editingListing?: {
    id: string;
    title: string;
    description: string;
    rent: number;
    deposit: number;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    available: boolean;
    amenities: string[];
    images: string[];
    availableDate?: Date;
    propertyId: string;
    unitId?: string;
    landlordId: string;
    userDetails: {
      name: string;
      phone: string;
      email: string;
    };
    lease_term_months?: number;
    application_fee?: number;
    pet_deposit?: number;
    security_deposit_months?: number;
    first_month_rent_required?: boolean;
    last_month_rent_required?: boolean;
  };
  onListingUpdate?: (updatedListing: any) => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ 
  setPropertyFormOpen, 
  editingListing, 
  editingProperty,
  onPropertyUpdate,
  onListingUpdate
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const stepperRef = useRef<HTMLDivElement>(null);
  
  // Determine if we're in edit mode
  const isEditMode = !!editingProperty;
  const isListingEditMode = !!editingListing;
  const isAnyEditMode = isEditMode || isListingEditMode;

  // Helper function to convert various date formats to Date object
  const convertToDate = (date: any): Date | undefined => {
    if (!date) return undefined;
    
    if (date instanceof Date) {
      return date;
    }
    
    if (date.seconds) {
      // Firebase timestamp
      return new Date(date.seconds * 1000);
    }
    
    if (typeof date === 'string') {
      return new Date(date);
    }
    
    return new Date(date);
  };
  
  // Function to scroll to navigation buttons with slower speed
  const scrollToNavigation = () => {
    if (stepperRef.current) {
      // Use a custom slow scroll implementation
      const targetElement = stepperRef.current;
      const targetPosition = targetElement.offsetTop - 100; // 100px offset from top
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1500; // 1.5 seconds for slower scroll
      let start: number | null = null;

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
      };

      // Easing function for smooth animation
      const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
      };

      requestAnimationFrame(animation);
    }
  };
  
  const [formState, setFormState] = useState<PropertyFormState>({
    currentStep: 'property',
    data: {
      property: {
        name: '',
        title: '',
        address: {
          line1: '',
          line2: '',
          city: '',
          region: '',
          postalCode: '',
          country: 'United States',
        },
        location: {
          lat: 0,
          lng: 0,
        },
        rent_amount: 0,
        bedrooms: 0,
        bathrooms: 0,
        square_feet: 0,
        property_type: '',
        propertyType: '',
        is_available: true,
        available_date: null,
        amenities: [],
        pet_friendly: false,
        images: [],
        description: '',
        rating: 0,
        isRentWiseNetwork: false,
        userDetails: {
          name: '',
          phone: '',
          email: '',
        },
        socialFeeds: {},
        // Lease Terms
        lease_term_months: 12,
        lease_term_options: ['12 Months'],
        security_deposit_months: 1,
        first_month_rent_required: true,
        last_month_rent_required: false,
      },
      units: [
        {
          unitNumber: '',
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 0,
          rent: 0,
          deposit: 0,
          available: true,
          amenities: [],
          images: [],
          floorImage: '',
          description: '',
          userDetails: {
            name: '',
            phone: '',
            email: '',
          },
          lease_term_months: 12,
          lease_term_options: ['12 Months'],
          security_deposit_months: 1,
          first_month_rent_required: true,
          last_month_rent_required: false,
          pet_deposit: 0,
          application_fee: 0,
        }
      ],
      listings: [
        {
          title: '',
          description: '',
          rent: 0,
          deposit: 0,
          bedrooms: 1,
          bathrooms: 1,
          squareFeet: 0,
          images: [],
          amenities: [],
          available: true,
          userDetails: {
            name: '',
            phone: '',
            email: '',
          },
          lease_term_months: 12,
          lease_term_options: ['12 Months'],
          security_deposit_months: 1,
          first_month_rent_required: true,
          last_month_rent_required: false,
          pet_deposit: 0,
          application_fee: 0,
        }
      ],
    },
    errors: {},
    isSubmitting: false,
    isDirty: false,
  });

  // Populate form with editingListing data when editing
  React.useEffect(() => {
    if (editingListing) {
      setFormState(prevState => ({
        ...prevState,
        data: {
          ...prevState.data,
          property: {
            ...prevState.data.property,
            name: editingListing.title || '',
            title: editingListing.title || '',
            rent_amount: editingListing.rent || 0,
            bedrooms: editingListing.bedrooms || 0,
            bathrooms: editingListing.bathrooms || 0,
            square_feet: editingListing.squareFeet || 0,
            description: editingListing.description || '',
            amenities: editingListing.amenities || [],
            images: editingListing.images || [],
            is_available: editingListing.available !== false,
            lease_term_months: editingListing.lease_term_months || 12,
          },
          listings: [{
            title: editingListing.title || '',
            description: editingListing.description || '',
            rent: editingListing.rent || 0,
            deposit: editingListing.deposit || 0,
            bedrooms: editingListing.bedrooms || 0,
            bathrooms: editingListing.bathrooms || 0,
            squareFeet: editingListing.squareFeet || 0,
            available: editingListing.available !== false,
            amenities: editingListing.amenities || [],
            images: editingListing.images || [],
            lease_term_months: editingListing.lease_term_months || 12,
            application_fee: editingListing.application_fee || 0,
            userDetails: {
              name: '',
              phone: '',
              email: '',
            },
            lease_term_options: ['12 Months'],
            security_deposit_months: 1,
            first_month_rent_required: true,
            last_month_rent_required: false,
            pet_deposit: 0,
          }],
        },
      }));
    }
  }, [editingListing]);

  const [steps, setSteps] = useState({
    property: { completed: false, valid: false },
    units: { completed: false, valid: false }, // Will be valid when units are properly filled
    listings: { completed: false, valid: false }, // Will be valid when listings are properly filled
    review: { completed: false, valid: false },
  });

  // Load existing property data for edit mode
  useEffect(() => {
    if (editingProperty && isEditMode) {
      loadPropertyData();
    } else if (editingListing && isListingEditMode) {
      loadListingData();
    }
  }, [editingProperty, isEditMode, editingListing, isListingEditMode]);

  // Update review step completion status when other steps change
  useEffect(() => {
    const allStepsValid = steps.property.valid && steps.units.valid && steps.listings.valid;
    setSteps(prev => ({
      ...prev,
      review: { completed: allStepsValid, valid: allStepsValid }
    }));
  }, [steps.property.valid, steps.units.valid, steps.listings.valid]);

  const loadPropertyData = async () => {
    if (!editingProperty) return;
    
    try {
      // Load property data
      const propertyData = {
        name: editingProperty.name || '',
        title: editingProperty.title || '',
        address: {
          line1: editingProperty.address?.line1 || '',
          line2: editingProperty.address?.line2 || '',
          city: editingProperty.address?.city || '',
          region: editingProperty.address?.region || '',
          postalCode: editingProperty.address?.postalCode || '',
          country: editingProperty.address?.country || 'United States',
        },
        location: {
          lat: editingProperty.location?.lat || 0,
          lng: editingProperty.location?.lng || 0,
        },
        rent_amount: editingProperty.rent_amount || 0,
        bedrooms: editingProperty.bedrooms || 0,
        bathrooms: editingProperty.bathrooms || 0,
        square_feet: editingProperty.square_feet || 0,
        property_type: editingProperty.property_type || '',
        propertyType: editingProperty.property_type || '',
        is_available: editingProperty.is_available ?? true,
        available_date: editingProperty.available_date ? (() => {
          const date = convertToDate(editingProperty.available_date);
          return date ? date.toISOString().split('T')[0] : null;
        })() : null,
        amenities: editingProperty.amenities || [],
        pet_friendly: editingProperty.pet_friendly || false,
        images: editingProperty.images || [],
        description: editingProperty.description || '',
        rating: editingProperty.rating || 0,
        isRentWiseNetwork: false,
        userDetails: {
          name: editingProperty.userDetails?.name || '',
          phone: editingProperty.userDetails?.phone || '',
          email: editingProperty.userDetails?.email || '',
        },
        socialFeeds: {},
        lease_term_months: editingProperty.lease_term_months || 12,
        lease_term_options: ['12 Months'],
        security_deposit_months: editingProperty.security_deposit_months || 1,
        first_month_rent_required: editingProperty.first_month_rent_required ?? true,
        last_month_rent_required: editingProperty.last_month_rent_required ?? false,
      };

      // Load units for this property
      const unitsQuery = query(
        collection(db, 'units'),
        where('propertyId', '==', editingProperty.id)
      );
      const unitsSnapshot = await getDocs(unitsQuery);
      const unitsData = unitsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          unitNumber: data.unitNumber || '',
          bedrooms: data.bedrooms || 1,
          bathrooms: data.bathrooms || 1,
          squareFeet: data.squareFeet || 0,
          rent: data.rent || 0,
          deposit: data.deposit || 0,
          available: data.available ?? true,
          amenities: data.amenities || [],
          images: data.images || [],
          floorImage: data.floorImage || '',
          description: data.description || '',
          userDetails: data.userDetails || { name: '', phone: '', email: '' },
          lease_term_months: data.lease_term_months || 12,
          lease_term_options: data.lease_term_options || ['12 Months'],
          security_deposit_months: data.security_deposit_months || 1,
          first_month_rent_required: data.first_month_rent_required ?? true,
          last_month_rent_required: data.last_month_rent_required ?? false,
          pet_deposit: data.pet_deposit || 0,
          application_fee: data.application_fee || 0,
          // Convert availableDate to Date object if it exists
          availableDate: convertToDate(data.availableDate)
        };
      }) as UnitFormData[];

      // Load listings for this property
      const listingsQuery = query(
        collection(db, 'listings'),
        where('propertyId', '==', editingProperty.id)
      );
      const listingsSnapshot = await getDocs(listingsQuery);
      const listingsData = listingsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          rent: data.rent || 0,
          deposit: data.deposit || 0,
          bedrooms: data.bedrooms || 1,
          bathrooms: data.bathrooms || 1,
          squareFeet: data.squareFeet || 0,
          images: data.images || [],
          amenities: data.amenities || [],
          available: data.available ?? true,
          userDetails: data.userDetails || { name: '', phone: '', email: '' },
          lease_term_months: data.lease_term_months || 12,
          lease_term_options: data.lease_term_options || ['12 Months'],
          security_deposit_months: data.security_deposit_months || 1,
          first_month_rent_required: data.first_month_rent_required ?? true,
          last_month_rent_required: data.last_month_rent_required ?? false,
          pet_deposit: data.pet_deposit || 0,
          application_fee: data.application_fee || 0,
          // Convert availableDate to Date object if it exists
          availableDate: convertToDate(data.availableDate)
        };
      }) as ListingFormData[];

      console.log('Loaded property data for edit:', propertyData);
      console.log('Loaded units data for edit:', unitsData);
      console.log('Loaded listings data for edit:', listingsData);

      setFormState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          property: propertyData,
          units: unitsData.length > 0 ? unitsData : prev.data.units,
          listings: listingsData.length > 0 ? listingsData : prev.data.listings
        }
      }));

      // Update step completion status
      setSteps(prev => ({
        ...prev,
        property: { completed: true, valid: true },
        units: { completed: unitsData.length > 0, valid: unitsData.length > 0 },
        listings: { completed: listingsData.length > 0, valid: listingsData.length > 0 }
      }));

    } catch (error) {
      console.error('Error loading property data:', error);
      toast({
        title: "Error",
        description: "Failed to load property data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadListingData = async () => {
    if (!editingListing) return;
    
    try {
      // Load the property data for this listing
      const propertyDoc = await getDoc(doc(db, 'properties', editingListing.propertyId));
      const propertyData = propertyDoc.data();

      if (!propertyData) {
        throw new Error('Property not found for this listing');
      }

      // Map property data to form format
      const mappedPropertyData = {
        name: propertyData.name || '',
        title: propertyData.title || '',
        address: {
          line1: propertyData.address?.line1 || '',
          line2: propertyData.address?.line2 || '',
          city: propertyData.address?.city || '',
          region: propertyData.address?.region || '',
          postalCode: propertyData.address?.postalCode || '',
          country: propertyData.address?.country || 'United States',
        },
        location: {
          lat: propertyData.location?.lat || 0,
          lng: propertyData.location?.lng || 0,
        },
        rent_amount: propertyData.rent_amount || 0,
        bedrooms: propertyData.bedrooms || 0,
        bathrooms: propertyData.bathrooms || 0,
        square_feet: propertyData.square_feet || 0,
        property_type: propertyData.property_type || '',
        propertyType: propertyData.property_type || '',
        is_available: propertyData.is_available ?? true,
        available_date: propertyData.available_date ? (() => {
          const date = convertToDate(propertyData.available_date);
          return date ? date.toISOString().split('T')[0] : null;
        })() : null,
        amenities: propertyData.amenities || [],
        pet_friendly: propertyData.pet_friendly || false,
        images: propertyData.images || [],
        description: propertyData.description || '',
        rating: propertyData.rating || 0,
        isRentWiseNetwork: false,
        userDetails: {
          name: propertyData.userDetails?.name || '',
          phone: propertyData.userDetails?.phone || '',
          email: propertyData.userDetails?.email || '',
        },
        socialFeeds: {},
        lease_term_months: propertyData.lease_term_months || 12,
        lease_term_options: ['12 Months'],
        security_deposit_months: propertyData.security_deposit_months || 1,
        first_month_rent_required: propertyData.first_month_rent_required ?? true,
        last_month_rent_required: propertyData.last_month_rent_required ?? false,
      };

      // Map listing data to form format
      const mappedListingData = {
        id: editingListing.id,
        title: editingListing.title || '',
        description: editingListing.description || '',
        rent: editingListing.rent || 0,
        deposit: editingListing.deposit || 0,
        bedrooms: editingListing.bedrooms || 0,
        bathrooms: editingListing.bathrooms || 0,
        squareFeet: editingListing.squareFeet || 0,
        images: editingListing.images || [],
        amenities: editingListing.amenities || [],
        available: editingListing.available ?? true,
        availableDate: convertToDate((editingListing as any).availableDate),
        userDetails: {
          name: (editingListing as any).userDetails?.name || '',
          phone: (editingListing as any).userDetails?.phone || '',
          email: (editingListing as any).userDetails?.email || '',
        },
        lease_term_months: editingListing.lease_term_months || 12,
        lease_term_options: ['12 Months'],
        security_deposit_months: (editingListing as any).security_deposit_months || 1,
        first_month_rent_required: (editingListing as any).first_month_rent_required ?? true,
        last_month_rent_required: (editingListing as any).last_month_rent_required ?? false,
        pet_deposit: (editingListing as any).pet_deposit || 0,
        application_fee: editingListing.application_fee || 0,
      };

      console.log('Loaded listing data for edit:', mappedListingData);

      setFormState(prev => ({
        ...prev,
        data: {
          ...prev.data,
          property: mappedPropertyData,
          listings: [mappedListingData] // Replace with the single listing being edited
        }
      }));

      // Update step completion status - start on listings step
      setSteps(prev => ({
        ...prev,
        property: { completed: true, valid: true },
        units: { completed: false, valid: false },
        listings: { completed: true, valid: true },
        review: { completed: false, valid: false }
      }));

      // Start on the listings step
      updateFormState({ currentStep: 'listings' });

    } catch (error) {
      console.error('Error loading listing data:', error);
      toast({
        title: "Error",
        description: "Failed to load listing data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Validation functions
  const validateProperty = (data: PropertyFormData): PropertyFormErrors['property'] => {
    const errors: PropertyFormErrors['property'] = {};
    
    if (!data.name.trim()) {
      errors.name = 'Property name is required';
    } else if (data.name.length < 3) {
      errors.name = 'Property name must be at least 3 characters';
    }

    if (!data.title.trim()) {
      errors.title = 'Property title is required';
    } else if (data.title.length < 5) {
      errors.title = 'Property title must be at least 5 characters';
    }

    if (!data.address.line1.trim()) {
      errors.address = { ...errors.address, line1: 'Street address is required' };
    }

    if (!data.address.city.trim()) {
      errors.address = { ...errors.address, city: 'City is required' };
    }

    if (!data.address.region.trim()) {
      errors.address = { ...errors.address, region: 'State is required' };
    }

    if (!data.address.postalCode.trim()) {
      errors.address = { ...errors.address, postalCode: 'ZIP code is required' };
    } else if (!/^\d{5}(-\d{4})?$/.test(data.address.postalCode)) {
      errors.address = { ...errors.address, postalCode: 'Invalid ZIP code format' };
    }

    if (!data.address.country.trim()) {
      errors.address = { ...errors.address, country: 'Country is required' };
    }

    // Validate location coordinates
    if (!data.location.lat || !data.location.lng || data.location.lat === 0 || data.location.lng === 0) {
      errors.location = { 
        lat: 'Latitude is required', 
        lng: 'Longitude is required' 
      };
    } else {
      // Validate coordinate ranges
      if (data.location.lat < -90 || data.location.lat > 90) {
        errors.location = { 
          ...errors.location, 
          lat: 'Latitude must be between -90 and 90 degrees' 
        };
      }
      if (data.location.lng < -180 || data.location.lng > 180) {
        errors.location = { 
          ...errors.location, 
          lng: 'Longitude must be between -180 and 180 degrees' 
        };
      }
    }

    if (!data.property_type.trim()) {
      errors.property_type = 'Property type is required';
    }

    if (data.rent_amount <= 0) {
      errors.rent_amount = 'Rent amount must be greater than 0';
    }

    if (data.bedrooms < 0 || data.bedrooms > 10) {
      errors.bedrooms = 'Bedrooms must be between 0 and 10';
    }

    if (data.bathrooms < 0 || data.bathrooms > 10) {
      errors.bathrooms = 'Bathrooms must be between 0 and 10';
    }

    if (data.square_feet <= 0) {
      errors.square_feet = 'Square feet must be greater than 0';
    }

    if (!data.description.trim()) {
      errors.description = 'Property description is required';
    } else if (data.description.length < 20) {
      errors.description = 'Description must be at least 20 characters';
    }

    if (data.rating < 1 || data.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }

    if (data.lease_term_months < 1 || data.lease_term_months > 36) {
      errors.lease_term_months = 'Lease term must be between 1 and 36 months';
    }

    if (data.security_deposit_months < 0 || data.security_deposit_months > 6) {
      errors.security_deposit_months = 'Security deposit must be between 0 and 6 months';
    }

    if (data.lease_term_options.length === 0) {
      errors.lease_term_options = 'At least one lease term option must be selected';
    }

    // Validate Contact Information
    if (!data.userDetails.name.trim()) {
      errors.userDetails = { ...errors.userDetails, name: 'Contact name is required' };
    }

    if (!data.userDetails.phone.trim()) {
      errors.userDetails = { ...errors.userDetails, phone: 'Contact phone number is required' };
    } else if (!/^[+]?[1-9]\d{0,15}$/.test(data.userDetails.phone.replace(/[\s\-()]/g, ''))) {
      errors.userDetails = { ...errors.userDetails, phone: 'Please enter a valid phone number' };
    }

    if (!data.userDetails.email.trim()) {
      errors.userDetails = { ...errors.userDetails, email: 'Contact email is required' };
    } else     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.userDetails.email)) {
      errors.userDetails = { ...errors.userDetails, email: 'Please enter a valid email address' };
    }

    // Validate available date
    if (data.is_available && !data.available_date) {
      errors.available_date = 'Available date is required when property is marked as available';
    }

    return errors;
  };

  const validateUnit = (data: UnitFormData) => {
    const errors: Record<string, string | { name?: string; phone?: string; email?: string }> = {};
    
    if (!data.unitNumber.trim()) {
      errors.unitNumber = 'Unit number is required';
    }

    if (data.bedrooms < 0 || data.bedrooms > 10) {
      errors.bedrooms = 'Bedrooms must be between 0 and 10';
    }

    if (data.bathrooms < 0 || data.bathrooms > 10) {
      errors.bathrooms = 'Bathrooms must be between 0 and 10';
    }

    if (data.squareFeet < 0 || data.squareFeet > 10000) {
      errors.squareFeet = 'Square feet must be between 0 and 10,000';
    }

    if (data.rent < 0 || data.rent > 50000) {
      errors.rent = 'Rent must be between $0 and $50,000';
    }

    if (data.deposit < 0 || data.deposit > 100000) {
      errors.deposit = 'Deposit must be between $0 and $100,000';
    }

    if (!data.description.trim()) {
      errors.description = 'Unit description is required';
    } else if (data.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (data.lease_term_months < 1 || data.lease_term_months > 36) {
      errors.lease_term_months = 'Lease term must be between 1 and 36 months';
    }

    if (data.security_deposit_months < 0 || data.security_deposit_months > 6) {
      errors.security_deposit_months = 'Security deposit must be between 0 and 6 months';
    }

    if (data.pet_deposit < 0 || data.pet_deposit > 10000) {
      errors.pet_deposit = 'Pet deposit must be between $0 and $10,000';
    }

    if (data.application_fee < 0 || data.application_fee > 1000) {
      errors.application_fee = 'Application fee must be between $0 and $1,000';
    }

    // Validate Contact Information
    const userDetailsErrors: { name?: string; phone?: string; email?: string } = {};
    
    if (!data.userDetails.name.trim()) {
      userDetailsErrors.name = 'Contact name is required';
    }

    if (!data.userDetails.phone.trim()) {
      userDetailsErrors.phone = 'Contact phone number is required';
    } else if (!/^[+]?[1-9]\d{0,15}$/.test(data.userDetails.phone.replace(/[\s\-()]/g, ''))) {
      userDetailsErrors.phone = 'Please enter a valid phone number';
    }

    if (!data.userDetails.email.trim()) {
      userDetailsErrors.email = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.userDetails.email)) {
      userDetailsErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(userDetailsErrors).length > 0) {
      errors.userDetails = userDetailsErrors;
    }

    return errors;
  };

  const validateListing = (data: ListingFormData) => {
    const errors: Record<string, string | { name?: string; phone?: string; email?: string }> = {};
    
    if (!data.title.trim()) {
      errors.title = 'Listing title is required';
    } else if (data.title.length < 5) {
      errors.title = 'Title must be at least 5 characters';
    }

    if (!data.description.trim()) {
      errors.description = 'Listing description is required';
    } else if (data.description.length < 20) {
      errors.description = 'Description must be at least 20 characters';
    }

    if (data.rent < 0 || data.rent > 50000) {
      errors.rent = 'Rent must be between $0 and $50,000';
    }

    if (data.deposit < 0 || data.deposit > 100000) {
      errors.deposit = 'Deposit must be between $0 and $100,000';
    }

    if (data.bedrooms < 0 || data.bedrooms > 10) {
      errors.bedrooms = 'Bedrooms must be between 0 and 10';
    }

    if (data.bathrooms < 0 || data.bathrooms > 10) {
      errors.bathrooms = 'Bathrooms must be between 0 and 10';
    }

    if (data.squareFeet < 0 || data.squareFeet > 10000) {
      errors.squareFeet = 'Square feet must be between 0 and 10,000';
    }

    if (data.lease_term_months < 1 || data.lease_term_months > 36) {
      errors.lease_term_months = 'Lease term must be between 1 and 36 months';
    }

    if (data.security_deposit_months < 0 || data.security_deposit_months > 6) {
      errors.security_deposit_months = 'Security deposit must be between 0 and 6 months';
    }

    if (data.pet_deposit < 0 || data.pet_deposit > 10000) {
      errors.pet_deposit = 'Pet deposit must be between $0 and $10,000';
    }

    if (data.application_fee < 0 || data.application_fee > 1000) {
      errors.application_fee = 'Application fee must be between $0 and $1,000';
    }

    // Validate Contact Information
    const userDetailsErrors: { name?: string; phone?: string; email?: string } = {};
    
    if (!data.userDetails.name.trim()) {
      userDetailsErrors.name = 'Contact name is required';
    }

    if (!data.userDetails.phone.trim()) {
      userDetailsErrors.phone = 'Contact phone number is required';
    } else if (!/^[+]?[1-9]\d{0,15}$/.test(data.userDetails.phone.replace(/[\s\-()]/g, ''))) {
      userDetailsErrors.phone = 'Please enter a valid phone number';
    }

    if (!data.userDetails.email.trim()) {
      userDetailsErrors.email = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.userDetails.email)) {
      userDetailsErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(userDetailsErrors).length > 0) {
      errors.userDetails = userDetailsErrors;
    }

    return errors;
  };

  // Update form state
  const updateFormState = (updates: Partial<PropertyFormState>) => {
    setFormState(prev => ({ ...prev, ...updates, isDirty: true }));
  };

  // Handle property data change
  const handlePropertyChange = (propertyData: PropertyFormData) => {
    const errors = validateProperty(propertyData);
    const isValid = Object.keys(errors || {}).length === 0;
    
    // Check if lease terms have changed
    const leaseTermsChanged = 
      propertyData.lease_term_months !== formState.data.property.lease_term_months ||
      propertyData.security_deposit_months !== formState.data.property.security_deposit_months ||
      propertyData.first_month_rent_required !== formState.data.property.first_month_rent_required ||
      propertyData.last_month_rent_required !== formState.data.property.last_month_rent_required ||
      JSON.stringify(propertyData.lease_term_options) !== JSON.stringify(formState.data.property.lease_term_options);

    // Check if amenities have changed
    const amenitiesChanged = 
      JSON.stringify(propertyData.amenities) !== JSON.stringify(formState.data.property.amenities);

    // Update existing units with new lease terms and amenities if they changed
    let updatedUnits = formState.data.units;
    if (leaseTermsChanged || amenitiesChanged) {
      updatedUnits = formState.data.units.map(unit => ({
        ...unit,
        lease_term_months: propertyData.lease_term_months,
        lease_term_options: propertyData.lease_term_options,
        security_deposit_months: propertyData.security_deposit_months,
        first_month_rent_required: propertyData.first_month_rent_required,
        last_month_rent_required: propertyData.last_month_rent_required,
        // Only update amenities if they changed and unit doesn't have custom amenities
        amenities: amenitiesChanged ? [...propertyData.amenities] : unit.amenities,
      }));
    }

    // Update existing listings with new lease terms and amenities if they changed
    let updatedListings = formState.data.listings;
    if (leaseTermsChanged || amenitiesChanged) {
      updatedListings = formState.data.listings.map(listing => ({
        ...listing,
        lease_term_months: propertyData.lease_term_months,
        lease_term_options: propertyData.lease_term_options,
        security_deposit_months: propertyData.security_deposit_months,
        first_month_rent_required: propertyData.first_month_rent_required,
        last_month_rent_required: propertyData.last_month_rent_required,
        // Only update amenities if they changed and listing doesn't have custom amenities
        amenities: amenitiesChanged ? [...propertyData.amenities] : listing.amenities,
      }));
    }
    
    updateFormState({
      data: { 
        ...formState.data, 
        property: propertyData,
        units: updatedUnits,
        listings: updatedListings
      },
      errors: { ...formState.errors, property: errors },
    });

    // Check if all required fields are filled
    const isAllRequiredFieldsFilled = 
      propertyData.name.trim() &&
      propertyData.title.trim() &&
      propertyData.address.line1.trim() &&
      propertyData.address.city.trim() &&
      propertyData.address.region.trim() &&
      propertyData.address.postalCode.trim() &&
      propertyData.address.country.trim() &&
      propertyData.location.lat !== 0 &&
      propertyData.location.lng !== 0 &&
      propertyData.description.trim() &&
      propertyData.userDetails.name.trim() &&
      propertyData.userDetails.phone.trim() &&
      propertyData.userDetails.email.trim() &&
      (!propertyData.is_available || propertyData.available_date);

    setSteps(prev => ({
      ...prev,
      property: { completed: Boolean(isValid && isAllRequiredFieldsFilled), valid: Boolean(isValid && isAllRequiredFieldsFilled) }
    }));
  };

  // Handle unit data change
  const handleUnitChange = (unitIndex: number, unitData: UnitFormData) => {
    const updatedUnits = [...formState.data.units];
    updatedUnits[unitIndex] = unitData;
    
    const errors = validateUnit(unitData);
    
    updateFormState({
      data: { ...formState.data, units: updatedUnits },
      errors: { 
        ...formState.errors, 
        units: { 
          ...formState.errors.units, 
          [unitIndex]: errors 
        }
      },
    });

    // Check if all units have all required fields filled
    // Units are optional, so if there are no units, the step is valid
    // If there are units, all must be valid
    const allUnitsValid = updatedUnits.length === 0 || updatedUnits.every(unit => {
      const unitErrors = validateUnit(unit);
      const hasNoErrors = Object.keys(unitErrors || {}).length === 0;
      const hasAllRequiredFields = 
        unit.unitNumber.trim() &&
        unit.description.trim() &&
        unit.userDetails.name.trim() &&
        unit.userDetails.phone.trim() &&
        unit.userDetails.email.trim() &&
        (!unit.available || unit.availableDate);
      return hasNoErrors && hasAllRequiredFields;
    });

    setSteps(prev => ({
      ...prev,
      units: { completed: allUnitsValid, valid: allUnitsValid }
    }));
  };

  // Handle listing data change
  const handleListingChange = (listingIndex: number, listingData: ListingFormData) => {
    const updatedListings = [...formState.data.listings];
    updatedListings[listingIndex] = listingData;
    
    const errors = validateListing(listingData);
    
    updateFormState({
      data: { ...formState.data, listings: updatedListings },
      errors: { 
        ...formState.errors, 
        listings: { 
          ...formState.errors.listings, 
          [listingIndex]: errors 
        }
      },
    });

    // Check if all listings have all required fields filled
    // Listings are optional, so if there are no listings, the step is valid
    // If there are listings, all must be valid
    const allListingsValid = updatedListings.length === 0 || updatedListings.every(listing => {
      const listingErrors = validateListing(listing);
      const hasNoErrors = Object.keys(listingErrors || {}).length === 0;
      const hasAllRequiredFields = 
        listing.title.trim() &&
        listing.description.trim() &&
        listing.userDetails.name.trim() &&
        listing.userDetails.phone.trim() &&
        listing.userDetails.email.trim() &&
        (!listing.available || listing.availableDate);
      return hasNoErrors && hasAllRequiredFields;
    });

    setSteps(prev => ({
      ...prev,
      listings: { completed: allListingsValid, valid: allListingsValid }
    }));
  };

  // Add new unit
  const addUnit = () => {
    const newUnit: UnitFormData = {
      unitNumber: '',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 0,
      rent: 0,
      deposit: 0,
      available: true,
      amenities: [...formState.data.property.amenities], // Inherit amenities from property
      images: [],
      floorImage: '',
      description: '',
      userDetails: {
        name: '',
        phone: '',
        email: '',
      },
      // Lease Terms for Unit - inherit from property
      lease_term_months: formState.data.property.lease_term_months,
      lease_term_options: formState.data.property.lease_term_options,
      security_deposit_months: formState.data.property.security_deposit_months,
      first_month_rent_required: formState.data.property.first_month_rent_required,
      last_month_rent_required: formState.data.property.last_month_rent_required,
      pet_deposit: 0,
      application_fee: 0,
    };
    
    const updatedUnits = [...formState.data.units, newUnit];
    updateFormState({
      data: { ...formState.data, units: updatedUnits }
    });

    // Update step completion status
    const allUnitsValid = updatedUnits.length === 0 || updatedUnits.every(unit => {
      const unitErrors = validateUnit(unit);
      const hasNoErrors = Object.keys(unitErrors || {}).length === 0;
      const hasAllRequiredFields = 
        unit.unitNumber.trim() &&
        unit.description.trim() &&
        unit.userDetails.name.trim() &&
        unit.userDetails.phone.trim() &&
        unit.userDetails.email.trim() &&
        (!unit.available || unit.availableDate);
      return hasNoErrors && hasAllRequiredFields;
    });

    setSteps(prev => ({
      ...prev,
      units: { completed: allUnitsValid, valid: allUnitsValid }
    }));
  };

  // Remove unit
  const removeUnit = (index: number) => {
    const updatedUnits = formState.data.units.filter((_, i) => i !== index);
    updateFormState({
      data: { ...formState.data, units: updatedUnits }
    });

    // Update step completion status
    const allUnitsValid = updatedUnits.length === 0 || updatedUnits.every(unit => {
      const unitErrors = validateUnit(unit);
      const hasNoErrors = Object.keys(unitErrors || {}).length === 0;
      const hasAllRequiredFields = 
        unit.unitNumber.trim() &&
        unit.description.trim() &&
        unit.userDetails.name.trim() &&
        unit.userDetails.phone.trim() &&
        unit.userDetails.email.trim() &&
        (!unit.available || unit.availableDate);
      return hasNoErrors && hasAllRequiredFields;
    });

    setSteps(prev => ({
      ...prev,
      units: { completed: allUnitsValid, valid: allUnitsValid }
    }));
  };

  // Add new listing
  const addListing = () => {
    const newListing: ListingFormData = {
      title: '',
      description: '',
      rent: 0,
      deposit: 0,
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 0,
      images: [],
      amenities: [...formState.data.property.amenities], // Inherit amenities from property
      available: true,
      userDetails: {
        name: '',
        phone: '',
        email: '',
      },
      // Lease Terms for Listing - inherit from property
      lease_term_months: formState.data.property.lease_term_months,
      lease_term_options: formState.data.property.lease_term_options,
      security_deposit_months: formState.data.property.security_deposit_months,
      first_month_rent_required: formState.data.property.first_month_rent_required,
      last_month_rent_required: formState.data.property.last_month_rent_required,
      pet_deposit: 0,
      application_fee: 0,
    };
    
    const updatedListings = [...formState.data.listings, newListing];
    updateFormState({
      data: { ...formState.data, listings: updatedListings }
    });

    // Update step completion status
    const allListingsValid = updatedListings.length === 0 || updatedListings.every(listing => {
      const listingErrors = validateListing(listing);
      const hasNoErrors = Object.keys(listingErrors || {}).length === 0;
      const hasAllRequiredFields = 
        listing.title.trim() &&
        listing.description.trim() &&
        listing.userDetails.name.trim() &&
        listing.userDetails.phone.trim() &&
        listing.userDetails.email.trim() &&
        (!listing.available || listing.availableDate);
      return hasNoErrors && hasAllRequiredFields;
    });

    setSteps(prev => ({
      ...prev,
      listings: { completed: allListingsValid, valid: allListingsValid }
    }));
  };

  // Remove listing
  const removeListing = (index: number) => {
    const updatedListings = formState.data.listings.filter((_, i) => i !== index);
    updateFormState({
      data: { ...formState.data, listings: updatedListings }
    });

    // Update step completion status
    const allListingsValid = updatedListings.length === 0 || updatedListings.every(listing => {
      const listingErrors = validateListing(listing);
      const hasNoErrors = Object.keys(listingErrors || {}).length === 0;
      const hasAllRequiredFields = 
        listing.title.trim() &&
        listing.description.trim() &&
        listing.userDetails.name.trim() &&
        listing.userDetails.phone.trim() &&
        listing.userDetails.email.trim() &&
        (!listing.available || listing.availableDate);
      return hasNoErrors && hasAllRequiredFields;
    });

    setSteps(prev => ({
      ...prev,
      listings: { completed: allListingsValid, valid: allListingsValid }
    }));
  };

  // Navigation functions
  const goToStep = (step: PropertyFormStep) => {
    updateFormState({ currentStep: step });
  };

  const goToNextStep = () => {
    const stepOrder: PropertyFormStep[] = ['property', 'units', 'listings', 'review'];
    const currentIndex = stepOrder.indexOf(formState.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      updateFormState({ currentStep: stepOrder[currentIndex + 1] });
    }
  };

  const goToPreviousStep = () => {
    const stepOrder: PropertyFormStep[] = ['property', 'units', 'listings', 'review'];
    const currentIndex = stepOrder.indexOf(formState.currentStep);
    if (currentIndex > 0) {
      updateFormState({ currentStep: stepOrder[currentIndex - 1] });
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a property',
        variant: 'destructive',
      });
      return;
    }

    updateFormState({ isSubmitting: true });

    try {
      let propertyRef: { id: string };
      
      if (editingListing) {
        // Update existing listing
        const listingData = {
          ...formState.data.listings[0],
          updatedAt: serverTimestamp(),
        };
        
        // Update the listing in Firestore
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'listings', editingListing.id), listingData);
        
        // Notify parent component of update
        if (onListingUpdate) {
          onListingUpdate(listingData);
        }
        
        toast({
          title: 'Listing updated successfully!',
          description: 'Your listing has been updated.',
        });

        setPropertyFormOpen(false);
      } else if (isEditMode && editingProperty) {
        // Update existing property
        const propertyData = {
          ...formState.data.property,
          updatedAt: serverTimestamp(),
        };
        
        propertyRef = { id: editingProperty.id };
        await updateDoc(doc(db, 'properties', editingProperty.id), propertyData);

        // Update units
        for (const unit of formState.data.units) {
          if ((unit as any).id) {
            const unitData = {
              ...unit,
              updatedAt: serverTimestamp(),
            };
            await updateDoc(doc(db, 'units', (unit as any).id), unitData);
          }
        }

        // Update listings
        for (const listing of formState.data.listings) {
          if ((listing as any).id) {
            const listingData = {
              ...listing,
              updatedAt: serverTimestamp(),
            };
            await updateDoc(doc(db, 'listings', (listing as any).id), listingData);
          }
        }

        // Notify parent component of update
        if (onPropertyUpdate) {
          onPropertyUpdate(propertyData);
        }

        toast({
          title: 'Property updated successfully!',
          description: 'Your property has been updated.',
        });

        setPropertyFormOpen(false);
      } else {
        // Create new property
        const propertyData = {
          ...formState.data.property,
          landlordId: user.uid,
          // Ensure lease_term_options is explicitly set
          lease_term_options: formState.data.property.lease_term_options || ['12 Months'],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        console.log('Creating property with lease_term_options:', propertyData.lease_term_options);
        console.log('Property data being saved:', propertyData);
        propertyRef = await addDoc(collection(db, 'properties'), propertyData);

        // Create units
      const unitPromises = formState.data.units.map(unit => {
        const unitData = {
          ...unit,
          propertyId: propertyRef.id,
          landlordId: user.uid,
          // Ensure lease_term_options is explicitly set
          lease_term_options: unit.lease_term_options && unit.lease_term_options.length > 0 
            ? unit.lease_term_options 
            : formState.data.property.lease_term_options,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        console.log('Creating unit with lease_term_options:', unitData.lease_term_options);
        console.log('Unit lease_term_options type:', typeof unitData.lease_term_options);
        console.log('Unit lease_term_options length:', unitData.lease_term_options?.length);
        console.log('Unit data being saved:', unitData);
        return addDoc(collection(db, 'units'), unitData);
      });
      const unitRefs = await Promise.all(unitPromises);

      // Create listings
      const listingPromises = formState.data.listings.map((listing, index) => {
        const listingData = {
          ...listing,
          propertyId: propertyRef.id,
          unitId: unitRefs[index]?.id || '',
          landlordId: user.uid,
          lease_term_options: listing.lease_term_options || formState.data.property.lease_term_options,
          publishedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        console.log('Creating listing with lease_term_options:', listingData.lease_term_options);
        return addDoc(collection(db, 'listings'), listingData);
      });
      await Promise.all(listingPromises);

        toast({
          title: 'Property created successfully!',
          description: 'Property created successfully!',
        });

        // Reset form
      setFormState({
        currentStep: 'property',
        data: {
          property: {
            name: '',
            title: '',
            address: {
              line1: '',
              line2: '',
              city: '',
              region: '',
              postalCode: '',
              country: 'United States',
            },
            location: {
              lat: 0,
              lng: 0,
            },
            rent_amount: 0,
            bedrooms: 0,
            bathrooms: 0,
            square_feet: 0,
            property_type: '',
            propertyType: '',
            is_available: true,
            available_date: null,
            amenities: [],
            pet_friendly: false,
            images: [],
            description: '',
            rating: 0,
            isRentWiseNetwork: false,
            userDetails: {
              name: '',
              phone: '',
              email: '',
            },
            socialFeeds: {},
            // Lease Terms
            lease_term_months: 12,
            lease_term_options: ['12 Months'],
            security_deposit_months: 1,
            first_month_rent_required: true,
            last_month_rent_required: false,
          },
          units: [],
          listings: [],
        },
        errors: {},
        isSubmitting: false,
        isDirty: false,
      });
      }

    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: 'Error',
        description: 'Failed to create property. Please try again.',
        variant: 'destructive',
      });
    } finally {
      updateFormState({ isSubmitting: false });
    }
  };

  // Check if can go next
  const canGoNext = () => {
    switch (formState.currentStep) {
      case 'property':
        return steps.property.valid;
      case 'units':
        return steps.units.valid;
      case 'listings':
        return steps.listings.valid;
      case 'review':
        return false;
      default:
        return false;
    }
  };

  // Check if can go previous
  const canGoPrevious = () => {
    return formState.currentStep !== 'property';
  };

  // Render current step content
  const renderStepContent = () => {
    switch (formState.currentStep) {
      case 'property':
        return (
          <PropertyBasicInfo
            data={formState.data.property}
            onChange={handlePropertyChange}
            errors={formState.errors.property}
          />
        );
      
      case 'units':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Property Units</h2>
                  <p className="text-sm text-gray-600">Add individual units to your property</p>
                </div>
              </div>
              <Button onClick={addUnit} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white mt-3 md:mt-0">
                <Plus className="h-4 w-4" />
                Add Unit
              </Button>
            </div>
            
            <div className="space-y-6">
              {formState.data.units.map((unit, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <UnitForm
                    data={unit}
                    onChange={(unitData) => handleUnitChange(index, unitData)}
                    onRemove={() => removeUnit(index)}
                    errors={formState.errors.units?.[index]}
                    showRemoveButton={formState.data.units.length > 1}
                    propertyLeaseTerms={{
                      lease_term_months: formState.data.property.lease_term_months,
                      security_deposit_months: formState.data.property.security_deposit_months,
                      first_month_rent_required: formState.data.property.first_month_rent_required,
                      last_month_rent_required: formState.data.property.last_month_rent_required,
                    }}
                    propertyAmenities={formState.data.property.amenities}
                    onLastFieldComplete={scrollToNavigation}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'listings':
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <List className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Property Listings</h2>
                  <p className="text-sm text-gray-600">Create public listings for your property</p>
                </div>
              </div>
              <Button onClick={addListing} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white mt-3 md:mt-0">
                <Plus className="h-4 w-4" />
                Add Listing
              </Button>
            </div>
            
            <div className="space-y-6">
              {formState.data.listings.map((listing, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6">
                  <ListingForm
                    data={listing}
                    onChange={(listingData) => handleListingChange(index, listingData)}
                    onRemove={() => removeListing(index)}
                    errors={formState.errors.listings?.[index]}
                    showRemoveButton={formState.data.listings.length > 1}
                    propertyLeaseTerms={{
                      lease_term_months: formState.data.property.lease_term_months,
                      security_deposit_months: formState.data.property.security_deposit_months,
                      first_month_rent_required: formState.data.property.first_month_rent_required,
                      last_month_rent_required: formState.data.property.last_month_rent_required,
                    }}
                    propertyAmenities={formState.data.property.amenities}
                    onLastFieldComplete={scrollToNavigation}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'review':
        return (
          <PropertyFormReview
            data={formState.data}
            onSubmit={handleSubmit}
            onEdit={goToStep}
            isSubmitting={formState.isSubmitting}
            isEditMode={isAnyEditMode}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header Banner */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold">
                  {isEditMode ? 'Edit Property' : isListingEditMode ? 'Edit Listing' : 'Add New Property'}
                </h1>
                <p className="text-sm text-green-50">
                  {isEditMode 
                    ? `Edit ${editingProperty?.name || 'property'} details • All fields marked with * are required`
                    : isListingEditMode
                    ? `Edit ${editingListing?.title || 'listing'} details • All fields marked with * are required`
                    : 'Create a new property with units and listings • All fields marked with * are required'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-3 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPropertyFormOpen(false)}
                className="bg-white text-green-600 hover:bg-green-50 font-semibold transition-all duration-200 shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Back 
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="container mx-auto">

          {/* Form Stepper */}
          <div ref={stepperRef} className="mb-8">
            <PropertyFormStepper
              currentStep={formState.currentStep}
              onStepChange={goToStep}
              steps={steps}
              onNext={goToNextStep}
              onPrevious={goToPreviousStep}
              canGoNext={canGoNext()}
              canGoPrevious={canGoPrevious()}
              isSubmitting={formState.isSubmitting}
            />
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
