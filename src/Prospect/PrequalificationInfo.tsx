import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, CheckCircle, Clock, Shield, FileText } from 'lucide-react';

interface PrequalificationInfoProps {
  onBack: () => void;
}

const PrequalificationInfo = ({ onBack }: PrequalificationInfoProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button variant="ghost" onClick={onBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="text-2xl font-bold text-green-600">🏠 RentWise</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">How Prequalification Works</h1>
            <p className="text-xl text-gray-600">
              Streamline your rental process with our universal application system
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>One Application, Multiple Properties</CardTitle>
                <CardDescription>
                  Complete your application once and apply to multiple verified properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Income verification
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Credit score check
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Employment history
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    References verification
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Faster Approval Process</CardTitle>
                <CardDescription>
                  Get approved in hours, not days, with our streamlined process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                    Instant document upload
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                    Real-time status updates
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                    Automated verification
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                    Direct landlord communication
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Verified & Secure</CardTitle>
              <CardDescription>
                Your information is protected with bank-level security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">256-bit</div>
                  <p className="text-sm text-gray-600">SSL Encryption</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">SOC 2</div>
                  <p className="text-sm text-gray-600">Compliance</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-2">24/7</div>
                  <p className="text-sm text-gray-600">Monitoring</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-6">
              Join thousands of renters who have found their perfect home through our platform
            </p>
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700"
              onClick={onBack}
            >
              Start Your Application
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrequalificationInfo;