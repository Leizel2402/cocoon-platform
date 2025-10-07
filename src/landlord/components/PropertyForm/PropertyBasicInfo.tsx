import React, { useState } from 'react';
import { PropertyFormData, US_STATES, PROPERTY_TYPES, PROPERTY_AMENITIES } from '../../types/propertyForm';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/lable';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Checkbox } from '../../../components/ui/checkbox';
import { Badge } from '../../../components/ui/badge';
import { MapPin, Building, Globe, Home, Star, X, Plus } from 'lucide-react';

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
  };
}

const PropertyBasicInfo: React.FC<PropertyBasicInfoProps> = ({ data, onChange, errors }) => {
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleLocationChange('lat', position.coords.latitude);
          handleLocationChange('lng', position.coords.longitude);
          setShowLocationInput(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setShowLocationInput(true);
        }
      );
    } else {
      setShowLocationInput(true);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Basic Property Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Property Name */}
        <div className="space-y-2">
          <Label htmlFor="propertyName">Property Name *</Label>
          <Input
            id="propertyName"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Enter property name"
            className={errors?.name ? 'border-red-500' : ''}
          />
          {errors?.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Property Title */}
        <div className="space-y-2">
          <Label htmlFor="propertyTitle">Property Title *</Label>
          <Input
            id="propertyTitle"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Enter property title for listings"
            className={errors?.title ? 'border-red-500' : ''}
          />
          {errors?.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <Label htmlFor="propertyType">Property Type *</Label>
          <Select
            value={data.property_type}
            onValueChange={(value) => onChange({ ...data, property_type: value, propertyType: value })}
          >
            <SelectTrigger className={errors?.property_type ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors?.property_type && <p className="text-sm text-red-500">{errors.property_type}</p>}
        </div>

        {/* Address Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <h3 className="text-lg font-semibold">Address</h3>
          </div>

          {/* Address Line 1 */}
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Street Address *</Label>
            <Input
              id="addressLine1"
              value={data.address.line1}
              onChange={(e) => handleAddressChange('line1', e.target.value)}
              placeholder="123 Main Street"
              className={errors?.address?.line1 ? 'border-red-500' : ''}
            />
            {errors?.address?.line1 && <p className="text-sm text-red-500">{errors.address.line1}</p>}
          </div>

          {/* Address Line 2 */}
          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
            <Input
              id="addressLine2"
              value={data.address.line2 || ''}
              onChange={(e) => handleAddressChange('line2', e.target.value)}
              placeholder="Apt 4B, Suite 200, etc."
            />
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={data.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="San Francisco"
                className={errors?.address?.city ? 'border-red-500' : ''}
              />
              {errors?.address?.city && <p className="text-sm text-red-500">{errors.address.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">State *</Label>
              <Select
                value={data.address.region}
                onValueChange={(value) => handleAddressChange('region', value)}
              >
                <SelectTrigger className={errors?.address?.region ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors?.address?.region && <p className="text-sm text-red-500">{errors.address.region}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">ZIP Code *</Label>
              <Input
                id="postalCode"
                value={data.address.postalCode}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                placeholder="94102"
                className={errors?.address?.postalCode ? 'border-red-500' : ''}
              />
              {errors?.address?.postalCode && <p className="text-sm text-red-500">{errors.address.postalCode}</p>}
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={data.address.country}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              placeholder="United States"
              className={errors?.address?.country ? 'border-red-500' : ''}
            />
            {errors?.address?.country && <p className="text-sm text-red-500">{errors.address.country}</p>}
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <h3 className="text-lg font-semibold">Location Coordinates</h3>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              className="flex-1"
            >
              Use Current Location
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowLocationInput(!showLocationInput)}
            >
              {showLocationInput ? 'Hide' : 'Manual Entry'}
            </Button>
          </div>

          {showLocationInput && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={data.location.lat || ''}
                  onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value) || 0)}
                  placeholder="37.7749"
                  className={errors?.location?.lat ? 'border-red-500' : ''}
                />
                {errors?.location?.lat && <p className="text-sm text-red-500">{errors.location.lat}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={data.location.lng || ''}
                  onChange={(e) => handleLocationChange('lng', parseFloat(e.target.value) || 0)}
                  placeholder="-122.4194"
                  className={errors?.location?.lng ? 'border-red-500' : ''}
                />
                {errors?.location?.lng && <p className="text-sm text-red-500">{errors.location.lng}</p>}
              </div>
            </div>
          )}

          {/* Display current coordinates */}
          {(data.location.lat && data.location.lng) && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Current Location:</strong> {data.location.lat.toFixed(6)}, {data.location.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* Property Details Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <h3 className="text-lg font-semibold">Property Details</h3>
          </div>

          {/* Property Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms *</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                max="10"
                value={data.bedrooms}
                onChange={(e) => onChange({ ...data, bedrooms: parseInt(e.target.value) || 0 })}
                className={errors?.bedrooms ? 'border-red-500' : ''}
              />
              {errors?.bedrooms && <p className="text-sm text-red-500">{errors.bedrooms}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms *</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={data.bathrooms}
                onChange={(e) => onChange({ ...data, bathrooms: parseFloat(e.target.value) || 0 })}
                className={errors?.bathrooms ? 'border-red-500' : ''}
              />
              {errors?.bathrooms && <p className="text-sm text-red-500">{errors.bathrooms}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="squareFeet">Square Feet *</Label>
              <Input
                id="squareFeet"
                type="number"
                min="0"
                value={data.square_feet}
                onChange={(e) => onChange({ ...data, square_feet: parseInt(e.target.value) || 0 })}
                className={errors?.square_feet ? 'border-red-500' : ''}
              />
              {errors?.square_feet && <p className="text-sm text-red-500">{errors.square_feet}</p>}
            </div>
          </div>

          {/* Rent Amount */}
          <div className="space-y-2">
            <Label htmlFor="rentAmount">Base Rent Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="rentAmount"
                type="text"
                value={data.rent_amount ? `$${data.rent_amount.toLocaleString()}` : ''}
                onChange={(e) => {
                  const value = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                  onChange({ ...data, rent_amount: value });
                }}
                placeholder="2,500"
                className={`pl-8 ${errors?.rent_amount ? 'border-red-500' : ''}`}
              />
            </div>
            {errors?.rent_amount && <p className="text-sm text-red-500">{errors.rent_amount}</p>}
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">Property Rating *</Label>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                value={data.rating}
                onChange={(e) => onChange({ ...data, rating: parseFloat(e.target.value) || 0 })}
                className={errors?.rating ? 'border-red-500' : ''}
              />
              <span className="text-sm text-gray-500">/ 5.0</span>
            </div>
            {errors?.rating && <p className="text-sm text-red-500">{errors.rating}</p>}
          </div>

          {/* Availability and Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAvailable"
                checked={data.is_available}
                onCheckedChange={(checked) => onChange({ ...data, is_available: !!checked })}
              />
              <Label htmlFor="isAvailable">Property is currently available</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="petFriendly"
                checked={data.pet_friendly}
                onCheckedChange={(checked) => onChange({ ...data, pet_friendly: !!checked })}
              />
              <Label htmlFor="petFriendly">Pet friendly</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isRentWiseNetwork"
                checked={data.isRentWiseNetwork}
                onCheckedChange={(checked) => onChange({ ...data, isRentWiseNetwork: !!checked })}
              />
              <Label htmlFor="isRentWiseNetwork">Part of RentWise Network</Label>
            </div>
          </div>

          {/* Available Date */}
          {data.is_available && (
            <div className="space-y-2">
              <Label htmlFor="availableDate">Available Date</Label>
              <Input
                id="availableDate"
                type="date"
                value={data.available_date || ''}
                onChange={(e) => onChange({ ...data, available_date: e.target.value || null })}
              />
            </div>
          )}
        </div>

        {/* Property Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Property Description *</Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="Describe the property, its features, location, and what makes it special..."
            rows={4}
            className={errors?.description ? 'border-red-500' : ''}
          />
          {errors?.description && <p className="text-sm text-red-500">{errors.description}</p>}
        </div>

        {/* Property Images */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Property Images</Label>
            <p className="text-sm text-gray-600">Add multiple images to showcase your property</p>
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
                onChange={(e) => handleSocialFeedsChange('instagram', e.target.value)}
                placeholder="@propertyname"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input
                id="tiktok"
                value={data.socialFeeds?.tiktok || ''}
                onChange={(e) => handleSocialFeedsChange('tiktok', e.target.value)}
                placeholder="@propertyname"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={data.socialFeeds?.youtube || ''}
                onChange={(e) => handleSocialFeedsChange('youtube', e.target.value)}
                placeholder="Channel name or URL"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyBasicInfo;
