import React, { useState } from "react";
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
  Calendar,
  DollarSign,
  Building,
  XCircle,
  Info,
  X,
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
  is_available: boolean;
  images: string[];
  landlordId: string;
  createdAt: Date | { seconds: number; nanoseconds: number };
}

interface DeletePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  property: PropertyData | null;
  isLoading?: boolean;
}

interface ImpactAnalysis {
  activeTenants: number;
  pendingApplications: number;
  maintenanceRequests: number;
  activeListings: number;
  totalRevenue: number;
  hasActiveLeases: boolean;
}

const DeletePropertyModal: React.FC<DeletePropertyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  property,
  isLoading = false,
}) => {
  const [confirmationText, setConfirmationText] = useState("");
  const [showImpactAnalysis, setShowImpactAnalysis] = useState(false);
  const [acknowledgeRisks, setAcknowledgeRisks] = useState(false);

  // Mock data for impact analysis - in real implementation, this would come from API
  const impactAnalysis: ImpactAnalysis = {
    activeTenants: 2,
    pendingApplications: 5,
    maintenanceRequests: 3,
    activeListings: 1,
    totalRevenue: 4500,
    hasActiveLeases: true,
  };

  const isConfirmationValid = confirmationText === "DELETE";
  const canProceed = isConfirmationValid && acknowledgeRisks;

  const handleClose = () => {
    setConfirmationText("");
    setAcknowledgeRisks(false);
    setShowImpactAnalysis(false);
    onClose();
  };

  const handleConfirm = () => {
    if (canProceed) {
      onConfirm();
      handleClose();
    }
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
                <div className="grid grid-cols-2 gap-4">
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
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              To confirm deletion, type <span className="font-mono bg-gray-100 px-2 py-1 rounded">DELETE</span> below:
            </label>
            <Input
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="font-mono"
            />
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
            disabled={!canProceed || isLoading}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
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
