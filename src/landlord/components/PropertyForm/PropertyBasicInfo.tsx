import React, { useState } from 'react';
import { PropertyFormData, US_STATES, PROPERTY_TYPES, PROPERTY_AMENITIES, LEASE_TERM_OPTIONS, LEASE_TERM_MONTHS, SECURITY_DEPOSIT_OPTIONS, SECURITY_DEPOSIT_MONTHS } from '../../types/propertyForm';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/lable';
import { Button } from '../../../components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import { Badge } from '../../../components/ui/badge';
import { useToast } from '../../../hooks/use-toast';
import { useAuth } from '../../../hooks/useAuth';
import { useScrollToTop } from '../../../hooks/useScrollToTop';
import { MapPin, Building, Globe, Home, Star, X, Plus, Camera, FileText, User } from 'lucide-react';

interface PropertyBasicInfoProps {
  data: PropertyFormData;
  onChange: (data: PropertyFormData) => void;
  errors?: {
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
    userDetails?: {
      name?: string;
      phone?: string;
      email?: string;
    };
    available_date?: string;
  };
}

const PropertyBasicInfo: React.FC<PropertyBasicInfoProps> = ({ 
  data, 
  onChange, 
  errors
}) => {
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { FloatingScrollButton } = useScrollToTop();
console.log("user",user);

  const handleAddressChange = (field: string, value: string) => {
    onChange({
      ...data,
      address: {
        ...data.address,
        [field]: value,
      },
    });
  };

  const handleLocationChange = (field: 'lat' | 'lng', value: number) => {
    onChange({
      ...data,
      location: {
        ...data.location,
        [field]: value,
      },
    });
  };

  const handleSocialFeedsChange = (platform: string, value: string) => {
    onChange({
      ...data,
      socialFeeds: {
        ...data.socialFeeds,
        [platform]: value,
      },
    });
  };

  const handleUserDetailsChange = (field: string, value: string) => {
    onChange({
      ...data,
      userDetails: {
        ...data.userDetails,
        [field]: value,
      },
    });
  };

  const populateFromAuthUser = () => {
    if (!user) {
      toast({
        title: 'No User Data',
        description: 'Unable to get user information. Please enter contact details manually.',
        variant: 'destructive',
      });
      return;
    }

    const userDetails = {
      name: user.displayName || user.email?.split('@')[0] || '',
      phone: user.phone || '', // Phone number not available in Firebase Auth by default
      email: user.email || '',
    };

    onChange({
      ...data,
      userDetails,
    });

    toast({
      title: 'Contact Information Updated',
      description: 'Contact details have been populated from your account information.',
      variant: 'default',
    });
  };


  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`File ${file.name} is not an image. Please select only image files.`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Please select files smaller than 5MB.`);
          continue;
        }

        // Convert to base64 for now (in production, upload to Firebase Storage)
        const base64 = await convertToBase64(file);
        newImages.push(base64);
      }

      // Add new images to existing ones
      onChange({
        ...data,
        images: [...data.images, ...newImages],
      });

    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Create a fake event to reuse the existing upload handler
      const fakeEvent = {
        target: { files, value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      handleImageUpload(fakeEvent);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation Not Supported',
        description: 'Your browser does not support geolocation. Please use manual entry.',
        variant: 'destructive',
      });
      setShowLocationInput(true);
      return;
    }

    // Show loading state
    const button = document.querySelector('[data-location-button]') as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      button.textContent = 'Getting Location...';
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Update both coordinates in a single call to trigger validation properly
        onChange({
          ...data,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
        setShowLocationInput(false);
        
        // Reset button
        if (button) {
          button.disabled = false;
          button.textContent = 'Use Current Location';
        }
        
        toast({
          title: 'Location Set Successfully!',
          description: `Latitude: ${position.coords.latitude.toFixed(6)}, Longitude: ${position.coords.longitude.toFixed(6)}`,
          variant: 'default',
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setShowLocationInput(true);
        
        // Reset button
        if (button) {
          button.disabled = false;
          button.textContent = 'Use Current Location';
        }
        
        let errorMessage = 'Unable to get your current location. ';
        let errorTitle = 'Location Error';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Please allow location access in your browser settings and try again.';
            errorTitle = 'Permission Denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            errorTitle = 'Location Unavailable';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again.';
            errorTitle = 'Request Timeout';
            break;
          default:
            errorMessage += 'An unknown error occurred.';
            break;
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: 'destructive',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Building className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Basic Property Information</h2>
          <p className="text-sm text-gray-600">Enter the essential details about your property</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Property Name */}
        <div>
          <Label
            htmlFor="propertyName"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Property Name *
          </Label>
          <Input
            id="propertyName"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Enter property name"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
              errors?.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
            }`}
            required
          />
          {errors?.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Property Title */}
        <div>
          <Label
            htmlFor="propertyTitle"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Property Title *
          </Label>
          <Input
            id="propertyTitle"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Enter property title for listings"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
              errors?.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
            }`}
            required
          />
          {errors?.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Property Type */}
        <div>
          <Label
            htmlFor="propertyType"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Property Type *
          </Label>
          <Select
            value={data.property_type}
            onValueChange={(value) => onChange({ ...data, property_type: value, propertyType: value })}
          >
            <SelectTrigger className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
              errors?.property_type ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
            }`}>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.property_type && (
            <p className="text-red-500 text-sm mt-1">{errors.property_type}</p>
          )}
        </div>

        {/* Address Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
          </div>

          {/* Address Line 1 */}
          <div>
            <Label
              htmlFor="addressLine1"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Street Address *
            </Label>
            <Input
              id="addressLine1"
              value={data.address.line1}
              onChange={(e) => handleAddressChange('line1', e.target.value)}
              placeholder="123 Main Street"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                errors?.address?.line1 ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
              }`}
              required
            />
            {errors?.address?.line1 && (
              <p className="text-red-500 text-sm mt-1">{errors.address.line1}</p>
            )}
          </div>

          {/* Address Line 2 */}
          <div>
            <Label
              htmlFor="addressLine2"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Address Line 2 (Optional)
            </Label>
            <Input
              id="addressLine2"
              value={data.address.line2 || ''}
              onChange={(e) => handleAddressChange('line2', e.target.value)}
              placeholder="Apt 4B, Suite 200, etc."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-green-200 bg-white/50 backdrop-blur-sm"
            />
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label
                htmlFor="city"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                City *
              </Label>
              <Input
                id="city"
                value={data.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="San Francisco"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                  errors?.address?.city ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                }`}
                required
              />
              {errors?.address?.city && (
                <p className="text-red-500 text-sm mt-1">{errors.address.city}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="region"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                State *
              </Label>
              <Select
                value={data.address.region}
                onValueChange={(value) => handleAddressChange('region', value)}
              >
                <SelectTrigger className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                  errors?.address?.region ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                }`}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors?.address?.region && (
                <p className="text-red-500 text-sm mt-1">{errors.address.region}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="postalCode"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                ZIP Code *
              </Label>
              <Input
                id="postalCode"
                value={data.address.postalCode}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                placeholder="94102"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                  errors?.address?.postalCode ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                }`}
                required
              />
              {errors?.address?.postalCode && (
                <p className="text-red-500 text-sm mt-1">{errors.address.postalCode}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div>
            <Label
              htmlFor="country"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Country *
            </Label>
            <Input
              id="country"
              value={data.address.country}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              placeholder="United States"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                errors?.address?.country ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
              }`}
              required
            />
            {errors?.address?.country && (
              <p className="text-red-500 text-sm mt-1">{errors.address.country}</p>
            )}
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Location Coordinates *</h3>
              <p className="text-sm text-gray-600">Required for accurate property location on maps</p>
            </div>
          </div>

          {/* Show error message if coordinates are missing */}
          {(errors?.location?.lat || errors?.location?.lng) && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <p className="text-red-700 font-medium">Location coordinates are required</p>
              </div>
              <p className="text-red-600 text-sm mt-1">
                Please use "Use Current Location" or enter coordinates manually to continue.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => getCurrentLocation()}
              data-location-button
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use Current Location
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLocationInput(!showLocationInput)}
              className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {showLocationInput ? 'Hide' : 'Manual Entry'}
            </Button>
          </div>

          {showLocationInput && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <p className="text-blue-700 font-medium">Manual Coordinate Entry</p>
                </div>
                <p className="text-blue-600 text-sm">
                  Enter the exact latitude and longitude coordinates for your property. 
                  You can find these using Google Maps or other mapping services.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="latitude"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Latitude * <span className="text-gray-500 font-normal">(-90 to 90)</span>
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={data.location.lat || ''}
                    onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value) || 0)}
                    placeholder="37.7749"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                      errors?.location?.lat ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                    }`}
                    required
                  />
                  {errors?.location?.lat && (
                    <p className="text-red-500 text-sm mt-1">{errors.location.lat}</p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="longitude"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Longitude * <span className="text-gray-500 font-normal">(-180 to 180)</span>
                  </Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={data.location.lng || ''}
                    onChange={(e) => handleLocationChange('lng', parseFloat(e.target.value) || 0)}
                    placeholder="-122.4194"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                      errors?.location?.lng ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                    }`}
                    required
                  />
                  {errors?.location?.lng && (
                    <p className="text-red-500 text-sm mt-1">{errors.location.lng}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Display current coordinates */}
          {(data.location.lat && data.location.lng) && (
            <div className={`p-4 rounded-lg border ${
              errors?.location?.lat || errors?.location?.lng 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center gap-2">
                <MapPin className={`h-4 w-4 ${
                  errors?.location?.lat || errors?.location?.lng 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`} />
                <p className={`text-sm font-medium ${
                  errors?.location?.lat || errors?.location?.lng 
                    ? 'text-red-700' 
                    : 'text-green-700'
                }`}>
                  {errors?.location?.lat || errors?.location?.lng 
                    ? 'Invalid Location Coordinates' 
                    : 'Location Set Successfully'
                  }
                </p>
              </div>
              <p className={`text-sm mt-1 ${
                errors?.location?.lat || errors?.location?.lng 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`}>
                <strong>Coordinates:</strong> {data.location.lat.toFixed(6)}, {data.location.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* Property Details Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Home className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
          </div>

          {/* Property Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label
                htmlFor="bedrooms"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Bedrooms *
              </Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                max="10"
                value={data.bedrooms}
                onChange={(e) => onChange({ ...data, bedrooms: parseInt(e.target.value) || 0 })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                  errors?.bedrooms ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                }`}
                required
              />
              {errors?.bedrooms && (
                <p className="text-red-500 text-sm mt-1">{errors.bedrooms}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="bathrooms"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Bathrooms *
              </Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={data.bathrooms}
                onChange={(e) => onChange({ ...data, bathrooms: parseFloat(e.target.value) || 0 })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                  errors?.bathrooms ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                }`}
                required
              />
              {errors?.bathrooms && (
                <p className="text-red-500 text-sm mt-1">{errors.bathrooms}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="squareFeet"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Square Feet *
              </Label>
              <Input
                id="squareFeet"
                type="number"
                min="0"
                value={data.square_feet}
                onChange={(e) => onChange({ ...data, square_feet: parseInt(e.target.value) || 0 })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                  errors?.square_feet ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                }`}
                required
              />
              {errors?.square_feet && (
                <p className="text-red-500 text-sm mt-1">{errors.square_feet}</p>
              )}
            </div>
          </div>

          {/* Rent Amount */}
          <div>
            <Label
              htmlFor="rentAmount"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Base Rent Amount *
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
              <Input
                id="rentAmount"
                type="text"
                value={data.rent_amount ? `$${data.rent_amount.toLocaleString()}` : ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                  onChange({ ...data, rent_amount: value });
                }}
                placeholder="2,500"
                className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                  errors?.rent_amount ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                }`}
                required
              />
            </div>
            {errors?.rent_amount && (
              <p className="text-red-500 text-sm mt-1">{errors.rent_amount}</p>
            )}
          </div>

          {/* Rating */}
          <div>
            <Label
              htmlFor="rating"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Property Rating *
            </Label>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={data.rating}
                onChange={(e) => onChange({ ...data, rating: parseFloat(e.target.value) || 0 })}
                className={`w-24 px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                  errors?.rating ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                }`}
                required
              />
              <span className="text-sm text-gray-500">/ 5.0</span>
            </div>
            {errors?.rating && (
              <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
            )}
          </div>

          {/* Availability and Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Checkbox
                id="isAvailable"
                checked={data.is_available}
                onCheckedChange={(checked) => onChange({ ...data, is_available: !!checked })}
                className="w-5 h-5"
              />
              <Label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                Property is currently available
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Checkbox
                id="petFriendly"
                checked={data.pet_friendly}
                onCheckedChange={(checked) => onChange({ ...data, pet_friendly: !!checked })}
                className="w-5 h-5"
              />
              <Label htmlFor="petFriendly" className="text-sm font-medium text-gray-700">
                Pet friendly
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Checkbox
                id="isRentWiseNetwork"
                checked={data.isRentWiseNetwork}
                onCheckedChange={(checked) => onChange({ ...data, isRentWiseNetwork: !!checked })}
                className="w-5 h-5"
              />
              <Label htmlFor="isRentWiseNetwork" className="text-sm font-medium text-gray-700">
                Part of RentWise Network
              </Label>
            </div>
          </div>

          {/* Available Date */}
          {data.is_available && (
            <div>
              <Label
                htmlFor="availableDate"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Available Date *
              </Label>
              <Input
              
                id="availableDate"
                type="date"
                value={data.available_date || ''}
                onChange={(e) => onChange({ ...data, available_date: e.target.value || null })}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                  errors?.available_date ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                }`}
                required
              />
              {errors?.available_date && (
                <p className="text-red-500 text-sm mt-1">{errors.available_date}</p>
              )}
            </div>
          )}
        </div>

        {/* Lease Terms Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Default Lease Terms</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="leaseTerm"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Default Lease Term *
              </Label>
              <Select
                value={data.lease_term_months.toString()}
                onValueChange={(value) => {
                  const months = parseInt(value);
                  onChange({ ...data, lease_term_months: months });
                }}
              >
                <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-green-200 bg-white/50 backdrop-blur-sm">
                  <SelectValue placeholder="Select lease term" />
                </SelectTrigger>
                <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                  {LEASE_TERM_OPTIONS.map((term) => (
                    <SelectItem key={term} value={LEASE_TERM_MONTHS[term].toString()}>
                      {term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor="securityDeposit"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Security Deposit *
              </Label>
              <Select
                value={data.security_deposit_months.toString()}
                onValueChange={(value) => {
                  const months = parseFloat(value);
                  onChange({ ...data, security_deposit_months: months });
                }}
              >
                <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-green-200 bg-white/50 backdrop-blur-sm">
                  <SelectValue placeholder="Select security deposit" />
                </SelectTrigger>
                <SelectContent className="z-[9999] max-h-60 overflow-y-auto">
                  {SECURITY_DEPOSIT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={SECURITY_DEPOSIT_MONTHS[option].toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rent Payment Options */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Rent Payment Requirements</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Checkbox
                  id="firstMonthRequired"
                  checked={data.first_month_rent_required}
                  onCheckedChange={(checked) => onChange({ ...data, first_month_rent_required: !!checked })}
                  className="w-5 h-5"
                />
                <Label htmlFor="firstMonthRequired" className="text-sm font-medium text-gray-700">
                  First month rent required upfront
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <Checkbox
                  id="lastMonthRequired"
                  checked={data.last_month_rent_required}
                  onCheckedChange={(checked) => onChange({ ...data, last_month_rent_required: !!checked })}
                  className="w-5 h-5"
                />
                <Label htmlFor="lastMonthRequired" className="text-sm font-medium text-gray-700">
                  Last month rent required upfront
                </Label>
              </div>
            </div>
          </div>

          {/* Available Lease Term Options */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Available Lease Term Options</Label>
              <p className="text-sm text-gray-600">Select all lease terms you're willing to offer</p>
            </div>

            {/* Selected Lease Terms */}
            {data.lease_term_options.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.lease_term_options.map((term, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {term}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = data.lease_term_options.filter((_, i) => i !== index);
                        onChange({ ...data, lease_term_options: updated });
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Lease Term Selection */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {LEASE_TERM_OPTIONS.map((term) => (
                <div key={term} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lease-term-${term}`}
                    checked={data.lease_term_options.includes(term)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onChange({ ...data, lease_term_options: [...data.lease_term_options, term] });
                      } else {
                        onChange({ ...data, lease_term_options: data.lease_term_options.filter(t => t !== term) });
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`lease-term-${term}`}
                    className="text-sm cursor-pointer"
                  >
                    {term}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Property Description */}
        <div>
          <Label
            htmlFor="description"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Property Description *
          </Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="Describe the property, its features, location, and what makes it special..."
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm resize-none ${
              errors?.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
            }`}
            required
          />
          {errors?.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Property Images */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Camera className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Property Images</h3>
              <p className="text-sm text-gray-600">Add multiple images to showcase your property</p>
            </div>
          </div>

          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isUploading 
                ? 'border-blue-300 bg-blue-50' 
                : isDragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="imageUpload"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isUploading}
              className="hidden"
            />
            <label htmlFor="imageUpload" className={`cursor-pointer ${isUploading ? 'cursor-not-allowed' : ''}`}>
              <div className="flex flex-col items-center">
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-blue-600 mb-2">Uploading images...</p>
                  </>
                ) : isDragOver ? (
                  <>
                    <Plus className="h-8 w-8 text-blue-500 mb-2" />
                    <p className="text-blue-600 mb-2">Drop images here</p>
                  </>
                ) : (
                  <>
                    <Plus className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-500 mb-2">Click to upload images or drag and drop</p>
                    <Button type="button" variant="outline" disabled={isUploading}>
                      Choose Images
                    </Button>
                  </>
                )}
              </div>
            </label>
          </div>

          {data.images.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Uploaded images ({data.images.length})</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {data.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Property image ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = data.images.filter((_, i) => i !== index);
                        onChange({ ...data, images: updated });
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Property Amenities */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Property Amenities</Label>
            <p className="text-sm text-gray-600">Select all amenities that apply to this property</p>
          </div>

          {/* Selected Amenities */}
          {data.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.amenities.map((amenity, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = data.amenities.filter((_, i) => i !== index);
                      onChange({ ...data, amenities: updated });
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Amenity Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {PROPERTY_AMENITIES?.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={data.amenities.includes(amenity)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onChange({ ...data, amenities: [...data.amenities, amenity] });
                    } else {
                      onChange({ ...data, amenities: data.amenities.filter(a => a !== amenity) });
                    }
                  }}
                />
                <Label 
                  htmlFor={`amenity-${amenity}`}
                  className="text-sm cursor-pointer"
                >
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* User Details Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={populateFromAuthUser}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-2 border border-purple-200 rounded-lg"
            >
              Use My Account Info
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label
                htmlFor="propertyUserName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Name *
              </Label>
              <Input
                id="propertyUserName"
                value={data.userDetails.name}
                onChange={(e) => handleUserDetailsChange('name', e.target.value)}
                placeholder="John Doe"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                  errors?.userDetails?.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                }`}
                required
              />
              {errors?.userDetails?.name && (
                <p className="text-red-500 text-sm mt-1">{errors.userDetails.name}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="propertyUserPhone"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Phone Number *
              </Label>
              <Input
                id="propertyUserPhone"
                type="tel"
                value={data.userDetails.phone}
                onChange={(e) => handleUserDetailsChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                  errors?.userDetails?.phone ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                }`}
                required
              />
              {errors?.userDetails?.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.userDetails.phone}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="propertyUserEmail"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address *
              </Label>
              <Input
                id="propertyUserEmail"
                type="email"
                value={data.userDetails.email}
                onChange={(e) => handleUserDetailsChange('email', e.target.value)}
                placeholder="john@example.com"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none bg-white/50 backdrop-blur-sm ${
                  errors?.userDetails?.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                }`}
                required
              />
              {errors?.userDetails?.email && (
                <p className="text-red-500 text-sm mt-1">{errors.userDetails.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Social Media Feeds */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <h3 className="text-lg font-semibold">Social Media Feeds (Optional)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={data.socialFeeds?.instagram || ''}
                onChange={(e) => {
                  handleSocialFeedsChange('instagram', e.target.value);
                }}
                placeholder="@propertyname"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input
                id="tiktok"
                value={data.socialFeeds?.tiktok || ''}
                onChange={(e) => {
                  handleSocialFeedsChange('tiktok', e.target.value);
                }}
                placeholder="@propertyname"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={data.socialFeeds?.youtube || ''}
                onChange={(e) => {
                  handleSocialFeedsChange('youtube', e.target.value);
                }}
                placeholder="Channel name or URL"
              />
            </div>
          </div>
        </div>

    {/* Floating Scroll Button */}
    <FloatingScrollButton />
      </div>
    </div>
  );
};

export default PropertyBasicInfo;
