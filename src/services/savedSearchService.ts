import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SavedSearch {
  id: string;
  userId: string;
  searchName: string;
  searchLocation: string;
  priceRange: [number, number];
  selectedBeds: string[];
  selectedBaths: string[];
  selectedHomeTypes: string[];
  selectedAmenities: string[];
  selectedFeatures: string[];
  petPolicy: string;
  parkingType: string[];
  utilityPolicy: string[];
  squareFootage: [number, number];
  yearBuilt: [number, number];
  additionalSpecialties: string[];
  laundryFacilities: string[];
  selectedRating: string;
  propertyFeatures: string[];
  showOnlyRentWise: boolean;
  moveInDate?: Date;
  subscriptionsEnabled: boolean;
  // Add filtered properties data
  filteredPropertiesCount: number;
  filteredPropertyIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SaveSearchResult {
  success: boolean;
  searchId?: string;
  error?: string;
}

export interface GetSavedSearchesResult {
  success: boolean;
  searches?: SavedSearch[];
  error?: string;
}

export interface DeleteSavedSearchResult {
  success: boolean;
  error?: string;
}

export interface UpdateSavedSearchResult {
  success: boolean;
  error?: string;
}

// Save a new search
export const saveSearch = async (
  userId: string,
  searchData: Omit<SavedSearch, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<SaveSearchResult> => {
  try {
    const searchDoc = {
      userId,
      searchName: searchData.searchName,
      searchLocation: searchData.searchLocation,
      priceRange: searchData.priceRange,
      selectedBeds: searchData.selectedBeds,
      selectedBaths: searchData.selectedBaths,
      selectedHomeTypes: searchData.selectedHomeTypes,
      selectedAmenities: searchData.selectedAmenities,
      selectedFeatures: searchData.selectedFeatures,
      petPolicy: searchData.petPolicy,
      parkingType: searchData.parkingType,
      utilityPolicy: searchData.utilityPolicy,
      squareFootage: searchData.squareFootage,
      yearBuilt: searchData.yearBuilt,
      additionalSpecialties: searchData.additionalSpecialties,
      laundryFacilities: searchData.laundryFacilities,
      selectedRating: searchData.selectedRating,
      propertyFeatures: searchData.propertyFeatures,
      showOnlyRentWise: searchData.showOnlyRentWise,
      moveInDate: searchData.moveInDate ? Timestamp.fromDate(searchData.moveInDate) : null,
      subscriptionsEnabled: searchData.subscriptionsEnabled,
      filteredPropertiesCount: searchData.filteredPropertiesCount,
      filteredPropertyIds: searchData.filteredPropertyIds,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'savedSearches'), searchDoc);
    
    return {
      success: true,
      searchId: docRef.id,
    };
  } catch (error) {
    console.error('Error saving search:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save search',
    };
  }
};

// Get all saved searches for a user
export const getSavedSearches = async (userId: string): Promise<GetSavedSearchesResult> => {
  try {
    const searchesQuery = query(
      collection(db, 'savedSearches'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(searchesQuery);
    const searches: SavedSearch[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
        searches.push({
          id: doc.id,
          userId: data.userId,
          searchName: data.searchName,
          searchLocation: data.searchLocation,
          priceRange: data.priceRange,
          selectedBeds: data.selectedBeds,
          selectedBaths: data.selectedBaths,
          selectedHomeTypes: data.selectedHomeTypes,
          selectedAmenities: data.selectedAmenities,
          selectedFeatures: data.selectedFeatures,
          petPolicy: data.petPolicy,
          parkingType: data.parkingType,
          utilityPolicy: data.utilityPolicy,
          squareFootage: data.squareFootage,
          yearBuilt: data.yearBuilt,
          additionalSpecialties: data.additionalSpecialties,
          laundryFacilities: data.laundryFacilities,
          selectedRating: data.selectedRating,
          propertyFeatures: data.propertyFeatures,
          showOnlyRentWise: data.showOnlyRentWise,
          moveInDate: data.moveInDate ? data.moveInDate.toDate() : undefined,
          subscriptionsEnabled: data.subscriptionsEnabled,
          filteredPropertiesCount: data.filteredPropertiesCount || 0,
          filteredPropertyIds: data.filteredPropertyIds || [],
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        });
    });
    
    return {
      success: true,
      searches,
    };
  } catch (error) {
    console.error('Error getting saved searches:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get saved searches',
    };
  }
};

// Delete a saved search
export const deleteSavedSearch = async (searchId: string): Promise<DeleteSavedSearchResult> => {
  try {
    await deleteDoc(doc(db, 'savedSearches', searchId));
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting saved search:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete saved search',
    };
  }
};

// Update a saved search
export const updateSavedSearch = async (
  searchId: string,
  updateData: Partial<Omit<SavedSearch, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<UpdateSavedSearchResult> => {
  try {
    const updateDocData: any = {
      ...updateData,
      updatedAt: Timestamp.now(),
    };

    // Convert Date to Timestamp if moveInDate is provided
    if (updateData.moveInDate) {
      updateDocData.moveInDate = Timestamp.fromDate(updateData.moveInDate);
    }

    await updateDoc(doc(db, 'savedSearches', searchId), updateDocData);
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating saved search:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update saved search',
    };
  }
};

// Toggle subscriptions for a saved search
export const toggleSearchSubscriptions = async (
  searchId: string,
  enabled: boolean
): Promise<UpdateSavedSearchResult> => {
  try {
    await updateDoc(doc(db, 'savedSearches', searchId), {
      subscriptionsEnabled: enabled,
      updatedAt: Timestamp.now(),
    });
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error toggling search subscriptions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle subscriptions',
    };
  }
};
