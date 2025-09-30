import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/lable';
import { Card, CardContent } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex">
      {/* Left Panel */}
      <div className="w-80 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white p-8 flex flex-col justify-center">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
              <span className="text-lg">🏠</span>
            </div>
            <span className="text-xl font-semibold">{paymentType === 'annual' ? 'Annual Payment' : 'Monthly Payment'}</span>
          </div>
          <div className="text-4xl font-bold">
            ${totalAmount.toFixed(2)}
            <span className="text-lg font-normal ml-2">USD</span>
          </div>
          <div className="space-y-2 opacity-80">
            <div className="h-1 bg-white/20 rounded w-full"></div>
            <div className="h-1 bg-white/20 rounded w-3/4"></div>
            <div className="h-1 bg-white/20 rounded w-1/2"></div>
            <div className="h-1 bg-white/20 rounded w-2/3"></div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white p-8">
        <div className="max-w-2xl mx-auto">
          {paymentStatus === 'form' && (
            <>
              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={onBack}
                className="mb-6 -ml-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>

              {/* Testing Controls */}
              {testingMode && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-green-800">🧪 Testing Mode</h3>
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
                <h2 className="text-2xl font-semibold">Select Payment Method</h2>
                
                {/* Payment Methods Grid - 2 rows of 4 */}
                <div className="grid grid-cols-4 gap-4">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.id}
                      variant={selectedPaymentMethod === method.id ? "default" : "outline"}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className="flex flex-col items-center gap-2 p-4 h-20"
                    >
                      <span className="text-xl">{method.icon}</span>
                      <span className="text-xs text-center">{method.name}</span>
                    </Button>
                  ))}
                </div>

                {/* Card Details Form - Show for Credit Card and Debit Card */}
                {(selectedPaymentMethod === 'credit-card' || selectedPaymentMethod === 'debit-card') && (
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Card number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, number: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="cardholder">Cardholder</Label>
                        <Input
                          id="cardholder"
                          placeholder="John Doe"
                          value={cardDetails.cardholder}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, cardholder: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">MM/YY</Label>
                          <Input
                            id="expiry"
                            placeholder="12/24"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, expiry: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails(prev => ({ ...prev, cvv: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveCard"
                          checked={saveCard}
                          onCheckedChange={(checked) => setSaveCard(checked as boolean)}
                        />
                        <Label htmlFor="saveCard" className="text-sm">
                          Save card details for future use
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Alternative payment method messages */}
                {selectedPaymentMethod === 'ach' && (
                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <Label htmlFor="routingNumber">Routing Number</Label>
                        <Input
                          id="routingNumber"
                          placeholder="123456789"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          placeholder="1234567890"
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {(selectedPaymentMethod === 'google-pay' || selectedPaymentMethod === 'apple-pay' || 
                  selectedPaymentMethod === 'paypal' || selectedPaymentMethod === 'cash-app') && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">
                        You will be redirected to {selectedPaymentMethod.replace('-', ' ')} to complete your payment.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {selectedPaymentMethod === 'bitcoin' && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">
                        You will receive Bitcoin wallet instructions to complete your payment.
                      </p>
                    </CardContent>
                  </Card>
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
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-2">Processing Payment</h3>
                <p className="text-muted-foreground">Please wait while we process your payment...</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {paymentStatus === 'success' && (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                <span className="text-4xl">🎉</span>
              </div>
              <div className="text-center space-y-4 max-w-md">
                <h3 className="text-3xl font-bold text-green-600 animate-fade-in">Payment Successful!</h3>
                <p className="text-lg text-muted-foreground">
                  Congratulations! Your payment has been processed successfully.
                </p>
                
                {/* Next Steps Information */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6 text-left space-y-4">
                  <h4 className="font-semibold text-green-800 flex items-center">
                    📋 What happens next?
                  </h4>
                  <div className="space-y-3 text-sm text-green-700">
                    <div className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">1.</span>
                      <p>Your landlord has been automatically notified of your payment and application.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">2.</span>
                      <p>You'll receive a confirmation email with your payment receipt and application details.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">3.</span>
                      <p>When you show up for your move-in, your landlord will have all your information and will know exactly who you are.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-600 mt-0.5">4.</span>
                      <p>Keep an eye on your email for any additional documents or move-in instructions.</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800">
                    💬 Questions? Contact your property manager or check your email for direct contact information.
                  </p>
                </div>

                {/* Action Button */}
                <Button 
                  onClick={onPaymentComplete}
                  className="w-full mt-6"
                  size="lg"
                >
                  Continue to Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* Failed State */}
          {paymentStatus === 'failed' && (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 animate-fade-in">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">❌</span>
              </div>
              <div className="text-center space-y-4">
                <h3 className="text-3xl font-bold text-red-600">Payment Failed</h3>
                <p className="text-lg text-muted-foreground">
                  We couldn't process your payment. Please try again with a different payment method.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                  <p className="text-sm text-red-800">
                    💡 Tip: Check your card details or try a different payment method.
                  </p>
                </div>
                <div className="flex gap-4 justify-center mt-6">
                  <Button onClick={resetPayment} variant="outline">
                    Try Different Payment Method
                  </Button>
                  <Button onClick={onBack} variant="ghost">
                    Back to Products
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;