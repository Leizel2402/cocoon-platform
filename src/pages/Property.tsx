import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPropertyAddress } from '../lib/utils';
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
import { Properties, Listing } from '../types';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PropertyMap } from '../components/maps';

export function Property() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<Properties[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [minRent, setMinRent] = useState<number | ''>('');
  const [maxRent, setMaxRent] = useState<number | ''>('');
  const [beds, setBeds] = useState<number | ''>('');
  const [baths, setBaths] = useState<number | ''>('');
  const [homeType, setHomeType] = useState<string>('any');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  // Map states
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 34.052235, lng: -118.243683 });
  const [mapZoom, setMapZoom] = useState(10);

  // Initialize search from URL params
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [searchParams]);

  const loadPropertiesAndListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const propertiesRef = collection(db, 'properties');
      const propertiesSnapshot = await getDocs(propertiesRef);
      const fetchedProperties: Property[] = propertiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
      setProperties(fetchedProperties);

      const allListings: Listing[] = [];
      for (const property of fetchedProperties) {
        const unitsRef = collection(db, `properties/${property.id}/units`);
        const unitsSnapshot = await getDocs(unitsRef);
        for (const unitDoc of unitsSnapshot.docs) {
          const listingsRef = collection(db, `properties/${property.id}/units/${unitDoc.id}/listings`);
          const listingsSnapshot = await getDocs(listingsRef);
          listingsSnapshot.docs.forEach(listingDoc => {
            allListings.push({
              id: listingDoc.id,
              propertyId: property.id,
              unitId: unitDoc.id,
              ...listingDoc.data()
            } as Listing);
          });
        }
      }
      setListings(allListings);

    } catch (err) {
      console.error('Error loading properties and listings:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPropertiesAndListings();
  }, []);

  const filteredListings = listings.filter(listing => {
    const property = properties.find(p => p.id === listing.propertyId);
    if (!property) return false;

    const matchesSearchTerm =
      searchTerm === '' ||
      property.address.line1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMinRent = minRent === '' || (listing.rent && listing.rent >= minRent);
    const matchesMaxRent = maxRent === '' || (listing.rent && listing.rent <= maxRent);
    const matchesBeds = beds === '' || (listing.bedrooms && listing.bedrooms >= beds);
    const matchesBaths = baths === '' || (listing.bathrooms && listing.bathrooms >= baths);
    const matchesHomeType = homeType === 'any' || (property.type && property.type.toLowerCase() === homeType);

    return matchesSearchTerm && matchesMinRent && matchesMaxRent && matchesBeds && matchesBaths && matchesHomeType;
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return (a.rent || 0) - (b.rent || 0);
    if (sortBy === 'price_desc') return (b.rent || 0) - (a.rent || 0);
    return 0;
  });

  const totalAvailableProperties = filteredListings.length;
  const averageRent = totalAvailableProperties > 0
    ? (filteredListings.reduce((sum, listing) => sum + (listing.rent || 0), 0) / totalAvailableProperties).toFixed(2)
    : '0.00';
  const uniqueCities = new Set(properties.map(p => p.address.city)).size;
  const verifiedProperties = properties.filter(p => p.isVerified).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-500 bg-gray-50">
        <p>{error}</p>
        <button onClick={loadPropertiesAndListings} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Retry</button>
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
                placeholder="Search by location, address, or property name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filters Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors lg:w-auto w-full"
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </motion.button>

            {/* Save Search Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition-colors lg:w-auto w-full"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Search
            </motion.button>
          </div>

          {/* Collapsible Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min Rent"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={minRent}
                    onChange={(e) => setMinRent(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                  <input
                    type="number"
                    placeholder="Max Rent"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={maxRent}
                    onChange={(e) => setMaxRent(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={beds}
                  onChange={(e) => setBeds(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>

              {/* Bathrooms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={baths}
                  onChange={(e) => setBaths(e.target.value === '' ? '' : Number(e.target.value))}
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>

              {/* Home Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Home Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={homeType}
                  onChange={(e) => setHomeType(e.target.value)}
                >
                  <option value="any">Any</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest Listings</option>
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSearchTerm('');
                    setMinRent('');
                    setMaxRent('');
                    setBeds('');
                    setBaths('');
                    setHomeType('any');
                    setSortBy('relevance');
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-sm hover:bg-gray-300 transition-colors"
                >
                  <X className="h-5 w-5 mr-2" />
                  Clear Filters
                </motion.button>
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
                  <h2 className="text-xl font-bold text-gray-800">
                    {filteredListings.length} Results
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <SortAsc className="h-4 w-4" />
                    <span>Sorted by {sortBy.replace('_', ' ').replace('asc', '(Low to High)').replace('desc', '(High to Low)')}</span>
                  </div>
                </div>
              </div>

              {/* Property List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredListings.map(listing => {
                  const property = properties.find(p => p.id === listing.propertyId);
                  if (!property) return null;
                  return (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                    >
                      <div className="relative h-48 w-full">
                        <img
                          src={listing.images?.[0] || 'https://via.placeholder.com/400x250?text=No+Image'}
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md">
                          <Heart className="h-5 w-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900">${listing.rent}/month</h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                          {property.address.line1}, {property.address.city}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-700 mt-2">
                          <span className="flex items-center"><Bed className="h-4 w-4 mr-1" /> {listing.bedrooms} Beds</span>
                          <span className="flex items-center"><Bath className="h-4 w-4 mr-1" /> {listing.bathrooms} Baths</span>
                          <span className="flex items-center"><Square className="h-4 w-4 mr-1" /> {listing.squareFeet} sqft</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{listing.description}</p>
                        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Selected Listing Details Sidebar */}
        {viewMode === 'map' && selectedListing && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="w-1/2 bg-white border-l border-gray-200 shadow-lg overflow-y-auto p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
              <button onClick={() => setSelectedListing(null)} className="p-2 rounded-full hover:bg-gray-100">
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            {/* Render detailed info for selectedListing */}
            {selectedListing && (
              <div>
                <img
                  src={selectedListing.images?.[0] || 'https://via.placeholder.com/600x400?text=No+Image'}
                  alt="Property"
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">${selectedListing.rent}/month</h3>
                <p className="text-lg text-gray-700 flex items-center mb-4">
                  <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                  {(() => {
                    const property = properties.find(p => p.id === selectedListing.propertyId);
                    if (!property) return 'Address not available';
                    return typeof property.address === 'string' 
                      ? property.address
                      : formatPropertyAddress(property.address);
                  })()}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-700">
                    <Bed className="h-5 w-5 mr-2" /> {selectedListing.bedrooms} Beds
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Bath className="h-5 w-5 mr-2" /> {selectedListing.bathrooms} Baths
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Square className="h-5 w-5 mr-2" /> {selectedListing.squareFeet} sqft
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-2" /> Built {properties.find(p => p.id === selectedListing.propertyId)?.yearBuilt}
                  </div>
                </div>
                <p className="text-gray-800 mb-6">{selectedListing.description}</p>
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                  >
                    <Calendar className="h-5 w-5 mr-2" /> Schedule Tour
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition-colors"
                  >
                    <Heart className="h-5 w-5 mr-2" /> Save Favorite
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
