import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/lable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  Shield, 
  DollarSign, 
  CreditCard, 
  Heart, 
  FileText,
  Calculator,
  Percent,
  Tag,
  Info,
  Smartphone,
  Building,
  Bitcoin,
  ArrowLeft
} from 'lucide-react';

interface ProductSelectionProps {
  property: any;
  unit: any;
  selectedLeaseTerm: number;
  selectedLeaseTermRent?: number; // Add the actual rent from selected lease term
  onPaymentProcess: (paymentData: any) => void;
  onBack: () => void;
  applicantData: any;
}

interface Product {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  required: boolean;
  icon: any;
  options?: { value: string; label: string; price: number }[];
}

const ProductSelection = ({ 
  property, 
  unit, 
  selectedLeaseTerm,
  selectedLeaseTermRent,
  onPaymentProcess,
  onBack,
  applicantData 
}: ProductSelectionProps) => {
  const { toast } = useToast();
  const [selectedProducts, setSelectedProducts] = useState<{[key: string]: any}>({
    // Default personal contents coverage to $7,500
    personal_contents: { selected: false, option: '7500' }
  });
  const [annualPayment, setAnnualPayment] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; discount: number} | null>(null);
  const [petInfo, setPetInfo] = useState({
    type: applicantData?.petDescription || '',
    name: applicantData?.petName || '',
    breed: applicantData?.petBreed || '',
    weight: applicantData?.petWeight || ''
  });

  // Mock credit score for security deposit calculation
  const creditScore = 720; // This would come from the screening results

  // Calculate security deposit fee based on credit score
  const getSecurityDepositFee = (score: number) => {
    if (score >= 725) return 0;
    if (score >= 675) return 15;
    if (score >= 625) return 25;
    return 35;
  };

  // Use the actual rent from the selected lease term, or fallback to calculation
  const baseRent = selectedLeaseTermRent || (
    unit && selectedLeaseTerm <= 6 ? unit.rent + 100 : 
    unit && selectedLeaseTerm <= 12 ? unit.rent : 
    unit ? unit.rent - 50 : 1200 // fallback to $1200 if unit is null
  );

  // Early return if required props are missing
  if (!property || !unit) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <p className="text-muted-foreground">Loading property information...</p>
          </div>
        </div>
      </div>
    );
  }

  const products: Product[] = [
    {
      id: 'renters_insurance',
      name: "Renter's Insurance",
      description: 'Covers up to $100,000 in damages',
      monthlyPrice: 11,
      required: true,
      icon: Shield
    },
    {
      id: 'security_deposit_alt',
      name: 'Security Deposit Alternative',
      description: `Monthly fee instead of large upfront deposit (Credit Score: ${creditScore})`,
      monthlyPrice: Math.round(baseRent * 0.02) + getSecurityDepositFee(creditScore),
      required: true,
      icon: DollarSign
    },
    {
      id: 'personal_contents',
      name: 'Personal Contents Coverage',
      description: 'Protect your Personal Contents',
      monthlyPrice: 0, // Will be set based on selection
      required: false,
      icon: FileText,
      options: [
        { value: '3000', label: '$3,000 Coverage', price: 3 },
        { value: '7500', label: '$7,500 Coverage', price: 4.5 },
        { value: '15000', label: '$15,000 Coverage', price: 6 },
        { value: '30000', label: '$30,000 Coverage', price: 8 }
      ]
    },
    {
      id: 'flex_rent',
      name: 'Flex Rent Payments',
      description: 'Split rent into three installments',
      monthlyPrice: 30,
      required: false,
      icon: Calculator
    },
    {
      id: 'credit_reporting',
      name: 'Credit Reporting',
      description: 'Build your credit with ontime rental payments',
      monthlyPrice: 7,
      required: false,
      icon: CreditCard
    },
    {
      id: 'pet_insurance',
      name: 'Pet Insurance',
      description: 'Healthcare coverage for your furry family members',
      monthlyPrice: 4,
      required: false,
      icon: Heart
    }
  ];

  const calculateTotal = () => {
    // Products that can be paid annually: renters_insurance, security_deposit_alt, personal_contents, credit_reporting, pet_insurance
    const annualEligibleProducts = ['renters_insurance', 'security_deposit_alt', 'personal_contents', 'credit_reporting', 'pet_insurance'];
    
    let monthlyOnlyTotal = 0;
    let flexiblePaymentTotal = 0;
    
    // Add rent only if flex_rent is selected (50% of rent)
    if (selectedProducts.flex_rent?.selected) {
      monthlyOnlyTotal += baseRent * 0.5;
    }
    
    // Add flex_rent fee if selected (always monthly)
    if (selectedProducts.flex_rent?.selected) {
      monthlyOnlyTotal += 30; // flex_rent monthly fee
    }

    // Categorize products
    products.forEach(product => {
      if (product.required && annualEligibleProducts.includes(product.id)) {
        flexiblePaymentTotal += product.monthlyPrice;
      }
    });

    // Add selected optional products
    Object.entries(selectedProducts).forEach(([productId, data]) => {
      if (data.selected && productId !== 'flex_rent') { // flex_rent already handled above
        const product = products.find(p => p.id === productId);
        if (product) {
          let productPrice = 0;
          if (product.options && data.option) {
            const option = product.options.find(o => o.value === data.option);
            productPrice = option?.price || 0;
          } else {
            productPrice = product.monthlyPrice;
          }
          
          if (annualEligibleProducts.includes(productId)) {
            flexiblePaymentTotal += productPrice;
          } else {
            monthlyOnlyTotal += productPrice;
          }
        }
      }
    });

    const subtotal = monthlyOnlyTotal + flexiblePaymentTotal;
    const annualFlexibleTotal = flexiblePaymentTotal * 12;
    const annualDiscount = annualPayment ? annualFlexibleTotal * 0.07 : 0;
    const finalFlexibleTotal = annualPayment ? annualFlexibleTotal - annualDiscount : flexiblePaymentTotal;
    const couponDiscount = appliedCoupon ? (appliedCoupon.discount / 100) * subtotal : 0;
    
    return {
      monthlyOnly: monthlyOnlyTotal,
      flexiblePayment: flexiblePaymentTotal,
      subtotal: subtotal,
      annualFlexible: annualFlexibleTotal,
      annualDiscount,
      couponDiscount,
      total: monthlyOnlyTotal + finalFlexibleTotal - couponDiscount
    };
  };

  const applyCoupon = () => {
    if (couponCode === '111') {
      setAppliedCoupon({
        code: couponCode,
        discount: 5
      });
      toast({
        title: "Coupon Applied!",
        description: "5% discount applied."
      });
    } else {
      toast({
        title: "Invalid Coupon",
        description: "The coupon code you entered is not valid.",
        variant: "destructive"
      });
    }
  };

  // Clear coupon discount if field is blank or wrong code
  useEffect(() => {
    if (!couponCode || couponCode !== '111') {
      setAppliedCoupon(null);
    }
  }, [couponCode]);

  const totals = calculateTotal();

  const handleProductToggle = (productId: string, selected: boolean) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: { ...prev[productId], selected }
    }));
  };

  const handleProductOption = (productId: string, option: string) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: { ...prev[productId], option, selected: true }
    }));
  };

  const processPayment = () => {
    // Check if pet insurance is selected but no pet info
    if (selectedProducts.pet_insurance?.selected && !petInfo.type) {
      toast({
        title: "Pet Information Required",
        description: "Please provide pet information for pet insurance.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to payment page
    onPaymentProcess({
      products: selectedProducts,
      totals,
      annualPayment,
      appliedCoupon,
      petInfo
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-green-600">Customize Your Move-in Package</h1>
            <p className="text-sm text-gray-600">{property.name} - Unit {unit.unitNumber}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Product Selection */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xl font-semibold">Select Products</h3>

          {/* Required Products */}
          <div className="space-y-3">
            <h4 className="font-medium text-green-700 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Required Protection (Included)
            </h4>
            {products.filter(p => p.required).map((product) => {
              const Icon = product.icon;
              return (
                <Card key={product.id} className="border-green-200 bg-green-50/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-700">${product.monthlyPrice}/mo</p>
                        <Badge variant="outline" className="border-green-600 text-green-600 text-xs">
                          Required
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Optional Products */}
          <div className="space-y-3">
            <h4 className="font-medium text-primary flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              Optional Add-ons
            </h4>
            {products.filter(p => !p.required).map((product) => {
              const Icon = product.icon;
              const isSelected = selectedProducts[product.id]?.selected;
              
              return (
                <Card key={product.id} className={`transition-all cursor-pointer hover:shadow-md ${
                  isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border'
                }`} onClick={() => !product.options && handleProductToggle(product.id, !isSelected)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{product.name}</p>
                            {product.id === 'flex_rent' && (
                              <div className="group relative">
                                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-popover border rounded-md p-2 text-xs w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-md">
                                  TEST TEST TEST
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                          {product.id === 'flex_rent' && (
                            <p className="text-xs text-primary mt-1">Split rent into three installments for easier budgeting</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {!product.options && (
                          <div className="text-right">
                            <p className="font-semibold text-primary">${product.monthlyPrice}/mo</p>
                          </div>
                        )}
                        <Switch
                          checked={isSelected}
                          onCheckedChange={(checked) => handleProductToggle(product.id, checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    
                    {/* Options for products like Personal Contents */}
                    {product.options && isSelected && (
                      <div className="mt-4 space-y-2">
                        <Label className="text-sm font-medium">Choose Coverage Level</Label>
                        <Select
                          value={selectedProducts[product.id]?.option || '7500'}
                          onValueChange={(value) => handleProductOption(product.id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select coverage amount" />
                          </SelectTrigger>
                          <SelectContent>
                            {product.options.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label} - ${option.price}/month
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Pet Information Form */}
                    {product.id === 'pet_insurance' && isSelected && (
                      <div className="mt-4 space-y-3 border-t pt-4">
                        <h5 className="font-medium">Tell Us About Your Pet</h5>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="petType" className="text-xs">Pet Type</Label>
                            <Input
                              id="petType"
                              value={petInfo.type}
                              onChange={(e) => setPetInfo(prev => ({...prev, type: e.target.value}))}
                              placeholder="Dog, Cat, etc."
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="petName" className="text-xs">Pet Name</Label>
                            <Input
                              id="petName"
                              value={petInfo.name}
                              onChange={(e) => setPetInfo(prev => ({...prev, name: e.target.value}))}
                              placeholder="Pet's name"
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="petBreed" className="text-xs">Breed</Label>
                            <Input
                              id="petBreed"
                              value={petInfo.breed}
                              onChange={(e) => setPetInfo(prev => ({...prev, breed: e.target.value}))}
                              placeholder="Breed"
                              className="h-8"
                            />
                          </div>
                          <div>
                            <Label htmlFor="petWeight" className="text-xs">Weight (lbs)</Label>
                            <Input
                              id="petWeight"
                              type="number"
                              value={petInfo.weight}
                              onChange={(e) => setPetInfo(prev => ({...prev, weight: e.target.value}))}
                              placeholder="Weight"
                              className="h-8"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Flex Rent Section (separate if selected) */}
              {selectedProducts.flex_rent?.selected && (
                <>
                  <div className="bg-primary/5 rounded-lg p-3 space-y-2">
                    <h4 className="font-medium text-primary text-sm">Flex Payment Plan</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Rent (50%)</span>
                        <span>${(baseRent * 0.5).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Flex Rent Fee</span>
                        <span>$30.00</span>
                      </div>
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Products in order they appear on left */}
              <div className="space-y-2 text-sm">
                {products.map(product => {
                  if (product.id === 'flex_rent') return null;
                  if (product.required) {
                    return (
                      <div key={product.id} className="flex justify-between">
                        <span>{product.name}</span>
                        <span>${product.monthlyPrice.toFixed(2)}</span>
                      </div>
                    );
                  }
                  const isSelected = selectedProducts[product.id]?.selected;
                  if (isSelected) {
                    let productPrice = 0;
                    if (product.options && selectedProducts[product.id]?.option) {
                      const option = product.options.find(o => o.value === selectedProducts[product.id].option);
                      productPrice = option?.price || 0;
                    } else {
                      productPrice = product.monthlyPrice;
                    }
                    return (
                      <div key={product.id} className="flex justify-between">
                        <span>{product.name}</span>
                        <span>${productPrice.toFixed(2)}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              <Separator />

              {/* Subtotal */}
              <div className="flex justify-between font-medium">
                <span>Subtotal</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>

              {/* Annual Discount */}
              {annualPayment && totals.annualDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Annual Payment Discount (7%)</span>
                  <span>-(${totals.annualDiscount.toFixed(2)})</span>
                </div>
              )}

              {/* Coupon Section */}
              <div className="space-y-2">
                <Label htmlFor="coupon">Coupon Code</Label>
                <div className="flex space-x-2">
                  <Input
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    onClick={applyCoupon}
                    disabled={!couponCode}
                  >
                    Apply
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Coupon Discount ({appliedCoupon.discount}%)</span>
                    <span>-(${totals.couponDiscount.toFixed(2)})</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between text-lg font-bold">
                <span>Total Due</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>

              {/* Payment Frequency Selection */}
              <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="annual-payment" className="text-sm">Pay Annually (Save 7%)</Label>
                  <Switch
                    id="annual-payment"
                    checked={annualPayment}
                    onCheckedChange={setAnnualPayment}
                  />
                </div>
                {annualPayment && (
                  <div className="text-xs text-green-600">
                    💰 Saving ${totals.annualDiscount.toFixed(2)} with annual payment!
                  </div>
                )}
              </div>

              <Button 
                onClick={processPayment} 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                Pay Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductSelection;