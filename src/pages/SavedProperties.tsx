import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  DollarSign, 
  Star,
  Trash2,
  Eye,
  Calendar,
  Filter,
  Search,
  X,
  Edit3,
  Save
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  getSavedProperties, 
  removeSavedProperty, 
  updateSavedPropertyNotes,
  SavedProperty 
} from '../services/savedPropertiesService';

// Using SavedProperty interface from savedPropertiesService

export function SavedProperties() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'favorites'>('all');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');

  // Load saved properties from Firebase
  useEffect(() => {
    const loadSavedProperties = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getSavedProperties(user.uid);
        
        if (result.success && result.properties) {
          setSavedProperties(result.properties);
        } else {
          console.error('Error loading saved properties:', result.error);
          toast({
            title: "Error loading properties",
            description: result.error || "Failed to load saved properties",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading saved properties:', error);
        toast({
          title: "Error loading properties",
          description: "Failed to load saved properties",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSavedProperties();
  }, [user?.uid, toast]);

  const filteredProperties = savedProperties.filter(property => {
    const matchesSearch = property.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return matchesSearch && property.savedAt >= oneWeekAgo;
    }
    
    return matchesSearch;
  });

  const handleRemoveProperty = async (savedPropertyId: string) => {
    try {
      const result = await removeSavedProperty(savedPropertyId);
      
      if (result.success) {
        setSavedProperties(prev => prev.filter(p => p.id !== savedPropertyId));
        toast({
          title: "Property removed",
          description: "Property has been removed from your saved list.",
        });
      } else {
        toast({
          title: "Error removing property",
          description: result.error || "Failed to remove property",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error removing property:', error);
      toast({
        title: "Error removing property",
        description: "Failed to remove property",
        variant: "destructive"
      });
    }
  };

  const handleViewProperty = (property: SavedProperty) => {
    // Navigate to property details
    toast({
      title: "Viewing property",
      description: `Opening details for ${property.propertyName}`,
    });
  };

  const handleEditNotes = (property: SavedProperty) => {
    setEditingNotes(property.id);
    setNotesText(property.notes || '');
  };

  const handleSaveNotes = async (savedPropertyId: string) => {
    try {
      const result = await updateSavedPropertyNotes(savedPropertyId, notesText);
      
      if (result.success) {
        setSavedProperties(prev => prev.map(p => 
          p.id === savedPropertyId 
            ? { ...p, notes: notesText }
            : p
        ));
        setEditingNotes(null);
        setNotesText('');
        toast({
          title: "Notes updated",
          description: "Your notes have been saved successfully.",
        });
      } else {
        toast({
          title: "Error updating notes",
          description: result.error || "Failed to update notes",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast({
        title: "Error updating notes",
        description: "Failed to update notes",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingNotes(null);
    setNotesText('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your saved properties...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Saved Properties
              </h1>
              <p className="text-gray-600 mt-2">
                {savedProperties.length} properties saved
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Heart className="h-4 w-4 mr-1" />
                {savedProperties.length} Saved
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search saved properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-200"
                />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Properties' },
                { key: 'recent', label: 'Recent' },
                { key: 'favorites', label: 'Favorites' }
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={filterType === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(filter.key as any)}
                  className={filterType === filter.key 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "border-gray-200 hover:bg-green-50"
                  }
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        {filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {searchTerm ? 'No properties found' : 'No saved properties yet'}
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Start saving properties you like to see them here'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => window.history.back()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Browse Properties
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Property Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={property.propertyImage}
                    alt={property.propertyName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white backdrop-blur-sm"
                      onClick={() => handleViewProperty(property)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-red-500/90 hover:bg-red-600 backdrop-blur-sm"
                      onClick={() => handleRemoveProperty(property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge className="bg-green-600 text-white">
                      <Heart className="h-3 w-3 mr-1" />
                      Saved
                    </Badge>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {property.propertyName}
                    </h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{property.propertyRating}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm line-clamp-1">{property.propertyAddress}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        <span>{property.propertyBeds}</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span>{property.propertyBaths}</span>
                      </div>
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        <span>{property.propertySqft.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-green-600">
                      {property.propertyPrice}
                    </div>
                  </div>

                  {/* Notes Section */}
                  <div className="mb-4">
                    {editingNotes === property.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                          placeholder="Add your notes about this property..."
                          className="text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveNotes(property.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {property.notes ? (
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-gray-700 italic flex-1">"{property.notes}"</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditNotes(property)}
                              className="ml-2 text-gray-500 hover:text-gray-700"
                            >
                              <Edit3 className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 italic">No notes added</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditNotes(property)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Add Note
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Saved {property.savedAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                      onClick={() => handleViewProperty(property)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      Apply Now
                    </Button>
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
