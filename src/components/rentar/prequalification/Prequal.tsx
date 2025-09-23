import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/Button";
import { Card, CardContent } from "../../ui/card";
import { Input } from "../../ui/input";
import { Label } from "../../ui/lable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import { Checkbox } from "../../ui/checkbox";
import { savePrequalData } from "../shared/utils";

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
      savePrequalData(data);
      navigate('/renter/results');
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
      message: "Hey! I'm Addy with RentWise. I'm here to help you find your perfect rental. What's your first name?",
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
          <div className="flex gap-2">
            <Input
              type={currentStepData.type === 'email' ? 'email' : currentStepData.type === 'tel' ? 'tel' : 'text'}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleInputSubmit()}
              placeholder={currentStepData.type === 'email' ? 'your@email.com' : currentStepData.type === 'tel' ? '(555) 123-4567' : 'Type your answer...'}
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleInputSubmit} disabled={!currentInput.trim()}>
              Send
            </Button>
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="Tell me what you're looking for..."
              className="min-h-20"
              autoFocus
            />
            <Button onClick={handleInputSubmit} disabled={!currentInput.trim()} className="w-full">
              Send
            </Button>
          </div>
        );

      case 'boolean':
        return (
          <div className="flex gap-2">
            <Button onClick={() => handleSelectChange(currentStepData.field!, true)} className="flex-1">
              Yes
            </Button>
            <Button onClick={() => handleSelectChange(currentStepData.field!, false)} variant="outline" className="flex-1">
              No
            </Button>
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            {currentStepData.options?.map((option) => (
              <Button
                key={option.value}
                onClick={() => handleSelectChange(currentStepData.field!, option.value)}
                variant="outline"
                className="w-full justify-start"
              >
                {option.label}
              </Button>
            ))}
          </div>
        );

      case 'consent':
        return (
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={data.consent}
                onCheckedChange={(checked) => setData(prev => ({ ...prev, consent: !!checked }))}
              />
              <Label htmlFor="consent" className="text-sm leading-relaxed">
                I agree to receive rental matches and communications from RentWise. I understand this is not a hard credit check and I can opt out anytime.
              </Label>
            </div>
            <Button 
              onClick={handleNext} 
              disabled={!data.consent}
              className="w-full"
            >
              I Agree
            </Button>
          </div>
        );

      case 'finish':
        return (
          <Button onClick={handleNext} className="w-full bg-gradient-to-r from-primary to-primary-foreground">
            Finish Prequalification
          </Button>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-primary-foreground font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">RentWise Prequalification</h1>
          <p className="text-muted-foreground">Let Addy help you find your perfect rental</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Chat Container */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Addy's Message */}
            <div className="flex gap-3 mb-6">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm text-primary-foreground font-bold">A</span>
              </div>
              <div className="flex-1">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-foreground">{currentStepData.message}</p>
                </div>
              </div>
            </div>

            {/* User's Previous Response */}
            {!showInput && currentStepData.field && data[currentStepData.field] && (
              <div className="flex gap-3 mb-6 justify-end">
                <div className="flex-1 max-w-xs">
                  <div className="bg-primary rounded-lg p-4">
                    <p className="text-primary-foreground">
                      {typeof data[currentStepData.field] === 'boolean' 
                        ? (data[currentStepData.field] ? 'Yes' : 'No')
                        : String(data[currentStepData.field])
                      }
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold">You</span>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="space-y-4">
              {renderInput()}
            </div>
          </CardContent>
        </Card>

        {/* Trust Copy */}
        <div className="text-center space-y-2 mb-6">
          <p className="text-sm text-muted-foreground">
            🔒 <strong>No hard credit checks.</strong> You're in control.
          </p>
          <p className="text-xs text-muted-foreground">
            We only share your information with landlords you choose to connect with.
          </p>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrequalPage;