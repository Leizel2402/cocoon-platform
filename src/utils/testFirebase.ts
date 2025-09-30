// Quick Firebase testing utilities
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('🧪 Testing Firebase connection...');
    
    // Test write
    const testDoc = await addDoc(collection(db, 'test'), {
      message: 'Firebase connection test',
      timestamp: serverTimestamp(),
      testId: Math.random().toString(36).substr(2, 9)
    });
    
    console.log('✅ Firebase write test successful:', testDoc.id);
    
    // Test read
    const snapshot = await getDocs(collection(db, 'test'));
    console.log('✅ Firebase read test successful:', snapshot.docs.length, 'documents');
    
    return { success: true, testId: testDoc.id };
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return { success: false, error: error.message };
  }
};

export const testSubmissionService = async () => {
  try {
    console.log('🧪 Testing submission service...');
    
    // Test tour booking submission
    const { submitTourBooking } = await import('../services/submissionService');
    
    const testTourData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '(555) 123-4567',
      preferredDate: new Date().toISOString().split('T')[0],
      apartmentPreferences: 'Test tour booking',
      moveInDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      propertyId: 'test-property',
      propertyName: 'Test Property',
      unitId: 'test-unit',
      unitNumber: 'A101',
      submittedBy: 'test-user-id'
    };
    
    const result = await submitTourBooking(testTourData);
    
    if (result.success) {
      console.log('✅ Tour booking submission test successful:', result.id);
    } else {
      console.error('❌ Tour booking submission test failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Submission service test failed:', error);
    return { success: false, error: error.message };
  }
};

// Add to window for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testFirebase = testFirebaseConnection;
  (window as any).testSubmissions = testSubmissionService;
}
