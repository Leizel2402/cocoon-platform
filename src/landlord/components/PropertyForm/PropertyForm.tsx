import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

const PropertyForm: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
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

  const [steps, setSteps] = useState({
    property: { completed: false, valid: false },
    units: { completed: false, valid: false },
    listings: { completed: false, valid: false },
    review: { completed: false, valid: false },
  });

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

    if (data.location.lat === 0 && data.location.lng === 0) {
      errors.location = { lat: 'Location coordinates are required', lng: 'Location coordinates are required' };
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

    return errors;
  };

  const validateUnit = (data: UnitFormData) => {
    const errors: Record<string, string> = {};
    
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

    return errors;
  };

  const validateListing = (data: ListingFormData) => {
    const errors: Record<string, string> = {};
    
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

    // Update existing units with new lease terms if they changed
    let updatedUnits = formState.data.units;
    if (leaseTermsChanged) {
      updatedUnits = formState.data.units.map(unit => ({
        ...unit,
        lease_term_months: propertyData.lease_term_months,
        lease_term_options: propertyData.lease_term_options,
        security_deposit_months: propertyData.security_deposit_months,
        first_month_rent_required: propertyData.first_month_rent_required,
        last_month_rent_required: propertyData.last_month_rent_required,
      }));
    }

    // Update existing listings with new lease terms if they changed
    let updatedListings = formState.data.listings;
    if (leaseTermsChanged) {
      updatedListings = formState.data.listings.map(listing => ({
        ...listing,
        lease_term_months: propertyData.lease_term_months,
        lease_term_options: propertyData.lease_term_options,
        security_deposit_months: propertyData.security_deposit_months,
        first_month_rent_required: propertyData.first_month_rent_required,
        last_month_rent_required: propertyData.last_month_rent_required,
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

    setSteps(prev => ({
      ...prev,
      property: { completed: isValid, valid: isValid }
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

    setSteps(prev => ({
      ...prev,
      units: { completed: updatedUnits.length > 0 && updatedUnits.every(u => Object.keys(validateUnit(u) || {}).length === 0), valid: true }
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

    setSteps(prev => ({
      ...prev,
      listings: { completed: updatedListings.length > 0 && updatedListings.every(l => Object.keys(validateListing(l) || {}).length === 0), valid: true }
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
      amenities: [],
      images: [],
      description: '',
      // Lease Terms for Unit - inherit from property
      lease_term_months: formState.data.property.lease_term_months,
      lease_term_options: formState.data.property.lease_term_options,
      security_deposit_months: formState.data.property.security_deposit_months,
      first_month_rent_required: formState.data.property.first_month_rent_required,
      last_month_rent_required: formState.data.property.last_month_rent_required,
      pet_deposit: 0,
      application_fee: 0,
    };
    
    updateFormState({
      data: { ...formState.data, units: [...formState.data.units, newUnit] }
    });
  };

  // Remove unit
  const removeUnit = (index: number) => {
    const updatedUnits = formState.data.units.filter((_, i) => i !== index);
    updateFormState({
      data: { ...formState.data, units: updatedUnits }
    });
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
      amenities: [],
      available: true,
      // Lease Terms for Listing - inherit from property
      lease_term_months: formState.data.property.lease_term_months,
      lease_term_options: formState.data.property.lease_term_options,
      security_deposit_months: formState.data.property.security_deposit_months,
      first_month_rent_required: formState.data.property.first_month_rent_required,
      last_month_rent_required: formState.data.property.last_month_rent_required,
      pet_deposit: 0,
      application_fee: 0,
    };
    
    updateFormState({
      data: { ...formState.data, listings: [...formState.data.listings, newListing] }
    });
  };

  // Remove listing
  const removeListing = (index: number) => {
    const updatedListings = formState.data.listings.filter((_, i) => i !== index);
    updateFormState({
      data: { ...formState.data, listings: updatedListings }
    });
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
      // Create property
      const propertyData = {
        ...formState.data.property,
        landlordId: user.uid,
        lease_term_options: formState.data.property.lease_term_options,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      console.log('Creating property with lease_term_options:', propertyData.lease_term_options);
      const propertyRef = await addDoc(collection(db, 'properties'), propertyData);

      // Create units
      const unitPromises = formState.data.units.map(unit => {
        const unitData = {
          ...unit,
          propertyId: propertyRef.id,
          landlordId: user.uid,
          lease_term_options: unit.lease_term_options || formState.data.property.lease_term_options,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        console.log('Creating unit with lease_term_options:', unitData.lease_term_options);
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
        title: 'Success',
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
        return formState.data.units.length > 0;
      case 'listings':
        return formState.data.listings.length > 0;
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Property Units</h2>
                  <p className="text-sm text-gray-600">Add individual units to your property</p>
                </div>
              </div>
              <Button onClick={addUnit} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4" />
                Add Unit
              </Button>
            </div>
            
            {formState.data.units.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900">No Units Added</h3>
                <p className="text-gray-600 mb-6">Add at least one unit to your property to get started.</p>
                <Button onClick={addUnit} className="bg-green-600 hover:bg-green-700 text-white">
                  Add First Unit
                </Button>
              </div>
            ) : (
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
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'listings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <List className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Property Listings</h2>
                  <p className="text-sm text-gray-600">Create public listings for your property</p>
                </div>
              </div>
              <Button onClick={addListing} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white">
                <Plus className="h-4 w-4" />
                Add Listing
              </Button>
            </div>
            
            {formState.data.listings.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
                <List className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900">No Listings Added</h3>
                <p className="text-gray-600 mb-6">Create public listings to showcase your property to potential tenants.</p>
                <Button onClick={addListing} className="bg-green-600 hover:bg-green-700 text-white">
                  Create First Listing
                </Button>
              </div>
            ) : (
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
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'review':
        return (
          <PropertyFormReview
            data={formState.data}
            onSubmit={handleSubmit}
            onEdit={goToStep}
            isSubmitting={formState.isSubmitting}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Add New Property</h1>
                <p className="text-sm text-green-50">
                  Create a new property with units and listings • All fields marked with * are required
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.history.back()}
                className="bg-white text-green-600 hover:bg-green-50 font-semibold transition-all duration-200 shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="container mx-auto">

          {/* Form Stepper */}
          <div className="mb-8">
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
