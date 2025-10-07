import React from 'react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/Button';
import { Star, MapPin, Bed, Bath, Square, Heart } from 'lucide-react';
import { formatPropertyAddress } from '../lib/utils';

interface Property {
  id: string;
  title: string;
  address: string;
  rent: number;
  beds: number;
  baths: number;
  sqft?: number;
  rating: number;
  available: string;
  image: string;
  amenities?: string[];
}

interface TestPropertyCardProps {
  property: Property;
  onViewDetails: (property: any) => void;
  onViewUnits: (property: any) => void;
  onToggleSave: () => void;
  isSaved?: boolean;
}

export const TestPropertyCard: React.FC<TestPropertyCardProps> = ({
  property,
  onViewDetails,
  onViewUnits,
  onToggleSave,
  isSaved = false
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20">
      <div className="relative">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={property.image} 
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-3 right-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={onToggleSave}
            >
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            </Button>
          </div>
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
              Available {property.available}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                {property.title}
              </h3>
              <div className="flex items-center gap-1 ml-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{property.rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {typeof property.address === 'string' 
                  ? property.address
                  : formatPropertyAddress(property.address)
                }
              </span>
            </div>
          </div>

          {/* Price and Details */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">
              ${property.rent.toLocaleString()}/mo
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{property.beds}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{property.baths}</span>
              </div>
              {property.sqft && (
                <div className="flex items-center gap-1">
                  <Square className="h-4 w-4" />
                  <span>{property.sqft}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{property.amenities.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(property);
              }}
              className="flex-1"
            >
              View Details
            </Button>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onViewUnits(property);
              }}
              className="flex-1"
            >
              See Available Units
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};