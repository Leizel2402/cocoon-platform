import React, { useState, useEffect } from "react";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  AlertTriangle,
  Trash2,
  Users,
  FileText,
  Wrench,
  Home,
  DollarSign,
  Building,
  XCircle,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";

interface PropertyData {
  id: string;
  name: string;
  title: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  property_type: string;
  available: boolean;
  images: string[];
  landlordId: string;
  createdAt: Date | { seconds: number; nanoseconds: number };
}

interface DeletePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  property: PropertyData | null;
  isLoading?: boolean;
  // Real data for impact analysis
  applications?: ApplicationData[];
  maintenanceRequests?: MaintenanceRequest[];
  listings?: ListingData[];
  units?: UnitData[];
}

// Additional interfaces for real data
interface ApplicationData {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  applicationMetadata: {
    propertyId: string;
    unitId: string;
    landlordId: string;
    unitRent: number;
  };
}

interface MaintenanceRequest {
  id: string;
  propertyId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface ListingData {
  id: string;
  propertyId: string;
  rent: number;
  available: boolean;
  landlordId: string;
}

interface UnitData {
  id: string;
  propertyId: string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  rent: number;
  isAvailable: boolean;
  landlordId: string;
}

interface ImpactAnalysis {
  activeTenants: number;
  pendingApplications: number;
  maintenanceRequests: number;
  activeListings: number;
  totalUnits: number;
  availableUnits: number;
  totalRevenue: number;
  hasActiveLeases: boolean;
}

const DeletePropertyModal: React.FC<DeletePropertyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  property,
  isLoading = false,
  applications = [],
  maintenanceRequests = [],
  listings = [],
  units = [],
}) => {
  const { user } = useAuth();
  const [confirmationText, setConfirmationText] = useState("DELETE");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showImpactAnalysis, setShowImpactAnalysis] = useState(false);
  const [acknowledgeRisks, setAcknowledgeRisks] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  // Calculate real impact analysis from provided data
  const calculateImpactAnalysis = (): ImpactAnalysis => {
    if (!property) {
      return {
        activeTenants: 0,
        pendingApplications: 0,
        maintenanceRequests: 0,
        activeListings: 0,
        totalUnits: 0,
        availableUnits: 0,
        totalRevenue: 0,
        hasActiveLeases: false,
      };
    }

    // Filter data for this specific property
    const propertyApplications = applications.filter(app => 
      app.applicationMetadata.propertyId === property.id
    );
    
    const propertyMaintenanceRequests = maintenanceRequests.filter(req => 
      req.propertyId === property.id
    );
    
    const propertyListings = listings.filter(listing => 
      listing.propertyId === property.id
    );

    const propertyUnits = units.filter(unit => 
      unit.propertyId === property.id
    );

    // Calculate metrics
    const activeTenants = propertyApplications.filter(app => 
      app.status === 'approved'
    ).length;

    const pendingApplications = propertyApplications.filter(app => 
      app.status === 'pending'
    ).length;

    const activeMaintenanceRequests = propertyMaintenanceRequests.filter(req => 
      req.status === 'pending' || req.status === 'in_progress'
    ).length;

    const activeListings = propertyListings.filter(listing => 
      listing.available
    ).length;

    // Calculate units metrics
    const totalUnits = propertyUnits.length;
    console.log("propertyUnits", propertyUnits);
    const availableUnits = propertyUnits.filter(unit => 
      unit.available
    ).length;

    // Calculate total revenue from approved applications
    const totalRevenue = propertyApplications
      .filter(app => app.status === 'approved')
      .reduce((sum, app) => sum + app.applicationMetadata.unitRent, 0);

    const hasActiveLeases = activeTenants > 0;

    return {
      activeTenants,
      pendingApplications,
      maintenanceRequests: activeMaintenanceRequests,
      activeListings,
      totalUnits,
      availableUnits,
      totalRevenue,
      hasActiveLeases,
    };
  };

  // Recalculate impact analysis when modal opens or data changes
  const impactAnalysis = calculateImpactAnalysis();
  

  // Clear fields when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfirmationText("");
      setPassword("");
      setShowPassword(false);
      setAcknowledgeRisks(false);
      setShowImpactAnalysis(false);
      setPasswordError("");
      
    }
  }, [isOpen, property, applications, maintenanceRequests, listings, units]);

  // Verify password function
  const verifyPassword = async (enteredPassword: string): Promise<boolean> => {
    if (!user?.email) {
      setPasswordError("User not authenticated");
      return false;
    }

    try {
      setIsVerifyingPassword(true);
      setPasswordError("");

      const credential = EmailAuthProvider.credential(user.email, enteredPassword);
      await reauthenticateWithCredential(auth.currentUser!, credential);
      
      return true;
    } catch (error: unknown) {
      console.error("Password verification error:", error);
      
      const firebaseError = error as { code?: string; message?: string };
      
      if (firebaseError.code === "auth/wrong-password") {
        setPasswordError("Incorrect password. Please try again.");
      } else if (firebaseError.code === "auth/invalid-credential") {
        setPasswordError("Invalid credentials. Please check your password.");
      } else if (firebaseError.code === "auth/too-many-requests") {
        setPasswordError("Too many failed attempts. Please try again later.");
      } else {
        setPasswordError("Password verification failed. Please try again.");
      }
      
      return false;
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const isConfirmationValid = confirmationText === "DELETE";
  const isPasswordValid = password.length > 0; // Just check if password is entered
  const canProceed = isConfirmationValid && isPasswordValid && acknowledgeRisks;

  const handleClose = () => {
    setConfirmationText("");
    setPassword("");
    setShowPassword(false);
    setAcknowledgeRisks(false);
    setShowImpactAnalysis(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (!canProceed) return;

    // Verify password before proceeding
    const isPasswordCorrect = await verifyPassword(password);
    if (!isPasswordCorrect) {
      return; // Error is already set in verifyPassword function
    }

    // Password is correct, proceed with deletion
    onConfirm(password);
    handleClose();
  };

  if (!property) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-hidden p-0">
        {/* Custom Header - Red Background */}
        <div className="bg-red-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  Delete Property
                </h2>
                <p className="text-red-100 text-sm mt-1">
                  This action cannot be undone. All data associated with this property will be permanently deleted.
                </p>
              </div>
            </div>
           
          </div>
         
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">

        <div className="space-y-6">
          {/* Property Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-4">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Building className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{property.name}</h3>
                <p className="text-sm text-gray-600">{property.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {property.address.line1}, {property.address.city}, {property.address.region}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline" className="text-xs">
                    <Home className="h-3 w-3 mr-1" />
                    {property.property_type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <DollarSign className="h-3 w-3 mr-1" />
                    ${property.rent_amount}/month
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {property.bedrooms} bed • {property.bathrooms} bath
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Analysis Toggle */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">Impact Analysis</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImpactAnalysis(!showImpactAnalysis)}
              >
                {showImpactAnalysis ? "Hide Details" : "Show Details"}
              </Button>
            </div>

            {showImpactAnalysis && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-900">Active Tenants</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{impactAnalysis.activeTenants}</p>
                    <p className="text-xs text-red-700">Will be affected</p>
                  </div>

                  <div className="bg-orange-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">Pending Applications</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">{impactAnalysis.pendingApplications}</p>
                    <p className="text-xs text-orange-700">Will be cancelled</p>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900">Maintenance Requests</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{impactAnalysis.maintenanceRequests}</p>
                    <p className="text-xs text-yellow-700">Will be closed</p>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Active Listings</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{impactAnalysis.activeListings}</p>
                    <p className="text-xs text-blue-700">Will be removed</p>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">Total Units</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{impactAnalysis.totalUnits}</p>
                    <p className="text-xs text-purple-700">Will be deleted</p>
                  </div>

                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Home className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-900">Available Units</span>
                    </div>
                    <p className="text-2xl font-bold text-indigo-600">{impactAnalysis.availableUnits}</p>
                    <p className="text-xs text-indigo-700">Will be removed</p>
                  </div>
                </div>

                {impactAnalysis.hasActiveLeases && (
                  <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">Active Lease Warning</h4>
                        <p className="text-sm text-red-800 mt-1">
                          This property has active leases. Deleting it will immediately terminate all active leases
                          and may result in legal complications. Consider contacting tenants first.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Estimated Monthly Revenue Loss</span>
                    <span className="text-lg font-bold text-gray-900">${impactAnalysis.totalRevenue}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Warning Messages */}
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">What will be deleted:</h4>
                  <ul className="text-sm text-red-800 mt-2 space-y-1">
                    <li>• Property details and all associated data</li>
                    <li>• All unit information and configurations</li>
                    <li>• Property listings and availability data</li>
                    <li>• All maintenance requests and history</li>
                    <li>• Application data and tenant records</li>
                    <li>• Revenue and financial records</li>
                    <li>• Property images and documents</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Impact on Users:</h4>
                  <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                    <li>• Renters will lose access to their property details</li>
                    <li>• Prospects with pending applications will be notified</li>
                    <li>• Active tenants will need to be contacted separately</li>
                    <li>• All saved properties and searches will be updated</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-4">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              To confirm deletion, type <span className="font-mono bg-gray-100 px-2 py-1 rounded">DELETE</span> below:
            </label>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="font-mono"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Enter your password to confirm deletion:
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="font-mono pr-10"
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-red-600 mt-2">
                  {passwordError}
                </p>
              )}
            </div>
          </div>

          {/* Acknowledgment Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="acknowledge-risks"
              checked={acknowledgeRisks}
              onChange={(e) => setAcknowledgeRisks(e.target.checked)}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="acknowledge-risks" className="text-sm text-gray-700">
              I understand that this action is irreversible and will permanently delete all data associated with this property.
              I have contacted any active tenants and understand the legal implications.
            </label>
          </div>
        </div>
        </div>

        {/* Custom Footer */}
        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-gray-200 hover:bg-gray-50"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canProceed || isLoading || isVerifyingPassword}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : isVerifyingPassword ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying Password...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Property
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePropertyModal;
