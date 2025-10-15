import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Mail, Lock, ArrowRight } from 'lucide-react';

interface QuotaExceededFallbackProps {
  onRetry: () => void;
  onContactSupport: () => void;
}

export function QuotaExceededFallback({ onRetry, onContactSupport }: QuotaExceededFallbackProps) {
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-10 px-8 shadow-2xl sm:rounded-3xl border border-red-200">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6"
            >
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Service Temporarily Unavailable
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              We've reached our daily limit for magic link requests. This is a temporary issue.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={onRetry}
                className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors group"
              >
                <Mail className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Try Magic Link Again
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => setShowContact(!showContact)}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </button>
            </div>

            {showContact && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="mt-6 p-4 bg-gray-50 rounded-lg"
              >
                <h3 className="font-semibold text-gray-900 mb-2">Contact Information:</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Email: support@rental.com
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Phone: (555) 123-4567
                </p>
                <p className="text-sm text-gray-500">
                  We'll resolve this issue as soon as possible.
                </p>
              </motion.div>
            )}

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">What's happening?</h3>
              <p className="text-sm text-blue-800">
                Our authentication service has reached its daily limit. This is a temporary restriction 
                that resets every 24 hours. We're working to increase our capacity.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
