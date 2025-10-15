import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/lable';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { motion } from 'framer-motion';
import { 
  Shield, 
  DollarSign, 
  CreditCard, 
  Heart, 
  FileText,
  Calculator,
  Tag,
  Info,
  ArrowLeft,
  Building,
  Star
} from 'lucide-react';

interface LeaseTerm {
  months: number;
  rent: number;
  popular?: boolean;
  savings?: number | null;
  concession?: string | null;
}

interface Unit {
  id: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  available: boolean;
  availableDate: string;
  floorPlan: string;
  rent: number;
  deposit: number;
  leaseTerms: LeaseTerm[];
  amenities: string[];
  images: string[];
  qualified: boolean;
  qualifiedStatus?: 'qualified' | 'pending' | 'denied';
  parkingIncluded: boolean;
  petFriendly: boolean;
  furnished: boolean;
  floor: number;
  view: string;
}

interface QualifiedProperty {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  units: Unit[];
  amenities: string[];
  images: string[];
  latitude: number;
  longitude: number;
  petPolicy: {
    allowed: boolean;
    fee: number;
    deposit: number;
  };
}

interface ProductSelectionProps {
  property: QualifiedProperty | null;
  unit: Unit | null;
  selectedLeaseTerm: number;
  selectedLeaseTermRent?: number;
  onPaymentProcess: (paymentData: unknown) => void;
  onBack: () => void;
  applicantData: Record<string, unknown>;
}

interface Product {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  required: boolean;
  icon: React.ComponentType<{ className?: string }>;
  options?: { value: string; label: string; price: number }[];
}

const ProductSelection = ({ 
  property, 
  unit, 
  selectedLeaseTerm,
  selectedLeaseTermRent,
  onPaymentProcess,
  onBack,
  applicantData: _applicantData // eslint-disable-line @typescript-eslint/no-unused-vars
}: ProductSelectionProps) => {
  const { toast } = useToast();
  
  const [selectedProducts, setSelectedProducts] = useState<Record<string, { selected: boolean; option?: string }>>({
    // Default personal contents coverage to $7,500
    personal_contents: { selected: false, option: '7500' }
  });
  const [annualPayment, setAnnualPayment] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string; discount: number} | null>(null);
  const [petInfo, setPetInfo] = useState({
    type: '',
    name: '',
    breed: '',
    weight: ''
  });
  useEffect(() => {
    if (!couponCode || couponCode !== '111') {
      setAppliedCoupon(null);
    }
  }, [couponCode]);
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
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Customize Your Move-in Package</h1>
                <p className="text-sm text-green-50">
                  {property.name} - Unit {unit.unitNumber} • {selectedLeaseTerm} months at ${selectedLeaseTermRent?.toLocaleString()}/mo
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={onBack} 
                className="bg-white text-green-600 hover:bg-green-50 font-semibold transition-all duration-200 shadow-lg"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Comparison
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-6 space-y-6">

        {/* Summary Section */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/30">
          <h2 className="font-bold text-gray-800 mb-6 text-xl flex items-center">
            <Star className="h-5 w-5 mr-2 text-green-600" />
            Move-in Package Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="font-bold text-green-800 mb-2 flex items-center">
                <Building className="h-4 w-4 mr-1" />
                Property
              </h4>
              <p className="text-green-700 font-medium text-sm">{property.name}</p>
              <p className="text-green-600 text-xs">Unit {unit.unitNumber}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <h4 className="font-bold text-emerald-800 mb-2 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Lease Term
              </h4>
              <p className="text-emerald-700 font-medium text-sm">{selectedLeaseTerm} months</p>
              <p className="text-emerald-600 text-xs">${selectedLeaseTermRent?.toLocaleString()}/mo</p>
            </div>
            <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
              <h4 className="font-bold text-teal-800 mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Protection
              </h4>
              <p className="text-teal-700 font-medium text-sm">Required + Optional</p>
              <p className="text-teal-600 text-xs">Customize below</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Product Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Required Products */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                Required Protection
              </h3>
              {products.filter(p => p.required).map((product, index) => {
                const Icon = product.icon;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border-2 border-green-200 hover:border-green-300 transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Icon className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">{product.name}</h4>
                            <p className="text-sm text-gray-600">{product.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-700 text-lg">${product.monthlyPrice}/mo</p>
                          <Badge className="bg-green-100 text-green-700 text-xs px-2 py-1">
                            Required
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Optional Products */}
            <div className="space-y-4">
               <h3 className="text-xl font-bold text-gray-800 flex items-center">
                 <Heart className="h-5 w-5 mr-2 text-blue-600" />
                 Optional Add-ons
               </h3>
              {products.filter(p => !p.required).map((product, index) => {
                const Icon = product.icon;
                const isSelected = selectedProducts[product.id]?.selected;
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                     className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                       isSelected ? 'border-blue-500 shadow-blue-200 bg-blue-50/30' : 'border-gray-200 hover:border-blue-300'
                     }`}
                    onClick={() => !product.options && handleProductToggle(product.id, !isSelected)}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                           <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                             isSelected ? 'bg-blue-100' : 'bg-gray-100'
                           }`}>
                             <Icon className={`h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-gray-800">{product.name}</h4>
                              {product.id === 'flex_rent' && (
                                <div className="group relative">
                                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white border rounded-md p-2 text-xs w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 shadow-md">
                                    Split rent into three installments for easier budgeting
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{product.description}</p>
                             {product.id === 'flex_rent' && (
                               <p className="text-xs text-blue-600 mt-1 font-medium">Split rent into three installments for easier budgeting</p>
                             )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {!product.options && (
                            <div className="text-right">
                               <p className={`font-bold text-lg ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                                 ${product.monthlyPrice}/mo
                               </p>
                               {isSelected && (
                                 <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-1">
                                   Selected
                                 </Badge>
                               )}
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
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <Label className="text-sm font-medium text-gray-700">Choose Coverage Level</Label>
                          <Select
                            value={selectedProducts[product.id]?.option || '7500'}
                            onValueChange={(value) => handleProductOption(product.id, value)}
                          >
                             <SelectTrigger className="w-full mt-2 border-gray-300 focus:border-blue-500">
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
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="font-medium text-gray-700 mb-3">Tell Us About Your Pet</h5>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="petType" className="text-xs text-gray-600">Pet Type</Label>
                              <Input
                                id="petType"
                                value={petInfo.type}
                                onChange={(e) => setPetInfo(prev => ({...prev, type: e.target.value}))}
                                placeholder="Dog, Cat, etc."
                                 className="h-8 border-gray-300 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <Label htmlFor="petName" className="text-xs text-gray-600">Pet Name</Label>
                              <Input
                                id="petName"
                                value={petInfo.name}
                                onChange={(e) => setPetInfo(prev => ({...prev, name: e.target.value}))}
                                placeholder="Pet's name"
                                 className="h-8 border-gray-300 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <Label htmlFor="petBreed" className="text-xs text-gray-600">Breed</Label>
                              <Input
                                id="petBreed"
                                value={petInfo.breed}
                                onChange={(e) => setPetInfo(prev => ({...prev, breed: e.target.value}))}
                                placeholder="Breed"
                                 className="h-8 border-gray-300 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <Label htmlFor="petWeight" className="text-xs text-gray-600">Weight (lbs)</Label>
                              <Input
                                id="petWeight"
                                type="number"
                                value={petInfo.weight}
                                onChange={(e) => setPetInfo(prev => ({...prev, weight: e.target.value}))}
                                placeholder="Weight"
                                 className="h-8 border-gray-300 focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Tag className="h-5 w-5 mr-2 text-green-600" />
                Payment Summary
              </h3>
              <div className="space-y-4">
                {/* Flex Rent Section (separate if selected) */}
                {selectedProducts.flex_rent?.selected && (
                  <>
                     <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                       <h4 className="font-bold text-blue-800 text-sm mb-3 flex items-center">
                         <Calculator className="h-4 w-4 mr-1" />
                         Flex Payment Plan
                       </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rent (50%)</span>
                          <span className="font-semibold text-gray-800">${(baseRent * 0.5).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Flex Rent Fee</span>
                          <span className="font-semibold text-gray-800">$30.00</span>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                  </>
                )}

                {/* Products in order they appear on left */}
                <div className="space-y-3">
                  <h4 className="font-bold text-gray-800 text-sm flex items-center">
                    <Shield className="h-4 w-4 mr-1 text-green-600" />
                    Selected Products
                  </h4>
                  <div className="space-y-2 text-sm">
                    {products.map(product => {
                      if (product.id === 'flex_rent') return null;
                      if (product.required) {
                        return (
                          <div key={product.id} className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                            <span className="text-gray-700">{product.name}</span>
                            <span className="font-semibold text-green-700">${product.monthlyPrice.toFixed(2)}</span>
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
                           <div key={product.id} className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                             <span className="text-gray-700">{product.name}</span>
                             <span className="font-semibold text-blue-700">${productPrice.toFixed(2)}</span>
                           </div>
                         );
                      }
                      return null;
                    })}
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Subtotal */}
                <div className="flex justify-between font-semibold text-gray-800">
                  <span>Subtotal</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>

                {/* Annual Discount */}
                {annualPayment && totals.annualDiscount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Annual Payment Discount (7%)</span>
                    <span>-${totals.annualDiscount.toFixed(2)}</span>
                  </div>
                )}

                {/* Coupon Section */}
                <div className="space-y-3">
                  <Label htmlFor="coupon" className="text-sm font-medium text-gray-700">Coupon Code</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code"
                       className="flex-1 border-gray-300 focus:border-blue-500"
                    />
                    <Button 
                      variant="outline" 
                      onClick={applyCoupon}
                      disabled={!couponCode}
                       className="border-gray-300 hover:border-blue-500"
                    >
                      Apply
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600 text-sm bg-green-50 p-2 rounded-lg">
                      <span>Coupon Discount ({appliedCoupon.discount}%)</span>
                      <span>-${totals.couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Total */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="flex justify-between text-xl font-bold text-green-800">
                    <span>Total Due</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {annualPayment ? 'Annual payment (7% discount applied)' : 'Monthly payment'}
                  </p>
                </div>

                {/* Payment Frequency Selection */}
                <div className="space-y-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="annual-payment" className="text-sm font-medium text-gray-700">Pay Annually (Save 7%)</Label>
                    <Switch
                      id="annual-payment"
                      checked={annualPayment}
                      onCheckedChange={setAnnualPayment}
                    />
                  </div>
                  {annualPayment && (
                    <div className="text-xs text-green-600 bg-green-50 p-2 rounded-lg">
                      💰 Saving ${totals.annualDiscount.toFixed(2)} with annual payment!
                    </div>
                  )}
                </div>

                <Button 
                  onClick={processPayment} 
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-lg font-semibold"
                  size="lg"
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelection;