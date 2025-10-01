import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface SavedProperty {
  id: string;
  userId: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  propertyPrice: string;
  propertyBeds: number;
  propertyBaths: number;
  propertySqft: number;
  propertyRating: number;
  propertyImage: string;
  propertyType: string;
  propertyAmenities: string[];
  notes?: string;
  savedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SavePropertyData {
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  propertyPrice: string;
  propertyBeds: number;
  propertyBaths: number;
  propertySqft: number;
  propertyRating: number;
  propertyImage: string;
  propertyType: string;
  propertyAmenities: string[];
  notes?: string;
}

/**
 * Save a property to user's saved list
 */
export const saveProperty = async (
  userId: string, 
  propertyData: SavePropertyData
): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    // Check if property is already saved
    const existingQuery = query(
      collection(db, 'savedProperties'),
      where('userId', '==', userId),
      where('propertyId', '==', propertyData.propertyId)
    );
    
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      // Property is already saved, return the existing document ID
      return { 
        success: true, 
        id: existingSnapshot.docs[0].id 
      };
    }

    // Add new saved property
    const docRef = await addDoc(collection(db, 'savedProperties'), {
      userId,
      propertyId: propertyData.propertyId,
      propertyName: propertyData.propertyName,
      propertyAddress: propertyData.propertyAddress,
      propertyPrice: propertyData.propertyPrice,
      propertyBeds: propertyData.propertyBeds,
      propertyBaths: propertyData.propertyBaths,
      propertySqft: propertyData.propertySqft,
      propertyRating: propertyData.propertyRating,
      propertyImage: propertyData.propertyImage,
      propertyType: propertyData.propertyType,
      propertyAmenities: propertyData.propertyAmenities,
      notes: propertyData.notes || '',
      savedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('Property saved successfully with ID:', docRef.id);
    
    return { 
      success: true, 
      id: docRef.id 
    };
  } catch (error) {
    console.error('Error saving property:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Get all saved properties for a user
 */
export const getSavedProperties = async (
  userId: string
): Promise<{ success: boolean; properties?: SavedProperty[]; error?: string }> => {
  try {
    const q = query(
      collection(db, 'savedProperties'),
      where('userId', '==', userId),
      orderBy('savedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const properties: SavedProperty[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        propertyId: data.propertyId,
        propertyName: data.propertyName,
        propertyAddress: data.propertyAddress,
        propertyPrice: data.propertyPrice,
        propertyBeds: data.propertyBeds,
        propertyBaths: data.propertyBaths,
        propertySqft: data.propertySqft,
        propertyRating: data.propertyRating,
        propertyImage: data.propertyImage,
        propertyType: data.propertyType,
        propertyAmenities: data.propertyAmenities || [],
        notes: data.notes || '',
        savedAt: data.savedAt?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      };
    });

    console.log(`Retrieved ${properties.length} saved properties for user ${userId}`);
    
    return { 
      success: true, 
      properties 
    };
  } catch (error) {
    console.error('Error getting saved properties:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Remove a property from saved list
 */
export const removeSavedProperty = async (
  savedPropertyId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await deleteDoc(doc(db, 'savedProperties', savedPropertyId));
    
    return { success: true };
  } catch (error) {
    console.error('Error removing saved property:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Update notes for a saved property
 */
export const updateSavedPropertyNotes = async (
  savedPropertyId: string,
  notes: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await updateDoc(doc(db, 'savedProperties', savedPropertyId), {
      notes,
      updatedAt: serverTimestamp()
    });
    
    console.log('Saved property notes updated successfully:', savedPropertyId);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating saved property notes:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Check if a property is saved by user
 */
export const isPropertySaved = async (
  userId: string,
  propertyId: string
): Promise<{ success: boolean; isSaved?: boolean; savedPropertyId?: string; error?: string }> => {
  try {
    const q = query(
      collection(db, 'savedProperties'),
      where('userId', '==', userId),
      where('propertyId', '==', propertyId)
    );
    
    const querySnapshot = await getDocs(q);
    
    const isSaved = !querySnapshot.empty;
    const savedPropertyId = isSaved ? querySnapshot.docs[0].id : undefined;
    
    return { 
      success: true, 
      isSaved,
      savedPropertyId
    };
  } catch (error) {
    console.error('Error checking if property is saved:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Get saved property count for a user
 */
export const getSavedPropertyCount = async (
  userId: string
): Promise<{ success: boolean; count?: number; error?: string }> => {
  try {
    const q = query(
      collection(db, 'savedProperties'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    return { 
      success: true, 
      count: querySnapshot.size 
    };
  } catch (error) {
    console.error('Error getting saved property count:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};
