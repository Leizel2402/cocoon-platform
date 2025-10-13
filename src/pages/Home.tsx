import { useState, useEffect, useCallback } from "react";
import { PropertyCard } from "../components/PropertyCard";
import { Property, SearchFilters } from "../types";

import { motion } from "framer-motion";
import {
  Search,
  Home as HomeIcon,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import Footer from "../layout/Footer";
import ApplicationProcess from "../Prospect/ApplicationProcess";
import { Button } from "../components/ui/Button";

import { AddySearchBox } from "../components/AddySearch/AddySearchBox";
import { AddyChat } from "../components/AddyChat/Chat";
import { FAQSection, FAQItem } from "../components/FAQ";
import { TestimonialCard } from "../components/TestimonialCard/TestimonialCard";
import { ContactModal } from "../components/ContactModal";
import { testimonialsData, faqData } from "../constants/data";
import heroImage from "../assets/images/hero-apartments.jpg";

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Firebase imports
import { collection, query, limit, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  const [applicationStep] = useState<number | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<
    | "s"
    | "applications"
    | "profile"
    | "unit-selection"
    | "application-process"
    | "unit-comparison"
    | "product-selection"
    | "payment-page"
    | "property-management"
    | "property-success"
    | "properties-list"
    | "prequalification-info"
    | "property-details"
    | "account-management"
  >("s");
  const [loading, setLoading] = useState(true);
  const [showAllProperties, setShowAllProperties] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    city: "",
    minRent: 0,
    maxRent: 10000,
  });
  const [showAddyChat, setShowAddyChat] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  const faqData: FAQItem[] = [
    {
      question: "How do I apply for a rental property?",
      answer:
        "You can apply for rental properties through our platform by creating an account, completing your profile, and submitting applications directly to properties you're interested in. Our streamlined process makes it easy to apply to multiple properties with one profile.",
    },
    {
      question: "What documents do I need to rent an apartment?",
      answer:
        "Typically, you'll need a valid ID, proof of income (pay stubs, bank statements, or employment letter), credit report, rental history, and references. Some properties may require additional documentation like pet records or insurance information.",
    },
    {
      question: "How much should I budget for rent?",
      answer:
        "A general rule is to spend no more than 30% of your gross monthly income on rent. However, this can vary based on your location, lifestyle, and other financial obligations. Our platform helps you find properties within your budget range.",
    },
    {
      question: "Can I negotiate rent prices?",
      answer:
        "In some cases, yes! Rent negotiation is more common in certain markets or during slower rental periods. Factors like your credit score, rental history, and lease length can influence negotiation success. Our agents can help you understand local market conditions.",
    },
    {
      question: "What's included in my rent?",
      answer:
        "This varies by property. Some include utilities, parking, or amenities, while others don't. Always check the lease agreement carefully. Our property listings clearly indicate what's included, and our team can help clarify any questions.",
    },
    {
      question: "How long does the rental application process take?",
      answer:
        "Typically, rental applications are processed within 1-3 business days, though this can vary by property and landlord. Our platform streamlines the process by pre-verifying your information, which can speed up approval times.",
    },
    {
      question: "What if I have pets?",
      answer:
        "Many properties are pet-friendly! Our search filters help you find pet-friendly rentals. Be prepared for pet deposits, monthly pet rent, or breed restrictions. We can help you understand each property's specific pet policies.",
    },
    {
      question: "Can I break my lease early?",
      answer:
        "Lease terms vary by property and state laws. Some leases allow early termination with notice and fees, while others may require finding a replacement tenant. Our team can help you understand your specific lease terms and options.",
    },
  ];

  const INITIAL_PROPERTY_COUNT = 3;

  useEffect(() => {
    const loadProperties = async () => {
      try {
        setPropertiesLoading(true);

        // First try to load from properties collection
        let querySnapshot;
        let collectionName = "properties";

        try {
          // First try to load from properties collection
          const propertiesQuery = query(
            collection(db, "properties"),
            limit(20)
          );
          querySnapshot = await getDocs(propertiesQuery);

          if (querySnapshot.empty) {
            throw new Error("No properties found");
          }

          // Filter available properties in memory
          const availableProperties = querySnapshot.docs.filter((doc) => {
            const data = doc.data();
            return data.is_available === true;
          });

          if (availableProperties.length === 0) {
            throw new Error("No available properties found");
          }

          // Create a new query snapshot with only available properties
          querySnapshot = {
            docs: availableProperties,
            empty: false,
            size: availableProperties.length,
            forEach: (callback: (doc: any) => void) =>
              availableProperties.forEach(callback),
            docChanges: () => [],
            isEqual: () => false,
            metadata: { fromCache: false, hasPendingWrites: false },
          } as any;
        } catch {
          console.log("No properties found, trying listings collection...");
          // Fallback to listings collection
          const listingsQuery = query(collection(db, "listings"), limit(20));
          querySnapshot = await getDocs(listingsQuery);

          // Filter available listings in memory
          const availableListings = querySnapshot.docs.filter((doc) => {
            const data = doc.data();
            return data.available === true;
          });

          if (availableListings.length > 0) {
            querySnapshot = {
              docs: availableListings,
              empty: false,
              size: availableListings.length,
              forEach: (callback: (doc: any) => void) =>
                availableListings.forEach(callback),
              docChanges: () => [],
              isEqual: () => false,
              metadata: { fromCache: false, hasPendingWrites: false },
            } as any;
            collectionName = "listings";
          } else {
            throw new Error("No available properties found");
          }
        }

        if (querySnapshot.empty) {
          console.log("No properties found in Firebase");
          setProperties([]);
          setFilteredProperties([]);
          setLoading(false);
          setPropertiesLoading(false);
          return;
        }

        // Transform Firebase data to match expected format
        const transformedProperties = querySnapshot.docs.map(
          (doc: any, index: number) => {
            const prop = doc.data();

            // Handle different data structures from listings vs properties
            if (collectionName === "listings") {
              // Data from listings collection (migrated data)
              return {
                id: doc.id,
                title: prop.title || "Property",
                address: `123 ${(prop.title || "Property").replace(
                  /\s+/g,
                  ""
                )} St, City, State 00000`,
                city: "City",
                state: "State",
                rent: prop.rent || 1500,
                beds: prop.bedrooms || 1,
                baths: prop.bathrooms || 1,
                sqft: prop.sqft || 800,
                rating: 4.2 + (index % 10) * 0.1,
                available: prop.availableDate || "Available Now",
                image:
                  prop.images?.[0] ||
                  "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
                amenities: prop.amenities || ["Pool", "Gym", "Pet Friendly"],
                description:
                  prop.description || "Beautiful property in great location",
              };
            } else {
              // Data from properties collection (original format)
              return {
                id: doc.id,
                title: prop.title || prop.name || "Property",
                address:
                  prop.address ||
                  `${prop.city || ""}, ${prop.state || ""} ${
                    prop.zip_code || ""
                  }`.trim(),
                city: prop.city || "City",
                state: prop.state || "State",
                rent: prop.rent_amount || 1500,
                beds: prop.bedrooms || 1,
                baths: prop.bathrooms || 1,
                sqft: prop.sqft || 800,
                rating: prop.rating || 4.2 + (index % 10) * 0.1,
                available: prop.available_date || "Available Now",
                image:
                  prop.image ||
                  "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
                amenities: prop.amenities || ["Pool", "Gym", "Pet Friendly"],
                description:
                  prop.description || "Beautiful property in great location",
              };
            }
          }
        );

        console.log("Loaded properties from Firebase:", transformedProperties);
        setProperties(transformedProperties);
        setFilteredProperties(transformedProperties);
        setLoading(false);

        setPropertiesLoading(false);
      } catch (error) {
        console.error("Error loading properties from Firebase:", error);
        setProperties([]);
        setFilteredProperties([]);
        setLoading(false);

        setPropertiesLoading(false);
      }
    };

    loadProperties();
  }, []);

  const handleSearch = useCallback(
    (activeFilters: SearchFilters = filters) => {
    const filtered = properties.filter((property) => {
      const keyword = activeFilters.keyword?.toLowerCase() || "";

      const matchesKeyword =
        !keyword ||
        property.city.toLowerCase().includes(keyword) ||
        property.state.toLowerCase().includes(keyword) ||
        property.title.toLowerCase().includes(keyword) ||
          (property.description || "").toLowerCase().includes(keyword);

      const matchesRent =
          property.rent >= (activeFilters.minRent || 0) &&
          property.rent <= (activeFilters.maxRent || 10000);

        return matchesKeyword && matchesRent;
    });

    setFilteredProperties(filtered);
    setShowAllProperties(false); // Reset to show limited properties when new search is performed
    },
    [properties, filters]
  );

  useEffect(() => {
    handleSearch();
  }, [properties, handleSearch]);

  // Get properties to display based on showAllProperties state
  const propertiesToDisplay = showAllProperties
    ? filteredProperties
    : filteredProperties.slice(0, INITIAL_PROPERTY_COUNT);

  const hasMoreProperties = filteredProperties.length > INITIAL_PROPERTY_COUNT;

  if (loading || propertiesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-6"></div>
            <div
              className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
        </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Properties
          </h3>
          <p className="text-gray-600">
            Finding the best rental homes for you...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .testimonials-swiper {
            padding: 20px 0 60px 0;
          }
          .testimonials-swiper-pagination-bullet {
            width: 8px;
            height: 8px;
            background: #d1d5db;
            opacity: 1;
            margin: 0 4px;
            transition: all 0.3s ease;
          }
          .testimonials-swiper-pagination-bullet-active {
            background: #10b981;
            transform: scale(1.2);
          }
          .testimonials-swiper .swiper-pagination {
            bottom: 20px;
          }
          .testimonials-swiper-button-prev,
          .testimonials-swiper-button-next {
            width: 40px;
            height: 40px;
            margin-top: -20px;
          }
          @media (min-width: 640px) {
            .testimonials-swiper-pagination-bullet {
              width: 12px;
              height: 12px;
              margin: 0 6px;
            }
            .testimonials-swiper-button-prev,
            .testimonials-swiper-button-next {
              width: 48px;
              height: 48px;
              margin-top: -24px;
            }
          }
          .testimonials-swiper-button-prev:after,
          .testimonials-swiper-button-next:after {
            display: none;
          }
        `
      }} />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Hero Section */}

        <div className="relative min-h-[60vh] sm:min-h-[70vh] overflow-hidden">
          <img
            src={heroImage}
            alt="Beautiful apartment buildings"
            className="w-full h-full object-cover absolute inset-0"
          />
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Green line at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600"></div>
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
              {/* Hero Content */}
              <div className="relative z-10 flex flex-col items-center text-center px-4 py-8 sm:py-12 lg:py-16 pb-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white leading-tight">
                Forget everything you know about
                  <span className="block text-green-600 my-1"> Renting</span>
                </h1>
                {/* <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
                Forget everything you know about renting
                </p> */}

                {/* <div className="mb-8">
              <h1 className="text-white mb-8" style={{ fontSize: "64px", fontWeight: "bold", lineHeight: "1.1" }}>
                Forget everything you know about Renting
              </h1>
            </div> */}
                    </div>
            </motion.div>
                  </div>

          <div className="relative z-20">
            <div className="max-w-4xl mx-auto px-3 sm:px-4">
              {!showAddyChat ? (
                <>
                  <AddySearchBox
                    onStartConversation={(q) => {
                      setChatQuery(q);
                      setShowAddyChat(true);
                    }}
                  />
                 <div className="mb-8 sm:mb-12 lg:mb-16 mt-4 sm:mt-6 text-center">
                  <Button
                      variant="ghost"
                      onClick={() => navigate("/property")}
                      className="text-white hover:text-green-600 text-sm sm:text-base hover:underline font-normal px-4 sm:px-6 py-2 rounded-lg"
                    >
                      <span className="hidden sm:inline">Skip questions - Browse properties directly</span>
                      <span className="sm:hidden">Browse Properties</span>
                  </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                    <AddyChat
                      initialSearch={chatQuery}
                      onComplete={(filters) => {
                        localStorage.setItem(
                          "housingFilters",
                          JSON.stringify(filters)
                        );
                        navigate("/property");
                      }}
                    />
                  </div>
                  <div className="mb-8 sm:mb-12 lg:mb-16 mt-4 sm:mt-6 text-center">
                  <Button
                      variant="ghost"
                      onClick={() => navigate("/property")}
                      className="text-white text-sm sm:text-base font-normal hover:underline px-4 sm:px-6 py-2 rounded-lg"
                  >
                      <span className="hidden sm:inline">Skip remaining questions - Browse properties now</span>
                      <span className="sm:hidden">Browse Properties</span>
                  </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chat Board Section - Separate from hero */}
        {/* <div className="relative -mt-20 z-20">
          <div className="max-w-4xl mx-auto px-4">
            {!showAddyChat ? (
              <>
                <AddySearchBox onStartConversation={(q) => { setChatQuery(q); setShowAddyChat(true); }} />
                <div className="mt-6 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/property')}
                    className="text-gray-600 hover:text-green-600 text-sm underline bg-white/90 backdrop-blur-sm px-6 py-2 rounded-lg"
                  >
                    Skip questions - Browse properties directly
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                  <AddyChat initialSearch={chatQuery} onComplete={(filters) => {
                    localStorage.setItem('housingFilters', JSON.stringify(filters));
                    navigate('/property');
                  }} />
                </div>
                <div className="mt-6 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/property')}
                    className="text-gray-600 hover:text-green-600 text-sm underline bg-white/90 backdrop-blur-sm px-6 py-2 rounded-lg"
                  >
                    Skip remaining questions - Browse properties now
                  </Button>
                </div>
              </>
            )}
          </div>
        </div> */}

        {/* Search and Results */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Results Header */}
          <div className="flex items-center flex-col gap-2 mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center">
                Featured Properties
              </h2>
              <div className="text-gray-600 text-lg sm:text-xl text-center max-w-2xl">
                Discover amazing places to call home
            </div>
          </div>

          {/* Property Grid */}
          {filteredProperties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {propertiesToDisplay.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    index={index}
                  />
                ))}
              </div>

              {/* Show More / Show Less Button */}
              {hasMoreProperties && (
                <div className="flex justify-center mt-8 sm:mt-12">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate("/property")}
                    className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg sm:rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Browse More Properties</span>
                    <span className="sm:hidden">Browse More</span>
                  </motion.button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12 sm:py-16"
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12 max-w-md mx-auto">
                <div className="bg-gray-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Search className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-gray-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  No Properties Found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6 sm:mb-8 text-sm sm:text-base">
                  Try adjusting your search filters to find more rental
                  properties.
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    setFilters({
                      city: "",
                      minRent: 0,
                      maxRent: 10000,
                    });
                    handleSearch();
                  }}
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Reset Filters
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Services Section */}
        </div>

        {/* How It Works Section */}
       

        {/* Features Section */}
        <div className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                We make finding your perfect rental home simple, fast, and
                stress-free
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <HomeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Smart Matching
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Our AI-powered system matches you with properties that fit
                  your budget, lifestyle, and preferences perfectly.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Expert Support
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Get personalized assistance from our team of rental experts
                  who understand your local market.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-center p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 sm:col-span-2 lg:col-span-1"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  Secure & Safe
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Your data is protected with bank-level security. Apply safely
                  and securely to multiple properties.
                </p>
              </motion.div>
            </div>
                  </div>
                </div>

       
        {/* FAQ Section */}
        <FAQSection
          faqData={faqData}
          onBrowseProperties={() => navigate("/property")}
          onContactSupport={() => setIsContactModalOpen(true)}
        />
        {/* Testimonials Section */}
        <div className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                What Our Renters Say
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                Real stories from real people who found their perfect home
              </p>
              </motion.div>

            <div className="relative">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                navigation={{
                  nextEl: '.testimonials-swiper-button-next',
                  prevEl: '.testimonials-swiper-button-prev',
                }}
                pagination={{
                  clickable: true,
                  bulletClass: 'testimonials-swiper-pagination-bullet',
                  bulletActiveClass: 'testimonials-swiper-pagination-bullet-active',
                }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  640: {
                    slidesPerView: 1,
                    spaceBetween: 20,
                  },
                  768: {
                    slidesPerView: 2,
                    spaceBetween: 30,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                  },
                }}
                className="testimonials-swiper"
              >
                {testimonialsData.map((testimonial, index) => (
                  <SwiperSlide key={testimonial.id}>
                    <TestimonialCard 
                      testimonial={testimonial} 
                      index={index} 
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom Navigation Buttons */}
              <button className="testimonials-swiper-button-prev absolute left-0 sm:-left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-green-500 group hidden sm:flex">
                <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600 group-hover:text-green-600" />
              </button>
              <button className="testimonials-swiper-button-next absolute right-0 sm:-right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-green-500 group hidden sm:flex">
                <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-gray-600 group-hover:text-green-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <Footer />
      </div>
      {currentView === "application-process" && (
        <ApplicationProcess
          isOpen={true}
          onClose={() => setCurrentView("unit-selection")}
          type="prequalify"
          initialStep={applicationStep}
          onNavigateToUnitSelection={() => setCurrentView("unit-selection")}
        />
      )}

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </>
  );
}
