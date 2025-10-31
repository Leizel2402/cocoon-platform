import 'leaflet/dist/leaflet.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Layout } from './components/layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DataMigration } from './components/DataMigration';
import { Home } from './pages/Home';
import { SignIn, SignUp } from './pages/auth';
import { MagicLinkHandler } from './components/MagicLinkHandler';
import { Apply } from './pages/Apply';
import LandlordDashboard from './pages/LandlordDashboard';
import Dashboards from './pages/Dashboards';
import { MyApplications } from './pages/MyApplications';
import { UserPortal } from './pages/UserPortal';
import { PropertyManagement } from './pages/PropertyManagement';
import { AddyChat } from './pages/AddyChat';
import ApplicationProcess from './Prospect/ApplicationProcess';
import { SavedProperties } from './pages/SavedProperties';
import { SavedSearches } from './pages/SavedSearches';
import { MaintenanceRequests } from './pages/MaintenanceRequests';
import { LearningCenter } from './pages/LearningCenter';
import { Subscriptions } from './pages/Subscriptions';
import { TourBookings } from './pages/TourBookings';
import Notifications from './pages/Notifications';
import { LandlordPropertyManagement } from './landlord';

// Component to handle property details redirect
function PropertyDetailsRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/property?propertyId=${id}`} replace />;
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/magic-link-verify" element={<MagicLinkHandler />} />
          <Route path="/property" element={<Dashboards />} />
          {/* Prospect routes */}
          {/* <Route
            path="/property"
            element={
              <ProtectedRoute requiredRoles={['prospect', 'renter']}> 
                <Dashboards />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/prequalify"
            element={
              <ProtectedRoute requiredRoles={['prospect', 'renter']}>
                <ApplicationProcess 
                  isOpen={true} 
                  type="prequalify"
                  onClose={() => window.history.back()}
                />
              </ProtectedRoute>
            }
          />
          
          {/* Property details route - redirect to property page with property ID */}
          <Route
            path="/property-details/:id"
            element={<PropertyDetailsRedirect />}
          />
          <Route
            path="/addy-chat"
            element={
              <ProtectedRoute requiredRoles={['prospect', 'renter']}>
                <AddyChat />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/prospect-application"
            element={
              <ProtectedRoute requiredRoles={['prospect']}>
                <ProspectApplication />
              </ProtectedRoute>
            }
          /> */}
          
          {/* Saved Properties route */}
          <Route
            path="/saved-properties"
            element={
              <ProtectedRoute requiredRoles={['prospect', 'renter']}>
                <SavedProperties />
              </ProtectedRoute>
            }
          />
          
          {/* Saved Searches route */}
          <Route
            path="/saved-searches"
            element={
              <ProtectedRoute requiredRoles={['prospect', 'renter']}>
                <SavedSearches />
              </ProtectedRoute>
            }
          />
          
          {/* Property Comparison route */}
          <Route
            path="/property-comparison"
            element={
              <ProtectedRoute requiredRoles={['prospect', 'renter']}>
                <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
                  <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Property Comparison</h1>
                    <div className="bg-white rounded-lg p-8 shadow-lg">
                      <p className="text-gray-600 text-center py-12">
                        Compare properties side by side. This feature is coming soon!
                      </p>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          
          {/* Renter routes */}
          <Route
            path="/apply"
            element={
              <ProtectedRoute requiredRoles={['prospect', 'renter']}>
                <Apply />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-applications"
            element={
              <ProtectedRoute requiredRoles={['prospect', 'renter']}>
                <MyApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal"
            element={
              <ProtectedRoute requiredRole="renter">
                <UserPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute requiredRole="renter">
                <MaintenanceRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tour-bookings"
            element={
              <ProtectedRoute requiredRoles={['prospect', 'renter']}>
                <TourBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-center"
            element={
              <ProtectedRoute requiredRoles={['prospect', 'renter', 'landlord_admin', 'landlord_employee', 'cocoon_admin', 'cocoon_employee']}>
                <LearningCenter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <ProtectedRoute requiredRole="renter">
                <Subscriptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute requiredRoles={['prospect', 'renter', 'landlord_admin', 'landlord_employee', 'cocoon_admin', 'cocoon_employee']}>
                <Notifications />
              </ProtectedRoute>
            }
          />
          
          {/* Landlord routes */}
          {/* <Route
            path="/property-management"
            element={
              <ProtectedRoute requiredRoles={['landlord_admin', 'landlord_employee']}>
                <LandlordDashboard />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/properties"
            element={
              <ProtectedRoute requiredRoles={['landlord_admin', 'landlord_employee']}>
                <PropertyManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/property-management"
            element={
              <ProtectedRoute requiredRoles={['landlord_admin', 'landlord_employee']}>
                <LandlordPropertyManagement />
              </ProtectedRoute>
            }
          />
          
          {/* Cocoon employee routes */}
          <Route
            path="/cocoon-dashboard"
            element={
              <ProtectedRoute requiredRoles={['cocoon_admin', 'cocoon_employee']}>
                <LandlordDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Legacy dashboard route - redirect based on role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboards/>
              </ProtectedRoute>
            }
          />
          
          {/* Data Migration (temporary) */}
          <Route
            path="/migrate"
            element={
              <ProtectedRoute requiredRoles={['cocoon_admin', 'cocoon_employee']}>
                <DataMigration />
              </ProtectedRoute>
            }
          />
          
          {/* Unauthorized page */}
          <Route path="/unauthorized" element={<div>Unauthorized access</div>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
 
export default App;
 