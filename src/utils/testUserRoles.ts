// Test user role access to tour submissions
import { getTourBookings, getApplications } from '../services/submissionService';

export const testUserRoleAccess = async (userRole: string, userId?: string) => {
  console.log(`🧪 Testing access for user role: ${userRole}`);
  
  try {
    // Test tour bookings access
    const tourResult = await getTourBookings(userId);
    console.log('Tour bookings access:', tourResult.success ? '✅ Allowed' : '❌ Denied');
    
    if (tourResult.success) {
      console.log(`Found ${tourResult.data.length} tour bookings`);
      tourResult.data.forEach((booking, index) => {
        console.log(`Tour ${index + 1}:`, {
          name: `${booking.firstName} ${booking.lastName}`,
          email: booking.email,
          property: booking.propertyName,
          status: booking.status,
          date: booking.preferredDate
        });
      });
    }
    
    // Test applications access
    const appResult = await getApplications(userId);
    console.log('Applications access:', appResult.success ? '✅ Allowed' : '❌ Denied');
    
    if (appResult.success) {
      console.log(`Found ${appResult.data.length} applications`);
    }
    
    return {
      userRole,
      tourAccess: tourResult.success,
      applicationAccess: appResult.success,
      tourCount: tourResult.data?.length || 0,
      applicationCount: appResult.data?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Error testing user role access:', error);
    return {
      userRole,
      error: error.message
    };
  }
};

// Test all user roles
export const testAllUserRoles = async () => {
  const roles = ['landlord', 'staff', 'employee', 'prospect', 'renter'];
  
  console.log('🧪 Testing access for all user roles...');
  
  for (const role of roles) {
    console.log(`\n--- Testing ${role} role ---`);
    await testUserRoleAccess(role);
  }
};

// Add to window for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testUserRoles = testUserRoleAccess;
  (window as any).testAllRoles = testAllUserRoles;
}
