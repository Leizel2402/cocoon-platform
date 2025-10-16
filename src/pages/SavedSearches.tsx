import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Bell,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  getSavedSearches, 
  deleteSavedSearch, 
  toggleSearchSubscriptions,
  SavedSearch 
} from '../services/savedSearchService';
import { useNavigate } from 'react-router-dom';

export function SavedSearches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive'>('all');
  const [saving, setSaving] = useState(false);
  const [editingSearch, setEditingSearch] = useState<string | null>(null);
  const [editSearchName, setEditSearchName] = useState('');

  // Load saved searches from Firebase
  useEffect(() => {
    const loadSavedSearches = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getSavedSearches(user.uid);
        
        if (result.success && result.searches) {
          setSavedSearches(result.searches);
        } else {
          console.error('Error loading saved searches:', result.error);
          toast({
            title: "Error loading searches",
            description: result.error || "Failed to load saved searches",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading saved searches:', error);
        toast({
          title: "Error loading searches",
          description: "Failed to load saved searches",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSavedSearches();
  }, [user?.uid, toast]);

  const filteredSearches = savedSearches.filter(search => {
    const matchesSearch = search.searchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         search.searchLocation.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'active') {
      return matchesSearch && search.subscriptionsEnabled;
    } else if (filterType === 'inactive') {
      return matchesSearch && !search.subscriptionsEnabled;
    }
    
    return matchesSearch;
  });

  const handleDeleteSearch = async (searchId: string) => {
    try {
      setSaving(true);
      const result = await deleteSavedSearch(searchId);
      
      if (result.success) {
        setSavedSearches(prev => prev.filter(s => s.id !== searchId));
        toast({
          title: "Search deleted",
          description: "Search has been removed from your saved searches.",
          variant: "deleted"
        });
      } else {
        toast({
          title: "Error deleting search",
          description: result.error || "Failed to delete search",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting search:', error);
      toast({
        title: "Error deleting search",
        description: "Failed to delete search",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSubscriptions = async (searchId: string, enabled: boolean) => {
    try {
      setSaving(true);
      const result = await toggleSearchSubscriptions(searchId, enabled);
      
      if (result.success) {
        setSavedSearches(prev => prev.map(s => 
          s.id === searchId ? { ...s, subscriptionsEnabled: enabled } : s
        ));
        toast({
          title: enabled ? "Notifications enabled" : "Notifications disabled",
          description: enabled 
            ? "You'll receive email notifications for new matches"
            : "Email notifications have been turned off",
        });
      } else {
        toast({
          title: "Error updating notifications",
          description: result.error || "Failed to update notifications",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error toggling subscriptions:', error);
      toast({
        title: "Error updating notifications",
        description: "Failed to update notifications",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditSearch = (search: SavedSearch) => {
    setEditingSearch(search.id);
    setEditSearchName(search.searchName);
  };

  const handleSaveEdit = async (searchId: string) => {
    if (!editSearchName.trim()) {
      toast({
        title: "Search name required",
        description: "Please enter a name for your search",
        variant: "destructive"
      });
      return;
    }

    try {
      setSaving(true);
      // Here you would call updateSavedSearch service
      // For now, just update the local state
      setSavedSearches(prev => prev.map(s => 
        s.id === searchId ? { ...s, searchName: editSearchName.trim() } : s
      ));
      setEditingSearch(null);
      setEditSearchName('');
      toast({
        title: "Search updated",
        description: "Search name has been updated",
      });
    } catch (error) {
      console.error('Error updating search:', error);
      toast({
        title: "Error updating search",
        description: "Failed to update search",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRunSearch = (search: SavedSearch) => {
    // Navigate to property page with search parameters
    const params = new URLSearchParams();
    if (search.searchLocation) params.set('location', search.searchLocation);
    if (search.priceRange[0] !== 0 || search.priceRange[1] !== 10000) {
      params.set('minPrice', search.priceRange[0].toString());
      params.set('maxPrice', search.priceRange[1].toString());
    }
    if (search.selectedBeds.length > 0) params.set('beds', search.selectedBeds.join(','));
    if (search.selectedBaths.length > 0) params.set('baths', search.selectedBaths.join(','));
    if (search.selectedHomeTypes.length > 0) params.set('types', search.selectedHomeTypes.join(','));
    if (search.selectedAmenities.length > 0) params.set('amenities', search.selectedAmenities.join(','));
    if (search.selectedFeatures.length > 0) params.set('features', search.selectedFeatures.join(','));
    if (search.petPolicy) params.set('petPolicy', search.petPolicy);
    if (search.parkingType.length > 0) params.set('parking', search.parkingType.join(','));
    if (search.utilityPolicy.length > 0) params.set('utilities', search.utilityPolicy.join(','));
    if (search.squareFootage[0] !== 500 || search.squareFootage[1] !== 3000) {
      params.set('minSqft', search.squareFootage[0].toString());
      params.set('maxSqft', search.squareFootage[1].toString());
    }
    if (search.yearBuilt[0] !== 1980 || search.yearBuilt[1] !== 2024) {
      params.set('minYear', search.yearBuilt[0].toString());
      params.set('maxYear', search.yearBuilt[1].toString());
    }
    if (search.additionalSpecialties.length > 0) params.set('specialties', search.additionalSpecialties.join(','));
    if (search.laundryFacilities.length > 0) params.set('laundry', search.laundryFacilities.join(','));
    if (search.selectedRating) params.set('rating', search.selectedRating);
    if (search.propertyFeatures.length > 0) params.set('propertyFeatures', search.propertyFeatures.join(','));
    if (search.showOnlyRentWise) params.set('rentwise', 'true');
    if (search.moveInDate) params.set('moveInDate', search.moveInDate.toISOString());
    
    // Add filtered property IDs if available
    if (search.filteredPropertyIds.length > 0) {
      params.set('propertyIds', search.filteredPropertyIds.join(','));
    }
    
    navigate(`/property?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your saved searches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Saved searches
              </h1>
              <p className="text-gray-600 mt-2">
                {savedSearches.length} searches saved
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                New search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search saved searches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-200"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Searches' },
                { key: 'active', label: 'Active' },
                { key: 'inactive', label: 'Inactive' },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={filterType === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(filter.key as 'all' | 'active' | 'inactive')}
                  className={filterType === filter.key 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "border-gray-200 hover:bg-blue-50"
                  }
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Searches List */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        {filteredSearches.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchTerm ? 'No searches found' : 'No saved searches yet'}
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Start saving searches you like to see them here'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Search className="h-4 w-4 mr-2" />
                Start Searching
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSearches.map((search, index) => (
              <motion.div
                key={search.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {editingSearch === search.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            value={editSearchName}
                            onChange={(e) => setEditSearchName(e.target.value)}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(search.id)}
                            disabled={saving || !editSearchName.trim()}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingSearch(null);
                              setEditSearchName('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {search.searchName}
                          </h3>
                          {/* <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {search.searchLocation || 'Any location'}
                            </span>
                          </div> */}
                          <div className="text-sm text-gray-600">
                            For Rent: ${search.priceRange[0].toLocaleString()} - ${search.priceRange[1].toLocaleString()}/month
                          </div>
                          <div className="text-xs text-green-600 font-medium mt-1">
                            📊 {search.filteredPropertiesCount} properties found
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={search.subscriptionsEnabled ? "default" : "outline"}
                        className={search.subscriptionsEnabled 
                          ? "bg-green-100 text-green-700 border-green-200" 
                          : "bg-gray-100 text-gray-600 border-gray-200"
                        }
                      >
                        <Bell className="h-3 w-3 mr-1" />
                        Subscriptions are {search.subscriptionsEnabled ? 'ON' : 'OFF'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRunSearch(search)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Search className="h-4 w-4 mr-1" />
                        Run Search
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSearch(search)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        disabled={saving}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleSubscriptions(search.id, !search.subscriptionsEnabled)}
                        className={search.subscriptionsEnabled 
                          ? "text-orange-600 border-orange-200 hover:bg-orange-50" 
                          : "text-green-600 border-green-200 hover:bg-green-50"
                        }
                        disabled={saving}
                      >
                        <Bell className="h-4 w-4 mr-1" />
                        {search.subscriptionsEnabled ? 'Disable' : 'Enable'}
                      </Button> */}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteSearch(search.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
