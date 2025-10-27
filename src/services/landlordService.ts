import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface LandlordContactInfo {
  id: string;
  name: string;
  phone: string;
  email: string;
  country?: string;
}

export interface PropertyWithLandlordInfo {
  id: string;
  landlordId: string;
  userDetails: {
    name: string;
    phone: string;
    email: string;
  };
  [key: string]: unknown; // Allow other property fields
}

class LandlordService {
  private landlordsCollection = 'landlords';
  private propertiesCollection = 'properties';

  // Get landlord contact information by landlord ID
  async getLandlordContactInfo(landlordId: string): Promise<LandlordContactInfo | null> {
    try {
      // First try to get from landlords collection
      const landlordDoc = await getDoc(doc(db, this.landlordsCollection, landlordId));
      
      if (landlordDoc.exists()) {
        const data = landlordDoc.data();
        return {
          id: landlordDoc.id,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          country: data.country || 'US'
        };
      }

      // If not found in landlords collection, try to get from properties collection
      // as the landlord contact info might be stored in the property's userDetails
      const propertiesQuery = query(
        collection(db, this.propertiesCollection),
        where('landlordId', '==', landlordId)
      );
      
      const propertiesSnapshot = await getDocs(propertiesQuery);
      
      if (!propertiesSnapshot.empty) {
        const propertyData = propertiesSnapshot.docs[0].data() as PropertyWithLandlordInfo;
        
        if (propertyData.userDetails) {
          return {
            id: landlordId,
            name: propertyData.userDetails.name || '',
            phone: propertyData.userDetails.phone || '',
            email: propertyData.userDetails.email || '',
            country: 'US'
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching landlord contact info:', error);
      throw new Error('Failed to fetch landlord contact information');
    }
  }

  // Get landlord contact info from property data (if already available)
  getLandlordContactFromProperty(property: PropertyWithLandlordInfo): LandlordContactInfo | null {
    if (!property.userDetails) {
      return null;
    }

    return {
      id: property.landlordId,
      name: property.userDetails.name || '',
      phone: property.userDetails.phone || '',
      email: property.userDetails.email || '',
      country: 'US'
    };
  }

  // Get all landlords (for admin purposes)
  async getAllLandlords(): Promise<LandlordContactInfo[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.landlordsCollection));
      const landlords: LandlordContactInfo[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        landlords.push({
          id: doc.id,
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          country: data.country || 'US'
        });
      });
      
      return landlords;
    } catch (error) {
      console.error('Error fetching all landlords:', error);
      throw new Error('Failed to fetch landlords');
    }
  }
}

export const landlordService = new LandlordService();
