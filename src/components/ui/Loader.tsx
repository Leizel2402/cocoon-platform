import { motion } from "framer-motion";

interface LoaderProps {
  message?: string;
  subMessage?: string;
  className?: string;
}

export function Loader({ 
  message = "Loading Properties", 
  subMessage = "Finding the best rental homes for you...",
  className = ""
}: LoaderProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 mx-auto mb-6"></div>
          <div
            className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-blue-600 animate-spin mx-auto"
            style={{
              animationDirection: "reverse",
              animationDuration: "1.5s",
            }}
          ></div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {message}
        </h3>
        <p className="text-gray-600">
          {subMessage}
        </p>
      </motion.div>
    </div>
  );
}
