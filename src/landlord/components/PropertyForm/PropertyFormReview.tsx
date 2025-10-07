import React from 'react';
import { PropertyCreationData } from '../../types/propertyForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
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
    <div className="space-y-6">
      {/* Property Information Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Property Information
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit('property')}
          >
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-lg">{data.property.name}</h4>
            <p className="text-gray-600 text-sm">{data.property.title}</p>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              <span>
                {data.property.address.line1}
                {data.property.address.line2 && `, ${data.property.address.line2}`}
              </span>
            </div>
            <p className="text-gray-600">
              {data.property.address.city}, {data.property.address.region} {data.property.address.postalCode}
            </p>
            <p className="text-gray-600">{data.property.address.country}</p>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-semibold">{data.property.property_type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bedrooms</p>
              <p className="font-semibold">{data.property.bedrooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Bathrooms</p>
              <p className="font-semibold">{data.property.bathrooms}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Square Feet</p>
              <p className="font-semibold">{data.property.square_feet.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Base Rent</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(data.property.rent_amount)}/month</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Rating</p>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">{data.property.rating}/5.0</span>
              </div>
            </div>
          </div>

          {/* Property Features */}
          <div className="flex flex-wrap gap-2">
            {data.property.pet_friendly && (
              <Badge variant="secondary">Pet Friendly</Badge>
            )}
            {data.property.is_available && (
              <Badge variant="default">Available</Badge>
            )}
            {data.property.isRentWiseNetwork && (
              <Badge variant="outline">RentWise Network</Badge>
            )}
          </div>

          {/* Property Description */}
          {data.property.description && (
            <div>
              <h5 className="font-medium mb-2">Description</h5>
              <p className="text-gray-700 text-sm">{data.property.description}</p>
            </div>
          )}

          {/* Property Amenities */}
          {data.property.amenities.length > 0 && (
            <div>
              <h5 className="font-medium mb-2">Amenities</h5>
              <div className="flex flex-wrap gap-1">
                {data.property.amenities.map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Property Images */}
          {data.property.images.length > 0 && (
            <div>
              <h5 className="font-medium mb-2">Images ({data.property.images.length})</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {data.property.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}

          {data.property.socialFeeds && (
            <div>
              <h5 className="font-medium mb-2">Social Media</h5>
              <div className="flex flex-wrap gap-2">
                {data.property.socialFeeds.instagram && (
                  <Badge variant="secondary">Instagram: {data.property.socialFeeds.instagram}</Badge>
                )}
                {data.property.socialFeeds.tiktok && (
                  <Badge variant="secondary">TikTok: {data.property.socialFeeds.tiktok}</Badge>
                )}
                {data.property.socialFeeds.youtube && (
                  <Badge variant="secondary">YouTube: {data.property.socialFeeds.youtube}</Badge>
                )}
              </div>
            </div>
          )}

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Coordinates:</strong> {data.property.location.lat.toFixed(6)}, {data.property.location.lng.toFixed(6)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Units Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Units ({data.units.length})
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit('units')}
          >
            Edit
          </Button>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Listings Review */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Listings ({data.listings.length})
          </CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit('listings')}
          >
            Edit
          </Button>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Submit Section */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800">Ready to Submit</h3>
          </div>
          <p className="text-green-700 mb-4">
            Review all the information above. Once submitted, your property will be created and available for management.
          </p>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Creating Property...' : 'Create Property'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyFormReview;
