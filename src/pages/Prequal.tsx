import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  ArrowRight, 
  MessageCircle, 
  User, 
  Check,
  ChevronLeft
} from "lucide-react";

interface PrequalData {
  firstName: string;
  lookingFor: string;
  hasPets: boolean;
  petName?: string;
  adults: string;
  kids: string;
  incomeRange: string;
  creditBand: string;
  hasVoucher: boolean;
  email: string;
  phone: string;
  consent: boolean;
}

const PrequalPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<PrequalData>({
    firstName: "",
    lookingFor: "",
    hasPets: false,
    petName: "",
    adults: "",
    kids: "",
    incomeRange: "",
    creditBand: "",
    hasVoucher: false,
    email: "",
    phone: "",
    consent: false,
  });

  const [currentInput, setCurrentInput] = useState("");
  const [showInput, setShowInput] = useState(true);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentInput("");
      setShowInput(true);
    } else {
      // Save data and navigate to results
      localStorage.setItem('prequalData', JSON.stringify(data));
      navigate('/');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowInput(true);
    }
  };

  const handleInputSubmit = () => {
    const step = steps[currentStep];
    if (step.field && currentInput.trim()) {
      setData(prev => ({ ...prev, [step.field!]: currentInput.trim() }));
      setShowInput(false);
      setTimeout(() => handleNext(), 1000);
    }
  };

  const handleSelectChange = (field: keyof PrequalData, value: string | boolean) => {
    setData(prev => ({ ...prev, [field]: value }));
    setShowInput(false);
    setTimeout(() => handleNext(), 1000);
  };

  const steps = [
    {
      id: 'intro',
      message: "Hey! I'm Addy with Rent My Place. I'm here to help you find your perfect rental. What's your first name?",
      field: 'firstName' as keyof PrequalData,
      type: 'text'
    },
    {
      id: 'looking-for',
      message: `Nice to meet you, ${data.firstName}! What are you looking for in your next place? Feel free to mention bedrooms, budget, neighborhood, pets, or anything else that's important to you.`,
      field: 'lookingFor' as keyof PrequalData,
      type: 'textarea'
    },
    {
      id: 'pets-question',
      message: `Got it, ${data.firstName}! Do you have any pets that will be living with you?`,
      field: 'hasPets' as keyof PrequalData,
      type: 'boolean'
    },
    ...(data.hasPets ? [{
      id: 'pet-name',
      message: "What's your pet's name? I'd love to know!",
      field: 'petName' as keyof PrequalData,
      type: 'text'
    }] : []),
    {
      id: 'adults',
      message: data.hasPets && data.petName 
        ? `Awesome! ${data.petName} sounds lovely. How many adults will be living in the home?`
        : `Perfect! How many adults will be living in the home?`,
      field: 'adults' as keyof PrequalData,
      type: 'select',
      options: [
        { value: '1', label: '1 adult' },
        { value: '2', label: '2 adults' },
        { value: '3', label: '3 adults' },
        { value: '4+', label: '4+ adults' }
      ]
    },
    {
      id: 'kids',
      message: "And how many children?",
      field: 'kids' as keyof PrequalData,
      type: 'select',
      options: [
        { value: '0', label: 'No children' },
        { value: '1', label: '1 child' },
        { value: '2', label: '2 children' },
        { value: '3', label: '3 children' },
        { value: '4+', label: '4+ children' }
      ]
    },
    {
      id: 'income',
      message: `Thanks ${data.firstName}! What's your household income range? This helps me find places you'll qualify for.`,
      field: 'incomeRange' as keyof PrequalData,
      type: 'select',
      options: [
        { value: 'under-30k', label: 'Under $30,000' },
        { value: '30k-50k', label: '$30,000 - $50,000' },
        { value: '50k-75k', label: '$50,000 - $75,000' },
        { value: '75k-100k', label: '$75,000 - $100,000' },
        { value: '100k-150k', label: '$100,000 - $150,000' },
        { value: 'over-150k', label: 'Over $150,000' }
      ]
    },
    {
      id: 'credit',
      message: "What's your credit situation? Don't worry - no hard credit checks here!",
      field: 'creditBand' as keyof PrequalData,
      type: 'select',
      options: [
        { value: 'excellent', label: 'Excellent (750+)' },
        { value: 'good', label: 'Good (700-749)' },
        { value: 'fair', label: 'Fair (650-699)' },
        { value: 'building', label: 'Building credit (below 650)' },
        { value: 'unsure', label: 'Not sure' }
      ]
    },
    {
      id: 'voucher',
      message: "Do you have a housing voucher or rental assistance?",
      field: 'hasVoucher' as keyof PrequalData,
      type: 'boolean'
    },
    {
      id: 'email',
      message: `Almost done, ${data.firstName}! What's your email address? I'll use this to send you your matches.`,
      field: 'email' as keyof PrequalData,
      type: 'email'
    },
    {
      id: 'phone',
      message: "And your phone number? (Optional, but helpful for urgent updates)",
      field: 'phone' as keyof PrequalData,
      type: 'tel'
    },
    {
      id: 'consent',
      message: "Perfect! I need your permission to save your information and send you rental matches. You can opt out anytime.",
      field: 'consent' as keyof PrequalData,
      type: 'consent'
    },
    {
      id: 'finish',
      message: data.hasPets && data.petName 
        ? `You're all set, ${data.firstName}! I'm excited to help you and ${data.petName} find the perfect home. Ready to see your matches?`
        : `You're all set, ${data.firstName}! I'm excited to help you find the perfect home. Ready to see your matches?`,
      type: 'finish'
    }
  ];

  const currentStepData = steps[currentStep];

  const renderInput = () => {
    if (!showInput) return null;

    switch (currentStepData.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <input
              type={currentStepData.type === 'email' ? 'email' : currentStepData.type === 'tel' ? 'tel' : 'text'}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
              placeholder={
                currentStepData.type === 'email' ? 'your@email.com' : 
                currentStepData.type === 'tel' ? '(555) 123-4567' : 
                'Type your answer...'
              }
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200"
              autoFocus
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleInputSubmit}
              disabled={!currentInput.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        );

      case 'textarea':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Tell me what you're looking for..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/70 backdrop-blur-sm transition-all duration-200 min-h-24 resize-none"
              autoFocus
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInputSubmit}
              disabled={!currentInput.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Continue
            </motion.button>
          </motion.div>
        );

      case 'boolean':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectChange(currentStepData.field!, true)}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              Yes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectChange(currentStepData.field!, false)}
              className="flex-1 px-6 py-4 bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-white transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              No
            </motion.button>
          </motion.div>
        );

      case 'select':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {currentStepData.options?.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectChange(currentStepData.field!, option.value)}
                className="w-full px-6 py-4 bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 rounded-xl hover:bg-white hover:border-blue-300 transition-all duration-200 font-medium shadow-lg hover:shadow-xl text-left"
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        );

      case 'consent':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-blue-50/80 backdrop-blur-sm rounded-xl p-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={data.consent}
                  onChange={(e) => setData(prev => ({ ...prev, consent: e.target.checked }))}
                  className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="consent" className="text-sm leading-relaxed text-gray-700">
                  I agree to receive rental matches and communications from Rent My Place. I understand this is not a hard credit check and I can opt out anytime.
                </label>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              disabled={!data.consent}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              I Agree & Continue
            </motion.button>
          </motion.div>
        );

      case 'finish':
        return (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl text-lg"
          >
            <div className="flex items-center justify-center">
              <Check className="h-6 w-6 mr-2" />
              Complete Prequalification
            </div>
          </motion.button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-xl">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Find Your Perfect Home
          </h1>
          <p className="text-xl text-gray-600">
            Let Addy help you discover rental properties that match your needs
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm font-medium text-blue-600">
                {currentStep + 1} of {steps.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full shadow-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Chat Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="p-6 sm:p-8">
            {/* Addy's Message */}
            <div className="flex gap-4 mb-8">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-sm border border-blue-100">
                  <motion.p
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gray-800 text-lg leading-relaxed"
                  >
                    {currentStepData.message}
                  </motion.p>
                </div>
              </div>
            </div>

            {/* User's Previous Response */}
            <AnimatePresence>
              {!showInput && currentStepData.field && data[currentStepData.field] && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 mb-8 justify-end"
                >
                  <div className="flex-1 max-w-sm">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 shadow-lg">
                      <p className="text-white font-medium">
                        {typeof data[currentStepData.field] === 'boolean' 
                          ? (data[currentStepData.field] ? 'Yes' : 'No')
                          : String(data[currentStepData.field])
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-gray-600">You</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="space-y-4">
              {renderInput()}
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          {currentStep > 0 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="flex items-center px-6 py-3 text-gray-600 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-200 font-medium shadow-lg hover:shadow-xl border border-gray-200"
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="flex items-center px-6 py-3 text-gray-600 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white transition-all duration-200 font-medium shadow-lg hover:shadow-xl border border-gray-200"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Home
            </motion.button>
          )}

          {/* Trust Indicators */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span>No Credit Check</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Copy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 space-y-2"
        >
          <p className="text-sm text-gray-600 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 inline-block shadow-sm">
            🔒 <strong>Your information is secure.</strong> We only share details with landlords you choose to connect with.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PrequalPage;