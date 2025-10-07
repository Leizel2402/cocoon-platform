import React, { useState } from 'react';
import { ListingFormData, PROPERTY_AMENITIES } from '../../types/propertyForm';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/lable';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Checkbox } from '../../../components/ui/checkbox';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { X, Plus, FileText, DollarSign, Calendar } from 'lucide-react';

interface ListingFormProps {
  data: ListingFormData;
  onChange: (data: ListingFormData) => void;
  onRemove?: () => void;
  errors?: {
    title?: string;
    description?: string;
    rent?: string;
    deposit?: string;
    bedrooms?: string;
    bathrooms?: string;
    squareFeet?: string;
  };
  showRemoveButton?: boolean;
}

const ListingForm: React.FC<ListingFormProps> = ({ 
  data, 
  onChange, 
  onRemove, 
  errors, 
  showRemoveButton = true 
}) => {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(data.amenities || []);
  const [newAmenity, setNewAmenity] = useState('');

  const handleAmenityToggle = (amenity: string) => {
    const updated = selectedAmenities.includes(amenity)
      ? selectedAmenities.filter(a => a !== amenity)
      : [...selectedAmenities, amenity];
    
    setSelectedAmenities(updated);
    onChange({ ...data, amenities: updated });
  };

  const handleAddCustomAmenity = () => {
    if (newAmenity.trim() && !selectedAmenities.includes(newAmenity.trim())) {
      const updated = [...selectedAmenities, newAmenity.trim()];
      setSelectedAmenities(updated);
      onChange({ ...data, amenities: updated });
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    const updated = selectedAmenities.filter(a => a !== amenity);
    setSelectedAmenities(updated);
    onChange({ ...data, amenities: updated });
  };

  const formatCurrency = (value: string) => {
    const number = parseFloat(value.replace(/[^0-9.]/g, ''));
    return isNaN(number) ? '' : number.toLocaleString();
  };

  const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Listing Information
        </CardTitle>
        {showRemoveButton && onRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Listing Title */}
        <div className="space-y-2">
          <Label htmlFor="listingTitle">Listing Title *</Label>
          <Input
            id="listingTitle"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Beautiful 2BR Apartment in Downtown"
            className={errors?.title ? 'border-red-500' : ''}
          />
          {errors?.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>

        {/* Listing Description */}
        <div className="space-y-2">
          <Label htmlFor="listingDescription">Listing Description *</Label>
          <Textarea
            id="listingDescription"
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="Describe the property, its location, nearby amenities, and what makes it special..."
            rows={4}
            className={errors?.description ? 'border-red-500' : ''}
          />
          {errors?.description && <p className="text-sm text-red-500">{errors.description}</p>}
        </div>

        {/* Unit Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="listingBedrooms">Bedrooms *</Label>
            <Input
              id="listingBedrooms"
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
            <Label htmlFor="listingBathrooms">Bathrooms *</Label>
            <Input
              id="listingBathrooms"
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
            <Label htmlFor="listingSquareFeet">Square Feet *</Label>
            <Input
              id="listingSquareFeet"
              type="number"
              min="0"
              value={data.squareFeet}
              onChange={(e) => onChange({ ...data, squareFeet: parseInt(e.target.value) || 0 })}
              className={errors?.squareFeet ? 'border-red-500' : ''}
            />
            {errors?.squareFeet && <p className="text-sm text-red-500">{errors.squareFeet}</p>}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <h3 className="text-lg font-semibold">Pricing</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="listingRent">Monthly Rent *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="listingRent"
                  type="text"
                  value={data.rent ? `$${formatCurrency(data.rent.toString())}` : ''}
                  onChange={(e) => {
                    const value = parseCurrency(e.target.value);
                    onChange({ ...data, rent: value });
                  }}
                  placeholder="2,500"
                  className={`pl-8 ${errors?.rent ? 'border-red-500' : ''}`}
                />
              </div>
              {errors?.rent && <p className="text-sm text-red-500">{errors.rent}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="listingDeposit">Security Deposit *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="listingDeposit"
                  type="text"
                  value={data.deposit ? `$${formatCurrency(data.deposit.toString())}` : ''}
                  onChange={(e) => {
                    const value = parseCurrency(e.target.value);
                    onChange({ ...data, deposit: value });
                  }}
                  placeholder="3,750"
                  className={`pl-8 ${errors?.deposit ? 'border-red-500' : ''}`}
                />
              </div>
              {errors?.deposit && <p className="text-sm text-red-500">{errors.deposit}</p>}
            </div>
          </div>
        </div>

        {/* Availability Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <h3 className="text-lg font-semibold">Availability</h3>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="listingAvailable"
              checked={data.available}
              onCheckedChange={(checked) => onChange({ ...data, available: !!checked })}
            />
            <Label htmlFor="listingAvailable">This listing is currently available</Label>
          </div>

          {data.available && (
            <div className="space-y-2">
              <Label htmlFor="listingAvailableDate">Available Date</Label>
              <Input
                id="listingAvailableDate"
                type="date"
                value={data.availableDate ? data.availableDate.toISOString().split('T')[0] : ''}
                onChange={(e) => onChange({ 
                  ...data, 
                  availableDate: e.target.value ? new Date(e.target.value) : undefined 
                })}
              />
            </div>
          )}
        </div>

        {/* Amenities Section */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Listing Amenities</Label>
            <p className="text-sm text-gray-600">Select all amenities that apply to this listing</p>
          </div>

          {/* Selected Amenities */}
          {selectedAmenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedAmenities.map((amenity) => (
                <Badge
                  key={amenity}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(amenity)}
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
            {PROPERTY_AMENITIES.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`listing-amenity-${amenity}`}
                  checked={selectedAmenities.includes(amenity)}
                  onCheckedChange={() => handleAmenityToggle(amenity)}
                />
                <Label 
                  htmlFor={`listing-amenity-${amenity}`}
                  className="text-sm cursor-pointer"
                >
                  {amenity}
                </Label>
              </div>
            ))}
          </div>

          {/* Custom Amenity Input */}
          <div className="flex gap-2">
            <Input
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="Add custom amenity"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAmenity()}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCustomAmenity}
              disabled={!newAmenity.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Listing Images</Label>
            <p className="text-sm text-gray-600">Add images to showcase this listing</p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-500 mb-2">Image upload functionality will be implemented here</p>
            <Button type="button" variant="outline">
              Upload Images
            </Button>
          </div>

          {data.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {data.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Listing image ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = data.images.filter((_, i) => i !== index);
                      onChange({ ...data, images: updated });
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingForm;
