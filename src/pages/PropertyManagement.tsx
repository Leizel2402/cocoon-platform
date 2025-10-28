import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Home, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { Property, Unit, Listing } from '../types';
import { collection, query, where, getDocs, orderBy, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { PropertyForm } from '../components/forms';
import { Loader } from '../components/ui/Loader';

export function PropertyManagement() {
  const { user, isLandlord } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateProperty, setShowCreateProperty] = useState(false);

  useEffect(() => {
    if (!isLandlord()) {
      return;
    }
    loadProperties();
  }, [user, isLandlord]);

  const loadProperties = async () => {
    if (!user?.landlordId) return;
    
    try {
      setLoading(true);
              
      // Load properties
      const propertiesQuery = query(
        collection(db, 'properties'),
        where('landlordId', '==', user.landlordId),
        orderBy('createdAt', 'desc')
      );
      const propertiesSnapshot = await getDocs(propertiesQuery);
      const propertiesData = propertiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Property[];
      
      setProperties(propertiesData);

      // Load units for all properties
      const propertyIds = propertiesData.map(p => p.id);
      if (propertyIds.length > 0) {
        const unitsQuery = query(
          collection(db, 'units'),
          where('propertyId', 'in', propertyIds),
          orderBy('createdAt', 'desc')
        );
        const unitsSnapshot = await getDocs(unitsQuery);
        const unitsData = unitsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Unit[];
        
        setUnits(unitsData);

        // Load listings for all units
        const unitIds = unitsData.map(u => u.id);
        if (unitIds.length > 0) {
          const listingsQuery = query(
            collection(db, 'listings'),
            where('unitId', 'in', unitIds),
            orderBy('publishedAt', 'desc')
          );
          const listingsSnapshot = await getDocs(listingsQuery);
          const listingsData = listingsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            publishedAt: doc.data().publishedAt?.toDate() || new Date(),
            updatedAt: doc.data().updatedAt?.toDate(),
          })) as Listing[];
          
          setListings(listingsData);
        }
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLandlord()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">
            This page is only accessible to landlords and their employees.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <Loader 
        message="Loading Properties" 
        subMessage="Retrieving your property management data..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg shadow-lg mr-4">
                  <Home className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Property Management
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Manage your properties, units, and listings
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateProperty(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Property
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Home className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Properties</p>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <MapPin className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Units</p>
                <p className="text-2xl font-bold text-gray-900">
                  {units.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Eye className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Listings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {listings.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Rent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${units.length > 0 ? Math.round(units.reduce((sum, unit) => sum + unit.rent, 0) / units.length) : 0}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-white/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Filter className="h-5 w-5 mr-2" />
                Filter
              </button>
            </div>
          </div>
        </motion.div>

        {/* Properties List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20"
        >
          <div className="px-6 py-6 border-b border-gray-200/50">
            <h3 className="text-xl font-bold text-gray-900">
              Your Properties ({filteredProperties.length})
            </h3>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No properties found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first property.'}
              </p>
              {!searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateProperty(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center mx-auto"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Property
                </motion.button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredProperties.map((property) => {
                const propertyUnits = units.filter(unit => unit.propertyId === property.id);
                const propertyListings = listings.filter(listing => 
                  propertyUnits.some(unit => unit.id === listing.unitId)
                );
                
                return (
                  <div key={property.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 mr-3">
                            {property.name}
                          </h4>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {propertyUnits.length} units
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            {property.address.line1}, {property.address.city}, {property.address.region}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            <span>
                              ${propertyUnits.length > 0 ? Math.round(propertyUnits.reduce((sum, unit) => sum + unit.rent, 0) / propertyUnits.length) : 0}/mo avg
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{propertyListings.length} listings</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Added {property.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Property Form Modal */}
      {showCreateProperty && (
        <PropertyForm
          onClose={() => setShowCreateProperty(false)}
          onSuccess={() => {
            setShowCreateProperty(false);
            loadProperties();
          }}
        />
      )}
    </div>
  );
}
