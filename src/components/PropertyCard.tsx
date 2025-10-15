import { Property } from '../types';
import { Bed, Bath, Square, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface PropertyCardProps {
  property: Property;
  index: number;
}

export function PropertyCard({ property, index }: PropertyCardProps) {
    const [showAllAmenities, setShowAllAmenities] = useState(false);

    const displayedAmenities = showAllAmenities
      ? (property.amenities || [])
      : (property.amenities || []).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      {/* Image & Availability */}
      <div className="relative overflow-hidden group">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 sm:h-56 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Available Badge */}
        <div className="absolute top-4 left-4">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm ${
              property.available
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
            }`}
          >
            {property.available ? 'Available' : 'Unavailable'}
          </motion.span>
        </div>
        
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Details */}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2">
            {property.title}
          </h3>
          <div className="text-right ml-4">
            <span className="text-2xl font-bold">
              ${property.rent.toLocaleString()}
            </span>
            <div className="text-sm text-gray-500">per month</div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-3">
          <div className="bg-blue-50 p-1 rounded-lg mr-2">
            <MapPin className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-sm">{property.city}, {property.state}</span>
        </div>

        {/* Beds, Baths, Sqft */}
        <div className="flex items-center justify-between text-gray-600 mb-4 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1 text-blue-600" />
            <span className="text-sm">{property.beds} bed{property.beds !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1 text-green-600" />
            <span className="text-sm">{property.baths} bath{property.baths !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1 text-purple-600" />
            <span className="text-sm">{property.sqft} sqft</span>
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

        {(property.amenities || []).length > 3 && !showAllAmenities && (
          <button
            onClick={() => setShowAllAmenities(true)}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
          >
            +{(property.amenities || []).length - 3} more
          </button>
        )}

        {showAllAmenities && (property.amenities || []).length > 3 && (
          <button
            onClick={() => setShowAllAmenities(false)}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
          >
            Show less
          </button>
        )}
      </div>

        {/* Apply button (disable if unavailable) */}
        {/* {user?.role !== "owner" ? (
          <motion.button
            whileTap={{ scale: property.available ? 0.98 : 1 }}
            onClick={() => property.available && navigate(`/apply?property=${property.id}`)}
            disabled={!property.available}
            className={`w-full py-3 px-4 rounded-lg font-semibold shadow-lg transition-all duration-200 ${
              property.available
                ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 hover:shadow-xl'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            {property.available ? 'Apply Now' : 'Not Available'}
          </motion.button>
        ) : (null)} */}
      </div>
    </motion.div>
  );
}
