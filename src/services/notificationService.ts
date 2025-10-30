import { collection, addDoc, serverTimestamp, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { emailTemplates } from './emailTemplates';

export interface NotificationData {
  id?: string;
  userId: string;
  type: 'property_deleted' | 'application_cancelled' | 'application_approved' | 'application_rejected' | 'application_submitted' | 'maintenance_cancelled' | 'maintenance_created' | 'maintenance_resolved' | 'listing_removed' | 'new_application' | 'new_maintenance_request' | 'new_subscription' | 'property_viewed' | 'application_withdrawn' | 'maintenance_updated' | 'payment_received' | 'payment_failed';
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

  // Get alternative property for recommendations
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
        collection(db, 'property'),
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
      }).slice(0, 3); // Limit to 3 alternative property
    } catch (error) {
      console.error('Error getting alternative property:', error);
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
    }> = [],
    affectedSavedProperties: Array<{
      id: string;
      userId: string;
    }> = [],
    affectedSavedSearches: Array<{
      id: string;
      userId: string;
    }> = []
  ): Promise<void> {
    console.log('Starting notification process:', {
      propertyId,
      propertyName,
      affectedApplications: affectedApplications.length,
      affectedMaintenanceRequests: affectedMaintenanceRequests.length,
      affectedSubscriptions: affectedSubscriptions.length,
      affectedSavedProperties: affectedSavedProperties.length,
      affectedSavedSearches: affectedSavedSearches.length
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

      // Get alternative property
      const alternativeProperties = await this.getAlternativeProperties(landlordId, propertyId);

      // Notify each affected application
      for (const application of affectedApplications) {
        console.log('Processing application:', application);
        
        // Try to get user info from application first
        let userInfo = await this.getUserInfoFromApplication(application.id);
        
        // If no user info found, try to get it from the user ID directly
        if (!userInfo && application.userId) {
          console.log('Trying to get user info directly from user ID:', application.userId);
          try {
            const userQuery = query(collection(db, 'users'), where('uid', '==', application.userId));
            const userSnapshot = await getDocs(userQuery);
            
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              userInfo = {
                email: userData.email || '',
                name: userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User'
              };
              console.log('Found user info directly:', userInfo);
            }
          } catch (error) {
            console.error('Error getting user info directly:', error);
          }
        }
        
        // If still no user info, create a fallback
        if (!userInfo) {
          console.log('No user info found for application:', application.id, 'Using fallback');
          userInfo = {
            email: 'noreply@cocoon.com',
            name: 'Property Applicant'
          };
        }
        
        console.log('Final user info for application:', userInfo);

        // Normalize status to lowercase for comparison
        const normalizedStatus = (application.status || 'pending').toLowerCase().trim();
        console.log(`Application ${application.id} status: "${application.status}" (normalized: "${normalizedStatus}")`);

        // IMPORTANT: When property is deleted, we should NEVER send "application_approved" notification
        // All applications should be cancelled, regardless of their previous status
        let notificationType: 'property_deleted' | 'application_cancelled' = 'application_cancelled';
        let title = 'Application Cancelled - Property Deleted';
        let message = `Your application for "${propertyName}" has been cancelled as the property has been deleted.`;
        let actionRequired = false;
        let actionUrl = '/property';

        if (normalizedStatus === 'approved') {
          // If application was approved, this is more urgent - tenant is affected
          notificationType = 'property_deleted';
          title = 'URGENT: Property Deleted - Immediate Action Required';
          message = `The property "${propertyName}" you're renting has been deleted by the landlord. This is a serious situation that requires immediate attention.`;
          actionRequired = true;
          actionUrl = '/property';
        } else if (normalizedStatus === 'pending' || normalizedStatus === 'submitted') {
          // If application was pending/submitted, notify about cancellation
          notificationType = 'application_cancelled';
          title = 'Application Cancelled - Property Deleted';
          message = `Your application for "${propertyName}" has been cancelled as the property has been deleted by the landlord.`;
          actionRequired = false;
          actionUrl = '/property';
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
          actionUrl = '/property';
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
          actionUrl = '/property';
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
                  'Search for alternative property',
                  'Contact landlord for other available property',
                  'Reapply for different property',
                  'Check for similar property in the area'
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
          actionRequired: false,
          actionUrl: '/maintenance'
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
          actionRequired: false,
          actionUrl: '/subscriptions'
        });
        console.log('Created notification for subscription:', subscription.id);
      }

      // Notify users with saved property
      for (const savedProperty of affectedSavedProperties) {
        console.log('Processing saved property:', savedProperty);
        // Create in-app notification
        await this.createNotification({
          userId: savedProperty.userId,
          type: 'listing_removed',
          title: 'Saved Property No Longer Available',
          message: `The property "${propertyName}" you saved is no longer available as it has been removed by the landlord.`,
          propertyId,
          propertyName,
          actionRequired: false,
          actionUrl: '/saved-properties'
        });
        console.log('Created notification for saved property:', savedProperty.id);
      }

      // Notify users with saved searches that included this property
      for (const savedSearch of affectedSavedSearches) {
        console.log('Processing saved search:', savedSearch);
        // Create in-app notification
        await this.createNotification({
          userId: savedSearch.userId,
          type: 'listing_removed',
          title: 'Property Removed from Search Results',
          message: `A property matching your saved search criteria has been removed. The property "${propertyName}" is no longer available.`,
          propertyId,
          propertyName,
          actionRequired: false,
          actionUrl: '/saved-searches'
        });
        console.log('Created notification for saved search:', savedSearch.id);
      }

      console.log(`Successfully notified ${affectedApplications.length} applications, ${affectedMaintenanceRequests.length} maintenance requests, ${affectedSubscriptions.length} subscriptions, ${affectedSavedProperties.length} saved property, and ${affectedSavedSearches.length} saved searches`);
    } catch (error) {
      console.error('Error notifying users of property deletion:', error);
      throw error;
    }
  }

  // LANDLORD NOTIFICATION METHODS

  // Notify landlord when a new application is submitted
  async notifyLandlordNewApplication(
    landlordId: string,
    applicationId: string,
    propertyId: string,
    propertyName: string,
    applicantName: string,
    applicantEmail: string
  ): Promise<void> {
    try {
      await this.createNotification({
        userId: landlordId,
        type: 'new_application',
        title: 'New Application Received! 📋',
        message: `${applicantName} has submitted an application for "${propertyName}". Review and respond to the application.`,
        propertyId,
        propertyName,
        actionRequired: true,
        actionUrl: '/property-management'
      });

      console.log(`Landlord notification created for new application ${applicationId}`);
    } catch (error) {
      console.error('Error creating landlord application notification:', error);
      throw error;
    }
  }

  // Notify landlord when a new maintenance request is submitted
  async notifyLandlordNewMaintenanceRequest(
    landlordId: string,
    maintenanceRequestId: string,
    propertyId: string,
    propertyName: string,
    tenantName: string,
    issueDescription: string
  ): Promise<void> {
    try {
      await this.createNotification({
        userId: landlordId,
        type: 'new_maintenance_request',
        title: 'New Maintenance Request 🔧',
        message: `${tenantName} has submitted a maintenance request for "${propertyName}": ${issueDescription}`,
        propertyId,
        propertyName,
        actionRequired: true,
        actionUrl: '/property-management'
      });

      console.log(`Landlord notification created for new maintenance request ${maintenanceRequestId}`);
    } catch (error) {
      console.error('Error creating landlord maintenance notification:', error);
      throw error;
    }
  }

  // Notify landlord when someone subscribes to their property
  async notifyLandlordNewSubscription(
    landlordId: string,
    propertyId: string,
    propertyName: string,
    subscriberName: string,
    subscriberEmail: string
  ): Promise<void> {
    try {
      await this.createNotification({
        userId: landlordId,
        type: 'new_subscription',
        title: 'New Property Subscription 📧',
        message: `${subscriberName} has subscribed to updates for "${propertyName}". They'll receive notifications about changes.`,
        propertyId,
        propertyName,
        actionRequired: false,
        actionUrl: '/property-management'
      });

      console.log(`Landlord notification created for new subscription to property ${propertyId}`);
    } catch (error) {
      console.error('Error creating landlord subscription notification:', error);
      throw error;
    }
  }

  // Notify landlord when their property is viewed
  async notifyLandlordPropertyViewed(
    landlordId: string,
    propertyId: string,
    propertyName: string,
    viewerName?: string
  ): Promise<void> {
    try {
      const message = viewerName 
        ? `${viewerName} viewed your property "${propertyName}"`
        : `Someone viewed your property "${propertyName}"`;

      await this.createNotification({
        userId: landlordId,
        type: 'property_viewed',
        title: 'Property Viewed 👀',
        message,
        propertyId,
        propertyName,
        actionRequired: false,
        actionUrl: '/property-management'
      });

      console.log(`Landlord notification created for property view ${propertyId}`);
    } catch (error) {
      console.error('Error creating landlord property view notification:', error);
      throw error;
    }
  }

  // Notify landlord when an application is withdrawn
  async notifyLandlordApplicationWithdrawn(
    landlordId: string,
    applicationId: string,
    propertyId: string,
    propertyName: string,
    applicantName: string
  ): Promise<void> {
    try {
      await this.createNotification({
        userId: landlordId,
        type: 'application_withdrawn',
        title: 'Application Withdrawn 📝',
        message: `${applicantName} has withdrawn their application for "${propertyName}".`,
        propertyId,
        propertyName,
        actionRequired: false,
        actionUrl: '/property-management'
      });

      console.log(`Landlord notification created for withdrawn application ${applicationId}`);
    } catch (error) {
      console.error('Error creating landlord application withdrawal notification:', error);
      throw error;
    }
  }

  // Notify landlord when a maintenance request is updated
  async notifyLandlordMaintenanceUpdated(
    landlordId: string,
    maintenanceRequestId: string,
    propertyId: string,
    propertyName: string,
    tenantName: string,
    updateDescription: string
  ): Promise<void> {
    try {
      await this.createNotification({
        userId: landlordId,
        type: 'maintenance_updated',
        title: 'Maintenance Request Updated 🔄',
        message: `${tenantName} has updated their maintenance request for "${propertyName}": ${updateDescription}`,
        propertyId,
        propertyName,
        actionRequired: true,
        actionUrl: '/property-management'
      });

      console.log(`Landlord notification created for updated maintenance request ${maintenanceRequestId}`);
    } catch (error) {
      console.error('Error creating landlord maintenance update notification:', error);
      throw error;
    }
  }

  // Notify landlord when payment is received
  async notifyLandlordPaymentReceived(
    landlordId: string,
    propertyId: string,
    propertyName: string,
    tenantName: string,
    amount: number,
    paymentType: string
  ): Promise<void> {
    try {
      await this.createNotification({
        userId: landlordId,
        type: 'payment_received',
        title: 'Payment Received! 💰',
        message: `Received $${amount} ${paymentType} payment from ${tenantName} for "${propertyName}".`,
        propertyId,
        propertyName,
        actionRequired: false,
        actionUrl: '/property-management'
      });

      console.log(`Landlord notification created for payment received for property ${propertyId}`);
    } catch (error) {
      console.error('Error creating landlord payment notification:', error);
      throw error;
    }
  }

  // Notify landlord when payment fails
  async notifyLandlordPaymentFailed(
    landlordId: string,
    propertyId: string,
    propertyName: string,
    tenantName: string,
    amount: number,
    paymentType: string
  ): Promise<void> {
    try {
      await this.createNotification({
        userId: landlordId,
        type: 'payment_failed',
        title: 'Payment Failed ⚠️',
        message: `Failed to receive $${amount} ${paymentType} payment from ${tenantName} for "${propertyName}". Please follow up.`,
        propertyId,
        propertyName,
        actionRequired: true,
        actionUrl: '/property-management'
      });

      console.log(`Landlord notification created for failed payment for property ${propertyId}`);
    } catch (error) {
      console.error('Error creating landlord payment failure notification:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
