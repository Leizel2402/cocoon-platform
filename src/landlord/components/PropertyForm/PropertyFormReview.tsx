import React from 'react';
import { PropertyCreationData } from '../../types/propertyForm';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/Button';
import { Building, MapPin, DollarSign, Home, FileText, Calendar, CheckCircle, Star } from 'lucide-react';

interface PropertyFormReviewProps {
  data: PropertyCreationData;
  onSubmit: () => void;
  onEdit: (section: 'property' | 'units' | 'listings') => void;
  isSubmitting?: boolean;
}

const PropertyFormReview: React.FC<PropertyFormReviewProps> = ({
  data,
  onSubmit,
  onEdit,
  isSubmitting = false
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Property Information Review */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Property Information</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit('property')}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </Button>
        </div>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-xl text-gray-900 mb-2">{data.property.name}</h4>
            <p className="text-gray-600 text-sm mb-3">{data.property.title}</p>
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <MapPin className="h-4 w-4" />
              <span>
                {data.property.address.line1}
                {data.property.address.line2 && `, ${data.property.address.line2}`}
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              {data.property.address.city}, {data.property.address.region} {data.property.address.postalCode}
            </p>
            <p className="text-gray-600 text-sm">{data.property.address.country}</p>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Type</p>
              <p className="font-semibold text-gray-900">{data.property.property_type}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Bedrooms</p>
              <p className="font-semibold text-gray-900">{data.property.bedrooms}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Bathrooms</p>
              <p className="font-semibold text-gray-900">{data.property.bathrooms}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">Square Feet</p>
              <p className="font-semibold text-gray-900">{data.property.square_feet.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-green-50 rounded-xl border border-green-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">Base Rent</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(data.property.rent_amount)}/month</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Rating</p>
              <div className="flex items-center gap-1 justify-end">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold text-gray-900">{data.property.rating}/5.0</span>
              </div>
            </div>
          </div>

          {/* Property Features */}
          <div className="flex flex-wrap gap-2">
            {data.property.pet_friendly && (
              <Badge className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-full">
                Pet Friendly
              </Badge>
            )}
            {data.property.is_available && (
              <Badge className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full">
                Available
              </Badge>
            )}
            {data.property.isRentWiseNetwork && (
              <Badge className="bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1 rounded-full">
                RentWise Network
              </Badge>
            )}
          </div>

          {/* Property Description */}
          {data.property.description && (
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Description</h5>
              <p className="text-gray-700 text-sm leading-relaxed p-4 bg-gray-50 rounded-xl border border-gray-200">
                {data.property.description}
              </p>
            </div>
          )}

          {/* Property Amenities */}
          {data.property.amenities.length > 0 && (
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Amenities</h5>
              <div className="flex flex-wrap gap-2">
                {data.property.amenities.map((amenity, index) => (
                  <Badge key={index} className="bg-gray-100 text-gray-800 border border-gray-200 px-3 py-1 rounded-full text-sm">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Property Images */}
          {data.property.images.length > 0 && (
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Images ({data.property.images.length})</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.property.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-xl border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          {data.property.socialFeeds && (
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Social Media</h5>
              <div className="flex flex-wrap gap-2">
                {data.property.socialFeeds.instagram && (
                  <Badge className="bg-pink-100 text-pink-800 border border-pink-200 px-3 py-1 rounded-full">
                    Instagram: {data.property.socialFeeds.instagram}
                  </Badge>
                )}
                {data.property.socialFeeds.tiktok && (
                  <Badge className="bg-black text-white border border-gray-800 px-3 py-1 rounded-full">
                    TikTok: {data.property.socialFeeds.tiktok}
                  </Badge>
                )}
                {data.property.socialFeeds.youtube && (
                  <Badge className="bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full">
                    YouTube: {data.property.socialFeeds.youtube}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Coordinates:</strong> {data.property.location.lat.toFixed(6)}, {data.property.location.lng.toFixed(6)}
            </p>
          </div>
        </div>
      </div>

      {/* Units Review */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Home className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Units ({data.units.length})</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit('units')}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </Button>
        </div>
        <div>
          <div className="space-y-4">
            {data.units.map((unit, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Unit {unit.unitNumber}</h4>
                  <Badge variant={unit.available ? 'default' : 'secondary'}>
                    {unit.available ? 'Available' : 'Not Available'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                    <p className="font-medium">{unit.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                    <p className="font-medium">{unit.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Square Feet</p>
                    <p className="font-medium">{unit.squareFeet.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Rent</p>
                    <p className="font-medium text-green-600">{formatCurrency(unit.rent)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Deposit:</span>
                    <span className="font-medium">{formatCurrency(unit.deposit)}</span>
                  </div>
                  {unit.availableDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Available:</span>
                      <span className="font-medium">{formatDate(unit.availableDate)}</span>
                    </div>
                  )}
                </div>

                {unit.amenities.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Amenities:</p>
                    <div className="flex flex-wrap gap-1">
                      {unit.amenities.map((amenity, amenityIndex) => (
                        <Badge key={amenityIndex} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {unit.description && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-1">Description:</p>
                    <p className="text-sm text-gray-800">{unit.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listings Review */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Listings ({data.listings.length})</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit('listings')}
            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </Button>
        </div>
        <div>
          <div className="space-y-4">
            {data.listings.map((listing, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{listing.title}</h4>
                  <Badge variant={listing.available ? 'default' : 'secondary'}>
                    {listing.available ? 'Available' : 'Not Available'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                    <p className="font-medium">{listing.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bathrooms</p>
                    <p className="font-medium">{listing.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Square Feet</p>
                    <p className="font-medium">{listing.squareFeet.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Monthly Rent</p>
                    <p className="font-medium text-green-600">{formatCurrency(listing.rent)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Deposit:</span>
                    <span className="font-medium">{formatCurrency(listing.deposit)}</span>
                  </div>
                  {listing.availableDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Available:</span>
                      <span className="font-medium">{formatDate(listing.availableDate)}</span>
                    </div>
                  )}
                </div>

                {listing.amenities.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Amenities:</p>
                    <div className="flex flex-wrap gap-1">
                      {listing.amenities.map((amenity, amenityIndex) => (
                        <Badge key={amenityIndex} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {listing.description && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-1">Description:</p>
                    <p className="text-sm text-gray-800">{listing.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Section */}
      <div className="bg-green-50 rounded-2xl shadow-sm border border-green-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-800">Ready to Submit</h3>
        </div>
        <p className="text-green-700 mb-6 leading-relaxed">
          Review all the information above. Once submitted, your property will be created and available for management.
        </p>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold text-white transition-colors"
        >
          {isSubmitting ? 'Creating Property...' : 'Create Property'}
        </Button>
      </div>
    </div>
  );
};

export default PropertyFormReview;
