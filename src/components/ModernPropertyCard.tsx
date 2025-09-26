import { Star, MapPin, Bed, Bath, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface ModernPropertyCardProps {
  property: {
    id: string | number;
    name: string;
    address: string;
    priceRange: string;
    rent_amount?: number;
    beds: string;
    bedrooms?: number;
    bathrooms?: number;
    rating: number;
    propertyType: string;
    amenities: string[];
    image: string;
    isRentWiseNetwork?: boolean;
  };
  index: number;
  onViewDetails?: (property: any) => void;
  onViewUnits?: (property: any) => void;
}

export function ModernPropertyCard({ 
  property, 
  index, 
  onViewDetails, 
  onViewUnits 
}: ModernPropertyCardProps) {
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  // Format price display
  const formatPrice = () => {
    if (property.rent_amount) {
      return property.rent_amount.toLocaleString();
    }
    // Extract price from priceRange string
    const priceMatch = property.priceRange.match(/\$([\d,]+)/);
    return priceMatch ? priceMatch[1] : "1,500";
  };

  // Format bedroom display
  const formatBedrooms = () => {
    if (property.bedrooms) {
      return property.bedrooms;
    }
    // Extract number from beds string like "1-2 Beds" or "Studio - 2 Beds"
    const bedMatch = property.beds.match(/(\d+)/);
    return bedMatch ? parseInt(bedMatch[1]) : 1;
  };

  // Format bathroom display
  const formatBathrooms = () => {
    if (property.bathrooms) {
      return property.bathrooms;
    }
    return 1; // Default fallback
  };

  // Format square footage (mock data for now)
  const formatSquareFootage = () => {
    // This would come from property data in a real implementation
    return 900;
  };

  const displayedAmenities = showAllAmenities
    ? property.amenities
    : property.amenities.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="flex">
        {/* Image & Availability */}
        <div className="w-1/3 relative overflow-hidden group">
          <img
            src={property.image || "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"}
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-4 right-4">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="px-3 py-1 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm bg-gradient-to-r from-green-500 to-green-600 text-white"
            >
              Available
            </motion.span>
          </div>
          
          {/* RentWise Network Badge */}
          {/* {property.isRentWiseNetwork && (
            <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
              RentWise Network
            </div>
          )} */}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Details */}
        <div className="w-2/3 p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 mb-1">
              {property.name}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <div className="bg-blue-50 p-1 rounded-lg mr-2">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm">{property.address}</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              <span className="text-sm font-semibold text-gray-900">
                {property.rating.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="text-right ml-4">
            <span className="text-2xl font-bold ">
              ${formatPrice()}
            </span>
            <div className="text-sm text-gray-500">per month</div>
          </div>
        </div>

        {/* Beds, Baths, Sqft */}
        <div className="flex items-center justify-between text-gray-600 mb-4 bg-gray-50 rounded-xl p-3">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1 text-blue-600" />
            <span className="text-sm">{formatBedrooms()} bed{formatBedrooms() !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1 text-green-600" />
            <span className="text-sm">{formatBathrooms()} bath{formatBathrooms() !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1 text-purple-600" />
            <span className="text-sm">{formatSquareFootage()} sqft</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {displayedAmenities.map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-200"
            >
              {amenity}
            </span>
          ))}

          {property.amenities.length > 3 && !showAllAmenities && (
            <button
              onClick={() => setShowAllAmenities(true)}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
            >
              +{property.amenities.length - 3} more
            </button>
          )}

          {showAllAmenities && property.amenities.length > 3 && (
            <button
              onClick={() => setShowAllAmenities(false)}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
            >
              Show less
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(property);
            }}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium px-6 py-3 border-gray-200 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Details
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              onViewUnits?.(property);
            }}
            className="bg-gradient-to-r from-green-600 to-green-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:from-green-700 hover:to-green-600 hover:shadow-xl"
          >
            Available Units
          </motion.button>
        </div>
        </div>
      </div>
    </motion.div>
  );
}
