import { 
  collection, 
  doc, 
  query, 
  where, 
  getDocs, 
  getDoc,
  writeBatch,
  deleteDoc,
  updateDoc,
  QueryDocumentSnapshot,
  DocumentReference
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { notificationService } from './notificationService';

export interface PropertyDeletionResult {
  success: boolean;
  deletedCounts: {
    properties: number;
    units: number;
    listings: number;
    applications: number;
    maintenanceRequests: number;
    savedProperties: number;
    savedSearches: number;
    subscriptions: number;
  };
  affectedUsers: {
    applications: Array<{
      id: string;
      status: string;
      userId: string;
    }>;
    maintenanceRequests: Array<{
      id: string;
      userId: string;
    }>;
    subscriptions: Array<{
      id: string;
      userId: string;
      status: string;
    }>;
  };
  errors: string[];
}

class PropertyDeletionService {
  // Test function to check property data structure
  async testPropertyData(propertyId: string): Promise<void> {
    try {
      const propertyRef = doc(db, 'properties', propertyId);
      const propertyDocSnap = await getDoc(propertyRef);
      
      if (propertyDocSnap.exists()) {
        const propertyData = propertyDocSnap.data();
        console.log('Property data structure:', propertyData);
        console.log('Property fields:', Object.keys(propertyData));
      } else {
        console.log('Property not found');
      }
    } catch (error) {
      console.error('Error testing property data:', error);
    }
  }

  // Test function to check user permissions
  async testUserPermissions(userId: string): Promise<void> {
    try {
      console.log('Testing user permissions for:', userId);
      
      // Test reading from different collections
      const collections = ['properties', 'applications', 'maintenanceRequests', 'subscriptions', 'notifications'];
      
      for (const collectionName of collections) {
        try {
          const testQuery = query(collection(db, collectionName), where('__name__', '!=', ''));
          const snapshot = await getDocs(testQuery);
          console.log(`✅ Can read ${collectionName}: ${snapshot.docs.length} documents`);
        } catch (error) {
          console.log(`❌ Cannot read ${collectionName}:`, (error as Error).message);
        }
      }
    } catch (error) {
      console.error('Error testing user permissions:', error);
    }
  }

  // Test function to try deleting just the property document
  async testDeleteProperty(propertyId: string): Promise<void> {
    try {
      console.log('Testing simple property deletion...');
      const propertyRef = doc(db, 'properties', propertyId);
      await deleteDoc(propertyRef);
      console.log('Property deleted successfully!');
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  }

  // Fallback function to delete documents individually
  async fallbackIndividualDeletions(
    propertyId: string,
    applicationsDocs: QueryDocumentSnapshot[],
    maintenanceRequestsDocs: QueryDocumentSnapshot[],
    unitsDocs: QueryDocumentSnapshot[],
    listingsDocs: QueryDocumentSnapshot[],
    savedPropertiesDocs: QueryDocumentSnapshot[],
    savedSearchesDocs: QueryDocumentSnapshot[],
    subscriptionsDocs: QueryDocumentSnapshot[],
    propertyRef: DocumentReference
  ): Promise<void> {
    console.log('Starting individual deletions...');
    
    // Delete applications individually
    for (const doc of applicationsDocs) {
      try {
        await deleteDoc(doc.ref);
        console.log('Deleted application:', doc.id);
      } catch (error) {
        console.error('Failed to delete application:', doc.id, error);
      }
    }

    // Delete maintenance requests individually
    for (const doc of maintenanceRequestsDocs) {
      try {
        await deleteDoc(doc.ref);
        console.log('Deleted maintenance request:', doc.id);
      } catch (error) {
        console.error('Failed to delete maintenance request:', doc.id, error);
      }
    }

    // Delete units individually
    for (const doc of unitsDocs) {
      try {
        await deleteDoc(doc.ref);
        console.log('Deleted unit:', doc.id);
      } catch (error) {
        console.error('Failed to delete unit:', doc.id, error);
      }
    }

    // Delete listings individually
    for (const doc of listingsDocs) {
      try {
        await deleteDoc(doc.ref);
        console.log('Deleted listing:', doc.id);
      } catch (error) {
        console.error('Failed to delete listing:', doc.id, error);
      }
    }

    // Update saved properties individually
    for (const doc of savedPropertiesDocs) {
      try {
        const data = doc.data();
        const updatedPropertyIds = data.propertyIds.filter((id: string) => id !== propertyId);
        
        if (updatedPropertyIds.length === 0) {
          await deleteDoc(doc.ref);
          console.log('Deleted saved property:', doc.id);
        } else {
          await updateDoc(doc.ref, {
            propertyIds: updatedPropertyIds,
            updatedAt: new Date()
          });
          console.log('Updated saved property:', doc.id);
        }
      } catch (error) {
        console.error('Failed to update saved property:', doc.id, error);
      }
    }

    // Update saved searches individually
    for (const doc of savedSearchesDocs) {
      try {
        const data = doc.data();
        const updatedPropertyIds = data.propertyIds.filter((id: string) => id !== propertyId);
        
        if (updatedPropertyIds.length === 0) {
          await deleteDoc(doc.ref);
          console.log('Deleted saved search:', doc.id);
        } else {
          await updateDoc(doc.ref, {
            propertyIds: updatedPropertyIds,
            updatedAt: new Date()
          });
          console.log('Updated saved search:', doc.id);
        }
      } catch (error) {
        console.error('Failed to update saved search:', doc.id, error);
      }
    }

    // Delete subscriptions individually
    for (const doc of subscriptionsDocs) {
      try {
        await deleteDoc(doc.ref);
        console.log('Deleted subscription:', doc.id);
      } catch (error) {
        console.error('Failed to delete subscription:', doc.id, error);
      }
    }

    // Finally, delete the main property document
    try {
      await deleteDoc(propertyRef);
      console.log('Deleted main property document');
    } catch (error) {
      console.error('Failed to delete main property document:', error);
      throw error;
    }
  }

  // Delete a property and all associated data
  async deleteProperty(
    propertyId: string,
    propertyName: string,
    propertyAddress: string,
    landlordId: string
  ): Promise<PropertyDeletionResult> {
    console.log('Starting property deletion for:', { propertyId, propertyName, landlordId });
    const result: PropertyDeletionResult = {
      success: false,
      deletedCounts: {
        properties: 0,
        units: 0,
        listings: 0,
        applications: 0,
        maintenanceRequests: 0,
        savedProperties: 0,
        savedSearches: 0,
        subscriptions: 0
      },
      affectedUsers: {
        applications: [],
        maintenanceRequests: [],
        subscriptions: []
      },
      errors: []
    };

    try {
      // 0. Test property data structure and user permissions first
      await this.testPropertyData(propertyId);
      await this.testUserPermissions(landlordId);
      
      // 1. Verify property ownership
      const propertyRef = doc(db, 'properties', propertyId);
      const propertyDocSnap = await getDoc(propertyRef);
      
      if (!propertyDocSnap.exists()) {
        result.errors.push('Property not found');
        return result;
      }
      
      const propertyData = propertyDocSnap.data();
      console.log('Property data:', propertyData);
      console.log('Expected landlordId:', landlordId);
      console.log('Property landlordId:', propertyData.landlordId);
      
      if (propertyData.landlordId !== landlordId) {
        result.errors.push(`Unauthorized: Property does not belong to this landlord. Expected: ${landlordId}, Found: ${propertyData.landlordId}`);
        return result;
      }

      // Use batch operations for atomicity
      const batch = writeBatch(db);

      // 1. Get all affected data before deletion
      const [
        applicationsSnapshot,
        maintenanceRequestsSnapshot,
        unitsSnapshot,
        listingsSnapshot,
        savedPropertiesSnapshot,
        savedSearchesSnapshot,
        subscriptionsSnapshot
      ] = await Promise.all([
        // Get applications for this property - try multiple query approaches
        Promise.all([
          // Query by applicationMetadata.propertyId
          getDocs(query(
            collection(db, 'applications'),
            where('applicationMetadata.propertyId', '==', propertyId)
          )),
          // Query by direct propertyId field
          getDocs(query(
            collection(db, 'applications'),
            where('propertyId', '==', propertyId)
          )),
          // Query by listingId if property has listings
          getDocs(query(
            collection(db, 'applications'),
            where('listingId', '==', propertyId)
          )),
          // Fallback: Get all applications and filter manually (in case queries don't work)
          getDocs(collection(db, 'applications')).then(snapshot => {
            const filteredDocs = snapshot.docs.filter(doc => {
              const data = doc.data();
              return data.applicationMetadata?.propertyId === propertyId ||
                     data.propertyId === propertyId ||
                     data.listingId === propertyId ||
                     (data.applicationMetadata?.landlordId === landlordId && 
                      (data.applicationMetadata?.propertyName?.includes(propertyName) ||
                       data.propertyName?.includes(propertyName)));
            });
            return { docs: filteredDocs };
          })
        ]).then(results => {
          // Combine all results and remove duplicates
          const allDocs = [...results[0].docs, ...results[1].docs, ...results[2].docs, ...results[3].docs];
          const uniqueDocs = allDocs.filter((doc, index, self) => 
            index === self.findIndex(d => d.id === doc.id)
          );
          console.log(`Found ${uniqueDocs.length} applications for property ${propertyId}`);
          return { docs: uniqueDocs };
        }),
        // Get maintenance requests for this property (try both naming conventions)
        getDocs(query(
          collection(db, 'maintenanceRequests'),
          where('propertyId', '==', propertyId)
        )),
        // Get units for this property
        getDocs(query(
          collection(db, 'units'),
          where('propertyId', '==', propertyId)
        )),
        // Get listings for this property
        getDocs(query(
          collection(db, 'listings'),
          where('propertyId', '==', propertyId)
        )),
        // Get saved properties that include this property
        getDocs(query(
          collection(db, 'saved_properties'),
          where('propertyIds', 'array-contains', propertyId)
        )),
        // Get saved searches that might reference this property
        getDocs(query(
          collection(db, 'saved_searches'),
          where('propertyIds', 'array-contains', propertyId)
        )),
        // Get subscriptions for this property
        getDocs(query(
          collection(db, 'subscriptions'),
          where('propertyId', '==', propertyId)
        ))
      ]);

      // 2. Prepare affected users data for notifications
      result.affectedUsers.applications = applicationsSnapshot.docs.map(doc => {
        const data = doc.data();
        // Try multiple ways to get the user ID
        const userId = data.applicationMetadata?.submittedBy || 
                      data.submittedBy || 
                      data.prospectId || 
                      data.userId || 
                      doc.id;
        return {
          id: doc.id,
          status: data.status || 'pending',
          userId: userId
        };
      });

      result.affectedUsers.maintenanceRequests = maintenanceRequestsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.tenantId || data.userId || data.submittedBy || doc.id
        };
      });

      // Add subscriptions to affected users
      result.affectedUsers.subscriptions = subscriptionsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || data.subscriberId || doc.id,
          status: data.status || 'active'
        };
      });

      console.log('Found affected data:', {
        applications: result.affectedUsers.applications.length,
        maintenanceRequests: result.affectedUsers.maintenanceRequests.length,
        units: unitsSnapshot.docs.length,
        listings: listingsSnapshot.docs.length
      });

      // 3. Delete all associated data in batch
      
      // Delete applications
      applicationsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      result.deletedCounts.applications = applicationsSnapshot.docs.length;

      // Delete maintenance requests
      maintenanceRequestsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      result.deletedCounts.maintenanceRequests = maintenanceRequestsSnapshot.docs.length;

      // Delete units
      unitsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      result.deletedCounts.units = unitsSnapshot.docs.length;

      // Delete listings
      listingsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      result.deletedCounts.listings = listingsSnapshot.docs.length;

      // Update saved properties (remove property from arrays)
      savedPropertiesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const updatedPropertyIds = data.propertyIds.filter((id: string) => id !== propertyId);
        
        if (updatedPropertyIds.length === 0) {
          // If no properties left, delete the saved property entry
          batch.delete(doc.ref);
        } else {
          // Update the array to remove the deleted property
          batch.update(doc.ref, {
            propertyIds: updatedPropertyIds,
            updatedAt: new Date()
          });
        }
      });
      result.deletedCounts.savedProperties = savedPropertiesSnapshot.docs.length;

      // Update saved searches (remove property from arrays)
      savedSearchesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const updatedPropertyIds = data.propertyIds.filter((id: string) => id !== propertyId);
        
        if (updatedPropertyIds.length === 0) {
          // If no properties left, delete the saved search entry
          batch.delete(doc.ref);
        } else {
          // Update the array to remove the deleted property
          batch.update(doc.ref, {
            propertyIds: updatedPropertyIds,
            updatedAt: new Date()
          });
        }
      });
      result.deletedCounts.savedSearches = savedSearchesSnapshot.docs.length;

      // Delete subscriptions
      subscriptionsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      result.deletedCounts.subscriptions = subscriptionsSnapshot.docs.length;

      // Delete the main property document (using the ref we already have)
      batch.delete(propertyRef);
      result.deletedCounts.properties = 1;

      // 4. Execute all deletions in batch
      console.log('Executing batch deletion with operations:', {
        applications: applicationsSnapshot.docs.length,
        maintenanceRequests: maintenanceRequestsSnapshot.docs.length,
        units: unitsSnapshot.docs.length,
        listings: listingsSnapshot.docs.length,
        savedProperties: savedPropertiesSnapshot.docs.length,
        savedSearches: savedSearchesSnapshot.docs.length,
        subscriptions: subscriptionsSnapshot.docs.length,
        properties: 1
      });
      
      try {
        await batch.commit();
        console.log('Batch deletion completed successfully');
      } catch (batchError) {
        console.error('Batch deletion failed:', batchError);
        const error = batchError as Error;
        console.error('Error details:', {
          code: (error as { code?: string }).code,
          message: error.message,
          stack: error.stack
        });
        
        // Try individual deletions as fallback
        console.log('Attempting individual deletions as fallback...');
        try {
          await this.fallbackIndividualDeletions(
            propertyId,
            applicationsSnapshot.docs,
            maintenanceRequestsSnapshot.docs,
            unitsSnapshot.docs,
            listingsSnapshot.docs,
            savedPropertiesSnapshot.docs,
            savedSearchesSnapshot.docs,
            subscriptionsSnapshot.docs,
            propertyRef
          );
          console.log('Fallback individual deletions completed successfully');
        } catch (fallbackError) {
          console.error('Fallback deletions also failed:', fallbackError);
          throw batchError; // Throw original batch error
        }
      }

      // 5. Send notifications to affected users
      try {
        await notificationService.notifyPropertyDeletion(
          propertyId,
          propertyName,
          propertyAddress,
          landlordId,
          result.affectedUsers.applications,
          result.affectedUsers.maintenanceRequests,
          result.affectedUsers.subscriptions
        );
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError);
        result.errors.push(`Notification error: ${notificationError}`);
        // Don't fail the deletion if notifications fail
      }

      result.success = true;
      console.log('Property deletion completed successfully:', result.deletedCounts);

    } catch (error) {
      console.error('Error deleting property:', error);
      result.errors.push(`Deletion error: ${error}`);
      result.success = false;
    }

    return result;
  }

  // Get detailed impact analysis before deletion
  async getDeletionImpact(propertyId: string): Promise<{
    applications: number;
    maintenanceRequests: number;
    units: number;
    listings: number;
    savedProperties: number;
    savedSearches: number;
    affectedUsers: string[];
  }> {
    try {
      const [
        applicationsSnapshot,
        maintenanceRequestsSnapshot,
        unitsSnapshot,
        listingsSnapshot,
        savedPropertiesSnapshot,
        savedSearchesSnapshot
      ] = await Promise.all([
        getDocs(query(
          collection(db, 'applications'),
          where('applicationMetadata.propertyId', '==', propertyId)
        )),
        getDocs(query(
          collection(db, 'maintenance_requests'),
          where('propertyId', '==', propertyId)
        )),
        getDocs(query(
          collection(db, 'units'),
          where('propertyId', '==', propertyId)
        )),
        getDocs(query(
          collection(db, 'listings'),
          where('propertyId', '==', propertyId)
        )),
        getDocs(query(
          collection(db, 'saved_properties'),
          where('propertyIds', 'array-contains', propertyId)
        )),
        getDocs(query(
          collection(db, 'saved_searches'),
          where('propertyIds', 'array-contains', propertyId)
        ))
      ]);

      // Get unique affected user IDs
      const affectedUserIds = new Set<string>();
      
      applicationsSnapshot.docs.forEach(doc => {
        const userId = doc.data().applicationMetadata?.submittedBy || doc.id;
        affectedUserIds.add(userId);
      });

      maintenanceRequestsSnapshot.docs.forEach(doc => {
        const userId = doc.data().userId || doc.id;
        affectedUserIds.add(userId);
      });

      return {
        applications: applicationsSnapshot.docs.length,
        maintenanceRequests: maintenanceRequestsSnapshot.docs.length,
        units: unitsSnapshot.docs.length,
        listings: listingsSnapshot.docs.length,
        savedProperties: savedPropertiesSnapshot.docs.length,
        savedSearches: savedSearchesSnapshot.docs.length,
        affectedUsers: Array.from(affectedUserIds)
      };
    } catch (error) {
      console.error('Error getting deletion impact:', error);
      throw error;
    }
  }

  // Clean up orphaned data (optional maintenance function)
  async cleanupOrphanedData(): Promise<{
    cleanedApplications: number;
    cleanedMaintenanceRequests: number;
    cleanedUnits: number;
    cleanedListings: number;
  }> {
    const result = {
      cleanedApplications: 0,
      cleanedMaintenanceRequests: 0,
      cleanedUnits: 0,
      cleanedListings: 0
    };

    try {
      // Get all property IDs
      const propertiesSnapshot = await getDocs(collection(db, 'properties'));
      const propertyIds = new Set(propertiesSnapshot.docs.map(doc => doc.id));

      // Clean up applications with non-existent properties
      const applicationsSnapshot = await getDocs(collection(db, 'applications'));
      const batch = writeBatch(db);
      let batchCount = 0;

      for (const doc of applicationsSnapshot.docs) {
        const data = doc.data();
        const propertyId = data.applicationMetadata?.propertyId;
        
        if (propertyId && !propertyIds.has(propertyId)) {
          batch.delete(doc.ref);
          result.cleanedApplications++;
          batchCount++;
        }

        // Firestore batch limit is 500 operations
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
      }

      console.log('Orphaned data cleanup completed:', result);
    } catch (error) {
      console.error('Error cleaning up orphaned data:', error);
    }

    return result;
  }
}

export const propertyDeletionService = new PropertyDeletionService();
