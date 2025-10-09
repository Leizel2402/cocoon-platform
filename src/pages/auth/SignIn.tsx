import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { Mail, Home, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { isSignInWithEmailLink } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { QuotaExceededFallback } from '../../components/QuotaExceededFallback';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  const { sendMagicLink, verifyMagicLink, user } = useAuth();
  const navigate = useNavigate();

  // Role-based redirect function
  // const redirectUserByRole = useCallback((userRole: string) => {
  //   switch (userRole) {
  //     case 'prospect':
  //       navigate('/property', { replace: true });
  //       break;
  //     case 'renter':
  //       navigate('/portal', { replace: true });
  //       break;
  //     case 'landlord_admin':
  //     case 'landlord_employee':
  //       navigate('/landlord-dashboard', { replace: true });
  //       break;
  //     case 'cocoon_admin':
  //     case 'cocoon_employee':
  //       navigate('/cocoon-dashboard', { replace: true });
  //       break;
  //     default:
  //       navigate('/', { replace: true });
  //   }
  // }, [navigate]);

  const handleMagicLinkVerification = useCallback(async () => {
    try {
      const savedEmail = localStorage.getItem('emailForSignIn');
      console.log('Starting magic link verification:', { savedEmail });
      
      await verifyMagicLink(savedEmail || '');
      console.log('Magic link verification successful');
      
      // Clean up URL after successful verification
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // The navigation will be handled by useEffect above when user state updates
    } catch (error: unknown) {
      console.error('Magic link verification failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      setError(errorMessage);
      setIsVerifying(false);
      
      // Clean up URL on error too
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [verifyMagicLink]);

  // Enhanced magic link detection
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasOobCode = urlParams.has('oobCode');
    const hasApiKey = urlParams.has('apiKey');
    const mode = urlParams.get('mode');
    
    // Check multiple conditions for magic link
    const isMagicLink = isSignInWithEmailLink(auth, window.location.href) || 
                       (hasOobCode && hasApiKey && mode === 'signIn');
    
    console.log('Magic link detection:', {
      currentUrl: window.location.href,
      isMagicLink,
      hasOobCode,
      hasApiKey,
      mode,
      searchParams: window.location.search
    });
    
    if (isMagicLink) {
      setIsVerifying(true);
      handleMagicLinkVerification();
    }
  }, [handleMagicLinkVerification]);


  // Updated redirect effect for logged in users
  // useEffect(() => {
  //   if (user && !isVerifying) {
  //     console.log('User logged in, redirecting based on role:', user.role);
  //     redirectUserByRole(user.role);
  //   }
  // }, [user, navigate, isVerifying, redirectUserByRole]);


  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError('');
  //   setLoading(true);
  //   setQuotaExceeded(false);

  //   try {
  //     await sendMagicLink(email);
  //     setEmailSent(true);
  //   } catch (error: unknown) {
  //     console.error('Magic link error:', error);
  //     const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
  //     // Check if it's a quota exceeded error
  //     if (errorMessage.includes('quota') || errorMessage.includes('QUOTA_EXCEEDED')) {
  //       setQuotaExceeded(true);
  //     } else {
  //       setError(errorMessage);
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  setQuotaExceeded(false);

  try {
    const { auth } = await import("../../lib/firebase");


    const currentUser = auth.currentUser;
    if (currentUser) {
      await currentUser.reload();
    }

    
    if (
      currentUser &&
      currentUser.email === email &&
      !currentUser.emailVerified
    ) {
      throw new Error(
        "Please verify your email address before logging in. Check your inbox for a verification email."
      );
    }

    

    await sendMagicLink(email);
    setEmailSent(true);
  } catch (error: unknown) {
    console.error("Magic link error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An error occurred";

    // Quota check
    if (
      errorMessage.includes("quota") ||
      errorMessage.includes("QUOTA_EXCEEDED")
    ) {
      setQuotaExceeded(true);
    } else {
      setError(errorMessage);
    }
  } finally {
    setLoading(false);
  }
};

  const handleRetry = () => {
    setQuotaExceeded(false);
    setError('');
  };

  const handleContactSupport = () => {
    // You can implement contact support functionality here
    window.open('mailto:support@cocoon.com?subject=Magic Link Quota Exceeded', '_blank');
  };

  if (quotaExceeded) {
    return <QuotaExceededFallback onRetry={handleRetry} onContactSupport={handleContactSupport} />;
  }

  if (isVerifying) {
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
              Please wait while we verify your magic link...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (emailSent) {
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
              className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle className="h-10 w-10 text-green-600" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              If an account exists with <strong>{email}</strong>, you'll receive a magic link shortly.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Click the link in your email to sign in. The link will expire in 1 hour.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="w-full py-3 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Send to Different Email
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
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
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-2xl"
          >
            <Mail className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Sign In
          </h2>
          <p className="text-xl text-white/80">
            Enter your email to receive a magic link
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-md py-10 px-8 shadow-2xl sm:rounded-3xl border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending magic link...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Send Magic Link
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </motion.button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}