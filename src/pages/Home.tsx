import { useState, useEffect } from "react";
import { SearchFiltersComponent } from "../components/SearchFilters";
import { PropertyCard } from "../components/PropertyCard";
import { Property, SearchFilters } from "../types";
import { motion } from "framer-motion";
import {
  DollarSign,
  Home as HomeIcon,
  Key,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../layout/Footer";
import ApplicationProcess from "../Prospect/ApplicationProcess";
import { Button } from "../components/ui/Button";

export function Home() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [applicationStep, setApplicationStep] = useState<number | null>(null);
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
  >("dashboard");
  const [isPrequalified, setIsPrequalified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAllProperties, setShowAllProperties] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    city: "",
    minRent: 0,
    maxRent: 10000,
    beds: 0,
    baths: 0,
  });

  const INITIAL_PROPERTY_COUNT = 6;

  useEffect(() => {
    // Load properties from local JSON
    fetch("/data/properties.json")
      .then((response) => response.json())
      .then((data: Property[]) => {
        setProperties(data);
        setFilteredProperties(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading properties:", error);
        setLoading(false);
      });
  }, []);

  const handleSearch = (activeFilters: SearchFilters = filters) => {
    const filtered = properties.filter((property) => {
      const keyword = activeFilters.keyword?.toLowerCase() || "";

      const matchesKeyword =
        !keyword ||
        property.city.toLowerCase().includes(keyword) ||
        property.state.toLowerCase().includes(keyword) ||
        property.title.toLowerCase().includes(keyword) ||
        property.description.toLowerCase().includes(keyword);

      const matchesRent =
        property.rent >= activeFilters.minRent &&
        property.rent <= activeFilters.maxRent;

      const matchesBeds =
        activeFilters.beds === 0 || property.beds >= activeFilters.beds;
      const matchesBaths =
        activeFilters.baths === 0 || property.baths >= activeFilters.baths;

      return matchesKeyword && matchesRent && matchesBeds && matchesBaths;
    });

    setFilteredProperties(filtered);
    setShowAllProperties(false); // Reset to show limited properties when new search is performed
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to properties page with search query
      navigate(`/property?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [properties]);

  // Get properties to display based on showAllProperties state
  const propertiesToDisplay = showAllProperties
    ? filteredProperties
    : filteredProperties.slice(0, INITIAL_PROPERTY_COUNT);

  const hasMoreProperties = filteredProperties.length > INITIAL_PROPERTY_COUNT;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl inline-block mb-6">
                  <HomeIcon className="h-16 w-16 text-white" />
                </div>
                <h1 className="text-4xl sm:text-6xl font-bold mb-6">
                  Find Your Perfect
                  <span className="block text-yellow-400">Rental Home</span>
                </h1>
                <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
                Forget everything you know about renting
                </p>

                {/* Search Input */}
                {/* <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto mb-8">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-6 w-6 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter city, neighborhood, or address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 text-lg border-0 rounded-xl focus:ring-4 focus:ring-white/30 focus:outline-none bg-white/90 backdrop-blur-sm placeholder-gray-500"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Search
                    </button>
                  </div>
                </form> */}

                {/* <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setCurrentView("application-process");
                      setIsPrequalified(true);
                    }}
                    className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl text-black bg-white hover:bg-gray-100 transition-colors duration-200"
                  >
                    Get Prequalified
                  </Button>
                  <Button
                    onClick={() => navigate('/property')}
                    className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-xl text-white bg-transparent border-2 border-white hover:bg-white hover:text-blue-600 transition-colors duration-200"
                  >
                    <MapPin className="h-5 w-5 mr-2" />
                    Browse All Properties
                  </Button>
                </div> */}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Search and Results */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SearchFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
          />

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredProperties.length} Properties Found
                {!showAllProperties && hasMoreProperties && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    (Showing first {INITIAL_PROPERTY_COUNT})
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* Property Grid */}
          {filteredProperties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="flex justify-center mt-12">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setShowAllProperties(!showAllProperties)}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    {showAllProperties ? (
                      <>
                        Show Less
                        <ChevronUp className="ml-2 h-5 w-5" />
                      </>
                    ) : (
                      <>
                        Show More (
                        {filteredProperties.length - INITIAL_PROPERTY_COUNT}{" "}
                        more properties)
                        <ChevronDown className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No Properties Found
                </h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
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
                      beds: 0,
                      baths: 0,
                    });
                    handleSearch();
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Reset Filters
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Services Section */}
          <div className="mt-16 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
              {/* Buy a home */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className="mb-6">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    {/* Couple looking at house illustration */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 rounded-full"></div>
                    <div className="absolute bottom-4 left-8 w-12 h-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full"></div>
                    <div className="absolute bottom-4 right-8 w-10 h-6 bg-gradient-to-t from-orange-500 to-orange-300 rounded-full"></div>
                    {/* House */}
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-16 h-12 bg-gradient-to-b from-blue-500 to-blue-600 rounded-lg"></div>
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-6 border-l-transparent border-r-transparent border-b-red-500"></div>
                    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 -translate-x-2 w-3 h-4 bg-yellow-300 rounded-sm"></div>
                    {/* Hearts/love indicators */}
                    <div className="absolute top-2 right-6 w-3 h-3 bg-pink-400 rounded-full"></div>
                    <div className="absolute top-8 left-4 w-2 h-2 bg-pink-300 rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Buy a home
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  A real estate agent can provide you with a clear breakdown of
                  costs so that you can avoid surprise expenses.
                </p>
                <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200 font-medium">
                  Find a local agent
                </button>
              </motion.div>

           
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
    </>
  );
}
