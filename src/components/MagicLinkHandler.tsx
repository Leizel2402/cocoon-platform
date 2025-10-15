import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isSignInWithEmailLink } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function MagicLinkHandler() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');
  const { verifyMagicLink, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // Check if this is actually a magic link
        const isMagicLink = isSignInWithEmailLink(auth, window.location.href);
        console.log('Magic link detection:', {
          currentUrl: window.location.href,
          isMagicLink,
          searchParams: window.location.search
        });

        if (!isMagicLink) {
          throw new Error('Invalid magic link. Please try signing in again.');
        }

        const savedEmail = localStorage.getItem('emailForSignIn');
        console.log('Magic link verification starting...', { savedEmail });
        
        await verifyMagicLink(savedEmail || '');
        console.log('Magic link verification successful');
        setStatus('success');
        
        // Wait a moment to show success, then redirect
        setTimeout(() => {
          redirectToDashboard();
        }, 1500);
      } catch (error: any) {
        console.error('Magic link verification failed:', error);
        setError(error.message);
        setStatus('error');
      }
    };

    handleVerification();
  }, [verifyMagicLink]);

  const redirectToDashboard = () => {
    if (user) {
      console.log('Redirecting user to dashboard based on role:', user.role);
      
      switch (user.role) {
        case 'prospect':
          navigate('/property', { replace: true });
          break;
        case 'renter':
          navigate('/portal', { replace: true });
          break;
        case 'landlord_admin':
        case 'landlord_employee':
          navigate('/landlord-dashboard', { replace: true });
          break;
        case 'cocoon_admin':
        case 'cocoon_employee':
          navigate('/cocoon-dashboard', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    } else {
      // Fallback if user is not available
      navigate('/', { replace: true });
    }
  };

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        >
          <div className="bg-white/95 backdrop-blur-md py-10 px-8 shadow-2xl sm:rounded-3xl border border-white/20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Magic Link
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your magic link and sign you in...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        >
          <div className="bg-white/95 backdrop-blur-md py-10 px-8 shadow-2xl sm:rounded-3xl border border-white/20 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle className="h-10 w-10 text-green-600" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Successfully Signed In!
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Your magic link has been verified. Redirecting you to your dashboard...
            </p>
            
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Back to Home */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            to="/"
            className="flex items-center text-white/80 hover:text-white transition-colors group"
          >
            <Home className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        >
          <div className="bg-white/95 backdrop-blur-md py-10 px-8 shadow-2xl sm:rounded-3xl border border-white/20 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6"
            >
              <AlertCircle className="h-10 w-10 text-red-600" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {error.includes('An error occurred during authentication. Please try again.') ? 'Account Not Found' : 'Verification Failed'}
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {error.includes('An error occurred during authentication. Please try again.') 
                ? 'No account found with this email. Please create an account first before signing in.'
                : error || 'There was an error verifying your magic link.'
              }
            </p>
            
            <div className="space-y-4">
              {error.includes('An error occurred during authentication. Please try again.') ? (
                <Link
                  to="/signup"
                  className="block w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Account
                </Link>
              ) : (
                <Link
                  to="/signin"
                  className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Magic Link Again
                </Link>
              )}
              
              <Link
                to="/"
                className="block w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
