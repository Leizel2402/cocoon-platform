import React from 'react';
import { PropertyFormStep } from '../../types/propertyForm';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/card';
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Building, Home, List, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

interface PropertyFormStepperProps {
  currentStep: PropertyFormStep;
  onStepChange: (step: PropertyFormStep) => void;
  steps: {
    property: { completed: boolean; valid: boolean };
    units: { completed: boolean; valid: boolean };
    listings: { completed: boolean; valid: boolean };
    review: { completed: boolean; valid: boolean };
  };
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isSubmitting?: boolean;
}

const PropertyFormStepper: React.FC<PropertyFormStepperProps> = ({
  currentStep,
  onStepChange,
  steps,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isSubmitting = false
}) => {
  const stepConfig = [
    {
      id: 'property' as PropertyFormStep,
      title: 'Property Info',
      description: 'Basic property information',
      icon: Home
    },
    {
      id: 'units' as PropertyFormStep,
      title: 'Units',
      description: 'Add property units',
      icon: Building
    },
    {
      id: 'listings' as PropertyFormStep,
      title: 'Listings',
      description: 'Create public listings',
      icon: List
    },
    {
      id: 'review' as PropertyFormStep,
      title: 'Review',
      description: 'Review and submit',
      icon: CheckSquare
    }
  ];

  const getStepStatus = (stepId: PropertyFormStep) => {
    if (steps[stepId].completed) return 'completed';
    if (currentStep === stepId) return 'current';
    return 'upcoming';
  };

  const getStepIcon = (stepId: PropertyFormStep) => {
    const status = getStepStatus(stepId);
    const step = stepConfig.find(s => s.id === stepId);
    const IconComponent = step?.icon || Circle;
    
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (status === 'current') {
      return <IconComponent className="h-5 w-5 text-green-600" />;
    }
    return <IconComponent className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Step Progress */}
      <div className="flex items-center justify-between mb-8">
        {stepConfig.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onStepChange(step.id)}
                disabled={!steps[step.id].valid && step.id !== currentStep}
                className={`flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all duration-200 ${
                  getStepStatus(step.id) === 'completed'
                    ? 'bg-green-100 border-green-600 text-green-600 shadow-sm'
                    : getStepStatus(step.id) === 'current'
                    ? 'bg-green-100 border-green-600 text-green-600 shadow-md'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                } ${!steps[step.id].valid && step.id !== currentStep ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
              >
                {getStepIcon(step.id)}
              </motion.button>
              <div className="mt-3 text-center">
                <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
              </div>
            </div>
            {index < stepConfig.length - 1 && (
              <div className={`flex-1 h-0.5 mx-6 ${
                steps[step.id].completed ? 'bg-green-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Info */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            {(() => {
              const currentStepConfig = stepConfig.find(s => s.id === currentStep);
              const IconComponent = currentStepConfig?.icon || Circle;
              return <IconComponent className="h-5 w-5 text-green-600" />;
            })()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {stepConfig.find(s => s.id === currentStep)?.title}
            </h3>
            <p className="text-sm text-gray-600">
              {stepConfig.find(s => s.id === currentStep)?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious || isSubmitting}
          className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep !== 'review' && (
            <Button
              type="button"
              onClick={onNext}
              disabled={!canGoNext || isSubmitting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700 font-medium">
            Progress: {Object.values(steps).filter(s => s.completed).length} of {Object.keys(steps).length} steps completed
          </span>
          <span className="text-green-600 font-semibold">
            {Math.round((Object.values(steps).filter(s => s.completed).length / Object.keys(steps).length) * 100)}% Complete
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(Object.values(steps).filter(s => s.completed).length / Object.keys(steps).length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PropertyFormStepper;
