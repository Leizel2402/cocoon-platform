import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { MaintenanceRequest } from '../types';
import { notificationService } from './notificationService';

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

      // Notify the landlord about the new maintenance request
      try {
        const propertyDoc = await getDoc(doc(db, 'properties', requestData.propertyId));
        if (propertyDoc.exists()) {
          const propertyData = propertyDoc.data();
          const landlordId = propertyData.landlordId;
          
          if (landlordId) {
            await notificationService.notifyLandlordNewMaintenanceRequest(
              landlordId,
              docRef.id,
              requestData.propertyId,
              propertyData.name || propertyData.title || 'Property',
              (requestData as any).tenantName || 'Tenant',
              requestData.description || (requestData as any).issue
            );
          }
        }
      } catch (notificationError) {
        console.error('Error sending landlord maintenance notification:', notificationError);
        // Don't fail the maintenance request creation if notification fails
      }

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

  /**
   * Valid status transitions (Production Rules):
   * 
   * From Landlord:
   * - submitted → in_progress (requires scheduledDate)
   * - submitted → cancelled
   * - in_progress → completed
   * - in_progress → cancelled
   * 
   * Final States (cannot be changed):
   * - completed (final)
   * - cancelled (final)
   * 
   * Invalid Transitions:
   * - in_progress → submitted (not allowed)
   * - completed → any (final state)
   * - cancelled → any (final state)
   */
  private isValidStatusTransition(currentStatus: MaintenanceRequest['status'], newStatus: MaintenanceRequest['status']): { valid: boolean; error?: string } {
    // Same status is always valid (no-op)
    if (currentStatus === newStatus) {
      return { valid: true };
    }

    // Final states cannot be changed
    if (currentStatus === 'completed') {
      return { valid: false, error: 'Cannot change status of a completed request. Completed requests are final.' };
    }
    
    if (currentStatus === 'cancelled') {
      return { valid: false, error: 'Cannot change status of a cancelled request. Cancelled requests are final.' };
    }

    // Define valid transitions from each state
    const validTransitions: Record<MaintenanceRequest['status'], MaintenanceRequest['status'][]> = {
      'submitted': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [], // Final state
      'cancelled': [] // Final state
    };

    const allowedTransitions = validTransitions[currentStatus] || [];
    
    if (!allowedTransitions.includes(newStatus)) {
      return { 
        valid: false, 
        error: `Invalid status transition: Cannot change from "${currentStatus.replace('_', ' ')}" to "${newStatus.replace('_', ' ')}". Valid transitions from "${currentStatus.replace('_', ' ')}" are: ${allowedTransitions.map(s => s.replace('_', ' ')).join(', ')}.` 
      };
    }

    return { valid: true };
  }

  // Update maintenance request status
  async updateMaintenanceRequestStatus(
    requestId: string, 
    status: MaintenanceRequest['status'], 
    notes?: string,
    skipTransitionValidation: boolean = false
  ): Promise<void> {
    try {
      const requestRef = doc(db, this.collectionName, requestId);
      
      // Get current status for validation
      const requestDoc = await getDoc(requestRef);
      if (!requestDoc.exists()) {
        throw new Error('Maintenance request not found');
      }
      
      const requestData = requestDoc.data();
      const currentStatus = requestData.status as MaintenanceRequest['status'];
      
      // Validate status transition (unless explicitly skipped, e.g., from schedule modal)
      if (!skipTransitionValidation) {
        const validation = this.isValidStatusTransition(currentStatus, status);
        if (!validation.valid) {
          throw new Error(validation.error || 'Invalid status transition');
        }
      }
      
      // If changing to 'in_progress', verify that scheduledDate exists
      if (status === 'in_progress') {
        const scheduledDate = requestData.scheduledDate;
        
        if (!scheduledDate) {
          throw new Error('Cannot change status to "in_progress" without a scheduled date. Please schedule the maintenance first.');
        }
      }
      
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
      throw error instanceof Error ? error : new Error('Failed to update maintenance request');
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

  // Delete maintenance request (for user's own requests - any status except in_progress)
  async deleteMaintenanceRequest(requestId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const requestRef = doc(db, this.collectionName, requestId);
      
      // Check if request exists
      const requestDoc = await getDoc(requestRef);
      if (!requestDoc.exists()) {
        return { success: false, error: 'Maintenance request not found. It may have already been deleted.' };
      }
      
      const requestData = requestDoc.data() as MaintenanceRequest;
      
      // Verify the user is the owner of this request
      if (!requestData.tenantId) {
        return { success: false, error: 'Invalid request data: tenantId field is missing' };
      }
      
      if (requestData.tenantId !== userId) {
        return { success: false, error: 'You can only delete your own maintenance requests' };
      }
      
      // For in_progress requests, they should be cancelled, not deleted
      if (requestData.status === 'in_progress') {
        return { success: false, error: 'Cannot delete a request that is in progress. Please cancel it instead.' };
      }
      
      await deleteDoc(requestRef);
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting maintenance request:', error);
      
      // Provide more specific error messages
      if (error?.code === 'permission-denied') {
        return { success: false, error: 'Permission denied. You can only delete your own requests. Please ensure Firestore rules are deployed.' };
      }
      if (error?.code === 'not-found') {
        return { success: false, error: 'Maintenance request not found. It may have already been deleted.' };
      }
      
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred while deleting request' };
    }
  }

  // Cancel maintenance request with reason (for in_progress requests)
  async cancelMaintenanceRequest(
    requestId: string,
    userId: string,
    cancellationReason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const requestRef = doc(db, this.collectionName, requestId);
      
      // Check if request exists
      const requestDoc = await getDoc(requestRef);
      if (!requestDoc.exists()) {
        return { success: false, error: 'Maintenance request not found' };
      }
      
      const requestData = requestDoc.data() as MaintenanceRequest;
      
      // Verify the user is the owner
      if (!requestData.tenantId) {
        return { success: false, error: 'Invalid request data: tenantId field is missing' };
      }
      
      if (requestData.tenantId !== userId) {
        return { success: false, error: 'You can only cancel your own maintenance requests' };
      }
      
      // Only in_progress requests can be cancelled by user
      // submitted requests should be deleted instead
      if (requestData.status === 'completed' || requestData.status === 'cancelled') {
        return { success: false, error: 'Cannot cancel a completed or already cancelled request' };
      }
      
      if (requestData.status === 'submitted') {
        return { success: false, error: 'Submitted requests should be deleted, not cancelled. Please use delete instead.' };
      }
      
      await updateDoc(requestRef, {
        status: 'cancelled' as const,
        notes: cancellationReason ? `Cancelled by tenant. Reason: ${cancellationReason}` : 'Cancelled by tenant',
        updatedAt: Timestamp.fromDate(new Date())
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error cancelling maintenance request:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const maintenanceService = new MaintenanceService();
