import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Home, Plus, Trash2 } from 'lucide-react';
import { Property, Unit } from '../../types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';

interface PropertyFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function PropertyForm({ onClose, onSuccess }: PropertyFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  
  // Property data
  const [propertyData, setPropertyData] = useState({
    name: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'US'
    },
    location: {
      lat: 0,
      lng: 0
    }
  });

  // Units data
  const [units, setUnits] = useState<Partial<Unit>[]>([
    {
      unitNumber: '',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 0,
      rent: 0,
      deposit: 0,
      available: true,
      amenities: [],
      images: [],
      description: ''
    }
  ]);

  const handlePropertyChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setPropertyData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setPropertyData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleUnitChange = (index: number, field: string, value: any) => {
    setUnits(prev => prev.map((unit, i) => 
      i === index ? { ...unit, [field]: value } : unit
    ));
  };

  const addUnit = () => {
    setUnits(prev => [...prev, {
      unitNumber: '',
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 0,
      rent: 0,
      deposit: 0,
      available: true,
      amenities: [],
      images: [],
      description: ''
    }]);
  };

  const removeUnit = (index: number) => {
    if (units.length > 1) {
      setUnits(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!user?.landlordId) {
      setError('User not authorized');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create property
      const propertyRef = await addDoc(collection(db, 'properties'), {
        ...propertyData,
        landlordId: user.landlordId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create units
      for (const unitData of units) {
        const unitRef = await addDoc(collection(db, 'units'), {
          ...unitData,
          propertyId: propertyRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Create listing for each unit
        await addDoc(collection(db, 'listings'), {
          propertyId: propertyRef.id,
          unitId: unitRef.id,
          title: `${propertyData.name} - Unit ${unitData.unitNumber}`,
          description: unitData.description || '',
          rent: unitData.rent || 0,
          deposit: unitData.deposit || 0,
          bedrooms: unitData.bedrooms || 1,
          bathrooms: unitData.bathrooms || 1,
          squareFeet: unitData.squareFeet || 0,
          images: unitData.images || [],
          amenities: unitData.amenities || [],
          available: unitData.available || true,
          availableDate: unitData.available ? new Date() : null,
          publishedAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating property:', error);
      setError('Failed to create property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const amenities = [
    'Air Conditioning', 'Heating', 'Parking', 'Pet Friendly', 'Gym', 'Pool',
    'Laundry', 'Balcony', 'Dishwasher', 'Hardwood Floors', 'Carpet',
    'Walk-in Closet', 'Fireplace', 'Garden', 'Rooftop Access'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Property</h2>
              <p className="text-sm text-gray-600">Step {step} of 2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              step >= 2 ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium mb-6">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Name *
                </label>
                <input
                  type="text"
                  value={propertyData.name}
                  onChange={(e) => handlePropertyChange('name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Sunset Apartments"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={propertyData.address.line1}
                    onChange={(e) => handlePropertyChange('address.line1', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={propertyData.address.line2}
                    onChange={(e) => handlePropertyChange('address.line2', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Apt 4B (optional)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={propertyData.address.city}
                    onChange={(e) => handlePropertyChange('address.city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="San Francisco"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State/Region *
                  </label>
                  <input
                    type="text"
                    value={propertyData.address.region}
                    onChange={(e) => handlePropertyChange('address.region', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={propertyData.address.postalCode}
                    onChange={(e) => handlePropertyChange('address.postalCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="94102"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Units ({units.length})</h3>
                <button
                  onClick={addUnit}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Unit
                </button>
              </div>

              {units.map((unit, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Unit {index + 1}</h4>
                    {units.length > 1 && (
                      <button
                        onClick={() => removeUnit(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Number *
                      </label>
                      <input
                        type="text"
                        value={unit.unitNumber || ''}
                        onChange={(e) => handleUnitChange(index, 'unitNumber', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="101"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bedrooms *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={unit.bedrooms || 1}
                        onChange={(e) => handleUnitChange(index, 'bedrooms', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bathrooms *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={unit.bathrooms || 1}
                        onChange={(e) => handleUnitChange(index, 'bathrooms', parseFloat(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Square Feet *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={unit.squareFeet || 0}
                        onChange={(e) => handleUnitChange(index, 'squareFeet', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Rent *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={unit.rent || 0}
                        onChange={(e) => handleUnitChange(index, 'rent', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="2500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Security Deposit
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={unit.deposit || 0}
                        onChange={(e) => handleUnitChange(index, 'deposit', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="2500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={unit.description || ''}
                      onChange={(e) => handleUnitChange(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe this unit..."
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {amenities.map((amenity) => (
                        <label key={amenity} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={unit.amenities?.includes(amenity) || false}
                            onChange={(e) => {
                              const currentAmenities = unit.amenities || [];
                              const newAmenities = e.target.checked
                                ? [...currentAmenities, amenity]
                                : currentAmenities.filter(a => a !== amenity);
                              handleUnitChange(index, 'amenities', newAmenities);
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Previous
              </button>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Property'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
