import React, { useState } from 'react';
import { ListingFormData, PROPERTY_AMENITIES, LEASE_TERM_OPTIONS, LEASE_TERM_MONTHS, SECURITY_DEPOSIT_OPTIONS, SECURITY_DEPOSIT_MONTHS } from '../../types/propertyForm';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/lable';
import { Button } from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
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
  propertyLeaseTerms?: {
    lease_term_months: number;
    security_deposit_months: number;
    first_month_rent_required: boolean;
    last_month_rent_required: boolean;
  };
}

const ListingForm: React.FC<ListingFormProps> = ({ 
  data, 
  onChange, 
  onRemove, 
  errors, 
  showRemoveButton = true,
  propertyLeaseTerms
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
    <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Listing Information</h3>
        </div>
        {showRemoveButton && onRemove && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 border border-red-200 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="space-y-6">
        {/* Listing Title */}
        <div>
          <Label
            htmlFor="listingTitle"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Listing Title *
          </Label>
          <Input
            id="listingTitle"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Beautiful 2BR Apartment in Downtown"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none bg-white/50 backdrop-blur-sm ${
              errors?.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
            }`}
            required
          />
          {errors?.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Listing Description */}
        <div>
          <Label
            htmlFor="listingDescription"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Listing Description *
          </Label>
          <Textarea
            id="listingDescription"
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder="Describe the property, its location, nearby amenities, and what makes it special..."
            rows={4}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none bg-white/50 backdrop-blur-sm resize-none ${
              errors?.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
            }`}
            required
          />
          {errors?.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Unit Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label
              htmlFor="listingBedrooms"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Bedrooms *
            </Label>
            <Input
              id="listingBedrooms"
              type="number"
              min="0"
              max="10"
              value={data.bedrooms}
              onChange={(e) => onChange({ ...data, bedrooms: parseInt(e.target.value) || 0 })}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none bg-white/50 backdrop-blur-sm ${
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
              htmlFor="listingBathrooms"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Bathrooms *
            </Label>
            <Input
              id="listingBathrooms"
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={data.bathrooms}
              onChange={(e) => onChange({ ...data, bathrooms: parseFloat(e.target.value) || 0 })}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none bg-white/50 backdrop-blur-sm ${
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
              htmlFor="listingSquareFeet"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Square Feet *
            </Label>
            <Input
              id="listingSquareFeet"
              type="number"
              min="0"
              value={data.squareFeet}
              onChange={(e) => onChange({ ...data, squareFeet: parseInt(e.target.value) || 0 })}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none bg-white/50 backdrop-blur-sm ${
                errors?.squareFeet ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
              }`}
              required
            />
            {errors?.squareFeet && (
              <p className="text-red-500 text-sm mt-1">{errors.squareFeet}</p>
            )}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="listingRent"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Monthly Rent *
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <Input
                  id="listingRent"
                  type="text"
                  value={data.rent ? `$${formatCurrency(data.rent.toString())}` : ''}
                  onChange={(e) => {
                    const value = parseCurrency(e.target.value);
                    onChange({ ...data, rent: value });
                  }}
                  placeholder="2,500"
                  className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:outline-none bg-white/50 backdrop-blur-sm ${
                    errors?.rent ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                  }`}
                  required
                />
              </div>
              {errors?.rent && (
                <p className="text-red-500 text-sm mt-1">{errors.rent}</p>
              )}
            </div>

            <div>
              <Label
                htmlFor="listingDeposit"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Security Deposit *
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <Input
                  id="listingDeposit"
                  type="text"
                  value={data.deposit ? `$${formatCurrency(data.deposit.toString())}` : ''}
                  onChange={(e) => {
                    const value = parseCurrency(e.target.value);
                    onChange({ ...data, deposit: value });
                  }}
                  placeholder="3,750"
                  className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:outline-none bg-white/50 backdrop-blur-sm ${
                    errors?.deposit ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-green-200'
                  }`}
                  required
                />
              </div>
              {errors?.deposit && (
                <p className="text-red-500 text-sm mt-1">{errors.deposit}</p>
              )}
            </div>
          </div>
        </div>

        {/* Availability Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <Checkbox
              id="listingAvailable"
              checked={data.available}
              onCheckedChange={(checked) => onChange({ ...data, available: !!checked })}
              className="w-5 h-5"
            />
            <Label htmlFor="listingAvailable" className="text-sm font-medium text-gray-700">
              This listing is currently available
            </Label>
          </div>

          {data.available && (
            <div>
              <Label
                htmlFor="listingAvailableDate"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Available Date
              </Label>
              <Input
                id="listingAvailableDate"
                type="date"
                value={data.availableDate ? data.availableDate.toISOString().split('T')[0] : ''}
                onChange={(e) => onChange({ 
                  ...data, 
                  availableDate: e.target.value ? new Date(e.target.value) : undefined 
                })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-green-200 bg-white/50 backdrop-blur-sm"
              />
            </div>
          )}
        </div>

        {/* Lease Terms Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Lease Terms</h3>
              {propertyLeaseTerms && (
                <p className="text-sm text-blue-600 font-medium">
                  Inherited from property settings
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="listingLeaseTerm"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Lease Term *
              </Label>
              <Select
                value={data.lease_term_months.toString()}
                onValueChange={(value) => {
                  const months = parseInt(value);
                  onChange({ ...data, lease_term_months: months });
                }}
              >
                <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-green-200 bg-white/50 backdrop-blur-sm">
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
                htmlFor="listingSecurityDeposit"
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
                <SelectTrigger className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-green-200 bg-white/50 backdrop-blur-sm">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="listingPetDeposit"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Pet Deposit
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <Input
                  id="listingPetDeposit"
                  type="text"
                  value={data.pet_deposit ? `$${data.pet_deposit.toLocaleString()}` : ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                    onChange({ ...data, pet_deposit: value });
                  }}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-green-200 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor="listingApplicationFee"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Application Fee
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <Input
                  id="listingApplicationFee"
                  type="text"
                  value={data.application_fee ? `$${data.application_fee.toLocaleString()}` : ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value.replace(/[^0-9.]/g, '')) || 0;
                    onChange({ ...data, application_fee: value });
                  }}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-green-200 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>

          {/* Lease Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label
                htmlFor="leaseStartDate"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Preferred Lease Start Date
              </Label>
              <Input
                id="leaseStartDate"
                type="date"
                value={data.lease_start_date || ''}
                onChange={(e) => onChange({ ...data, lease_start_date: e.target.value || undefined })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-green-200 bg-white/50 backdrop-blur-sm"
              />
            </div>

            <div>
              <Label
                htmlFor="leaseEndDate"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Preferred Lease End Date
              </Label>
              <Input
                id="leaseEndDate"
                type="date"
                value={data.lease_end_date || ''}
                onChange={(e) => onChange({ ...data, lease_end_date: e.target.value || undefined })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-green-200 bg-white/50 backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Rent Payment Options */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Rent Payment Requirements</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Checkbox
                  id="listingFirstMonthRequired"
                  checked={data.first_month_rent_required}
                  onCheckedChange={(checked) => onChange({ ...data, first_month_rent_required: !!checked })}
                  className="w-5 h-5"
                />
                <Label htmlFor="listingFirstMonthRequired" className="text-sm font-medium text-gray-700">
                  First month rent required upfront
                </Label>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Checkbox
                  id="listingLastMonthRequired"
                  checked={data.last_month_rent_required}
                  onCheckedChange={(checked) => onChange({ ...data, last_month_rent_required: !!checked })}
                  className="w-5 h-5"
                />
                <Label htmlFor="listingLastMonthRequired" className="text-sm font-medium text-gray-700">
                  Last month rent required upfront
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Plus className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Listing Amenities</h3>
              <p className="text-sm text-gray-600">Select all amenities that apply to this listing</p>
            </div>
          </div>

          {/* Selected Amenities */}
          {selectedAmenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedAmenities.map((amenity) => (
                <Badge
                  key={amenity}
                  variant="secondary"
                  className="flex items-center gap-1 bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(amenity)}
                    className="ml-1 hover:text-red-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Amenity Selection */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {PROPERTY_AMENITIES.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                <Checkbox
                  id={`listing-amenity-${amenity}`}
                  checked={selectedAmenities.includes(amenity)}
                  onCheckedChange={() => handleAmenityToggle(amenity)}
                  className="w-4 h-4"
                />
                <Label 
                  htmlFor={`listing-amenity-${amenity}`}
                  className="text-sm cursor-pointer font-medium text-gray-700"
                >
                  {amenity}
                </Label>
              </div>
            ))}
          </div>

          {/* Custom Amenity Input */}
          <div className="flex gap-3">
            <Input
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="Add custom amenity"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAmenity()}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-green-200 bg-white/50 backdrop-blur-sm"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddCustomAmenity}
              disabled={!newAmenity.trim()}
              className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
              <Plus className="h-4 w-4 text-pink-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Listing Images</h3>
              <p className="text-sm text-gray-600">Add images to showcase this listing</p>
            </div>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
            <p className="text-gray-500 mb-4">Image upload functionality will be implemented here</p>
            <Button type="button" variant="outline" className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Upload Images
            </Button>
          </div>

          {data.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Listing image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = data.images.filter((_, i) => i !== index);
                      onChange({ ...data, images: updated });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingForm;
