import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
 
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  allowGuests?: boolean;
}
 
export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredRoles, 
  allowGuests = false 
}: ProtectedRouteProps) {
  const { user, loading, hasRole, hasAnyRole } = useAuth();
 
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
 
  // If no user and guests not allowed, redirect to sign in
  if (!user && !allowGuests) {
    return <Navigate to="/signin" replace />;
  }
 
  // If user exists, check role-based access
  if (user) {
    // Check single role requirement
    if (requiredRole && !hasRole(requiredRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
    
    // Check multiple roles requirement
    if (requiredRoles && !hasAnyRole(requiredRoles)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
 
  return <>{children}</>;
}
 