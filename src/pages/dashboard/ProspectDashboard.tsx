import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Bed, 
  Bath, 
  Square, 
  Star,
  Filter,


  
  Heart,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  User,
  MessageCircle,
  Home,
  TrendingUp,
  Award,
  Shield,
  Map,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Save,
  SortAsc,
  Filter as FilterIcon
} from 'lucide-react';
import { Property, Listing } from '../../types';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { PropertyMap } from '../../components/maps';

export function ProspectDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    minRent: '',
    maxRent: '',
    bedrooms: '',
    bathrooms: '',
    city: '',
    homeType: '',
    sortBy: 'relevance'
  });

  // Map state
  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [mapZoom, setMapZoom] = useState(10);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      
      // Load published listings
      const listingsQuery = query(
        collection(db, 'listings'),
        where('available', '==', true),
        orderBy('publishedAt', 'desc'),
        limit(50)
      );
      const listingsSnapshot = await getDocs(listingsQuery);
      const listingsData = listingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        publishedAt: doc.data().publishedAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Listing[];

      setListings(listingsData);

      // Load properties for these listings
      const propertyIds = [...new Set(listingsData.map(l => l.propertyId))];
      if (propertyIds.length > 0) {
        const propertiesQuery = query(
          collection(db, 'properties'),
          where('__name__', 'in', propertyIds)
        );
        const propertiesSnapshot = await getDocs(propertiesQuery);
        const propertiesData = propertiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Property[];

        setProperties(propertiesData);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter(listing => {
    const property = properties.find(p => p.id === listing.propertyId);
    if (!property) return false;

    const matchesSearch = 
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.region.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = 
      (!filters.minRent || listing.rent >= parseInt(filters.minRent)) &&
      (!filters.maxRent || listing.rent <= parseInt(filters.maxRent)) &&
      (!filters.bedrooms || listing.bedrooms >= parseInt(filters.bedrooms)) &&
      (!filters.bathrooms || listing.bathrooms >= parseInt(filters.bathrooms)) &&
      (!filters.city || property.address.city.toLowerCase().includes(filters.city.toLowerCase()));

    return matchesSearch && matchesFilters;
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minRent: '',
      maxRent: '',
      bedrooms: '',
      bathrooms: '',
      city: '',
      homeType: '',
      sortBy: 'relevance'
    });
  };

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mr-3">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Find Your Perfect Home</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Map className="h-4 w-4 mr-2" />
                Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Enter city, neighborhood, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filters.minRent}
                onChange={(e) => handleFilterChange('minRent', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Min Price</option>
                <option value="500">$500</option>
                <option value="1000">$1,000</option>
                <option value="1500">$1,500</option>
                <option value="2000">$2,000</option>
                <option value="2500">$2,500</option>
                <option value="3000">$3,000</option>
              </select>

              <select
                value={filters.maxRent}
                onChange={(e) => handleFilterChange('maxRent', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Max Price</option>
                <option value="1000">$1,000</option>
                <option value="1500">$1,500</option>
                <option value="2000">$2,000</option>
                <option value="2500">$2,500</option>
                <option value="3000">$3,000</option>
                <option value="4000">$4,000</option>
                <option value="5000">$5,000</option>
                <option value="6000">$6,000</option>
                <option value="7000">$7,000</option>
                <option value="8000">$8,000</option>
                <option value="9000">$9,000</option>
                <option value="10000">$10,000</option>
              </select>

              <select
                value={filters.bedrooms}
                onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Beds</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>

              <select
                value={filters.bathrooms}
                onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Baths</option>
                <option value="1">1+</option>
                <option value="1.5">1.5+</option>
                <option value="2">2+</option>
                <option value="2.5">2.5+</option>
                <option value="3">3+</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                More
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                <Save className="h-4 w-4 mr-2" />
                Save search
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Home Type</label>
                  <select
                    value={filters.homeType}
                    onChange={(e) => handleFilterChange('homeType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Any</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="relevance">Homes for You</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="sqft">Square Feet</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-12rem)]">
        {/* Map/List View */}
        <div className={`${viewMode === 'map' ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
          {viewMode === 'map' ? (
            <PropertyMap
              properties={properties}
              listings={filteredListings}
              selectedListing={selectedListing}
              onListingSelect={setSelectedListing}
              center={mapCenter}
              zoom={mapZoom}
              onCenterChange={setMapCenter}
              onZoomChange={setMapZoom}
            />
          ) : (
            <div className="h-full overflow-y-auto">
              {/* Results Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {filteredListings.length} results
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Sort:</span>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="px-3 py-1 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="relevance">Homes for You</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Property List */}
              <div className="divide-y divide-gray-200">
                {filteredListings.map((listing) => {
                  const property = properties.find(p => p.id === listing.propertyId);
                  if (!property) return null;

                  return (
                    <div
                      key={listing.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedListing(listing)}
                    >
                      <div className="flex gap-4">
                        {/* Property Image */}
                        <div className="w-32 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Home className="h-8 w-8 text-blue-400" />
                        </div>

                        {/* Property Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 truncate">
                                {property.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {property.address.line1}, {property.address.city}, {property.address.region}
                              </p>
                            </div>
                            <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                              <Heart className="h-5 w-5" />
                            </button>
                          </div>

                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Bed className="h-4 w-4 mr-1" />
                              <span>{listing.bedrooms}</span>
                            </div>
                            <div className="flex items-center">
                              <Bath className="h-4 w-4 mr-1" />
                              <span>{listing.bathrooms}</span>
                            </div>
                            <div className="flex items-center">
                              <Square className="h-4 w-4 mr-1" />
                              <span>{listing.squareFeet} sq ft</span>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-lg font-bold text-gray-900">
                              ${listing.rent.toLocaleString()}/mo
                            </span>
                            <div className="flex items-center text-green-600 text-sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span>Available</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredListings.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
                    <h3 className="text-lg font-medium text-yellow-800 mb-2">
                      No properties found
                    </h3>
                    <p className="text-yellow-700 text-sm">
                      Try adjusting your search criteria or zooming out to include more results.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Property Details Sidebar (Map View) */}
        {viewMode === 'map' && (
          <div className="w-1/2 border-l border-gray-200 bg-white overflow-y-auto">
            {selectedListing ? (
              <div className="p-6">
                {(() => {
                  const property = properties.find(p => p.id === selectedListing.propertyId);
                  if (!property) return null;

                  return (
                    <div>
                      {/* Property Image */}
                      <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <Home className="h-16 w-16 text-blue-400" />
                      </div>

                      {/* Property Details */}
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {property.name}
                          </h2>
                          <p className="text-gray-600">
                            {property.address.line1}, {property.address.city}, {property.address.region}
                          </p>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            <span>{selectedListing.bedrooms} beds</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            <span>{selectedListing.bathrooms} baths</span>
                          </div>
                          <div className="flex items-center">
                            <Square className="h-4 w-4 mr-1" />
                            <span>{selectedListing.squareFeet} sq ft</span>
                          </div>
                        </div>

                        <div className="text-3xl font-bold text-gray-900">
                          ${selectedListing.rent.toLocaleString()}
                          <span className="text-lg font-normal text-gray-600">/month</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                            Schedule Tour
                          </button>
                          <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <Heart className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                          <p className="text-gray-600 text-sm">
                            {selectedListing.description || 'Beautiful property in a great location. Contact us for more details.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Home className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a property
                </h3>
                <p className="text-gray-600">
                  Click on a property from the list to view details
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}