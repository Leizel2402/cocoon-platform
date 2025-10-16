import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useToast } from './use-toast';

export const useScrollToTop = () => {
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const { toast } = useToast();

  // Scroll event listener to show button when reaching bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show button when user is near the bottom (within 200px)
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 200;
      
      if (isNearBottom) {
        setShowFloatingNav(true);
      } else {
        setShowFloatingNav(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Check initial position
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    // Hide the button immediately to provide feedback
    setShowFloatingNav(false);
    
    try {
      // Method 1: Modern smooth scroll (primary method)
      if (window.scrollTo) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
        return; // Exit if successful
      }
      
      // Method 2: Fallback for older browsers
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
    } catch (error) {
      console.error('Scroll error:', error);
      
      // Method 3: Emergency fallback
      try {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch (fallbackError) {
        console.error('Fallback scroll error:', fallbackError);
        
        // Show error feedback
        toast({
          title: 'Scroll Error',
          description: 'Unable to scroll to top. Please scroll manually.',
          variant: 'destructive',
        });
      }
    }
  };

  const FloatingScrollButton: React.FC = () => (
    <AnimatePresence>
      {showFloatingNav && (
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: 50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.3 
          }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="relative group">
            {/* Pulsing Ring Effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-green-500 opacity-20"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.1, 0.2]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Main Scroll to Top Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={scrollToTop}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg border-0 p-0 flex items-center justify-center transition-all duration-300"
              >
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ArrowUp className="h-6 w-6" />
                </motion.div>
              </Button>
            </motion.div>
            
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none"
            >
              Back to Top
            </motion.div>
          </div>
          
          {/* Close Button */}
          <motion.button
            onClick={() => setShowFloatingNav(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-50 hover:bg-gray-100 text-green-600 flex items-center justify-center transition-all duration-200"
          >
            <X className="h-3 w-3" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return {
    showFloatingNav,
    scrollToTop,
    FloatingScrollButton
  };
};
