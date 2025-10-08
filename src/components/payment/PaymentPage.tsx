import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/lable';
import { Checkbox } from '../../components/ui/checkbox';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CreditCard, 
  Building, 
  DollarSign, 
  Shield, 
  CheckCircle,
  Star
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface PaymentPageProps {
  totalAmount: number;
  paymentType?: 'monthly' | 'annual';
  onBack: () => void;
  onPaymentComplete: () => void;
}

const PaymentPage = ({ totalAmount, paymentType = 'monthly', onBack, onPaymentComplete }: PaymentPageProps) => {
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'form' | 'processing' | 'success' | 'failed'>('form');
  const [testingMode, setTestingMode] = useState(true); // Enable testing controls
  const [simulationChoice, setSimulationChoice] = useState<'random' | 'approve' | 'decline'>('random');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    cardholder: '',
    expiry: '',
    cvv: ''
  });

  const paymentMethods = [
    { id: 'credit-card', name: 'Credit Card', icon: '💳' },
    { id: 'debit-card', name: 'Debit Card', icon: '💳' },
    { id: 'ach', name: 'ACH', icon: '🏦' },
    { id: 'google-pay', name: 'Google Pay', icon: '🔍' },
    { id: 'apple-pay', name: 'Apple Pay', icon: '🍎' },
    { id: 'paypal', name: 'PayPal', icon: '🅿️' },
    { id: 'cash-app', name: 'Cash App', icon: '💚' },
    { id: 'bitcoin', name: 'Bitcoin', icon: '₿' }
  ];

  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method.",
        variant: "destructive"
      });
      return;
    }

    if ((selectedPaymentMethod === 'credit-card' || selectedPaymentMethod === 'debit-card') && 
        (!cardDetails.number || !cardDetails.cardholder || !cardDetails.expiry || !cardDetails.cvv)) {
      toast({
        title: "Card Details Required",
        description: "Please fill in all card details.",
        variant: "destructive"
      });
      return;
    }

    setPaymentStatus('processing');
    
    // Simulate payment processing
    setTimeout(() => {
      let isSuccess;
      
      if (simulationChoice === 'approve') {
        isSuccess = true;
      } else if (simulationChoice === 'decline') {
        isSuccess = false;
      } else {
        // Random simulation (70% success, 30% failure)
        isSuccess = Math.random() > 0.3;
      }
      
      setPaymentStatus(isSuccess ? 'success' : 'failed');
      
      // Don't auto-redirect on success, let user read the information
    }, 2000);
  };

  const resetPayment = () => {
    setPaymentStatus('form');
    setSelectedPaymentMethod('');
    setCardDetails({
      number: '',
      cardholder: '',
      expiry: '',
      cvv: ''
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <div className="sticky top-16 z-50 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6 shadow-2xl">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl"
              >
                <CreditCard className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Secure Payment</h1>
                <div className="flex items-center space-x-4 text-white/90">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span className="text-sm">{paymentType === 'annual' ? 'Annual Payment' : 'Monthly Payment'}</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    <span className="text-sm">SSL Secured</span>
                  </div>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onBack} 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6 space-y-6">
        {/* Payment Summary Section */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/30">
          <h2 className="font-bold text-gray-800 mb-6 text-xl flex items-center">
            <Star className="h-5 w-5 mr-2 text-green-600" />
            Payment Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h4 className="font-bold text-green-800 mb-2 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Total Amount
              </h4>
              <p className="text-green-700 font-bold text-2xl">${totalAmount.toFixed(2)}</p>
              <p className="text-green-600 text-xs">{paymentType === 'annual' ? 'Annual Payment' : 'Monthly Payment'}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <h4 className="font-bold text-emerald-800 mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Security
              </h4>
              <p className="text-emerald-700 font-medium text-sm">SSL Encrypted</p>
              <p className="text-emerald-600 text-xs">Bank-level security</p>
            </div>
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-200">
              <h4 className="font-bold text-teal-800 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Protection
              </h4>
              <p className="text-teal-700 font-medium text-sm">Fraud Protected</p>
              <p className="text-teal-600 text-xs">Money-back guarantee</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {paymentStatus === 'form' && (
              <>
                {/* Testing Controls */}
                {testingMode && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-green-800 flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        Testing Mode
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTestingMode(false)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Hide
                      </Button>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs text-green-700">Simulate payment approval/decline for testing:</p>
                      <div className="flex gap-2">
                        <Button
                          variant={simulationChoice === 'approve' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSimulationChoice('approve')}
                          className="text-xs"
                        >
                          ✅ Force Approve
                        </Button>
                        <Button
                          variant={simulationChoice === 'decline' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSimulationChoice('decline')}
                          className="text-xs"
                        >
                          ❌ Force Decline
                        </Button>
                        <Button
                          variant={simulationChoice === 'random' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSimulationChoice('random')}
                          className="text-xs"
                        >
                          🎲 Random (70/30)
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {!testingMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTestingMode(true)}
                    className="mb-4 text-xs text-muted-foreground"
                  >
                    Show Testing Controls
                  </Button>
                )}

                {/* Payment Method Selection */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                    Select Payment Method
                  </h3>
                
                  {/* Payment Methods Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {paymentMethods.map((method, index) => (
                      <motion.div
                        key={method.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Button
                          variant={selectedPaymentMethod === method.id ? "default" : "outline"}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                          className={`w-full flex flex-col items-center gap-2 p-4 h-20 transition-all duration-300 ${
                            selectedPaymentMethod === method.id 
                              ? 'bg-blue-600 hover:bg-blue-700 border-blue-600' 
                              : 'border-gray-300 hover:border-blue-500'
                          }`}
                        >
                          <span className="text-xl">{method.icon}</span>
                          <span className="text-xs text-center">{method.name}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Card Details Form - Show for Credit Card and Debit Card */}
                  {(selectedPaymentMethod === 'credit-card' || selectedPaymentMethod === 'debit-card') && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border-2 border-blue-200 p-6"
                    >
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                        Card Information
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">Card number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                            className="mt-1 border-gray-300 focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="cardholder" className="text-sm font-medium text-gray-700">Cardholder</Label>
                          <Input
                            id="cardholder"
                            placeholder="John Doe"
                            value={cardDetails.cardholder}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, cardholder: e.target.value }))}
                            className="mt-1 border-gray-300 focus:border-blue-500"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="expiry" className="text-sm font-medium text-gray-700">MM/YY</Label>
                            <Input
                              id="expiry"
                              placeholder="12/24"
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                              className="mt-1 border-gray-300 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvv" className="text-sm font-medium text-gray-700">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                              className="mt-1 border-gray-300 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 pt-2">
                          <Checkbox
                            id="saveCard"
                            checked={saveCard}
                            onCheckedChange={(checked) => setSaveCard(checked as boolean)}
                          />
                          <Label htmlFor="saveCard" className="text-sm text-gray-700">
                            Save card details for future use
                          </Label>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Alternative payment method messages */}
                  {selectedPaymentMethod === 'ach' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border-2 border-blue-200 p-6"
                    >
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                        <Building className="h-5 w-5 mr-2 text-blue-600" />
                        Bank Account Information
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="routingNumber" className="text-sm font-medium text-gray-700">Routing Number</Label>
                          <Input
                            id="routingNumber"
                            placeholder="123456789"
                            className="mt-1 border-gray-300 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">Account Number</Label>
                          <Input
                            id="accountNumber"
                            placeholder="1234567890"
                            className="mt-1 border-gray-300 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {(selectedPaymentMethod === 'google-pay' || selectedPaymentMethod === 'apple-pay' || 
                    selectedPaymentMethod === 'paypal' || selectedPaymentMethod === 'cash-app') && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border-2 border-blue-200 p-6 text-center"
                    >
                      <p className="text-gray-600">
                        You will be redirected to {selectedPaymentMethod.replace('-', ' ')} to complete your payment.
                      </p>
                    </motion.div>
                  )}

                  {selectedPaymentMethod === 'bitcoin' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border-2 border-blue-200 p-6 text-center"
                    >
                      <p className="text-gray-600">
                        You will receive Bitcoin wallet instructions to complete your payment.
                      </p>
                    </motion.div>
                  )}

                  {/* Pay Now Button */}
                  <Button 
                    onClick={handlePayment}
                    className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                    disabled={!selectedPaymentMethod}
                  >
                    Pay now
                  </Button>
                </div>
              </>
            )}

            {/* Processing State */}
            {paymentStatus === 'processing' && (
              <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"
                ></motion.div>
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-2 text-gray-800">Processing Payment</h3>
                  <p className="text-gray-600">Please wait while we process your payment...</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Payment Summary
              </h3>
              <div className="space-y-4">
                {/* Total Amount */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-green-800">${totalAmount.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {paymentType === 'annual' ? 'Annual payment' : 'Monthly payment'}
                  </p>
                </div>

                {/* Security Features */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 text-sm flex items-center">
                    <Shield className="h-4 w-4 mr-1 text-green-600" />
                    Security Features
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-gray-700">SSL Encrypted</span>
                    </div>
                    <div className="flex items-center p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-gray-700">PCI Compliant</span>
                    </div>
                    <div className="flex items-center p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-gray-700">Fraud Protection</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Info */}
                {selectedPaymentMethod && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-bold text-blue-800 text-sm mb-2">Selected Method</h4>
                    <p className="text-blue-700 text-sm">
                      {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processing State - Full Screen */}
      {paymentStatus === 'processing' && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="animate-spin rounded-full h-20 w-20 border-b-4 border-green-600 mx-auto"
            ></motion.div>
            <div>
              <h3 className="text-3xl font-bold mb-2 text-gray-800">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we process your payment...</p>
            </div>
          </div>
        </div>
      )}

      {/* Success State - Full Screen */}
      {paymentStatus === 'success' && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-2xl"
              >
                <span className="text-5xl">🎉</span>
              </motion.div>
              
              <div className="space-y-4">
                <h3 className="text-4xl font-bold text-green-600">Payment Successful!</h3>
                <p className="text-xl text-gray-600">
                  Congratulations! Your payment has been processed successfully.
                </p>
              </div>
              
              {/* Next Steps Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 text-left space-y-4"
              >
                <h4 className="font-bold text-gray-800 text-lg flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  What happens next?
                </h4>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 mt-0.5 font-bold">1.</span>
                    <p>Your landlord has been automatically notified of your payment and application.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 mt-0.5 font-bold">2.</span>
                    <p>You'll receive a confirmation email with your payment receipt and application details.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 mt-0.5 font-bold">3.</span>
                    <p>When you show up for your move-in, your landlord will have all your information and will know exactly who you are.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-green-600 mt-0.5 font-bold">4.</span>
                    <p>Keep an eye on your email for any additional documents or move-in instructions.</p>
                  </div>
                </div>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4"
              >
                <p className="text-sm text-blue-800">
                  💬 Questions? Contact your property manager or check your email for direct contact information.
                </p>
              </motion.div>

              {/* Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <Button 
                  onClick={onPaymentComplete}
                  className="w-full mt-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-lg font-semibold"
                  size="lg"
                >
                  Continue to Dashboard
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Failed State - Full Screen */}
      {paymentStatus === 'failed' && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto shadow-2xl"
              >
                <span className="text-5xl">❌</span>
              </motion.div>
              
              <div className="space-y-4">
                <h3 className="text-4xl font-bold text-red-600">Payment Failed</h3>
                <p className="text-xl text-gray-600">
                  We couldn't process your payment. Please try again with a different payment method.
                </p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4"
              >
                <p className="text-sm text-red-800">
                  💡 Tip: Check your card details or try a different payment method.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex gap-4 justify-center"
              >
                <Button 
                  onClick={resetPayment} 
                  variant="outline"
                  className="border-gray-300 hover:border-blue-500"
                >
                  Try Different Payment Method
                </Button>
                <Button 
                  onClick={onBack} 
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-800"
                >
                  Back to Products
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;