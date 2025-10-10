import { Star, MapPin, Bed, Bath, Square, Heart, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { formatPropertyAddress } from "../lib/utils";
import { useToast } from "../hooks/use-toast";
import {
  saveProperty,
  isPropertySaved,
  removeSavedProperty,
  SavePropertyData,
} from "../services/savedPropertiesService";
import SharePropertyModal from "./SharePropertyModal";

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
    square_feet?: number;
    sqft?: number;
    available?: boolean;
    available_date?: string;
    description?: string;
    pet_friendly?: boolean;
    parkingIncluded?: boolean;
    furnished?: boolean;
    floor?: number;
    view?: string;
  };
  index: number;
  onViewUnits?: (property: ModernPropertyCardProps["property"]) => void;
}

export function ModernPropertyCard({
  property,
  index,
  onViewUnits,
}: ModernPropertyCardProps) {
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if property is saved
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user?.uid) return;

      try {
        const result = await isPropertySaved(user.uid, property.id.toString());
        if (result.success) {
          setIsSaved(result.isSaved || false);
          setSavedPropertyId(result.savedPropertyId || null);
        }
      } catch (error) {
        console.error("Error checking if property is saved:", error);
      }
    };

    checkIfSaved();
  }, [user?.uid, property.id]);

  // Handle save/unsave property toggle
  const handleSaveProperty = async () => {
    if (!user?.uid) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save properties.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      if (isSaved) {
        // Unsave property - remove from saved list
        if (!savedPropertyId) {
          toast({
            title: "Error",
            description: "Cannot remove property - no saved property ID found.",
            variant: "destructive",
          });
          return;
        }
        const result = await removeSavedProperty(savedPropertyId);

        if (result.success) {
          setIsSaved(false);
          setSavedPropertyId(null);
          toast({
            title: "Property removed",
            description: "Property has been removed from your saved list.",
          });
        } else {
          toast({
            title: "Error removing property",
            description: result.error || "Failed to remove property",
            variant: "destructive",
          });
        }
      } else {
        // Save property - add to saved list with dynamic data
        const propertyData: SavePropertyData = {
          propertyId: property.id.toString(),
          propertyName: property.name,
          propertyAddress: property.address,
          propertyPrice: property.priceRange,
          propertyBeds: formatBedrooms(),
          propertyBaths: formatBathrooms(),
          propertySqft: formatSquareFootage(),
          propertyRating: property.rating,
          propertyImage: property.image,
          propertyType: property.propertyType,
          propertyAmenities: property.amenities || [],
          notes:
            property.description ||
            `Available: ${property.available !== false ? "Yes" : "No"}${
              property.pet_friendly ? " | Pet Friendly" : ""
            }${property.parkingIncluded ? " | Parking Included" : ""}${
              property.furnished ? " | Furnished" : ""
            }`,
        };

        const result = await saveProperty(user.uid, propertyData);

        if (result.success) {
          setIsSaved(true);
          setSavedPropertyId(result.id || null);
          toast({
            title: "Property saved",
            description: "Property has been added to your saved list.",
          });
        } else {
          toast({
            title: "Error saving property",
            description: result.error || "Failed to save property",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error toggling property save:", error);
      toast({
        title: "Error",
        description: "Failed to update property status",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

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

  // Format square footage from Firebase data
  const formatSquareFootage = () => {
    if (property.square_feet) {
      return property.square_feet;
    }
    if (property.sqft) {
      return property.sqft;
    }
    // Generate reasonable square footage based on bedrooms if no data available
    const bedrooms = formatBedrooms();
    return bedrooms === 0 ? 500 : bedrooms * 400 + 200; // Studio: 500, 1BR: 600, 2BR: 1000, etc.
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
      <div className="flex flex-col sm:flex-row">
        {/* Image & Availability */}
        <div className="w-full sm:w-1/3 relative overflow-hidden group">
          <img
            src={
              property.image ||
              "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"
            }
            alt={property.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Available Badge - Dynamic from Firebase data */}
          <div className="absolute top-4 left-4">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className={`px-3 py-1 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm ${
                property.available === false
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                  : "bg-gradient-to-r from-green-500 to-green-600 text-white"
              }`}
            >
              {property.available === false ? "Unavailable" : "Available"}
            </motion.span>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            {/* Share Button */}
            <motion.div
              className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 bg-white bg-opacity-90 hover:bg-opacity-100 shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowShareModal(true);
              }}
              style={{ pointerEvents: "auto" }}
            >
              <Share2
                size={16}
                color="#6b7280"
                className="transition-all duration-300"
              />
            </motion.div>

            {/* Heart Icon - Save Property */}
            <motion.div
              className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 ${
                isSaved
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-200"
                  : "bg-white bg-opacity-90 hover:bg-opacity-100 hover:shadow-md"
              } ${saving ? "opacity-75 cursor-not-allowed" : ""}`}
              whileHover={{ scale: saving ? 1 : 1.1 }}
              whileTap={{ scale: saving ? 1 : 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                if (!saving) {
                  handleSaveProperty();
                }
              }}
              style={{ pointerEvents: "auto" }}
            >
              <Heart
                size={17}
                color={isSaved ? "#ffffff" : "#ef4444"}
                fill={isSaved ? "#ffffff" : "none"}
                className={`transition-all duration-300 ${
                  saving ? "animate-pulse" : ""
                }`}
              />
            </motion.div>
          </div>

          {/* RentWise Network Badge - Dynamic from Firebase data */}
          {property.isRentWiseNetwork && (
            <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
              RentWise Network
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Details */}
        <div className="w-full sm:w-2/3 p-4 sm:p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-2 mb-1">
                {property.name}
              </h3>
              <div className="flex items-center text-gray-600 mb-2">
                <div className="bg-blue-50 p-1 rounded-lg mr-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm">
                  {typeof property.address === "string"
                    ? property.address
                    : formatPropertyAddress(property.address)}
                </span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                <span className="text-sm font-semibold text-gray-900">
                  {property.rating.toFixed(1)}
                </span>
              </div>
            </div>
            <div className="text-right ml-4">
              <span className="text-2xl font-bold ">${formatPrice()}</span>
              <div className="text-sm text-gray-500">per month</div>
            </div>
          </div>

          {/* Beds, Baths, Sqft - Dynamic from Firebase data */}
          <div className="flex items-center justify-between text-gray-600 mb-4 bg-gray-50 rounded-xl p-3">
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1 text-blue-600" />
              <span className="text-sm">
                {formatBedrooms() === 0
                  ? "Studio"
                  : `${formatBedrooms()} bed${
                      formatBedrooms() !== 1 ? "s" : ""
                    }`}
              </span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1 text-green-600" />
              <span className="text-sm">
                {formatBathrooms()} bath{formatBathrooms() !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center">
              <Square className="h-4 w-4 mr-1 text-purple-600" />
              <span className="text-sm">
                {formatSquareFootage().toLocaleString()} sqft
              </span>
            </div>
          </div>

          {/* Additional Property Features - Dynamic from Firebase data */}
          {(property.pet_friendly ||
            property.parkingIncluded ||
            property.furnished) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {property.pet_friendly && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                  🐾 Pet Friendly
                </span>
              )}
              {property.parkingIncluded && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                  🚗 Parking
                </span>
              )}
              {property.furnished && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                  🛋️ Furnished
                </span>
              )}
            </div>
          )}

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

          {/* Enhanced Action Buttons */}
          <div className="flex items-center justify-between gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={(e) => {
                e.stopPropagation();
                // Navigate to property details URL which will open the modal
                navigate(`/property-details/${property.id.toString()}`);
              }}
              className="relative px-4 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center
             justify-center overflow-hidden group bg-gray-50 border-2 border-gray-300 text-gray-700 
            hover:bg-gradient-to-r hover:text-white hover:from-green-600 hover:to-emerald-600 hover:border-green-500 flex-1 shadow-sm hover:shadow-md"
            >
              <span className="relative transition-all duration-300 group-hover:text-white">
                View Details
              </span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={(e) => {
                e.stopPropagation();
                onViewUnits?.(property);
              }}
              className="relative px-3 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center overflow-hidden group bg-gradient-to-r from-blue-600 to-blue-600 text-white flex-1 shadow-md hover:shadow-lg border-2 border-blue-600 hover:border-blue-700"
            >
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <span className="relative transition-all duration-300">
                Available Units
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Share Property Modal */}
      <SharePropertyModal
        property={property}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </motion.div>
  );
}
