import { collection, addDoc, serverTimestamp, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { emailTemplates } from './emailTemplates';

export interface NotificationData {
  id?: string;
  userId: string;
  type: 'property_deleted' | 'application_cancelled' | 'application_approved' | 'application_rejected' | 'application_submitted' | 'maintenance_cancelled' | 'maintenance_created' | 'maintenance_resolved' | 'listing_removed';
  title: string;
  message: string;
  propertyId: string;
  propertyName: string;
  isRead: boolean;
  createdAt: Date | { seconds: number; nanoseconds: number };
  actionRequired?: boolean;
  actionUrl?: string;
}

export interface EmailNotificationData {
  to: string;
  subject: string;
  template: 'property_deleted_tenant' | 'property_deleted_prospect' | 'application_cancelled' | 'maintenance_cancelled';
  data: {
    recipientName: string;
    propertyName: string;
    propertyAddress: string;
    landlordName: string;
    landlordEmail: string;
    landlordPhone?: string;
    alternativeProperties?: Array<{
      id: string;
      name: string;
      address: string;
      rent: number;
      bedrooms: number;
      bathrooms: number;
    }>;
    nextSteps?: string[];
  };
}

class NotificationService {
  // Create in-app notification
  async createNotification(notification: Omit<NotificationData, 'id' | 'createdAt' | 'isRead'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send email notification (placeholder - integrate with your email service)
  async sendEmailNotification(emailData: EmailNotificationData): Promise<boolean> {
    try {
      // Get the appropriate email template
      const template = emailTemplates[emailData.template];
      if (!template) {
        throw new Error(`Email template not found: ${emailData.template}`);
      }

      // Generate email content
      const emailContent = template(emailData.data);
      
      // TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
      console.log('Email notification would be sent:', {
        to: emailData.to,
        subject: emailContent.subject,
        template: emailData.template
      });
      
      // For now, just log the email data
      // In production, you would call your email service here with emailContent.html
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  // Get user's email and name from applications
  async getUserInfoFromApplication(applicationId: string): Promise<{ email: string; name: string } | null> {
    try {
      const applicationDoc = await getDoc(doc(db, 'applications', applicationId));
      
      if (applicationDoc.exists()) {
        const applicationData = applicationDoc.data();
        return {
          email: applicationData.personalInfo?.email || '',
          name: `${applicationData.personalInfo?.firstName || ''} ${applicationData.personalInfo?.lastName || ''}`.trim()
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user info from application:', error);
      return null;
    }
  }

  // Get landlord information
  async getLandlordInfo(landlordId: string): Promise<{ name: string; email: string; phone?: string } | null> {
    try {
      console.log('Getting landlord info for:', landlordId);
      const userQuery = query(collection(db, 'users'), where('uid', '==', landlordId));
      const userSnapshot = await getDocs(userQuery);
      
      console.log('User query results:', userSnapshot.docs.length, 'documents found');
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data();
        console.log('User data:', userData);
        return {
          name: userData.displayName || 'Property Owner',
          email: userData.email || '',
          phone: userData.phone || ''
        };
      }
      console.log('No user found with uid:', landlordId);
      return null;
    } catch (error) {
      console.error('Error getting landlord info:', error);
      return null;
    }
  }

  // Get alternative properties for recommendations
  async getAlternativeProperties(landlordId: string, excludePropertyId: string): Promise<Array<{
    id: string;
    name: string;
    address: string;
    rent: number;
    bedrooms: number;
    bathrooms: number;
  }>> {
    try {
      const propertiesQuery = query(
        collection(db, 'properties'),
        where('landlordId', '==', landlordId),
        where('id', '!=', excludePropertyId)
      );
      const propertiesSnapshot = await getDocs(propertiesQuery);
      
      return propertiesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || data.title || 'Property',
          address: `${data.address?.line1 || ''}, ${data.address?.city || ''}, ${data.address?.region || ''}`,
          rent: data.rent_amount || 0,
          bedrooms: data.bedrooms || 0,
          bathrooms: data.bathrooms || 0
        };
      }).slice(0, 3); // Limit to 3 alternative properties
    } catch (error) {
      console.error('Error getting alternative properties:', error);
      return [];
    }
  }

  // Notify user when application status changes
  async notifyApplicationStatusChange(
    userId: string,
    applicationId: string,
    status: 'approved' | 'rejected' | 'submitted',
    propertyId: string,
    propertyName: string
  ): Promise<void> {
    try {
      let notificationType: 'application_approved' | 'application_rejected' | 'application_submitted';
      let title: string;
      let message: string;
      let actionRequired = false;
      let actionUrl = '/my-applications';

      switch (status) {
        case 'approved':
          notificationType = 'application_approved';
          title = 'Application Approved! 🎉';
          message = `Congratulations! Your application for "${propertyName}" has been approved.`;
          actionRequired = true;
          actionUrl = '/my-applications';
          break;
        case 'rejected':
          notificationType = 'application_rejected';
          title = 'Application Status Update';
          message = `Your application for "${propertyName}" has been reviewed. Please check your application details for more information.`;
          actionRequired = false;
          actionUrl = '/my-applications';
          break;
        case 'submitted':
          notificationType = 'application_submitted';
          title = 'Application Submitted Successfully';
          message = `Your application for "${propertyName}" has been submitted and is now under review.`;
          actionRequired = false;
          actionUrl = '/my-applications';
          break;
        default:
          return;
      }

      await this.createNotification({
        userId,
        type: notificationType,
        title,
        message,
        propertyId,
        propertyName,
        actionRequired,
        actionUrl
      });

      console.log(`Notification created for application ${applicationId} status change to ${status}`);
    } catch (error) {
      console.error('Error creating application status notification:', error);
      throw error;
    }
  }

  // Notify affected users when property is deleted
  async notifyPropertyDeletion(
    propertyId: string,
    propertyName: string,
    propertyAddress: string,
    landlordId: string,
    affectedApplications: Array<{
      id: string;
      status: string;
      userId: string;
    }>,
    affectedMaintenanceRequests: Array<{
      id: string;
      userId: string;
    }>,
    affectedSubscriptions: Array<{
      id: string;
      userId: string;
      status: string;
    }> = []
  ): Promise<void> {
    console.log('Starting notification process:', {
      propertyId,
      propertyName,
      affectedApplications: affectedApplications.length,
      affectedMaintenanceRequests: affectedMaintenanceRequests.length,
      affectedSubscriptions: affectedSubscriptions.length
    });
    
    try {
      // Get landlord information
      let landlordInfo = await this.getLandlordInfo(landlordId);
      if (!landlordInfo) {
        console.warn('Landlord information not found, using fallback');
        // Use fallback landlord info so notifications can still be sent
        landlordInfo = {
          name: 'Property Owner',
          email: 'noreply@cocoon.com',
          phone: ''
        };
        console.log('Using fallback landlord info:', landlordInfo);
      }

      // Get alternative properties
      const alternativeProperties = await this.getAlternativeProperties(landlordId, propertyId);

      // Notify each affected application
      for (const application of affectedApplications) {
        console.log('Processing application:', application);
        const userInfo = await this.getUserInfoFromApplication(application.id);
        console.log('User info for application:', userInfo);
        if (!userInfo) {
          console.log('No user info found for application:', application.id);
          continue;
        }

        // Normalize status to lowercase for comparison
        const normalizedStatus = (application.status || 'pending').toLowerCase().trim();
        console.log(`Application ${application.id} status: "${application.status}" (normalized: "${normalizedStatus}")`);

        // IMPORTANT: When property is deleted, we should NEVER send "application_approved" notification
        // All applications should be cancelled, regardless of their previous status
        let notificationType: 'property_deleted' | 'application_cancelled' = 'application_cancelled';
        let title = 'Application Cancelled - Property Deleted';
        let message = `Your application for "${propertyName}" has been cancelled as the property has been deleted.`;
        let actionRequired = false;
        let actionUrl = '/properties';

        if (normalizedStatus === 'approved') {
          // If application was approved, this is more urgent - tenant is affected
          notificationType = 'property_deleted';
          title = 'URGENT: Property Deleted - Immediate Action Required';
          message = `The property "${propertyName}" you're renting has been deleted by the landlord. This is a serious situation that requires immediate attention.`;
          actionRequired = true;
          actionUrl = '/contact-landlord';
        } else if (normalizedStatus === 'pending' || normalizedStatus === 'submitted') {
          // If application was pending/submitted, notify about cancellation
          notificationType = 'application_cancelled';
          title = 'Application Cancelled - Property Deleted';
          message = `Your application for "${propertyName}" has been cancelled as the property has been deleted by the landlord.`;
          actionRequired = false;
          actionUrl = '/properties';
        } else if (normalizedStatus === 'rejected') {
          // Don't notify for already rejected applications
          console.log('Skipping notification for rejected application:', application.id);
          continue;
        } else {
          // Default case: treat as cancelled
          notificationType = 'application_cancelled';
          title = 'Application Cancelled - Property Deleted';
          message = `Your application for "${propertyName}" has been cancelled as the property has been deleted by the landlord.`;
          actionRequired = false;
          actionUrl = '/properties';
        }

        // CRITICAL: Safety check - ensure title doesn't accidentally contain "Application Approved"
        if (title.includes('Application Approved') || title.includes('🎉')) {
          console.error('ERROR: Attempted to create application_approved notification during property deletion!');
          console.error('Application data:', application);
          console.error('Property being deleted:', propertyId, propertyName);
          // Force correct notification type
          notificationType = 'application_cancelled';
          title = 'Application Cancelled - Property Deleted';
          message = `Your application for "${propertyName}" has been cancelled as the property has been deleted by the landlord.`;
          actionRequired = false;
          actionUrl = '/properties';
        }

        console.log(`Creating notification for application ${application.id}:`, {
          type: notificationType,
          title,
          status: normalizedStatus,
          propertyId,
          propertyName
        });

        await this.createNotification({
          userId: application.userId,
          type: notificationType,
          title,
          message,
          propertyId,
          propertyName,
          actionRequired,
          actionUrl
        });

        // Send email notification
        await this.sendEmailNotification({
          to: userInfo.email,
          subject: title,
          template: notificationType === 'property_deleted' ? 'property_deleted_tenant' : 'property_deleted_prospect',
          data: {
            recipientName: userInfo.name,
            propertyName,
            propertyAddress,
            landlordName: landlordInfo.name,
            landlordEmail: landlordInfo.email,
            landlordPhone: landlordInfo.phone,
            alternativeProperties,
            nextSteps: notificationType === 'property_deleted' 
              ? [
                  'Contact your landlord immediately',
                  'Discuss lease termination terms',
                  'Arrange for security deposit return',
                  'Find alternative housing',
                  'Review your lease agreement for termination clauses'
                ]
              : [
                  'Search for alternative properties',
                  'Contact landlord for other available properties',
                  'Reapply for different properties',
                  'Check for similar properties in the area'
                ]
          }
        });
      }

      // Notify maintenance request submitters
      for (const maintenanceRequest of affectedMaintenanceRequests) {
        console.log('Processing maintenance request:', maintenanceRequest);
        // Create in-app notification
        await this.createNotification({
          userId: maintenanceRequest.userId,
          type: 'maintenance_cancelled',
          title: 'Maintenance Request Cancelled',
          message: `Your maintenance request for "${propertyName}" has been cancelled as the property has been deleted.`,
          propertyId,
          propertyName,
          actionRequired: false
        });
        console.log('Created notification for maintenance request:', maintenanceRequest.id);
      }

      // Notify subscription users
      for (const subscription of affectedSubscriptions) {
        console.log('Processing subscription:', subscription);
        // Create in-app notification
        await this.createNotification({
          userId: subscription.userId,
          type: 'property_deleted',
          title: 'Property Deleted - Subscription Cancelled',
          message: `The property "${propertyName}" you were subscribed to has been deleted. Your subscription has been cancelled.`,
          propertyId,
          propertyName,
          actionRequired: false
        });
        console.log('Created notification for subscription:', subscription.id);
      }

      console.log(`Successfully notified ${affectedApplications.length} applications, ${affectedMaintenanceRequests.length} maintenance requests, and ${affectedSubscriptions.length} subscriptions`);
    } catch (error) {
      console.error('Error notifying users of property deletion:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
