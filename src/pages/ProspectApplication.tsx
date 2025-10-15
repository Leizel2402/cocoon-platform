import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Calendar,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Home,
  Briefcase,
  CreditCard,
  Shield,
  Star
} from 'lucide-react';

interface ApplicationData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  
  // Address Information
  currentAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Employment Information
  employment: {
    company: string;
    position: string;
    monthlyIncome: string;
    employmentLength: string;
  };
  
  // References
  references: Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
  }>;
  
  // Preferences
  preferences: {
    moveInDate: string;
    leaseLength: string;
    pets: boolean;
    smoking: boolean;
    specialNeeds: string;
  };
}

export function ProspectApplication() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    dateOfBirth: '',
    ssn: '',
    currentAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    employment: {
      company: '',
      position: '',
      monthlyIncome: '',
      employmentLength: ''
    },
    references: [
      { name: '', relationship: '', phone: '', email: '' },
      { name: '', relationship: '', phone: '', email: '' }
    ],
    preferences: {
      moveInDate: '',
      leaseLength: '12',
      pets: false,
      smoking: false,
      specialNeeds: ''
    }
  });

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Address', icon: MapPin },
    { number: 3, title: 'Employment', icon: Briefcase },
    { number: 4, title: 'References', icon: FileText },
    { number: 5, title: 'Preferences', icon: Star },
    { number: 6, title: 'Review', icon: CheckCircle }
  ];

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setApplicationData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof ApplicationData],
          [child]: value
        }
      }));
    } else {
      setApplicationData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleReferenceChange = (index: number, field: string, value: string) => {
    setApplicationData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: value } : ref
      )
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // TODO: Implement application submission to Firestore
    console.log('Application data:', applicationData);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Application submitted successfully! You will receive a confirmation email shortly.');
    }, 2000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={applicationData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={applicationData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={applicationData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="john@example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={applicationData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={applicationData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Security Number *
              </label>
              <input
                type="text"
                value={applicationData.ssn}
                onChange={(e) => handleInputChange('ssn', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="XXX-XX-XXXX"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Current Address</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={applicationData.currentAddress.street}
                onChange={(e) => handleInputChange('currentAddress.street', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={applicationData.currentAddress.city}
                  onChange={(e) => handleInputChange('currentAddress.city', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="San Francisco"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={applicationData.currentAddress.state}
                  onChange={(e) => handleInputChange('currentAddress.state', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="CA"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={applicationData.currentAddress.zipCode}
                  onChange={(e) => handleInputChange('currentAddress.zipCode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="94102"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Employment Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={applicationData.employment.company}
                  onChange={(e) => handleInputChange('employment.company', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Acme Corporation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position *
                </label>
                <input
                  type="text"
                  value={applicationData.employment.position}
                  onChange={(e) => handleInputChange('employment.position', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Income *
                </label>
                <input
                  type="number"
                  value={applicationData.employment.monthlyIncome}
                  onChange={(e) => handleInputChange('employment.monthlyIncome', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Length *
                </label>
                <select
                  value={applicationData.employment.employmentLength}
                  onChange={(e) => handleInputChange('employment.employmentLength', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select length</option>
                  <option value="0-6 months">0-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="2-5 years">2-5 years</option>
                  <option value="5+ years">5+ years</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">References</h3>
            <p className="text-gray-600 mb-6">Please provide at least 2 personal or professional references.</p>
            
            {applicationData.references.map((reference, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Reference {index + 1}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={reference.name}
                      onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Jane Smith"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship *
                    </label>
                    <input
                      type="text"
                      value={reference.relationship}
                      onChange={(e) => handleReferenceChange(index, 'relationship', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Friend, Colleague, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={reference.phone}
                      onChange={(e) => handleReferenceChange(index, 'phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={reference.email}
                      onChange={(e) => handleReferenceChange(index, 'email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Preferences & Requirements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Move-in Date *
                </label>
                <input
                  type="date"
                  value={applicationData.preferences.moveInDate}
                  onChange={(e) => handleInputChange('preferences.moveInDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lease Length Preference *
                </label>
                <select
                  value={applicationData.preferences.leaseLength}
                  onChange={(e) => handleInputChange('preferences.leaseLength', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="6">6 months</option>
                  <option value="12">12 months</option>
                  <option value="18">18 months</option>
                  <option value="24">24 months</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pets"
                  checked={applicationData.preferences.pets}
                  onChange={(e) => handleInputChange('preferences.pets', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="pets" className="ml-2 text-sm text-gray-700">
                  I have pets
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smoking"
                  checked={applicationData.preferences.smoking}
                  onChange={(e) => handleInputChange('preferences.smoking', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="smoking" className="ml-2 text-sm text-gray-700">
                  I am a smoker
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Needs or Requirements
              </label>
              <textarea
                value={applicationData.preferences.specialNeeds}
                onChange={(e) => handleInputChange('preferences.specialNeeds', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Any special accommodations or requirements..."
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Review Your Application</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                <p className="text-gray-600">
                  {applicationData.firstName} {applicationData.lastName}
                </p>
                <p className="text-gray-600">{applicationData.email}</p>
                <p className="text-gray-600">{applicationData.phone}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Current Address</h4>
                <p className="text-gray-600">
                  {applicationData.currentAddress.street}, {applicationData.currentAddress.city}, {applicationData.currentAddress.state} {applicationData.currentAddress.zipCode}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Employment</h4>
                <p className="text-gray-600">
                  {applicationData.employment.position} at {applicationData.employment.company}
                </p>
                <p className="text-gray-600">Monthly Income: ${applicationData.employment.monthlyIncome}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Preferences</h4>
                <p className="text-gray-600">
                  Move-in Date: {applicationData.preferences.moveInDate}
                </p>
                <p className="text-gray-600">
                  Lease Length: {applicationData.preferences.leaseLength} months
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Privacy & Security</h4>
                  <p className="text-sm text-blue-700">
                    Your personal information is encrypted and stored securely. We only share your information with verified landlords for rental applications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg shadow-lg mr-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Rental Application
                </h1>
                <p className="text-gray-600 text-lg">
                  Complete your application to get prequalified
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-white/20"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.number ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20"
        >
          {renderStepContent()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Previous
            </button>

            <div className="flex items-center gap-4">
              {currentStep < steps.length ? (
                <button
                  onClick={nextStep}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Next
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <CheckCircle className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
