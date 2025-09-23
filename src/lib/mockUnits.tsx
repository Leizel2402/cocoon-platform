// Mock units data that works with database properties
export const generateMockUnitsForProperty = (property: any) => {
  const baseRent = property?.rent_amount || 1500;
  const bedrooms = property?.bedrooms || 2;
  const bathrooms = property?.bathrooms || 2;
  
  // Generate 2-4 units per property
  const numUnits = Math.floor(Math.random() * 3) + 2;
  
  return Array.from({ length: numUnits }, (_, index) => {
    const unitNumber = `${Math.floor(Math.random() * 20) + 1}${String.fromCharCode(65 + index)}`;
    const floorVariation = Math.floor(Math.random() * 200) - 100; // +/- $100
    const rentVariation = baseRent + floorVariation;
    
    return {
      id: `${property.id}-unit-${index + 1}`,
      unitNumber,
      bedrooms: bedrooms + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0),
      bathrooms: bathrooms + (Math.random() > 0.8 ? 0.5 : 0),
      sqft: 800 + (bedrooms * 300) + Math.floor(Math.random() * 400),
      available: true,
      availableDate: property?.available_date || new Date().toISOString().split('T')[0],
      floorPlan: '/assets/1br-floorplan.png',
      rent: rentVariation,
      deposit: rentVariation,
      leaseTerms: [
        { months: 6, rent: Math.round(rentVariation * 1.15), popular: false },
        { months: 9, rent: Math.round(rentVariation * 1.08), popular: false },
        { months: 12, rent: rentVariation, popular: true },
        { months: 15, rent: Math.round(rentVariation * 0.95), popular: false },
        { months: 18, rent: Math.round(rentVariation * 0.92), popular: false }
      ],
      amenities: property?.amenities?.slice(0, 4) || ['In-Unit Laundry', 'Balcony', 'Parking', 'Pet Friendly'],
      images: ['/assets/property-1.jpg', '/assets/property-2.jpg'],
      qualified: true,
      qualifiedStatus: 'qualified' as const,
      parkingIncluded: true,
      petFriendly: property?.pet_friendly || false,
      furnished: false,
      floor: Math.floor(Math.random() * 5) + 1,
      view: ['City', 'Garden', 'Pool', 'Courtyard'][Math.floor(Math.random() * 4)]
    };
  });
};

export const generateMockComparisonUnits = (properties: any[]) => {
  // Select 2-3 properties for comparison
  const selectedProperties = properties.slice(0, Math.min(3, properties.length));
  
  return selectedProperties.map(property => {
    const units = generateMockUnitsForProperty(property);
    // Return the first unit for comparison
    return {
      property: {
        id: property.id,
        name: property.name || property.title,
        address: property.address,
        city: property.city,
        state: property.state,
        zip: property.zip_code,
        units,
        amenities: property.amenities || [],
        images: ['/assets/property-1.jpg', '/assets/property-2.jpg'],
        latitude: -97.7437 + (Math.random() - 0.5) * 0.1,
        longitude: 30.2672 + (Math.random() - 0.5) * 0.1,
        petPolicy: {
          allowed: property.pet_friendly || false,
          fee: 25,
          deposit: 300
        }
      },
      unit: units[0]
    };
  });
};