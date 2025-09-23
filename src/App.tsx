import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DataMigration } from './components/DataMigration';
import { Home } from './pages/Home';
import { SignIn, SignUp } from './pages/auth';
import { Apply } from './pages/Apply';
import { Dashboard } from './pages/Dashboard';
import Dashboards from './pages/Dashboards';
import { MyApplications } from './pages/MyApplications';
import { UserPortal } from './pages/UserPortal';
import { PropertyManagement } from './pages/PropertyManagement';
import { Property } from './pages/Property';
import { AddyChat } from './pages/AddyChat';
import { ProspectApplication } from './pages/ProspectApplication';
// import ApplicationProcess from './Prospect/ApplicationProcess';

 
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Prospect routes */}
          <Route
            path="/prospect-dashboard"
            element={
              <ProtectedRoute requiredRole="prospect">
                <Dashboards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prequalify"
            element={
              <ProtectedRoute requiredRole="prospect">
                {/* <ApplicationProcess /> */}
                <div>Prequalification coming soon...</div>
              </ProtectedRoute>
            }
          />
          
          {/* Property routes */}
          <Route
            path="/property"
            element={<Property />}
          />
          <Route
            path="/addy-chat"
            element={
              <ProtectedRoute requiredRoles={['prospect', 'renter']}>
                <AddyChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prospect-application"
            element={
              <ProtectedRoute requiredRoles={['prospect']}>
                <ProspectApplication />
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
          
          {/* Landlord routes */}
          <Route
            path="/landlord-dashboard"
            element={
              <ProtectedRoute requiredRoles={['landlord_admin', 'landlord_employee']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/properties"
            element={
              <ProtectedRoute requiredRoles={['landlord_admin', 'landlord_employee']}>
                <PropertyManagement />
              </ProtectedRoute>
            }
          />
          
          {/* Cocoon employee routes */}
          <Route
            path="/cocoon-dashboard"
            element={
              <ProtectedRoute requiredRoles={['cocoon_admin', 'cocoon_employee']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Legacy dashboard route - redirect based on role */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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
 