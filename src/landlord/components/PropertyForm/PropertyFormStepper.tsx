import React from 'react';
import { PropertyFormStep } from '../../types/propertyForm';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/card';
import { CheckCircle, Circle, ArrowLeft, ArrowRight } from 'lucide-react';

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
      icon: '🏠'
    },
    {
      id: 'units' as PropertyFormStep,
      title: 'Units',
      description: 'Add property units',
      icon: '🏢'
    },
    {
      id: 'listings' as PropertyFormStep,
      title: 'Listings',
      description: 'Create public listings',
      icon: '📋'
    },
    {
      id: 'review' as PropertyFormStep,
      title: 'Review',
      description: 'Review and submit',
      icon: '✅'
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
    
    if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    if (status === 'current') {
      return <Circle className="h-5 w-5 text-blue-600 fill-current" />;
    }
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {/* Step Progress */}
        <div className="flex items-center justify-between mb-8">
          {stepConfig.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStepChange(step.id)}
                  disabled={!steps[step.id].valid && step.id !== currentStep}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    getStepStatus(step.id) === 'completed'
                      ? 'bg-green-100 border-green-600 text-green-600'
                      : getStepStatus(step.id) === 'current'
                      ? 'bg-blue-100 border-blue-600 text-blue-600'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  } ${!steps[step.id].valid && step.id !== currentStep ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
                >
                  {getStepIcon(step.id)}
                </button>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < stepConfig.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  steps[step.id].completed ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {stepConfig.find(s => s.id === currentStep)?.icon}
            </span>
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
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious || isSubmitting}
            className="flex items-center gap-2"
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
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-800">
              Progress: {Object.values(steps).filter(s => s.completed).length} of {Object.keys(steps).length} steps completed
            </span>
            <span className="text-blue-600">
              {Math.round((Object.values(steps).filter(s => s.completed).length / Object.keys(steps).length) * 100)}% Complete
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyFormStepper;
