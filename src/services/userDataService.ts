import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Debug function to inspect Firebase collections
export const debugFirebaseCollections = async (userId: string) => {
  
  const collections = ['applications', 'user_applications', 'rent_payments', 'user_subscriptions', 'maintenance_requests', 'user_messages', 'user_leases'];
  
  for (const collectionName of collections) {
    try {
      const q = query(collection(db, collectionName), limit(5));
      const snapshot = await getDocs(q);
      
      
      if (snapshot.docs.length > 0) {
        
        
        // Check if any document contains our user ID
        const userFound = snapshot.docs.some(doc => {
          const data = doc.data();
          return JSON.stringify(data).includes(userId);
        });
        
        if (userFound) {
          snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            if (JSON.stringify(data).includes(userId)) {
              console.log(`   📄 Document ${index + 1} with user data:`, data);
            }
          });
        } else {
          console.log(`   ❌ No documents found containing user ID: ${userId}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Error accessing collection ${collectionName}:`, error);
    }
  }
};

// User-specific data interfaces
export interface RentPayment {
  id: string;
  amount: number;
  dueDate: Date;
  status: 'due' | 'paid' | 'overdue';
  property: string;
  propertyId: string;
  unitId?: string;
  unitNumber?: string;
}

export interface UserSubscription {
  id: string;
  name: string;
  type: 'parking' | 'amenities' | 'utilities' | 'other';
  price: number;
  status: 'active' | 'inactive' | 'cancelled';
  nextBilling: Date;
  propertyId: string;
  unitId?: string;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: Date;
  propertyId: string;
  unitId?: string;
  unitNumber?: string;
}

export interface UserMessage {
  id: string;
  from: string;
  subject: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  isUrgent: boolean;
  propertyId?: string;
}

export interface UserApplication {
  id: string;
  propertyId: string;
  propertyName: string;
  unitId?: string;
  unitNumber?: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
  submittedAt: Date | string;
  appFeeCents: number;
  landlordId?: string;
}

export interface UserProperty {
  id: string;
  name: string;
  address: string;
  unitId?: string;
  unitNumber?: string;
  rent: number;
  leaseStart: Date;
  leaseEnd: Date;
  status: 'active' | 'expired' | 'terminated';
}

// Fetch user's rent payments
export const getUserRentPayments = async (userId: string): Promise<RentPayment[]> => {
  try {
    const q = query(
      collection(db, 'rent_payments'),
      where('userId', '==', userId),
      orderBy('dueDate', 'desc'),
      limit(12) // Last 12 payments
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        amount: data.amount || 0,
        dueDate: data.dueDate?.toDate() || new Date(),
        status: data.status || 'due',
        property: data.property || 'Unknown Property',
        propertyId: data.propertyId || '',
        unitId: data.unitId,
        unitNumber: data.unitNumber
      };
    });
  } catch (error) {
    console.error('Error fetching rent payments:', error);
    return [];
  }
};

// Fetch user's subscriptions
export const getUserSubscriptions = async (userId: string): Promise<UserSubscription[]> => {
  try {
    const q = query(
      collection(db, 'user_subscriptions'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('nextBilling', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Unknown Service',
        type: data.type || 'other',
        price: data.price || 0,
        status: data.status || 'active',
        nextBilling: data.nextBilling?.toDate() || new Date(),
        propertyId: data.propertyId || '',
        unitId: data.unitId
      };
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return [];
  }
};

// Fetch user's maintenance requests
export const getUserMaintenanceRequests = async (userId: string): Promise<MaintenanceRequest[]> => {
  try {
    const q = query(
      collection(db, 'maintenance_requests'),
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || 'Maintenance Request',
        description: data.description,
        status: data.status || 'open',
        priority: data.priority || 'medium',
        submittedAt: data.submittedAt?.toDate() || new Date(),
        propertyId: data.propertyId || '',
        unitId: data.unitId,
        unitNumber: data.unitNumber
      };
    });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    return [];
  }
};

// Fetch user's messages
export const getUserMessages = async (userId: string): Promise<UserMessage[]> => {
  try {
    const q = query(
      collection(db, 'user_messages'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        from: data.from || 'Unknown Sender',
        subject: data.subject || 'No Subject',
        message: data.message || '',
        timestamp: data.timestamp?.toDate() || new Date(),
        isRead: data.isRead || false,
        isUrgent: data.isUrgent || false,
        propertyId: data.propertyId
      };
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

// Fetch user's applications
export const getUserApplications = async (userId: string): Promise<UserApplication[]> => {
  try {
    
    const queries = [
    
      query(
        collection(db, 'applications'),
        where('applicationMetadata.submittedBy', '==', userId),
        orderBy('submittedAt', 'desc'),
        limit(10)
      ),
      
    ];

    let applications: UserApplication[] = [];
    
    for (let i = 0; i < queries.length; i++) {
      try {
        const querySnapshot = await getDocs(queries[i]);
        
        if (querySnapshot.docs.length > 0) {
          
          applications = querySnapshot.docs.map(doc => {
            const data = doc.data();
            
            // Handle different data structures
            const isNested = data.applicationMetadata;
            const baseData = isNested ? data.applicationMetadata : data;
            
            // Handle submittedAt - could be Firestore Timestamp, Date, or string
            let submittedAt: Date | string;
            if (data.submittedAt?.toDate) {
              // Firestore Timestamp
              submittedAt = data.submittedAt.toDate();
            } else if (baseData.submittedAt?.toDate) {
              // Nested Firestore Timestamp
              submittedAt = baseData.submittedAt.toDate();
            } else if (data.submittedAt instanceof Date) {
              // Already a Date object
              submittedAt = data.submittedAt;
            } else if (baseData.submittedAt instanceof Date) {
              // Nested Date object
              submittedAt = baseData.submittedAt;
            } else if (typeof data.submittedAt === 'string') {
              // ISO string
              submittedAt = data.submittedAt;
            } else if (typeof baseData.submittedAt === 'string') {
              // Nested ISO string
              submittedAt = baseData.submittedAt;
            } else {
              // Fallback to current date
              submittedAt = new Date();
            }

            return {
              id: doc.id,
              propertyId: baseData.propertyId || data.propertyId || '',
              propertyName: baseData.propertyName || data.propertyName || 'Unknown Property',
              unitId: baseData.unitId || data.unitId,
              unitNumber: baseData.unitNumber || data.unitNumber,
              status: data.status || baseData.status || 'pending',
              submittedAt: submittedAt,
              appFeeCents: data.appFeeCents || baseData.appFeeCents || 0,
              landlordId: baseData.landlordId || data.landlordId
            };
          });
          
          break; // Exit loop if we found data
        }
      } catch (queryError) {
        console.log(`Query ${i + 1} failed:`, queryError);
        continue; // Try next query
      }
    }
    
    return applications;
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
};

// Fetch user's approved applications for property selection
export const getUserApprovedApplications = async (userId: string): Promise<UserApplication[]> => {
  try {
    const q = query(
      collection(db, 'applications'),
      where('applicationMetadata.submittedBy', '==', userId),
      where('status', '==', 'approved')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      return {
        id: doc.id,
        propertyId: data.applicationMetadata?.propertyId || '',
        propertyName: data.applicationMetadata?.propertyName || 'Unknown Property',
        unitId: data.applicationMetadata?.unitId,
        unitNumber: data.applicationMetadata?.unitNumber,
        status: data.status || 'approved',
        submittedAt: data.submittedAt?.toDate() || new Date(),
        appFeeCents: data.appFeeCents || 0,
        landlordId: data.applicationMetadata?.landlordId || ''
      };
    });
  } catch (error) {
    console.error('Error fetching approved applications:', error);
    return [];
  }
};

// Fetch user's current property/lease information
export const getUserProperty = async (userId: string): Promise<UserProperty | null> => {
  try {
    const q = query(
      collection(db, 'user_leases'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: data.propertyId || '',
      name: data.propertyName || 'Unknown Property',
      address: data.propertyAddress || '',
      unitId: data.unitId,
      unitNumber: data.unitNumber,
      rent: data.rent || 0,
      leaseStart: data.leaseStart?.toDate() || new Date(),
      leaseEnd: data.leaseEnd?.toDate() || new Date(),
      status: data.status || 'active'
    };
  } catch (error) {
    console.error('Error fetching user property:', error);
    return null;
  }
};

// Calculate user statistics
export const calculateUserStats = async (userId: string): Promise<{
  currentRent: number;
  currentRentStatus: 'due' | 'paid' | 'overdue';
  activeSubscriptions: number;
  openMaintenanceRequests: number;
  unreadMessages: number;
  totalApplications: number;
  recentApplications: number;
}> => {
  try {
    const [rentPayments, subscriptions, maintenanceRequests, messages, applications] = await Promise.all([
      getUserRentPayments(userId),
      getUserSubscriptions(userId),
      getUserMaintenanceRequests(userId),
      getUserMessages(userId),
      getUserApplications(userId)
    ]);

    const currentRent = rentPayments.find(p => p.status === 'due')?.amount || 0;
    const currentRentStatus: 'due' | 'paid' | 'overdue' = rentPayments.find(p => p.status === 'due')?.status || 'paid';
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const openMaintenanceRequests = maintenanceRequests.filter(m => m.status === 'open').length;
    const unreadMessages = messages.filter(m => !m.isRead).length;
    const totalApplications = applications.length;
    const recentApplications = applications.filter(app => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return app.submittedAt >= thirtyDaysAgo;
    }).length;

    return {
      currentRent,
      currentRentStatus,
      activeSubscriptions,
      openMaintenanceRequests,
      unreadMessages,
      totalApplications,
      recentApplications
    };
  } catch (error) {
    console.error('Error calculating user stats:', error);
    return {
      currentRent: 0,
      currentRentStatus: 'paid',
      activeSubscriptions: 0,
      openMaintenanceRequests: 0,
      unreadMessages: 0,
      totalApplications: 0,
      recentApplications: 0
    };
  }
};
