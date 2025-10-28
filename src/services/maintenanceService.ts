import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { MaintenanceRequest } from '../types';

// Re-export the interface for backward compatibility
export type { MaintenanceRequest };

export interface MaintenanceActivity {
  id: string;
  type: 'maintenance';
  message: string;
  time: string;
  status: string;
  property: string;
  priority: string;
  maintenanceRequestId: string;
}

class MaintenanceService {
  private collectionName = 'maintenanceRequests';

  // Upload images to Firebase Storage and return URLs
  async uploadImages(files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(async (file) => {
        const fileName = `maintenance-requests/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, fileName);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
      });

      const imageUrls = await Promise.all(uploadPromises);
      return imageUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new Error('Failed to upload images');
    }
  }

  // Create a new maintenance request
  async createMaintenanceRequest(requestData: Omit<MaintenanceRequest, 'id' | 'submittedAt' | 'updatedAt'>, imageFiles?: File[]): Promise<string> {
    try {
      let imageUrls: string[] = [];
      
      // Upload images if provided
      if (imageFiles && imageFiles.length > 0) {
        imageUrls = await this.uploadImages(imageFiles);
      }

      const docRef = await addDoc(collection(db, this.collectionName), {
        ...requestData,
        images: imageUrls, // Store URLs instead of File objects
        submittedAt: Timestamp.fromDate(new Date()),
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      });
      
      console.log('Maintenance request created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      throw new Error('Failed to create maintenance request');
    }
  }

  // Get all maintenance requests for a specific tenant
  async getMaintenanceRequestsByTenant(tenantId: string): Promise<MaintenanceRequest[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('tenantId', '==', tenantId)
      );
      
      const querySnapshot = await getDocs(q);
      const requests: MaintenanceRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          scheduledDate: data.scheduledDate?.toDate(),
          completedDate: data.completedDate?.toDate()
        } as MaintenanceRequest);
      });
      
      // Sort by submittedAt in descending order on the client side
      return requests.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      throw new Error('Failed to fetch maintenance requests');
    }
  }

  // Get all maintenance requests for a specific landlord
  async getMaintenanceRequestsByLandlord(landlordId: string): Promise<MaintenanceRequest[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('landlordId', '==', landlordId)
      );
      
      const querySnapshot = await getDocs(q);
      const requests: MaintenanceRequest[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        requests.push({
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date(),
          scheduledDate: data.scheduledDate?.toDate(),
          completedDate: data.completedDate?.toDate()
        } as MaintenanceRequest);
      });
      
      // Sort by submittedAt in descending order on the client side
      return requests.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      throw new Error('Failed to fetch maintenance requests');
    }
  }

  // Update maintenance request status
  async updateMaintenanceRequestStatus(requestId: string, status: MaintenanceRequest['status'], notes?: string): Promise<void> {
    try {
      const requestRef = doc(db, this.collectionName, requestId);
      const updateData: Record<string, string | Date | { seconds: number; nanoseconds: number }> = {
        status,
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (status === 'completed') {
        updateData.completedDate = Timestamp.fromDate(new Date());
      }

      if (notes) {
        updateData.notes = notes;
      }

      await updateDoc(requestRef, updateData);
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      throw new Error('Failed to update maintenance request');
    }
  }

  // Update maintenance request scheduled date
  async updateMaintenanceRequestSchedule(requestId: string, scheduledDate: Date, notes?: string): Promise<void> {
    try {
      const requestRef = doc(db, this.collectionName, requestId);
      const updateData: Record<string, string | { seconds: number; nanoseconds: number }> = {
        scheduledDate: Timestamp.fromDate(scheduledDate),
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (notes) {
        updateData.notes = notes;
      }

      await updateDoc(requestRef, updateData);
    } catch (error) {
      console.error('Error updating maintenance request schedule:', error);
      throw new Error('Failed to update maintenance request schedule');
    }
  }

  // Get recent maintenance activities for landlord dashboard
  async getRecentMaintenanceActivities(landlordId: string, limit: number = 10): Promise<MaintenanceActivity[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('landlordId', '==', landlordId)
      );
      
      const querySnapshot = await getDocs(q);
      const activities: MaintenanceActivity[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const request = {
          id: doc.id,
          ...data,
          submittedAt: data.submittedAt?.toDate() || new Date()
        } as MaintenanceRequest;

        // Create activity entry
        const activity: MaintenanceActivity = {
          id: `maintenance-${doc.id}`,
          type: 'maintenance',
          message: this.getActivityMessage(request),
          time: this.getTimeAgo(request.submittedAt),
          status: request.status,
          property: request.propertyAddress,
          priority: request.priority,
          maintenanceRequestId: doc.id
        };

        activities.push(activity);
      });
      
      // Sort by submittedAt in descending order on the client side and limit results
      return activities
        .sort((a, b) => {
          const aTime = querySnapshot.docs.find(doc => doc.id === a.maintenanceRequestId)?.data().submittedAt?.toDate() || new Date();
          const bTime = querySnapshot.docs.find(doc => doc.id === b.maintenanceRequestId)?.data().submittedAt?.toDate() || new Date();
          return bTime.getTime() - aTime.getTime();
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent maintenance activities:', error);
      throw new Error('Failed to fetch recent maintenance activities');
    }
  }

  // Helper method to generate activity message
  private getActivityMessage(request: MaintenanceRequest): string {
    const statusMessages = {
      'submitted': `New maintenance request: ${request.title}`,
      'in_progress': `Maintenance request in progress: ${request.title}`,
      'completed': `Maintenance request completed: ${request.title}`,
      'cancelled': `Maintenance request cancelled: ${request.title}`
    };

    return statusMessages[request.status] || `Maintenance request: ${request.title}`;
  }

  // Helper method to get time ago string
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  }

  // Delete maintenance request
  async deleteMaintenanceRequest(requestId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, requestId));
    } catch (error) {
      console.error('Error deleting maintenance request:', error);
      throw new Error('Failed to delete maintenance request');
    }
  }
}

export const maintenanceService = new MaintenanceService();
