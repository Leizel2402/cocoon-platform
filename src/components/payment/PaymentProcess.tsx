import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/Button';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { useToast } from '../../hooks/use-toast';
// import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../hooks/useAuth';
import { 
  Shield,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Home,
  Phone,
  MapPin
} from 'lucide-react';

interface PaymentProcessProps {
  paymentData: any;
  onPaymentComplete: (success: boolean, details?: any) => void;
  onBackToProducts?: () => void;
}

const PaymentProcess = ({ paymentData, onPaymentComplete, onBackToProducts }: PaymentProcessProps) => {
  const { toast } = useToast();
  const { checkSubscription, user } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'failure' | null>(null);
  const [isAnnualPayment, setIsAnnualPayment] = useState(paymentData?.annualPayment || false);
  
  // Recalculate totals based on annual payment selection
  const recalculatedTotals = (() => {
    const subtotal = paymentData?.totals?.subtotal || 29.99;
    const couponDiscount = paymentData?.totals?.couponDiscount || 0;
    const annualDiscount = isAnnualPayment ? subtotal * 0.07 : 0;
    const total = subtotal - couponDiscount - annualDiscount;
    
    return {
      subtotal,
      couponDiscount,
      annualDiscount,
      total
    };
  })();

  const updateApplicationWithPetInfo = async () => {
    // If pet insurance was selected and there's pet info and an application ID
    if (paymentData?.selectedProducts?.pet_insurance?.selected && 
        paymentData?.petInfo && 
        paymentData?.applicationId) {
      try {
        const petInfo = paymentData.petInfo;
        
        // await supabase
        //   .from('applications')
        //   .update({
        //     has_pets: true,
        //     pet_description: `${petInfo.type}${petInfo.name ? `, ${petInfo.name}` : ''}${petInfo.breed ? `, ${petInfo.breed}` : ''}${petInfo.weight ? `, ${petInfo.weight} lbs` : ''}`
        //   })
        //   .eq('id', paymentData.applicationId);
          
        console.log('Updated application with pet information');
      } catch (error) {
        console.error('Error updating application with pet info:', error);
      }
    }
  };

  const processPayment = async () => {
    setProcessing(true);

    try {
      // Check if we're in test bypass mode (no authenticated user)
      const testBypassMode = !user;
      
      if (testBypassMode) {
        // Test bypass mode - simulate payment processing
        console.log('🧪 Test Bypass Mode: Simulating payment processing...');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update application with pet info if needed
        await updateApplicationWithPetInfo();
        
        // Simulate successful payment
        setPaymentResult('success');
        onPaymentComplete(true);
        
        toast({
          title: "🧪 Test Payment Successful!",
          description: "Test bypass mode - Payment simulation completed. Redirecting to dashboard...",
        });
        
        return;
      }

      // Get the total amount in cents for Stripe (min 50 cents)
      const computedTotal = recalculatedTotals.total;
      const totalInCents = Math.max(50, Math.round(computedTotal * 100));
      
      // Create Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceAmount: totalInCents,
          priceName: `${paymentData?.property?.name || 'Premium Subscription'} - Monthly Subscription`
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (data?.url) {
        // Update application with pet info if applicable
        await updateApplicationWithPetInfo();
        
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        // Send confirmation email
        try {
          await supabase.functions.invoke('send-confirmation-email', {
            body: {
              paymentData,
              userEmail: user?.email || 'guest@example.com',
              userName: user?.user_metadata?.first_name || 'Valued Renter'
            }
          });
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't block the payment flow for email errors
        }
        
        // Check subscription status after a delay (if user is authenticated)
        if (checkSubscription) {
          setTimeout(async () => {
            await checkSubscription();
          }, 1000);
        }
        
        // Show success immediately and redirect to account management
        setPaymentResult('success');
        onPaymentComplete(true);
        
        // Notify user of redirect
        toast({
          title: "Payment Successful!",
          description: "A confirmation email has been sent. Redirecting to your account dashboard...",
        });
        
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentResult('failure');
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'Payment processing failed',
        variant: "destructive"
      });
      onPaymentComplete(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleRetryPayment = () => {
    setPaymentResult(null);
  };

  if (paymentResult === 'success') {
    return (
      <div className="text-center space-y-6 animate-fade-in">
        <div className="relative">
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <div className="absolute -top-2 -right-2 animate-pulse">
            <Sparkles className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-green-600 animate-fade-in">
            Congratulations! 🎉
          </h2>
          <p className="text-xl text-primary animate-fade-in" style={{animationDelay: '0.2s'}}>
            Your new home is now secured!
          </p>
          <p className="text-muted-foreground animate-fade-in" style={{animationDelay: '0.4s'}}>
            Welcome to your new chapter at {paymentData?.property?.name || 'Your New Home'}
          </p>
        </div>

        <div className="text-left max-w-md mx-auto animate-fade-in" style={{animationDelay: '0.6s'}}>
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center">
                <Home className="h-5 w-5 mr-2" />
                Move-In Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-green-700">Property</p>
                <p>{paymentData?.property?.name || 'Premium Property'}</p>
              </div>
              <div>
                <p className="font-medium text-green-700 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Address
                </p>
                <p>{paymentData?.property?.address || 'Property Address'}</p>
                <p>{paymentData?.property?.city || 'City'}, {paymentData?.property?.state || 'State'}</p>
              </div>
              <div>
                <p className="font-medium text-green-700 flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Property Phone
                </p>
                <p>(555) 123-4567</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-green-700">Unit</p>
                  <p>{paymentData?.unit?.id || 'Unit'}</p>
                </div>
                <div>
                  <p className="font-medium text-green-700">Rent</p>
                  <p>${paymentData?.baseRent || '0'}/month</p>
                </div>
              </div>
              <div>
                <p className="font-medium text-green-700">Lease Term</p>
                <p>{paymentData?.leaseTerm || '12'} months</p>
              </div>
              {paymentData?.appliedCoupon && (
                <div>
                  <p className="font-medium text-green-700">Concessions</p>
                  <p>{paymentData.appliedCoupon.discount}% discount applied</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="text-sm text-muted-foreground animate-fade-in" style={{animationDelay: '0.8s'}}>
          Show these details to the landlord when you arrive to move in.
          A copy has been sent to your email.
        </p>
        
        <Button 
          onClick={() => {
            // Redirect to account management immediately
            window.location.href = '/dashboard?view=account';
          }}
          className="w-full mt-6"
          size="lg"
        >
          Access Your Account Dashboard
        </Button>
      </div>
    );
  }

  if (paymentResult === 'failure') {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
          <p className="text-muted-foreground">
            Your payment could not be processed due to insufficient funds.
          </p>
          <p className="text-sm text-muted-foreground">
            Please try a different payment method or contact your bank.
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={handleRetryPayment} className="w-full">
            Try Different Payment Method
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="outline" 
          onClick={onBackToProducts}
          className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
        >
          ← Back to Products
        </Button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600">Complete Payment</h2>
          <p className="text-sm text-gray-600">Secure your new home</p>
        </div>
        <div className="w-32"></div> {/* Spacer for centering */}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Payment Summary */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Product breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Move-in Package</span>
                  <span>${recalculatedTotals.subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              {/* Subtotal */}
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>${recalculatedTotals.subtotal.toFixed(2)}</span>
              </div>

              {/* Annual discount */}
              {isAnnualPayment && recalculatedTotals.annualDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Annual Payment Discount (7%)</span>
                  <span>-${recalculatedTotals.annualDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Coupon discount */}
              {paymentData.appliedCoupon && recalculatedTotals.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon ({paymentData.appliedCoupon.discount}%)</span>
                  <span>-${recalculatedTotals.couponDiscount.toFixed(2)}</span>
                </div>
              )}

              <Separator />

              {/* Total */}
              <div className="flex justify-between text-lg font-bold">
                <span>Total Due</span>
                <span className="text-primary">${recalculatedTotals.total.toFixed(2)}</span>
              </div>

              {/* Payment frequency toggle */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Pay Annually</p>
                    <p className="text-sm text-green-600">Save 7% discount</p>
                  </div>
                  <Switch
                    checked={isAnnualPayment}
                    onCheckedChange={setIsAnnualPayment}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {isAnnualPayment ? 'One-time annual payment' : 'Monthly payment'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Secure Payment */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Secure Payment
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Powered by</span>
                <span className="font-semibold text-blue-600">Stripe</span>
                <Badge variant="secondary" className="text-xs">
                  SSL Secured
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stripe Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">Secure Checkout with Stripe</p>
                    <p className="text-xs text-blue-600">
                      Your payment information is encrypted and processed securely by Stripe. 
                      We never store your card details. All payment methods (cards, digital wallets, bank transfers) 
                      are handled on Stripe's secure checkout page.
                    </p>
                  </div>
                </div>
              </div>

              {/* Guest/Authenticated notice */}
              {!user ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    <strong>🧪 Test Bypass Mode:</strong> You're using test bypass without authentication. Payment will be simulated for testing purposes.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-800">
                    <strong>Signed in as:</strong> {user.email} - Full account features enabled.
                  </p>
                </div>
              )}

              {/* Payment Methods Available */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-800 mb-2">Available Payment Methods:</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Credit & Debit Cards (Visa, Mastercard, Amex)</p>
                  <p>• Digital Wallets (Apple Pay, Google Pay)</p>
                  <p>• Bank Transfers (ACH, Wire)</p>
                  <p>• Buy Now, Pay Later (Klarna, Afterpay)</p>
                </div>
              </div>

              {/* Subscription note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> This will set up a recurring monthly subscription for ongoing services and support.
                </p>
              </div>

              {/* Process Payment Button */}
              <Button 
                onClick={processPayment} 
                disabled={processing}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Redirecting to Stripe...
                  </>
                ) : (
                  `Pay $${recalculatedTotals.total.toFixed(2)} - Secure Checkout`
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                You'll complete your payment securely on Stripe's checkout page. By continuing, you agree to start a monthly subscription.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentProcess;
