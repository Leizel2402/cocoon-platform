import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { PropertyFormData, UnitFormData, ListingFormData, PropertyFormStep, PropertyFormState, PropertyFormErrors } from '../../types/propertyForm';
import PropertyBasicInfo from './PropertyBasicInfo';
import UnitForm from './UnitForm';
import ListingForm from './ListingForm';
import PropertyFormStepper from './PropertyFormStepper';
import PropertyFormReview from './PropertyFormReview';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { useToast } from '../../../hooks/use-toast';
import { Building, Plus, X, Save, ArrowLeft } from 'lucide-react';

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

    return errors;
  };

  const validateUnit = (data: UnitFormData): PropertyFormErrors['units'] => {
    const errors: PropertyFormErrors['units'] = {};
    
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

    return errors;
  };

  const validateListing = (data: ListingFormData): PropertyFormErrors['listings'] => {
    const errors: PropertyFormErrors['listings'] = {};
    
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

    return errors;
  };

  // Update form state
  const updateFormState = (updates: Partial<PropertyFormState>) => {
    setFormState(prev => ({ ...prev, ...updates, isDirty: true }));
  };

  // Handle property data change
  const handlePropertyChange = (propertyData: PropertyFormData) => {
    const errors = validateProperty(propertyData);
    const isValid = Object.keys(errors).length === 0;
    
    updateFormState({
      data: { ...formState.data, property: propertyData },
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
    const isValid = Object.keys(errors).length === 0;
    
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
      units: { completed: updatedUnits.length > 0 && updatedUnits.every(u => validateUnit(u) && Object.keys(validateUnit(u)).length === 0), valid: true }
    }));
  };

  // Handle listing data change
  const handleListingChange = (listingIndex: number, listingData: ListingFormData) => {
    const updatedListings = [...formState.data.listings];
    updatedListings[listingIndex] = listingData;
    
    const errors = validateListing(listingData);
    const isValid = Object.keys(errors).length === 0;
    
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
      listings: { completed: updatedListings.length > 0 && updatedListings.every(l => validateListing(l) && Object.keys(validateListing(l)).length === 0), valid: true }
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
      const propertyRef = await addDoc(collection(db, 'properties'), {
        ...formState.data.property,
        landlordId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create units
      const unitPromises = formState.data.units.map(unit => 
        addDoc(collection(db, 'units'), {
          ...unit,
          propertyId: propertyRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
      const unitRefs = await Promise.all(unitPromises);

      // Create listings
      const listingPromises = formState.data.listings.map((listing, index) => 
        addDoc(collection(db, 'listings'), {
          ...listing,
          propertyId: propertyRef.id,
          unitId: unitRefs[index]?.id || '',
          publishedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      );
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
              <h2 className="text-2xl font-bold">Property Units</h2>
              <Button onClick={addUnit} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Unit
              </Button>
            </div>
            
            {formState.data.units.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Units Added</h3>
                  <p className="text-gray-600 mb-4">Add at least one unit to your property.</p>
                  <Button onClick={addUnit}>Add First Unit</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {formState.data.units.map((unit, index) => (
                  <UnitForm
                    key={index}
                    data={unit}
                    onChange={(unitData) => handleUnitChange(index, unitData)}
                    onRemove={() => removeUnit(index)}
                    errors={formState.errors.units?.[index]}
                    showRemoveButton={formState.data.units.length > 1}
                  />
                ))}
              </div>
            )}
          </div>
        );
      
      case 'listings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Property Listings</h2>
              <Button onClick={addListing} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Listing
              </Button>
            </div>
            
            {formState.data.listings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Listings Added</h3>
                  <p className="text-gray-600 mb-4">Create public listings for your property.</p>
                  <Button onClick={addListing}>Create First Listing</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {formState.data.listings.map((listing, index) => (
                  <ListingForm
                    key={index}
                    data={listing}
                    onChange={(listingData) => handleListingChange(index, listingData)}
                    onRemove={() => removeListing(index)}
                    errors={formState.errors.listings?.[index]}
                    showRemoveButton={formState.data.listings.length > 1}
                  />
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Building className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          </div>
          <p className="text-gray-600">
            Create a new property with units and listings. All fields marked with * are required.
          </p>
        </div>

        {/* Form Stepper */}
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

        {/* Form Content */}
        <div className="mt-8">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
