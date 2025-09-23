import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/badge';
import { MapPin, Star, Car, Wifi, Dumbbell, Home, ChevronLeft, ChevronRight, Calendar, FileText, Shield, Waves, Heart, TreePine, Building, Briefcase, PawPrint } from 'lucide-react';
import { motion } from 'framer-motion';
// import propertyInterior1 from '@/assets/property-interior-1.jpg';
// import propertyKitchen1 from '@/assets/property-kitchen-1.jpg';
// import propertyBedroom1 from '@/assets/property-bedroom-1.jpg';
// import propertyBathroom1 from '@/assets/property-bathroom-1.jpg';
// import propertyPool1 from '@/assets/property-pool-1.jpg';
// import propertyGym1 from '@/assets/property-gym-1.jpg';
import heroImage from '../../../assets/images/hero-apartments.jpg';
interface PropertyDetailsModalProps {
  property: {
    id: string;
    name: string;
    address: string;
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
  };
  isOpen: boolean;
  onClose: () => void;
  onScheduleTour?: (property?: PropertyDetailsModalProps['property']) => void;
  onApplyNow?: (property?: PropertyDetailsModalProps['property']) => void;
}

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  property,
  isOpen,
  onClose,
  onScheduleTour,
  onApplyNow
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  if (!property) return null;

  // Dynamic property images gallery - use property image if available, otherwise use defaults
  const propertyImages = property.image ? [
    { src: property.image, caption: "Property Image" },
    { src: heroImage, caption: "Building Exterior" },
    { src: heroImage, caption: "Living Room" },
    { src: heroImage, caption: "Modern Kitchen" },
    { src: heroImage, caption: "Master Bedroom" },
    { src: heroImage, caption: "Luxury Bathroom" },
    { src: heroImage, caption: "Rooftop Pool" },
    { src: heroImage, caption: "Fitness Center" }
  ] : [
    { src: heroImage, caption: "Building Exterior" },
    { src: heroImage, caption: "Living Room" },
    { src: heroImage, caption: "Modern Kitchen" },
    { src: heroImage, caption: "Master Bedroom" },
    { src: heroImage, caption: "Luxury Bathroom" },
    { src: heroImage, caption: "Rooftop Pool" },
    { src: heroImage, caption: "Fitness Center" }
  ];

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
        <DialogHeader className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-6 text-white">
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
                    <span className="text-sm">{property.address}</span>
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
                src={propertyImages[currentImageIndex].src}
                alt={propertyImages[currentImageIndex].caption}
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
                  {propertyImages[currentImageIndex].caption}
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
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {property.priceRange}
              </div>
                  <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-xl">
                    <Star className="h-5 w-5 text-yellow-500 fill-current mr-1" />
                    <span className="font-semibold text-yellow-700">{property.rating.toFixed(1)}</span>
                </div>
              </div>
                <div className="text-xl text-gray-600 mb-4 font-medium">
                {property.beds}
              </div>
                <div className="flex items-center text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">{property.address}</span>
                </div>
                {property.propertyType && (
                  <div className="mt-3">
                    <Badge className="bg-blue-100 text-blue-700">
                      {property.propertyType}
                    </Badge>
                  </div>
                )}
            </div>

              {/* Available Units and Lease Terms Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="space-y-6">
              <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <Home className="h-5 w-5 mr-2 text-blue-600" />
                      Available Units
                    </h3>
                    <div className="bg-blue-50 rounded-xl p-4">
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
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="text-sm text-purple-800 font-medium">
                        {property.lease_terms?.join(', ') || '6, 12, 18 month options available'}
                      </div>
                      <div className="text-xs text-purple-600 mt-1">
                        Flexible terms to fit your needs
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>

            {/* Additional Property Details */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Property Specifications */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-green-600" />
                  Specifications
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
                      <span className="text-gray-600">Rent:</span>
                      <span className="font-medium">${property.rent_amount.toLocaleString()}/mo</span>
                    </div>
                  )}
                  {property.country && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Country:</span>
                      <span className="font-medium">{property.country}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Property Features */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Waves className="h-5 w-5 mr-2 text-blue-600" />
                  Features
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
                  {property.pet_friendly !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pet Friendly:</span>
                      <span className="font-medium">{property.pet_friendly ? 'Yes' : 'No'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-purple-600" />
                  Contact
                </h3>
                <div className="space-y-3">
                  {property.landlordId && (
                    <div>
                      {/* <span className="text-gray-600 text-sm">Landlord ID:</span> */}
                      {/* <div className="font-medium">{property.landlordId}</div> */}
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
              </div>
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
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200"
                  >
                    <span className="text-2xl">{amenityIcons[amenity as string] || <Home className="h-4 w-4 text-gray-500" />}</span>
                    <span className="text-sm font-medium text-gray-700">{amenity}</span>
                  </motion.div>
              ))}
            </div>
          </div>

            {/* Description Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 text-xl flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                About This Property
              </h3>
              <p className="text-gray-600 leading-relaxed text-base">
                {property.description || `Experience luxury living at ${property.name}. This modern apartment community offers 
                premium amenities and spacious floor plans. With easy access 
              to downtown and major highways, you'll enjoy the perfect blend of urban convenience 
                and residential comfort.`}
            </p>
            </div>
          </div>
          </div>

        {/* Modern Action Buttons */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Button 
              onClick={() => onScheduleTour?.(property)}
              variant="outline" 
                className="w-full h-12 text-base font-semibold border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-200"
            >
                <Calendar className="h-4 w-4 mr-2" />
              Schedule Tour
            </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Button 
              onClick={() => onApplyNow?.(property)}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
                <FileText className="h-4 w-4 mr-2" />
              Apply Now
            </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsModal;