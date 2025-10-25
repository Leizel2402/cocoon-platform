import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/badge';
import { MapPin, Star, Car, Wifi, Dumbbell, Home, ChevronLeft, ChevronRight, Calendar, FileText, Shield, Waves, Heart, TreePine, Building, Briefcase, PawPrint, Instagram, Youtube, Music } from 'lucide-react';
import { motion } from 'framer-motion';
// import propertyInterior1 from '@/assets/property-interior-1.jpg';
// import propertyKitchen1 from '@/assets/property-kitchen-1.jpg';
// import propertyBedroom1 from '@/assets/property-bedroom-1.jpg';
// import propertyBathroom1 from '@/assets/property-bathroom-1.jpg';
// import propertyPool1 from '@/assets/property-pool-1.jpg';
// import propertyGym1 from '@/assets/property-gym-1.jpg';
import heroImage from '../../../assets/images/hero-apartments.jpg';
import { formatPropertyAddress } from '../../../lib/utils';
interface PropertyDetailsModalProps {
  property: {
    id: string;
    name: string;
    address: string | {
      line1: string;
      line2?: string;
      city: string;
      region: string;
      postalCode: string;
      country: string;
    };
    priceRange: string;
    rating: number;
    beds: string;
    amenities: string[];
    image?: string;
    rent_amount?: number;
    bedrooms?: number;
    bathrooms?: number;
    description?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    propertyType?: string;
    isRentWiseNetwork?: boolean;
    pet_friendly?: boolean;
    available_date?: string;
    // Additional detailed fields from Firebase
    square_feet?: number;
    lat?: number;
    lng?: number;
    country?: string;
    landlordId?: string;
    createdAt?: any;
    updatedAt?: any;
    created_at?: any;
    updated_at?: any;
    // Optional additional fields
    year_built?: number;
    parking_spaces?: number;
    laundry_type?: string;
    heating_type?: string;
    cooling_type?: string;
    flooring_type?: string;
    pet_policy?: string;
    smoking_policy?: string;
    lease_terms?: string[];
    utilities_included?: string[];
    nearby_schools?: string[];
    nearby_transportation?: string[];
    property_manager?: string;
    contact_phone?: string;
    contact_email?: string;
    coordinates?: [number, number];
    images?: string[];
    socialFeeds?: {
      instagram?: string;
      tiktok?: string;
      youtube?: string;
    };
  };
  isOpen: boolean;
  onClose: () => void;
  onScheduleTour?: (property?: PropertyDetailsModalProps['property']) => void;
  onApplyNow?: (property?: PropertyDetailsModalProps['property']) => void;
  onViewUnits?: (property: PropertyDetailsModalProps['property']) => void;
}

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  property,
  isOpen,
  onClose,
  onScheduleTour,
  onApplyNow,
  onViewUnits
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  console.log("property",property);
  
  if (!property) return null;

  // Dynamic property images gallery - use property images from Firebase data
  const propertyImages = (() => {
    const images = [];
    
    // Add images from property.images array (from Firebase)
    if (property.images && property.images.length > 0) {
      property.images.forEach((image, index) => {
        if (image && image.trim() !== '') { // Only add non-empty images
          images.push({
            src: image,
            caption: `Property Image ${index + 1}`
          });
        }
      });
    }
    
    // Add single image if available (fallback)
    if (property.image && property.image.trim() !== '') {
      images.push({
        src: property.image,
        caption: "Property Image"
      });
    }
    
    // If no images from property data, use default gallery
    // if (images.length === 0) {
    //   return [
    //     { src: heroImage, caption: "Building Exterior" },
    //     { src: heroImage, caption: "Living Room" },
    //     { src: heroImage, caption: "Modern Kitchen" },
    //     { src: heroImage, caption: "Master Bedroom" },
    //     { src: heroImage, caption: "Luxury Bathroom" },
    //     { src: heroImage, caption: "Rooftop Pool" },
    //     { src: heroImage, caption: "Fitness Center" }
    //   ];
    // }
    
    return images;
  })();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + propertyImages.length) % propertyImages.length);
  };

  // const formatPrice = (min: number, max: number) => {
  //   return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  // };

  const amenityIcons: { [key: string]: React.ReactNode } = {
    'Pool': <Waves className="h-4 w-4 text-blue-600" />,
    'Gym': <Dumbbell className="h-4 w-4 text-red-600" />,
    'Pet Friendly': <PawPrint className="h-4 w-4 text-orange-600" />,
    'Parking': <Car className="h-4 w-4 text-gray-600" />,
    'In Unit Laundry': <Heart className="h-4 w-4 text-pink-600" />,
    'Balcony': <TreePine className="h-4 w-4 text-green-500" />,
    'Wifi': <Wifi className="h-4 w-4 text-green-600" />,
    'Luxury': <Star className="h-4 w-4 text-yellow-500" />,
    'Concierge': <Shield className="h-4 w-4 text-blue-500" />,
    'Rooftop': <Building className="h-4 w-4 text-gray-700" />,
    'Clubhouse': <Home className="h-4 w-4 text-purple-600" />,
    'Business Center': <Briefcase className="h-4 w-4 text-indigo-600" />,
    'Dog Park': <PawPrint className="h-4 w-4 text-orange-500" />,
    'Modern': <Building className="h-4 w-4 text-gray-700" />
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden p-0 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
        {/* Modern Header with Gradient Background */}
        <DialogHeader className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 p-6 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl"
              >
                <Home className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <DialogTitle className="text-3xl font-bold text-white mb-1">
            {property.name}
          </DialogTitle>
                <div className="flex items-center space-x-4 text-white/90">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {typeof property.address === 'string' 
                        ? property.address
                        : formatPropertyAddress(property.address)
                      }
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-300 fill-current" />
                    <span className="text-sm font-medium">{property.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          
          </div>
        </DialogHeader>

        {/* Security Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 px-6 py-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">All property information is secure and verified</span>
          </div>
        </div>

        {/* Main Content Area - Single Column Layout */}
        <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Property Images Gallery */}
          <div className="relative">
              <div className="relative h-80 rounded-2xl overflow-hidden bg-gray-100 shadow-2xl">
              <img
                src={propertyImages[currentImageIndex]?.src}
                alt={propertyImages[currentImageIndex]?.caption}
                  className="w-full h-full object-cover transition-all duration-500"
              />
              
              {/* Navigation arrows */}
                <motion.button
                onClick={prevImage}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all backdrop-blur-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                </motion.button>
                <motion.button
                onClick={nextImage}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all backdrop-blur-sm"
              >
                <ChevronRight className="h-4 w-4" />
                </motion.button>

              {/* Image counter and caption */}
              <div className="absolute bottom-4 left-4 flex space-x-2">
                  <Badge className="bg-white/90 text-gray-800 border-0 shadow-lg text-xs">
                  {currentImageIndex + 1} of {propertyImages.length}
                </Badge>
                  <Badge className="bg-white/90 text-gray-800 border-0 shadow-lg text-xs">
                  {propertyImages[currentImageIndex]?.caption}
                </Badge>
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
              {propertyImages.map((image, index) => (
                  <motion.button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all shadow-md ${
                    index === currentImageIndex 
                        ? 'border-blue-500 shadow-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.caption}
                    className="w-full h-full object-cover"
                  />
                  </motion.button>
              ))}
            </div>
          </div>

            {/* Property Details Cards */}
          <div className="grid md:grid-cols-2 gap-6">
              {/* Price and Basic Info Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {property.priceRange}
              </div>
                  <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-500 fill-current mr-1" />
                    <span className="font-semibold text-yellow-700">{property.rating.toFixed(1)}</span>
                </div>
              </div>
                <div className="text-xl text-gray-600 mb-4 font-medium">
                {property.beds}
              </div>
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    {typeof property.address === 'string' 
                      ? property.address
                      : formatPropertyAddress(property.address)
                    }
                  </span>
                </div>
                
                {/* Property Status Badges */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {property.propertyType && (
                    <Badge className="bg-gray-100 text-gray-700">
                      {property.propertyType}
                    </Badge>
                  )}
                  {property.isRentWiseNetwork && (
                    <Badge className="bg-blue-100 text-blue-700">
                      RentWise Network
                    </Badge>
                  )}
                  {property.pet_friendly && (
                    <Badge className="bg-green-100 text-green-700">
                      Pet Friendly
                    </Badge>
                  )}
                  {property.available_date && (
                    <Badge className="bg-purple-100 text-purple-700">
                      Available {new Date(property.available_date).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
            </div>

              {/* Available Units and Lease Terms Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="space-y-6">
              <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <Home className="h-5 w-5 mr-2 text-blue-600" />
                      Available Units
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-blue-800 font-medium">
                {property.beds}
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Multiple floor plans to choose from
                      </div>
                </div>
              </div>
              <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                      Lease Terms
                    </h3>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-sm text-purple-800 font-medium">
                        {property.lease_term_options?.join(', ') || '6, 12, 18 month options available'}
                      </div>
                      <div className="text-xs text-purple-600 mt-1">
                        Flexible terms to fit your needs
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>

            {/* Complete Property Details */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Property Specifications */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-indigo-600" />
                  Property Details
                </h3>
                <div className="space-y-3">
                  {property.square_feet && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Square Feet:</span>
                      <span className="font-medium">{property.square_feet.toLocaleString()}</span>
                    </div>
                  )}
                  {property.bedrooms && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bedrooms:</span>
                      <span className="font-medium">{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bathrooms:</span>
                      <span className="font-medium">{property.bathrooms}</span>
                    </div>
                  )}
                  {property.rent_amount && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Rent:</span>
                      <span className="font-medium">${property.rent_amount.toLocaleString()}/mo</span>
                    </div>
                  )}
                  {property.rating && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-medium flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        {property.rating.toFixed(1)}/5.0
                      </span>
                    </div>
                  )}
                  {property.year_built && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year Built:</span>
                      <span className="font-medium">{property.year_built}</span>
                    </div>
                  )}
                  {property.parking_spaces && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Parking:</span>
                      <span className="font-medium">{property.parking_spaces} spaces</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Property Features */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Waves className="h-5 w-5 mr-2 text-teal-600" />
                  Property Features
                </h3>
                <div className="space-y-3">
                  {property.heating_type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Heating:</span>
                      <span className="font-medium">{property.heating_type}</span>
                    </div>
                  )}
                  {property.cooling_type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cooling:</span>
                      <span className="font-medium">{property.cooling_type}</span>
                    </div>
                  )}
                  {property.flooring_type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Flooring:</span>
                      <span className="font-medium">{property.flooring_type}</span>
                    </div>
                  )}
                  {property.laundry_type && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Laundry:</span>
                      <span className="font-medium">{property.laundry_type}</span>
                    </div>
                  )}
                  {property.pet_friendly !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pet Friendly:</span>
                      <span className="font-medium">{property.pet_friendly ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                  {property.isRentWiseNetwork && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">RentWise Network:</span>
                      <span className="font-medium text-blue-600">Yes</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Details */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-600" />
                  Address Details
                </h3>
                <div className="space-y-3">
                  {typeof property.address === 'object' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Street:</span>
                        <span className="font-medium text-right max-w-[60%] break-words">{property.address.line1}</span>
                      </div>
                      {property.address.line2 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Apt/Suite:</span>
                          <span className="font-medium text-right max-w-[60%] break-words">{property.address.line2}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">City:</span>
                        <span className="font-medium">{property.address.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">State:</span>
                        <span className="font-medium">{property.address.region}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">ZIP:</span>
                        <span className="font-medium">{property.address.postalCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Country:</span>
                        <span className="font-medium">{property.address.country}</span>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Full Address:</span>
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 shadow-sm">
                        <span className="font-medium text-gray-800 leading-relaxed block">{formatPropertyAddress(property.address)}</span>
                      </div>
                    </div>
                  )}
                  {property.city && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">City:</span>
                      <span className="font-medium">{property.city}</span>
                    </div>
                  )}
                  {property.state && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">State:</span>
                      <span className="font-medium">{property.state}</span>
                    </div>
                  )}
                  {property.zip_code && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">ZIP Code:</span>
                      <span className="font-medium">{property.zip_code}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              {/* <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                  Contact
                </h3>
                <div className="space-y-3">
                  {property.landlordId && (
                    <div>
                    
                    </div>
                  )}
                  {property.property_manager && (
                    <div>
                      <span className="text-gray-600 text-sm">Property Manager:</span>
                      <div className="font-medium">{property.property_manager}</div>
                    </div>
                  )}
                  {property.contact_phone && (
                    <div>
                      <span className="text-gray-600 text-sm">Phone:</span>
                      <div className="font-medium">{property.contact_phone}</div>
                    </div>
                  )}
                  {property.contact_email && (
                    <div>
                      <span className="text-gray-600 text-sm">Email:</span>
                      <div className="font-medium text-blue-600">{property.contact_email}</div>
                    </div>
                  )}
                </div>
              </div> */}
            </div>

            {/* Policies and Utilities */}
            {(property.pet_policy || property.smoking_policy || property.utilities_included) && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Policies */}
                {(property.pet_policy || property.smoking_policy) && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <PawPrint className="h-5 w-5 mr-2 text-orange-600" />
                      Policies
                    </h3>
                    <div className="space-y-3">
                      {property.pet_policy && (
                        <div>
                          <span className="text-gray-600 text-sm">Pet Policy:</span>
                          <div className="font-medium">{property.pet_policy}</div>
                        </div>
                      )}
                      {property.smoking_policy && (
          <div>
                          <span className="text-gray-600 text-sm">Smoking Policy:</span>
                          <div className="font-medium">{property.smoking_policy}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Utilities */}
                {property.utilities_included && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Waves className="h-5 w-5 mr-2 text-green-600" />
                      Utilities Included
                    </h3>
                    <div className="space-y-2">
                      {property.utilities_included.map((utility, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="font-medium">{utility}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Nearby Amenities */}
            {(property.nearby_schools || property.nearby_transportation) && (
              <div className="grid md:grid-cols-2 gap-6">
                {property.nearby_schools && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <TreePine className="h-5 w-5 mr-2 text-green-600" />
                      Nearby Schools
                    </h3>
                    <div className="space-y-2">
                      {property.nearby_schools.map((school, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <span className="font-medium">{school}</span>
                        </div>
                      ))}
            </div>
          </div>
                )}

                {property.nearby_transportation && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <Car className="h-5 w-5 mr-2 text-blue-600" />
                      Transportation
                    </h3>
                    <div className="space-y-2">
                      {property.nearby_transportation.map((transport, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <span className="font-medium">{transport}</span>
                </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Amenities Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-6 text-xl">Property Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from(new Set(property.amenities)).map((amenity, index) => (
                  <motion.div 
                    key={index} 
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-blue-300 transition-all duration-200"
                  >
                    <span className="text-2xl">{amenityIcons[amenity as string] || <Home className="h-4 w-4 text-gray-500" />}</span>
                    <span className="text-sm font-medium text-gray-700">{amenity}</span>
                  </motion.div>
              ))}
            </div>
          </div>


            {/* Property Information */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 text-xl flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                About This Property
              </h3>
              <p className="text-gray-600 leading-relaxed text-base">
                {property.description || 'No description available for this property.'}
              </p>
              
              {/* Property Metadata */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                  {/* Show only the most recent creation date */}
                  {(property.createdAt || property.created_at) && (
                    <div>
                      <span className="font-medium">Listed:</span> {
                        (() => {
                          try {
                            const dateValue = property.createdAt || property.created_at;
                            if (dateValue.toDate) {
                              return dateValue.toDate().toLocaleDateString();
                            } else {
                              const date = new Date(dateValue);
                              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                            }
                          } catch (error) {
                            return 'N/A';
                          }
                        })()
                      }
                    </div>
                  )}
                  
                  {/* Show only the most recent update date */}
                  {(property.updatedAt || property.updated_at) && (
                    <div>
                      <span className="font-medium">Last Updated:</span> {
                        (() => {
                          try {
                            const dateValue = property.updatedAt || property.updated_at;
                            if (dateValue.toDate) {
                              return dateValue.toDate().toLocaleDateString();
                            } else {
                              const date = new Date(dateValue);
                              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
                            }
                          } catch (error) {
                            return 'N/A';
                          }
                        })()
                      }
                    </div>
                  )}
                  
                  {property.landlordId && (
                    <div>
                      <span className="font-medium">Landlord ID:</span> {property.landlordId}
                    </div>
                  )}
                  
                  {property.propertyType && (
                    <div>
                      <span className="font-medium">Property Type:</span> {property.propertyType}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            {property.socialFeeds && (property.socialFeeds.instagram || property.socialFeeds.tiktok || property.socialFeeds.youtube) && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 text-xl flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-pink-600" />
                  Social Media
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {property.socialFeeds.instagram && (
                    <motion.a
                      href={property.socialFeeds.instagram.startsWith('@') ? `https://instagram.com/${property.socialFeeds.instagram.substring(1)}` : property.socialFeeds.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-3 p-4 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg border border-pink-200 hover:border-pink-300 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Instagram className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Instagram</p>
                        <p className="text-sm text-gray-600">{property.socialFeeds.instagram}</p>
                      </div>
                    </motion.a>
                  )}
                  
                  {property.socialFeeds.tiktok && (
                    <motion.a
                      href={property.socialFeeds.tiktok.startsWith('@') ? `https://tiktok.com/@${property.socialFeeds.tiktok.substring(1)}` : property.socialFeeds.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <Music className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">TikTok</p>
                        <p className="text-sm text-gray-600">{property.socialFeeds.tiktok}</p>
                      </div>
                    </motion.a>
                  )}
                  
                  {property.socialFeeds.youtube && (
                    <motion.a
                      href={property.socialFeeds.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-3 p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200 hover:border-red-300 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                        <Youtube className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">YouTube</p>
                        <p className="text-sm text-gray-600">Channel</p>
                      </div>
                    </motion.a>
                  )}
                </div>
              </div>
            )}
          </div>
          </div>

        {/* Modern Action Buttons */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Button 
              onClick={() => onScheduleTour?.(property)}
              variant="outline" 
                className="w-full h-12 text-base font-semibold border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
                <Calendar className="h-4 w-4 mr-2" />
              Schedule Tour
            </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Button 
             onClick={(e) => {
              e.stopPropagation();
              onViewUnits?.(property);
            }}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
                <FileText className="h-4 w-4 mr-2" />
                See Available Units
            </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsModal;