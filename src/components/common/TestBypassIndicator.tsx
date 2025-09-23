import { Badge } from '../ui/badge';
import { AlertTriangle, TestTube } from 'lucide-react';
// import { useAuth } from '../../auth/services/AuthContext';

export const TestBypassIndicator = () => {
//   const { user } = useAuth();
  const devBypass = localStorage.getItem('dev_auth_bypass') === 'true';
  const authBypassEnabled = import.meta.env.VITE_AUTH_BYPASS === 'true';
  
  // Show indicator if bypass mode is enabled OR if user is in bypass session
  if (!authBypassEnabled && !devBypass) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800 px-3 py-1">
        <TestTube className="h-3 w-3 mr-1" />
        Test Bypass Mode
      </Badge>
    </div>
  );
};

export default TestBypassIndicator;