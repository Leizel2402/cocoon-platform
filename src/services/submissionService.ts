import { collection, addDoc, serverTimestamp, query, getDocs, orderBy, limit, getDoc, doc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadDocuments, DocumentUpload } from './documentService';
import { notificationService } from './notificationService';

// Interface for the nested application data structure
interface NestedApplicationData {
  applicationMetadata?: {
    propertyId?: string;
    propertyName?: string;
  };
  personalInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  propertyId?: string;
  propertyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Tour Booking Submission
export interface TourBookingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredDate: string;
  apartmentPreferences: string;
  moveInDate: string;
  propertyId: string;
  propertyName: string;
  unitId?: string | null;
  unitNumber?: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  submittedBy: string; // user ID
  submittedAt: Date | { seconds: number; nanoseconds: number }; // serverTimestamp
}

// Application Submission
export interface ApplicationData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  currentAddress: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Employment Information
  employer: string;
  jobTitle: string;
  employmentStatus: string;
  annualIncome: number;
  employmentStartDate: string;
  
  // Rental History
  previousLandlordName: string;
  previousLandlordPhone: string;
  previousRentAmount: number;
  rentalHistory: string;
  
  // References
  reference1Name: string;
  reference1Phone: string;
  reference1Relationship: string;
  reference2Name: string;
  reference2Phone: string;
  reference2Relationship: string;
  
  // Property Information
  propertyId: string;
  propertyName: string;
  unitId?: string | null;
  unitNumber?: string | null;
  
  // Application Status
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
  submittedBy: string; // user ID
  submittedAt: Date | { seconds: number; nanoseconds: number }; // serverTimestamp
  
  // Additional fields
  notes?: string;
  creditScore?: number;
  hasPets: boolean;
  petDetails?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  
  // Documents
  documents?: DocumentUpload[];
}

// Submit Tour Booking
export const submitTourBooking = async (tourData: Omit<TourBookingData, 'status' | 'submittedBy' | 'submittedAt'>) => {
  try {
    // Filter out null/undefined values to prevent Firebase errors
    const cleanData = Object.fromEntries(
      Object.entries(tourData).filter(([, value]) => value !== null && value !== undefined)
    );

    const docRef = await addDoc(collection(db, 'tour_bookings'), {
      ...cleanData,
      status: 'pending',
      submittedAt: serverTimestamp(),
    });
    
    console.log('Tour booking submitted with ID:', docRef.id);

    // Notify the landlord about the new tour booking
    try {
      // Check if propertyId is valid and not a general tour request
      if (tourData.propertyId && tourData.propertyId !== 'general-tour') {
        const propertyDoc = await getDoc(doc(db, 'properties', tourData.propertyId));
        if (propertyDoc.exists()) {
          const propertyData = propertyDoc.data();
          const landlordId = propertyData.landlordId;
          
          if (landlordId) {
            // Notify the landlord about the new tour booking
            await notificationService.notifyLandlordNewTourBooking(
              landlordId,
              docRef.id,
              tourData.propertyId,
              tourData.propertyName || 'Property',
              `${tourData.firstName} ${tourData.lastName}`.trim(),
              tourData.email,
              tourData.preferredDate,
              tourData.unitNumber || null
            );
          } else {
            console.warn('Landlord ID not found for property:', tourData.propertyId);
          }
        } else {
          console.warn('Property not found:', tourData.propertyId);
        }
      } else {
        console.warn('Property ID is missing or is general tour request, skipping landlord notification');
      }
    } catch (notificationError) {
      console.error('Error sending landlord tour booking notification:', notificationError);
      // Don't fail the tour booking submission if notification fails
    }

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting tour booking:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Submit Application
export const submitApplication = async (applicationData: Omit<ApplicationData, 'status' | 'submittedBy' | 'submittedAt'>, userId: string) => {
  try {
    // Filter out null/undefined values to prevent Firebase errors
    const cleanData = Object.fromEntries(
      Object.entries(applicationData).filter(([, value]) => value !== null && value !== undefined)
    );

    const docRef = await addDoc(collection(db, 'applications'), {
      ...cleanData,
      status: 'pending',
      submittedAt: serverTimestamp(),
      submittedBy: userId,
    });
    
    console.log('Application submitted with ID:', docRef.id);

    // Get landlord information from the property
    try {
      // Extract propertyId and propertyName from the nested structure
      const nestedData = applicationData as NestedApplicationData;
      const propertyId = nestedData.applicationMetadata?.propertyId || nestedData.propertyId;
      const propertyName = nestedData.applicationMetadata?.propertyName || nestedData.propertyName;
      const firstName = nestedData.personalInfo?.firstName || nestedData.firstName;
      const lastName = nestedData.personalInfo?.lastName || nestedData.lastName;
      const email = nestedData.personalInfo?.email || nestedData.email;

      console.log('🔍 Extracted application data for landlord notification:', {
        propertyId,
        propertyName,
        firstName,
        lastName,
        email,
        hasApplicationMetadata: !!(applicationData as NestedApplicationData).applicationMetadata,
        hasPersonalInfo: !!(applicationData as NestedApplicationData).personalInfo
      });

      // Add defensive checks for required fields
      if (!propertyId || propertyId === 'general-application') {
        console.warn('Property ID is missing or is general application, skipping landlord notification');
        return { success: true, id: docRef.id };
      }

      const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
      if (propertyDoc.exists()) {
        const propertyData = propertyDoc.data();
        const landlordId = propertyData.landlordId;
        
        if (landlordId) {
          // Notify the landlord about the new application
          await notificationService.notifyLandlordNewApplication(
            landlordId,
            docRef.id,
            propertyId,
            propertyName || 'Property',
            `${firstName || ''} ${lastName || ''}`.trim() || 'Applicant',
            email || ''
          );
        } else {
          console.warn('Landlord ID not found for property:', propertyId);
        }
      } else {
        console.warn('Property not found:', propertyId);
      }
    } catch (notificationError) {
      console.error('Error sending landlord notification:', notificationError);
      // Don't fail the application submission if notification fails
    }
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting application:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Submit Application with Documents
export const submitApplicationWithDocuments = async (
  applicationData: Omit<ApplicationData, 'status' | 'submittedBy' | 'submittedAt' | 'documents'>,
  documents: {
    id: File[];
  },
  userId: string
) => {
  try {
    // First, create the application record
    const cleanData = Object.fromEntries(
      Object.entries(applicationData).filter(([, value]) => value !== null && value !== undefined)
    );

    const docRef = await addDoc(collection(db, 'applications'), {
      ...cleanData,
      status: 'pending',
      submittedAt: serverTimestamp(),
    });

    console.log('Application created with ID:', docRef.id);

    // Upload documents to Firebase Storage
    const allDocuments: DocumentUpload[] = [];
    
    // Upload each category of documents
    const categories = [
      { key: 'id' as const, files: documents.id }
    ];

    for (const category of categories) {
      if (category.files.length > 0) {
        const uploadResult = await uploadDocuments(
          category.files,
          docRef.id,
          userId,
          category.key
        );

        if (uploadResult.success && uploadResult.documents) {
          allDocuments.push(...uploadResult.documents);
        } else {
          console.error(`Failed to upload ${category.key} documents:`, uploadResult.error);
        }
      }
    }

    // Update the application with document references
    if (allDocuments.length > 0) {
      // Note: In a real implementation, you might want to store document metadata in Firestore
      // For now, we'll just log the successful uploads
      console.log(`Successfully uploaded ${allDocuments.length} documents for application ${docRef.id}`);
    }

    // Get landlord information from the property and notify them
    try {
      // Extract propertyId and propertyName from the nested structure
      const nestedData = applicationData as NestedApplicationData;
      const propertyId = nestedData.applicationMetadata?.propertyId || nestedData.propertyId;
      const propertyName = nestedData.applicationMetadata?.propertyName || nestedData.propertyName;
      const firstName = nestedData.personalInfo?.firstName || nestedData.firstName;
      const lastName = nestedData.personalInfo?.lastName || nestedData.lastName;
      const email = nestedData.personalInfo?.email || nestedData.email;

      console.log('🔍 Extracted application data for landlord notification:', {
        propertyId,
        propertyName,
        firstName,
        lastName,
        email,
        hasApplicationMetadata: !!(applicationData as NestedApplicationData).applicationMetadata,
        hasPersonalInfo: !!(applicationData as NestedApplicationData).personalInfo
      });

      // Add defensive checks for required fields
      if (!propertyId || propertyId === 'general-application') {
        console.warn('Property ID is missing or is general application, skipping landlord notification');
        return { 
          success: true, 
          id: docRef.id, 
          documentsUploaded: allDocuments.length,
          documents: allDocuments
        };
      }

      const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
      if (propertyDoc.exists()) {
        const propertyData = propertyDoc.data();
        const landlordId = propertyData.landlordId;
        
        if (landlordId) {
          // Notify the landlord about the new application
          await notificationService.notifyLandlordNewApplication(
            landlordId,
            docRef.id,
            propertyId,
            propertyName || 'Property',
            `${firstName || ''} ${lastName || ''}`.trim() || 'Applicant',
            email || ''
          );
        } else {
          console.warn('Landlord ID not found for property:', propertyId);
        }
      } else {
        console.warn('Property not found:', propertyId);
      }
    } catch (notificationError) {
      console.error('Error sending landlord notification:', notificationError);
      // Don't fail the application submission if notification fails
    }

    return { 
      success: true, 
      id: docRef.id, 
      documentsUploaded: allDocuments.length,
      documents: allDocuments
    };
  } catch (error) {
    console.error('Error submitting application with documents:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get Tour Bookings (for landlords/staff)
export const getTourBookings = async (landlordId?: string) => {
  try {
    const q = query(
      collection(db, 'tour_bookings'),
      orderBy('submittedAt', 'desc'),
      limit(50)
    );
    
    // If landlordId is provided, filter by property ownership
    if (landlordId) {
      // You would need to join with properties collection to filter by landlord
      // For now, we'll get all and filter in the component
    }
    
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: bookings };
  } catch (error) {
    console.error('Error fetching tour bookings:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get Tour Bookings by User ID (for renters/prospects)
export const getTourBookingsByUser = async (userId: string): Promise<(TourBookingData & { id: string })[]> => {
  try {
    // Query tour bookings by submittedBy (userId)
    const q = query(
      collection(db, 'tour_bookings'),
      where('submittedBy', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (TourBookingData & { id: string })[];
    
    // Sort by submittedAt in memory (to avoid composite index requirement)
    bookings.sort((a, b) => {
      const dateA = a.submittedAt && typeof a.submittedAt === 'object' && 'seconds' in a.submittedAt
        ? a.submittedAt.seconds * 1000
        : new Date(a.submittedAt as string | Date).getTime();
      const dateB = b.submittedAt && typeof b.submittedAt === 'object' && 'seconds' in b.submittedAt
        ? b.submittedAt.seconds * 1000
        : new Date(b.submittedAt as string | Date).getTime();
      return dateB - dateA; // Descending order
    });
    
    return bookings;
  } catch (error) {
    console.error('Error fetching tour bookings by user:', error);
    throw error;
  }
};

// Get Applications (for landlords/staff)
export const getApplications = async (landlordId?: string) => {
  try {
    const q = query(
      collection(db, 'applications'),
      orderBy('submittedAt', 'desc'),
      limit(50)
    );
    
    // If landlordId is provided, filter by property ownership
    if (landlordId) {
      // You would need to join with properties collection to filter by landlord
      // For now, we'll get all and filter in the component
    }
    
    const querySnapshot = await getDocs(q);
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: applications };
  } catch (error) {
    console.error('Error fetching applications:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Update Tour Booking Status
export const updateTourBookingStatus = async (bookingId: string, status: TourBookingData['status']) => {
  try {
    const { doc, updateDoc, getDoc } = await import('firebase/firestore');
    const bookingRef = doc(db, 'tour_bookings', bookingId);
    
    // Check if booking exists before trying to update
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) {
      return { success: false, error: 'Tour booking not found. It may have been deleted.' };
    }
    
    const bookingData = bookingDoc.data() as TourBookingData;
    
    // Prevent updating if already completed or cancelled (unless explicitly changing to these states)
    if (bookingData.status === 'completed' && status !== 'completed') {
      return { success: false, error: 'Cannot update a completed booking' };
    }
    
    await updateDoc(bookingRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating tour booking status:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Delete Tour Booking (for user's own bookings - any status)
export const deleteTourBooking = async (bookingId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { doc, deleteDoc, getDoc } = await import('firebase/firestore');
    const bookingRef = doc(db, 'tour_bookings', bookingId);
    
    // Check if booking exists
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) {
      return { success: false, error: 'Tour booking not found. It may have already been deleted.' };
    }
    
    const bookingData = bookingDoc.data() as TourBookingData;
    
    // Verify the user is the owner of this booking
    if (!bookingData.submittedBy) {
      return { success: false, error: 'Invalid booking data: submittedBy field is missing' };
    }
    
    if (bookingData.submittedBy !== userId) {
      return { success: false, error: 'You can only delete your own bookings' };
    }
    
    await deleteDoc(bookingRef);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting tour booking:', error);
    
    // Provide more specific error messages
    if (error?.code === 'permission-denied') {
      return { success: false, error: 'Permission denied. You can only delete your own bookings. Please ensure Firestore rules are deployed.' };
    }
    if (error?.code === 'not-found') {
      return { success: false, error: 'Tour booking not found. It may have already been deleted.' };
    }
    
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred while deleting booking' };
  }
};

// Cancel Tour Booking with Reason (for confirmed bookings)
export const cancelTourBooking = async (
  bookingId: string, 
  cancellationReason: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { doc, updateDoc, getDoc } = await import('firebase/firestore');
    const bookingRef = doc(db, 'tour_bookings', bookingId);
    
    // Check if booking exists
    const bookingDoc = await getDoc(bookingRef);
    if (!bookingDoc.exists()) {
      return { success: false, error: 'Tour booking not found' };
    }
    
    const bookingData = bookingDoc.data() as TourBookingData;
    if (bookingData.status === 'completed' || bookingData.status === 'cancelled') {
      return { success: false, error: 'Cannot cancel a completed or already cancelled booking' };
    }
    
    await updateDoc(bookingRef, {
      status: 'cancelled' as const,
      cancellationReason: cancellationReason,
      cancelledAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error cancelling tour booking:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Update Application Status
export const updateApplicationStatus = async (applicationId: string, status: ApplicationData['status']) => {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    const applicationRef = doc(db, 'applications', applicationId);
    await updateDoc(applicationRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating application status:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
