import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { Loader } from './ui/Loader';
 
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
      <Loader 
        message="Authenticating" 
        subMessage="Verifying your access permissions..."
      />
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
 