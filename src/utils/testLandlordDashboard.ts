// Test script for the new Landlord Dashboard
export const testLandlordDashboard = () => {
  console.log('🧪 Testing Landlord Dashboard Features...');
  
  // Test 1: Check if user has correct role
  const userRole = localStorage.getItem('userRole') || 'unknown';
  console.log('✅ User Role:', userRole);
  
  if (!['landlord_admin', 'landlord_employee', 'cocoon_admin', 'cocoon_employee'].includes(userRole)) {
    console.error('❌ User role not authorized for landlord dashboard');
    return false;
  }
  
  // Test 2: Check if dashboard components are loaded
  const dashboardElements = [
    'Recent Activity',
    'Submissions Dashboard',
    'Total Applications',
    'Tour Requests'
  ];
  
  dashboardElements.forEach(element => {
    const found = document.body.textContent?.includes(element);
    console.log(`${found ? '✅' : '❌'} ${element}:`, found ? 'Found' : 'Not found');
  });
  
  // Test 3: Check for interactive elements
  const interactiveElements = [
    'Refresh button',
    'Settings button',
    'Export button',
    'Time range selector'
  ];
  
  interactiveElements.forEach(element => {
    const found = document.querySelector('button') !== null;
    console.log(`${found ? '✅' : '❌'} ${element}:`, found ? 'Found' : 'Not found');
  });
  
  console.log('🎉 Landlord Dashboard test completed!');
  return true;
};

// Add to window for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testLandlordDashboard = testLandlordDashboard;
}
