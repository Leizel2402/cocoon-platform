import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import { UserPlus, Eye, EyeOff, Home, ArrowRight, User, Building, Search, Wrench } from 'lucide-react';
import { UserRole } from '../../types';
import { useToast } from '../../hooks/use-toast';

export function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('prospect');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  // Redirect if already logged in
  // useEffect(() => {
  //   if (user) {
  //     // Redirect based on role
  //     switch (user.role) {
  //       case 'landlord_admin':
  //       case 'landlord_employee':
  //         navigate('/property-management', { replace: true });
  //         break;
  //       case 'cocoon_admin':
  //       case 'cocoon_employee':
  //         navigate('/cocoon-dashboard', { replace: true });
  //         break;
  //       case 'renter':
  //         navigate('/portal', { replace: true });
  //         break;
  //       case 'prospect':
  //         navigate('/property', { replace: true });
  //         break;
  //       default:
  //         navigate('/', { replace: true });
  //     }
  //   }
  // }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Debug logging (disabled)
    // console.log('SignUp form data:', {
    //   email,
    //   password: password ? '***' : 'EMPTY',
    //   displayName,
    //   role,
    //   phone
    // });

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, displayName, role, phone);
      
      // Redirect to home page after successful signup
      // navigate('/', { replace: true });

      // COMMENTED OUT FOR TESTING: Email verification toast
      // toast({
      //   title: "Verification link sent!",
      //   description: "Please check your email for the verification link.",
      // });
 
      // TESTING: Direct redirect to signin after signup
      toast({
        title: "Account created successfully!",
        description: "Welcome to Cocoon!",
      });
      
      // Redirect to signin after a short delay
      setTimeout(() => {
        navigate("/signin", { replace: true });
      }, 2000);
    } catch (error: unknown) {
      console.error('SignUp error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-700 flex flex-col justify-center py-4 sm:py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Back to Home */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          to="/"
          className="flex items-center text-white/80 hover:text-white transition-colors group"
        >
          <Home className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          <span className="font-medium text-sm sm:text-base">Back to Home</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="text-center mb-4 sm:mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-2xl"
          >
            <UserPlus className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </motion.div>
          {/* <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4">
            Join Cocoon
          </h2> */}
          <p className="text-base sm:text-lg lg:text-xl text-white/80">
            Create your account to get started
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-2 sm:mt-4 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-md py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 shadow-2xl sm:rounded-3xl border border-white/20 ">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm text-sm"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm text-sm"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRole('prospect')}
                  className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                    role === 'prospect'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Search className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <span className="text-xs font-medium block truncate">Prospect</span>
                    <span className="text-xs text-gray-500 truncate">Looking for rentals</span>
                  </div>
                </motion.button>
                
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRole('renter')}
                  className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                    role === 'renter'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <User className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <span className="text-xs font-medium block truncate">Renter</span>
                    <span className="text-xs text-gray-500 truncate">Currently renting</span>
                  </div>
                </motion.button>
                
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRole('landlord_admin')}
                  className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                    role === 'landlord_admin'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <span className="text-xs font-medium block truncate">Landlord</span>
                    <span className="text-xs text-gray-500 truncate">Property owner</span>
                  </div>
                </motion.button>
                
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRole('cocoon_employee')}
                  className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                    role === 'cocoon_employee'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Wrench className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <span className="text-xs font-medium block truncate">Cocoon Staff</span>
                    <span className="text-xs text-gray-500 truncate">Platform employee</span>
                  </div>
                </motion.button>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
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
                className="appearance-none block w-full px-3 py-2.5 border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 backdrop-blur-sm text-sm"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </motion.button>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs sm:text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/signin"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}