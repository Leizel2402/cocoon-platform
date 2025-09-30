import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DollarSign, Calendar, TrendingDown, TrendingUp, ArrowLeft, MapPin } from 'lucide-react';

interface LeaseTermSelectionProps {
  property: any;
  unit: any;
  onLeaseTermSelect: (leaseTerm: number) => void;
  onBack: () => void;
}

const LeaseTermSelection = ({ property, unit, onLeaseTermSelect, onBack }: LeaseTermSelectionProps) => {
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);

  // Mock lease terms with pricing and concessions (would come from landlord system)
  const leaseTerms = [
    { months: 6, rent: unit.rent + 100, popular: false, savings: null, concession: null },
    { months: 8, rent: unit.rent + 75, popular: false, savings: null, concession: null },
    { months: 10, rent: unit.rent + 50, popular: false, savings: null, concession: "1 week free rent" },
    { months: 12, rent: unit.rent, popular: true, savings: null, concession: "2 weeks free rent" },
    { months: 15, rent: unit.rent - 25, popular: false, savings: 25, concession: "1 month free rent" },
    { months: 18, rent: unit.rent - 50, popular: false, savings: 50, concession: "6 weeks free rent" },
    { months: 24, rent: unit.rent - 75, popular: false, savings: 75, concession: "2 months free rent" }
  ];

  const handleSelect = () => {
    if (selectedTerm) {
      onLeaseTermSelect(selectedTerm);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with property info and back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div>
            <h2 className="text-xl font-bold text-primary">{property.name}</h2>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.address}, {property.city}, {property.state}</span>
            </div>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Units</span>
        </Button>
      </div>

      {/* Subtitle */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-muted-foreground">Choose Your Lease Term</h3>
        <p className="text-muted-foreground">
          Select the lease duration that works best for you
        </p>
      </div>

      {/* Unit Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Selected Unit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="font-medium text-muted-foreground">Property</p>
              <p className="font-semibold">{property.name}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Unit</p>
              <p className="font-semibold">{unit.type} - {unit.id}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Size</p>
              <p className="font-semibold">{unit.sqft} sq ft</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Base Rent</p>
              <p className="font-semibold text-primary">${unit.rent}/month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lease Terms */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Available Lease Terms</h3>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leaseTerms.map((term) => (
            <Card 
              key={term.months}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTerm === term.months 
                  ? 'border-primary bg-primary/5 shadow-lg' 
                  : 'hover:border-primary/50'
              } ${term.popular ? 'ring-2 ring-blue-200' : ''}`}
              onClick={() => setSelectedTerm(term.months)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {term.months} Month{term.months !== 1 ? 's' : ''}
                  </CardTitle>
                  <div className="flex flex-col items-end space-y-1">
                    {term.popular && (
                      <Badge className="bg-blue-600">Most Popular</Badge>
                    )}
                    {term.savings && (
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        Save ${term.savings}/month
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Monthly Rent</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">${term.rent}</p>
                    {term.rent !== unit.rent && (
                      <div className="flex items-center text-xs">
                        {term.rent > unit.rent ? (
                          <>
                            <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                            <span className="text-red-500">+${term.rent - unit.rent}</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                            <span className="text-green-500">-${unit.rent - term.rent}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Total Cost</span>
                  </div>
                  <span className="font-medium">${(term.rent * term.months).toLocaleString()}</span>
                </div>

                {/* Benefits for longer terms */}
                {term.months >= 12 && (
                  <div className="text-xs text-muted-foreground">
                    {term.months === 12 && "✓ Standard lease term"}
                    {term.months > 12 && "✓ Long-term stability • ✓ Lower monthly rate"}
                  </div>
                )}
                
                {term.months < 12 && (
                  <div className="text-xs text-muted-foreground">
                    ✓ Shorter commitment • ✓ More flexibility
                  </div>
                )}

                {/* Concession line */}
                {term.concession && (
                  <div className="text-xs text-green-600 font-medium border-t pt-2 mt-2">
                    🎉 Concession: {term.concession}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Lease Term Benefits */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-700">Lease Term Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-600">
          <p><strong>Short-term (6-10 months):</strong> More flexibility, higher monthly rent</p>
          <p><strong>Standard (12 months):</strong> Balanced option, market rate pricing</p>
          <p><strong>Long-term (15+ months):</strong> Lower monthly rent, stable housing for longer</p>
        </CardContent>
      </Card>

      {/* Continue Button */}
      <Button 
        onClick={handleSelect}
        disabled={!selectedTerm}
        className="w-full"
        size="lg"
      >
        Continue with {selectedTerm ? `${selectedTerm} Month Lease` : 'Selected Term'}
      </Button>
    </div>
  );
};

export default LeaseTermSelection;