import React, { useState, useEffect, useCallback } from "react";
import PropertyForm from "../components/PropertyForm/PropertyForm";
import DeletePropertyModal from "../components/DeletePropertyModal";
import ScheduleMaintenanceModal from "../components/ScheduleMaintenanceModal";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { maintenanceService, MaintenanceActivity, MaintenanceRequest } from "../../services/maintenanceService";
import { updateApplicationStatus } from "../../services/submissionService";
import { propertyDeletionService } from "../../services/propertyDeletionService";
import { notificationService } from "../../services/notificationService";
import { useToast } from "../../hooks/use-toast";
import { 
  Building, 
  Plus, 
  List, 
  Settings, 
  Users, 
  DollarSign, 
  TrendingUp,
  MapPin,
  Clock,
  AlertTriangle,
  Home,
  Wrench,
  Bell,
  ChevronRight,
  Eye,
  Edit,
  BarChart3,
  Bath,
  Bed,
  Square,
  X,
  Phone,
  Mail,
  Calendar,
  FileText,
  Heart,
  User,
  Star,
  Check,
  XCircle,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { Loader } from "../../components/ui/Loader";

// Property interface based on the provided JSON format
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
  location: {
    lat: string;
    lng: string;
  };
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  property_type: string;
  is_available: boolean;
  available_date: string;
  amenities: string[];
  images: string[];
  description: string;
  rating: number;
  landlordId: string;
  createdAt: Date | { seconds: number; nanoseconds: number };
  updatedAt?: Date | { seconds: number; nanoseconds: number };
  userDetails: {
    name: string;
    email: string;
    phone: string;
  };
  socialFeeds?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  lease_term_months: number;
  lease_term_options: string[];
  first_month_rent_required: boolean;
  security_deposit_months: number;
  last_month_rent_required: boolean;
  pet_friendly: boolean;
}

// Listing interface for property listings
interface ListingData {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  rent: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  images: string[];
  amenities: string[];
  available: boolean;
  availableDate?: string | { type: string; seconds: number; nanoseconds: number };
  publishedAt: Date | { seconds: number; nanoseconds: number };
  updatedAt?: Date | { seconds: number; nanoseconds: number };
  landlordId: string;
  property?: PropertyData; // Include property details
  // Additional fields from the Firebase data
  unitId?: string;
  lease_term_months?: number;
  lease_term_options?: string[];
  userDetails?: {
    email: string;
    name: string;
    phone: string;
  };
  security_deposit_months?: number;
  lease_start_date?: string;
  lease_end_date?: string;
  pet_deposit?: number;
  last_month_rent_required?: boolean;
  first_month_rent_required?: boolean;
  application_fee?: number;
}

// Application interface for tenant applications based on actual Firebase data
interface ApplicationData {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  submittedAt: Date | { seconds: number; nanoseconds: number };
  reviewedAt?: Date | { seconds: number; nanoseconds: number };
  
  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    ssn: string;
    middleInitial: string;
    isCitizen: boolean;
    desiredLeaseTerm: string;
    moveInDate: string;
  };
  
  // Additional Occupants
  additionalOccupants: {
    occupants: Array<{
      firstName: string;
      lastName: string;
      middleInitial: string;
      dateOfBirth: string;
      age: string;
      ssn: string;
    }>;
  };
  
  // Additional Information
  additionalInfo: {
    emergencyContact: {
      name: string;
      phone: string;
      email: string;
      relation: string;
    };
    pets: {
      hasPets: boolean;
      pets: Array<{
        type: string;
        breed: string;
        age: string;
        weight: string;
        isServiceAnimal: boolean;
      }>;
    };
    vehicles: {
      hasVehicles: boolean;
      vehicles: Array<{
        make: string;
        model: string;
        year: string;
        licensePlate: string;
      }>;
    };
    notes: string;
  };
  
  // Housing History
  housingHistory: {
    currentAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
      fullAddress: string;
      duration: string;
    };
    previousAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
      fullAddress: string;
    };
  };
  
  // Financial Information
  financialInfo: {
    employment: string;
    employerName: string;
    hasOtherIncome: boolean;
    otherIncomeDetails: string;
    employers: Array<{
      name: string;
      industry: string;
      income: string;
      employmentStatus: string;
      position: string;
    }>;
  };
  
  // Lease Holders and Guarantors
  leaseHoldersAndGuarantors: {
    leaseHolders: Array<{
      firstName: string;
      lastName: string;
      middleInitial: string;
      email: string;
      phone: string;
      dateOfBirth: string;
      ssn: string;
      isCitizen: boolean;
      monthlyIncome: string;
      employmentStatus: string;
      employerName: string;
      industry: string;
      position: string;
      currentStreet: string;
      currentCity: string;
      currentState: string;
      currentZip: string;
      currentDuration: string;
      sameAsPrimary: boolean;
    }>;
    guarantors: Array<{
      firstName: string;
      lastName: string;
      middleInitial: string;
      email: string;
      phone: string;
      dateOfBirth: string;
      ssn: string;
      isCitizen: boolean;
      monthlyIncome: string;
      employmentStatus: string;
      employerName: string;
      industry: string;
      position: string;
      currentStreet: string;
      currentCity: string;
      currentState: string;
      currentZip: string;
      currentDuration: string;
      sameAsPrimary: boolean;
    }>;
  };
  
  // Application Metadata
  applicationMetadata: {
    propertyId: string;
    unitId: string;
    landlordId: string;
    submittedBy: string;
    propertyName: string;
    propertyAddress: string;
    unitNumber: string;
    unitType: string;
    unitBedrooms: number;
    unitBathrooms: number;
    unitSqft: number | null;
    unitRent: number;
    unitDeposit: number;
    unitAvailableDate: string;
    unitFloorLevel: string;
    applicationType: string;
    source: string;
    submittedAt: string;
    selectedLeaseTerm: {
      months: number;
      rent: number;
      popular: boolean;
      savings: number | null;
      concession: number | null;
    };
    selectedLeaseTermMonths: number;
    selectedLeaseTermRent: number;
    unitLeaseTerms: Array<{
      months: number;
      rent: number;
      popular: boolean;
      savings: number | null;
      concession: number | null;
    }>;
  };
  
  // Documents
  documents: {
    id: string[];
  };
  
  // Review and Submit
  reviewAndSubmit: {
    backgroundCheckPermission: boolean;
    textMessagePermission: boolean;
  };
  
  // Legacy data
  legacy: {
    annualIncome: number;
    emergencyContactPhone: string;
    petDetails: string;
    jobTitle: string;
    emergencyContactRelationship: string;
    emergencyContactName: string;
    state: string;
    city: string;
    employmentStatus: string;
    employmentStartDate: string;
    zipCode: string;
    employer: string;
  };
  
  // Processing Data
  processingData: {
    saferentData: {
      FirstName: string;
      LastName: string;
      MiddleInitial: string;
      Email: string;
      Phone: string;
      SSN: string;
      DOB: string;
      CitizenshipStatus: string;
      MoveInDate: string;
      LeaseTerm: string;
      Addresses: Array<{
        Street: string;
        City: string;
        State: string;
        Zip: string;
        Duration: string;
      }>;
      LeaseHolders: Array<{
        FirstName: string;
        LastName: string;
        MiddleInitial: string;
        Email: string;
        Phone: string;
        SSN: string;
        DOB: string;
        CitizenshipStatus: string;
        Addresses: Array<{
          Street: string;
          City: string;
          State: string;
          Zip: string;
          Duration: string;
        }>;
        Employers: Array<{
          Employer: string;
          Position: string;
          Industry: string;
          EmploymentStatus: string;
          Income: string;
        }>;
      }>;
      Guarantors: Array<{
        FirstName: string;
        LastName: string;
        MiddleInitial: string;
        Email: string;
        Phone: string;
        SSN: string;
        DOB: string;
        CitizenshipStatus: string;
        Addresses: Array<{
          Street: string;
          City: string;
          State: string;
          Zip: string;
          Duration: string;
        }>;
        Employers: Array<{
          Employer: string;
          Position: string;
          Industry: string;
          EmploymentStatus: string;
          Income: string;
        }>;
      }>;
      AdditionalOccupants: Array<{
        FirstName: string;
        LastName: string;
        MiddleInitial: string;
        DOB: string;
      }>;
      Employers: Array<{
        Employer: string;
        Position: string;
        Industry: string;
        EmploymentStatus: string;
        Income: string;
      }>;
      AdditionalInfo: {
        Pets: Array<{
          Type: string;
          Breed: string;
          Age: string;
          Weight: string;
        }>;
        EmergencyContact: {
          Name: string;
          Phone: string;
          Relation: string;
        };
        Notes: string;
        Vehicles: Array<{
          Make: string;
          Model: string;
          Year: string;
          LicensePlate: string;
        }>;
      };
    };
  };
  
  // Property/Unit Information (fetched separately)
  property?: PropertyData;
  unit?: {
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet: number;
    rent: number;
  };
  listing?: ListingData;
}

// Unit interface for property units
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

const LandlordPropertyManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [listings, setListings] = useState<ListingData[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationData | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<ListingData | null>(null);
  const [showPropertyDetailsModal, setShowPropertyDetailsModal] = useState(false);
  const [selectedPropertyForView, setSelectedPropertyForView] = useState<PropertyData | null>(null);
  const [showPropertyViewModal, setShowPropertyViewModal] = useState(false);
  const [maintenanceActivities, setMaintenanceActivities] = useState<MaintenanceActivity[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [units, setUnits] = useState<UnitData[]>([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedMaintenanceRequest, setSelectedMaintenanceRequest] = useState<MaintenanceRequest | null>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedPropertyForDelete, setSelectedPropertyForDelete] = useState<PropertyData | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedRequestForSchedule, setSelectedRequestForSchedule] = useState<MaintenanceRequest | null>(null);


  // Fetch properties from Firebase
  const fetchProperties = useCallback(async () => {
    if (!user?.uid) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const propertiesQuery = query(
        collection(db, "properties"),
        where("landlordId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(propertiesQuery);
      const propertiesData: PropertyData[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PropertyData[];


      setProperties(propertiesData);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch listings from Firebase
  const fetchListings = useCallback(async () => {
    if (!user?.uid) {
      setListingsError("User not authenticated");
      return;
    }

    setListingsLoading(true);
    setListingsError(null);

    try {
      const listingsQuery = query(
        collection(db, "listings"),
        where("landlordId", "==", user.uid),
        orderBy("publishedAt", "desc")
      );
      
      const querySnapshot = await getDocs(listingsQuery);
      const listingsData: ListingData[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ListingData[];
        
      // Fetch property details for each listing
      const listingsWithProperties = await Promise.all(
        listingsData.map(async (listing) => {
          try {
            const propertyDoc = await getDocs(
              query(collection(db, "properties"), where("id", "==", listing.propertyId))
            );
            if (!propertyDoc.empty) {
              const propertyData = propertyDoc.docs[0].data() as PropertyData;
              return { ...listing, property: propertyData };
            }
            return listing;
          } catch (err) {
            console.error(`Error fetching property for listing ${listing.id}:`, err);
            return listing;
          }
        })
      );
      
      setListings(listingsWithProperties);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setListingsError("Failed to load listings. Please try again.");
    } finally {
      setListingsLoading(false);
    }
  }, [user]);

  // Fetch applications from Firebase
  const fetchApplications = useCallback(async () => {
    if (!user?.uid) {
      setApplicationsError("User not authenticated");
      return;
    }

    setApplicationsLoading(true);
    setApplicationsError(null);

    try {
      
      // First, let's try to get all applications to see what's in the collection
      const allApplicationsQuery = query(collection(db, "applications"));
      const allSnapshot = await getDocs(allApplicationsQuery);
      
     
      
      // Check if any applications match the current user ID in any field
      if (allSnapshot.docs.length > 0) {
        const matchingApps = allSnapshot.docs.filter(doc => {
          const data = doc.data();
          return data.landlordId === user.uid || 
                 data.applicationMetadata?.landlordId === user.uid ||
                 data.submittedBy === user.uid;
        });
        if (matchingApps.length > 0) {
          console.log("Matching application data:", matchingApps[0].data());
        }
      }

      // Since the queries are not working, let's use manual filtering
      let applicationsData: ApplicationData[] = [];
      
      const allDocs = allSnapshot.docs;
      applicationsData = allDocs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((app: Record<string, unknown>) => {
          const appLandlordId = (app.applicationMetadata as Record<string, unknown>)?.landlordId as string;
          const directLandlordId = app.landlordId as string;
          const submittedBy = app.submittedBy as string;
          
        
          
          return appLandlordId === user.uid || 
                 directLandlordId === user.uid ||
                 submittedBy === user.uid;
        }) as ApplicationData[];
      
   
      
      // Fetch property and unit details for each application
      const applicationsWithDetails = await Promise.all(
        applicationsData.map(async (application) => {
          try {
            // Fetch property details
            const propertyQuery = query(
              collection(db, "properties"),
              where("id", "==", application.applicationMetadata.propertyId)
            );
            const propertySnapshot = await getDocs(propertyQuery);
            let propertyData: PropertyData | undefined;
            if (!propertySnapshot.empty) {
              propertyData = propertySnapshot.docs[0].data() as PropertyData;
            }

            // Fetch unit details if unitId exists
            let unitData: {
              unitNumber: string;
              bedrooms: number;
              bathrooms: number;
              squareFeet: number;
              rent: number;
            } | undefined = undefined;
            if (application.applicationMetadata.unitId) {
              const unitQuery = query(
                collection(db, "units"),
                where("id", "==", application.applicationMetadata.unitId)
              );
              const unitSnapshot = await getDocs(unitQuery);
              if (!unitSnapshot.empty) {
                unitData = unitSnapshot.docs[0].data() as {
                  unitNumber: string;
                  bedrooms: number;
                  bathrooms: number;
                  squareFeet: number;
                  rent: number;
                };
              }
            }

            // Fetch listing details if listingId exists
            let listingData: ListingData | undefined;
            // Note: listingId is not available in the current data structure
            // We'll skip this for now

            return {
              ...application,
              property: propertyData,
              unit: unitData,
              listing: listingData,
            };
          } catch (err) {
            console.error(`Error fetching details for application ${application.id}:`, err);
            return application;
          }
        })
      );
      
      setApplications(applicationsWithDetails);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setApplicationsError("Failed to load applications. Please try again.");
    } finally {
      setApplicationsLoading(false);
    }
  }, [user]);

  // Fetch maintenance activities for Recent Activity section
  const fetchMaintenanceActivities = useCallback(async () => {
    if (!user?.uid) return;

    try {

     
      
      const activities = await maintenanceService.getRecentMaintenanceActivities(user.uid, 7);
    
      setMaintenanceActivities(activities);
    } catch (error) {
      console.error('Error fetching maintenance activities:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchProperties();
    fetchMaintenanceActivities();
    // Always fetch data needed for impact analysis
    fetchApplications();
    fetchListings();
  }, [user, fetchProperties, fetchMaintenanceActivities, fetchApplications, fetchListings]);

  useEffect(() => {
    if (activeTab === "listings") {
      fetchListings();
    }
  }, [activeTab, fetchListings]);

  useEffect(() => {
    if (activeTab === "applications") {
      fetchApplications();
    }
  }, [activeTab, fetchApplications]);

  // Fetch maintenance requests when maintenance tab is active
  const fetchMaintenanceRequests = useCallback(async () => {
    if (!user?.uid) return;

    setMaintenanceLoading(true);
    try {
      const requests = await maintenanceService.getMaintenanceRequestsByLandlord(user.uid);
      setMaintenanceRequests(requests);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      toast({
        title: "Error",
        description: "Failed to load maintenance requests.",
        variant: "destructive"
      });
    } finally {
      setMaintenanceLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (activeTab === "maintenance-requests") {
      fetchMaintenanceRequests();
    }
  }, [activeTab, fetchMaintenanceRequests]);

  // Fetch maintenance requests on component mount for impact analysis
  useEffect(() => {
    if (user?.uid) {
      fetchMaintenanceRequests();
    }
  }, [user, fetchMaintenanceRequests]);

  // Fetch units from Firebase
  const fetchUnits = useCallback(async () => {
    if (!user?.uid) return;

    setUnitsLoading(true);
    try {
      const unitsQuery = query(
        collection(db, "units"),
        where("landlordId", "==", user.uid)
      );
      const unitsSnapshot = await getDocs(unitsQuery);
      const unitsData = unitsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UnitData[];
      
      setUnits(unitsData);
    } catch (error) {
      console.error('Error fetching units:', error);
      toast({
        title: "Error",
        description: "Failed to load units data.",
        variant: "destructive"
      });
    } finally {
      setUnitsLoading(false);
    }
  }, [user, toast]);

  // Fetch units on component mount for impact analysis
  useEffect(() => {
    if (user?.uid) {
      fetchUnits();
    }
  }, [user, fetchUnits]);

  // Combine maintenance activities with other activities
  const recentActivity = [
    // Static application activities (you can replace these with real data later)
    // {
    //   id: "1",
    //   type: "application",
    //   message: "New application received for Unit 3A",
    //   time: "2 hours ago",
    //   status: "pending",
    //   property: "Downtown Apartments",
    //   priority: "medium",
    // },
    // {
    //   id: "3",
    //   type: "payment",
    //   message: "Rent payment received from Unit 2C",
    //   time: "1 day ago",
    //   status: "paid",
    //   property: "Downtown Apartments",
    //   priority: "low",
    // },
    // {
    //   id: "5",
    //   type: "application",
    //   message: "Application approved for Unit 4B",
    //   time: "1 day ago",
    //   status: "approved",
    //   property: "Garden View Complex",
    //   priority: "low",
    // },
    // Add real maintenance activities from Firebase
    ...maintenanceActivities
  ].sort((a, b) => {
    // Sort by time (most recent first)
    const timeA = a.time.includes('minute') ? 0 : a.time.includes('hour') ? 1 : 2;
    const timeB = b.time.includes('minute') ? 0 : b.time.includes('hour') ? 1 : 2;
    return timeA - timeB;
  });

  // Calculate stats based on Firebase data
  const totalProperties = properties.length;
  const totalRevenue = properties.reduce(
    (sum, p) => sum + (p.rent_amount || 0),
    0
  );
  const availableProperties = properties.filter((p) => p.is_available).length;
  const averageRent = totalProperties > 0 ? totalRevenue / totalProperties : 0;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const urgentMaintenance = recentActivity.filter(
    (a) => a.type === "maintenance" && a.priority === "high"
  ).length;

  // Handle opening application details modal
  const handleViewApplicationDetails = (application: ApplicationData) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  // Handle closing application details modal
  const handleCloseApplicationModal = () => {
    setSelectedApplication(null);
    setShowApplicationModal(false);
  };

  // Handle application status update
  const handleStatusUpdate = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      // Find the application to get user and property info
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        throw new Error('Application not found');
      }

      const result = await updateApplicationStatus(applicationId, newStatus);
      
      if (result.success) {
        // Update local state
        setApplications(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus }
              : app
          )
        );

        // Send notification to the applicant
        try {
          const userId = application.applicationMetadata?.submittedBy || application.id;
          const propertyId = application.applicationMetadata?.propertyId || '';
          const propertyName = application.applicationMetadata?.propertyName || 'Property';

          if (userId && propertyId) {
            await notificationService.notifyApplicationStatusChange(
              userId,
              applicationId,
              newStatus,
              propertyId,
              propertyName
            );
          }
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
          // Don't fail the status update if notification fails
        }
        
        toast({
          title: "Status Updated",
          description: `Application ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle opening property details modal
  const handleViewPropertyDetails = (property: ListingData) => {
    setSelectedProperty(property);
    setShowPropertyDetailsModal(true);
  };

  // Handle closing property details modal
  const handleClosePropertyDetailsModal = () => {
    setSelectedProperty(null);
    setShowPropertyDetailsModal(false);
  };

  // Handle opening property view modal
  const handleViewProperty = (property: PropertyData) => {
    setSelectedPropertyForView(property);
    setShowPropertyViewModal(true);
  };

  // Handle closing property view modal
  const handleClosePropertyViewModal = () => {
    setSelectedPropertyForView(null);
    setShowPropertyViewModal(false);
  };

  // Handle opening delete property modal
  const handleDeleteProperty = (property: PropertyData) => {
    setSelectedPropertyForDelete(property);
    setShowDeleteModal(true);
  };

  // Handle closing delete property modal
  const handleCloseDeleteModal = () => {
    setSelectedPropertyForDelete(null);
    setShowDeleteModal(false);
  };

  // Handle confirming property deletion
  const handleConfirmDelete = async () => {
    if (!selectedPropertyForDelete || !user) return;

    setIsDeleting(true);
    try {
      const propertyName = selectedPropertyForDelete.name || selectedPropertyForDelete.title;
      const propertyAddress = `${selectedPropertyForDelete.address.line1}, ${selectedPropertyForDelete.address.city}, ${selectedPropertyForDelete.address.region}`;

      // Use the property deletion service to delete everything
      const deletionResult = await propertyDeletionService.deleteProperty(
        selectedPropertyForDelete.id,
        propertyName,
        propertyAddress,
        user.uid
      );

      if (deletionResult.success) {
        // Remove from local state
        setProperties(prev => prev.filter(p => p.id !== selectedPropertyForDelete.id));
        
        // Update other local states to remove deleted data
        setApplications(prev => prev.filter(app => app.applicationMetadata.propertyId !== selectedPropertyForDelete.id));
        setMaintenanceRequests(prev => prev.filter(req => req.propertyId !== selectedPropertyForDelete.id));
        setListings(prev => prev.filter(listing => listing.propertyId !== selectedPropertyForDelete.id));
        setUnits(prev => prev.filter(unit => unit.propertyId !== selectedPropertyForDelete.id));
        
        const totalAffectedUsers = deletionResult.affectedUsers.applications.length + deletionResult.affectedUsers.maintenanceRequests.length;
        
        toast({
          title: "Property Deleted Successfully",
          description: `Property and all associated data deleted. ${totalAffectedUsers} users notified. Deleted: ${deletionResult.deletedCounts.properties} property, ${deletionResult.deletedCounts.applications} applications, ${deletionResult.deletedCounts.maintenanceRequests} maintenance requests, ${deletionResult.deletedCounts.units} units, ${deletionResult.deletedCounts.listings} listings.`,
          variant: "destructive",
        });
        
        handleCloseDeleteModal();
      } else {
        // Handle deletion errors
        const errorMessage = deletionResult.errors.length > 0 
          ? deletionResult.errors.join(', ')
          : 'Unknown error occurred during deletion';
          
        toast({
          title: "Deletion Failed",
          description: `Failed to delete property: ${errorMessage}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting the property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Maintenance request handlers
  const handleStatusChange = async (requestId: string, newStatus: MaintenanceRequest['status']) => {
    try {
      await maintenanceService.updateMaintenanceRequestStatus(requestId, newStatus);
      
      // Update local state
      setMaintenanceRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: newStatus }
            : req
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Maintenance request status changed to ${newStatus.replace('_', ' ')}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update maintenance request status.",
        variant: "destructive",
      });
    }
  };


  const handleScheduleMaintenance = (request: MaintenanceRequest) => {
    handleScheduleRequest(request);
  };


  const handleCancelRequest = async (requestId: string) => {
    try {
      await maintenanceService.updateMaintenanceRequestStatus(requestId, 'cancelled');
      
      // Update local state
      setMaintenanceRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'cancelled' }
            : req
        )
      );
      
      toast({
        title: "Request Cancelled",
        description: "The maintenance request has been cancelled.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel the maintenance request.",
        variant: "destructive",
      });
    }
  };

  const handleScheduleRequest = (request: MaintenanceRequest) => {
    setSelectedRequestForSchedule(request);
    setShowScheduleModal(true);
    setOpenDropdownId(null);
  };

  const handleScheduleComplete = () => {
    // Refresh maintenance requests
    fetchMaintenanceRequests();
  };

  // Inline editing handlers
  const handleInlineStatusChange = async (requestId: string, newStatus: MaintenanceRequest['status']) => {
    try {
      await maintenanceService.updateMaintenanceRequestStatus(requestId, newStatus);
      
      // Update local state
      setMaintenanceRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: newStatus }
            : req
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Status changed to ${newStatus.replace('_', ' ')}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  const handleInlinePriorityChange = async (requestId: string, newPriority: MaintenanceRequest['priority']) => {
    try {
      // Update the priority in Firestore
      const requestRef = doc(db, 'maintenanceRequests', requestId);
      await updateDoc(requestRef, {
        priority: newPriority,
        updatedAt: new Date()
      });
      
      // Update local state
      setMaintenanceRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, priority: newPriority }
            : req
        )
      );
      
      toast({
        title: "Priority Updated",
        description: `Priority changed to ${newPriority}.`,
      });
    } catch (error) {
      console.error("Error updating priority:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update priority.",
        variant: "destructive",
      });
    }
  };

  if (showPropertyForm) {
    return <PropertyForm setPropertyFormOpen={(open: boolean) => setShowPropertyForm(open)} />;
  }

  // Show loading state
  if (loading) {
    return (
      <Loader 
        message="Loading Property Management" 
        subMessage="Retrieving your property data..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header Banner */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Landlord Dashboard</h1>
                <p className="text-sm text-green-50">
                  Property management • {totalProperties > 0 ? totalProperties : 0} properties
                  • ${totalRevenue > 0 ? totalRevenue.toLocaleString() : 0}/month revenue
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {urgentMaintenance > 0 && (
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {urgentMaintenance > 0 ? urgentMaintenance : 0}
                  </span>
                </div>
              )}
              <Button
                onClick={() => setShowPropertyForm(true)}
                className="bg-white text-green-600 hover:bg-green-50 font-semibold transition-all duration-200 shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-blue-700 text-xs font-semibold">
                    Total Properties
                  </p>
                  <Building className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {totalProperties}
                </p>
                <p className="text-xs text-blue-600 mt-1 font-medium">Active</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-green-700 text-xs font-semibold">
                    Total Units
                  </p>
                  <Home className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {availableProperties}
                </p>
                <p className="text-xs text-green-600 mt-1 font-medium">
                  available properties
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-700 text-xs font-semibold">
                    Monthly Revenue
                  </p>
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-purple-600 mt-1 font-medium">
                  ${Math.round(averageRent).toLocaleString()} avg rent
                </p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-orange-700 text-xs font-semibold">
                    Pending Items
                  </p>
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingApplications + urgentMaintenance}
                </p>
                <p className="text-xs text-orange-600 mt-1 font-medium">
                  {urgentMaintenance} urgent
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-2">
            <nav className="flex flex-wrap space-x-2">
              {[
                { id: "overview", label: "Dashboard", icon: TrendingUp },
                { id: "properties", label: "Properties", icon: Building },
                { id: "listings", label: "Listings", icon: List },
                { id: "applications", label: "Applications", icon: Users },
                // { id: "maintenance", label: "Work Orders", icon: Wrench },
                { id: "maintenance-requests", label: "Maintenance Requests", icon: Wrench },
                { id: "reports", label: "Reports", icon: BarChart3 },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-3 px-4 rounded-lg font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg -z-10"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Properties Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mr-4">
                      <Building className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Properties Overview
                      </h2>
                      <p className="text-sm text-gray-600">
                        Manage your property portfolio
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center px-4 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 font-semibold transition-all duration-200"
                  >
                    Manage All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </motion.button>
                </div>
                <div className="space-y-4">
                  {properties.slice(0, 3).map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {/* <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                            <Building className="h-5 w-5 text-green-600" />
                          </div> */}
                          <div>
                            <h3 className="font-semibold text-gray-900 text-base">
                              {property.name || property.title}
                            </h3>
                            <div className="flex items-center text-gray-500 text-sm">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">
                                {typeof property.address === "string"
                                  ? property.address
                                  : `${property.address.line1}, ${property.address.city}, ${property.address.region}`}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            property.is_available
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {property.is_available ? "Available" : "Unavailable"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-gray-600 mb-4 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1 text-blue-600" />
                          <span className="text-sm font-medium">
                            {property.bedrooms === 0
                              ? "Studio"
                              : `${property.bedrooms} bed${
                                  property.bedrooms !== 1 ? "s" : ""
                                }`}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1 text-green-600" />
                          <span className="text-sm font-medium">
                            {property.bathrooms} bath
                            {property.bathrooms !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Square className="h-4 w-4 mr-1 text-purple-600" />
                          <span className="text-sm font-medium">
                            {property.square_feet?.toLocaleString()} sqft
                          </span>
                      </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Monthly Rent</p>
                          <p className="text-lg font-bold text-gray-900">
                            ${property.rent_amount?.toLocaleString() || "0"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 font-medium">Available</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {property.available_date
                              ? new Date(property.available_date).toLocaleDateString()
                              : "Now"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mr-4">
                      <Bell className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Recent Activity
                      </h2>
                      <p className="text-sm text-gray-600">
                        Latest updates and notifications
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab("maintenance-requests")}
                    className="flex items-center px-4 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 font-semibold transition-all duration-200"
                  >
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </motion.button>
                </div>
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ scale: 1.01, x: 4 }}
                      className={`p-4 rounded-lg border-l-4 transition-all duration-200 ${
                        activity.priority === "high"
                          ? "bg-gradient-to-r from-red-50 to-red-100 border-red-500 hover:shadow-md"
                          : activity.status === "completed"
                          ? "bg-gradient-to-r from-green-50 to-green-100 border-green-500 hover:shadow-md"
                          : activity.status === "pending"
                          ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-500 hover:shadow-md"
                          : "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-500 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              activity.type === "application"
                                ? "bg-blue-100"
                                : activity.type === "maintenance"
                                ? "bg-orange-100"
                                : "bg-green-100"
                            }`}
                          >
                            {activity.type === "application" && (
                              <Users className="h-4 w-4 text-blue-600" />
                            )}
                            {activity.type === "maintenance" && (
                              <Wrench className="h-4 w-4 text-orange-600" />
                            )}
                            {activity.type === "payment" && (
                              <DollarSign className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <p className="text-sm font-semibold text-gray-900">
                            {activity.message}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                            activity.priority === "high"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : activity.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                        >
                          {activity.priority}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-medium">{activity.property}</span>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Properties</h2>
                <p className="text-gray-600 mt-1">
                  Manage your property portfolio
                </p>
              </div>
              <Button 
                onClick={() => setShowPropertyForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800">{error}</span>
                </div>
                <button
                  onClick={fetchProperties}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {properties.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Properties Found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You haven't added any properties yet.
                    </p>
                    <Button
                      onClick={() => setShowPropertyForm(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Property
                    </Button>
                  </div>
                ) : (
                  properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      {/* Image Section */}
                      {property.images && property.images.length > 0 ? (
                        <div className="relative h-48 bg-gray-100">
                          <img
                            src={property.images[0]}
                            alt={property.name || property.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200" style={{display: 'none'}}>
                            <div className="flex items-center justify-center h-full">
                              <Building className="h-12 w-12 text-green-600" />
                        </div>
                          </div>
                          <div className="absolute top-3 right-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                property.is_available
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {property.is_available ? "Available" : "Unavailable"}
                            </span>
                        </div>
                          {property.images.length > 1 && (
                            <div className="absolute bottom-3 right-3">
                              <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
                                +{property.images.length - 1} more
                              </span>
                      </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                          <Building className="h-12 w-12 text-green-600" />
                        </div>
                      )}

                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 text-lg mb-2">
                            {property.name || property.title}
                          </h3>
                          <div className="flex items-center text-gray-500 text-sm">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">
                              {typeof property.address === "string"
                                ? property.address
                                : `${property.address.line1}, ${property.address.city}, ${property.address.region}`}
                      </span>
                          </div>
                    </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                            <p className="text-xs text-blue-700 font-medium mb-1">Bedrooms</p>
                            <p className="text-xl font-bold text-gray-900">
                              {property.bedrooms}
                            </p>
                      </div>
                          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                            <p className="text-xs text-green-700 font-medium mb-1">Bathrooms</p>
                            <p className="text-xl font-bold text-green-600">
                              {property.bathrooms}
                            </p>
                      </div>
                    </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600 font-medium">Square Feet</span>
                            <span className="font-bold text-gray-900">
                              {property.square_feet?.toLocaleString() || "N/A"}
                            </span>
                      </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>

                        <div className="flex items-center justify-between mb-4">
                      <div>
                            <p className="text-xs text-gray-500 font-medium">Monthly Rent</p>
                        <p className="text-2xl font-bold text-green-600">
                              ${property.rent_amount?.toLocaleString() || "0"}
                        </p>
                      </div>
                      <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium">Available Date</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {property.available_date
                                ? new Date(property.available_date).toLocaleDateString()
                                : "N/A"}
                            </p>
                      </div>
                    </div>

                        {/* Amenities */}
                        {property.amenities && property.amenities.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 font-medium mb-2">Amenities</p>
                            <div className="flex flex-wrap gap-1">
                              {property.amenities.slice(0, 3).map((amenity, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {property.amenities.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                  +{property.amenities.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleViewProperty(property)}
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-all duration-200"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-all duration-200"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDeleteProperty(property)}
                        className="px-3 py-2 border border-red-200 rounded-lg hover:bg-red-50 font-medium text-red-600 hover:text-red-700 transition-all duration-200"
                        title="Delete Property"
                      >
                        <Trash2 className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
                  ))
                )}
            </div>
          </motion.div>
        )}

        {/* Listings Tab */}
        {activeTab === "listings" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  Active Listings
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage your property listings and pricing
                </p>
              </div>
              <Button 
                onClick={() => setShowPropertyForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Listing
              </Button>
            </div>

            {/* Loading State */}
            {listingsLoading && (
              <Loader 
                message="Loading Listings" 
                subMessage="Retrieving your property listings..."
              />
            )}

            {/* Error State */}
            {listingsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800">{listingsError}</span>
                </div>
                <button 
                  onClick={fetchListings}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Listings Grid */}
            {!listingsLoading && !listingsError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Listings Found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You haven't created any listings yet.
                    </p>
                    <Button
                      onClick={() => setShowPropertyForm(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Listing
                    </Button>
                  </div>
                ) : (
                  listings.map((listing, index) => (
            <motion.div
                      key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      {/* Image Section */}
                      {listing.images && listing.images.length > 0 ? (
                        <div className="relative h-48 bg-gray-100">
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200" style={{display: 'none'}}>
                            <div className="flex items-center justify-center h-full">
                              <List className="h-12 w-12 text-blue-600" />
                </div>
                          </div>
                          <div className="absolute top-3 right-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                listing.available
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {listing.available ? "Active" : "Inactive"}
                            </span>
                          </div>
                          {listing.images.length > 1 && (
                            <div className="absolute bottom-3 right-3">
                              <span className="px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full">
                                +{listing.images.length - 1} more
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <List className="h-12 w-12 text-blue-600" />
                        </div>
                      )}

                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="font-semibold text-gray-900 text-lg mb-2">
                            {listing.title}
                          </h3>
                          {listing.property && (
                            <div className="flex items-center text-gray-500 text-sm">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">
                                {typeof listing.property.address === "string"
                                  ? listing.property.address
                                  : `${listing.property.address.line1}, ${listing.property.address.city}, ${listing.property.address.region}`}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                            <p className="text-xs text-blue-700 font-medium mb-1">Bedrooms</p>
                            <p className="text-xl font-bold text-gray-900">
                              {listing.bedrooms}
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                            <p className="text-xs text-green-700 font-medium mb-1">Bathrooms</p>
                            <p className="text-xl font-bold text-green-600">
                              {listing.bathrooms}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600 font-medium">Square Feet</span>
                            <span className="font-bold text-gray-900">
                              {listing.squareFeet?.toLocaleString() || "N/A"}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: "100%" }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Monthly Rent</p>
                            <p className="text-2xl font-bold text-green-600">
                              ${listing.rent?.toLocaleString() || "0"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium">Deposit</p>
                            <p className="text-sm font-semibold text-gray-900">
                              ${listing.deposit?.toLocaleString() || "0"}
                            </p>
                          </div>
                        </div>

                        {/* Additional Listing Info */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 font-medium mb-1">Lease Term</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {listing.lease_term_months ? `${listing.lease_term_months} months` : "Flexible"}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 font-medium mb-1">Application Fee</p>
                            <p className="text-sm font-semibold text-gray-900">
                              ${listing.application_fee || "0"}
                            </p>
                          </div>
                        </div>

                        {/* Amenities */}
                        {listing.amenities && listing.amenities.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 font-medium mb-2">Amenities</p>
                            <div className="flex flex-wrap gap-1">
                              {listing.amenities.slice(0, 3).map((amenity, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {amenity}
                                </span>
                              ))}
                              {listing.amenities.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                  +{listing.amenities.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleViewPropertyDetails(listing)}
                            className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-all duration-200"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-all duration-200"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-all duration-200"
                          >
                            <Settings className="h-4 w-4" />
                          </motion.button>
                </div>
              </div>
            </motion.div>
                  ))
                )}
          </div>
            )}
          </motion.div>
        )}

        {/* Applications Tab */}
        {activeTab === "applications" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                  Tenant Applications
                </h2>
                <p className="text-gray-600 mt-1">
                  Review, screen, and manage rental applications
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-3 md:mt-0">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  {pendingApplications} Pending Review
                </Badge>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Screening Available
                </Badge>
              </div>
            </div>

            {/* Loading State */}
            {applicationsLoading && (
              <Loader 
                message="Loading Applications" 
                subMessage="Retrieving your application data..."
              />
            )}

            {/* Error State */}
            {applicationsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800">{applicationsError}</span>
                </div>
                <button 
                  onClick={fetchApplications}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Applications Grid */}
            {!applicationsLoading && !applicationsError && (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {applications.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Applications Found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You haven't received any applications yet.
                    </p>
                    <Button
                      onClick={() => setShowPropertyForm(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Property Listing
                    </Button>
                  </div>
                ) : (
                  applications.map((application, index) => (
            <motion.div
                      key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                              <Users className="h-6 w-6 text-purple-600" />
                </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">
                                {application.personalInfo.firstName} {application.personalInfo.lastName}
                              </h3>
                              <div className="flex items-center text-gray-500 text-sm">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="truncate">
                                  {application.applicationMetadata.propertyName || application.property?.name || 'Property'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              application.status === 'pending'
                                ? "bg-yellow-100 text-yellow-700"
                                : application.status === 'approved'
                                ? "bg-green-100 text-green-700"
                                : application.status === 'rejected'
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                            <p className="text-xs text-blue-700 font-medium mb-1">Monthly Income</p>
                            <p className="text-xl font-bold text-gray-900">
                              ${application.leaseHoldersAndGuarantors.leaseHolders[0]?.monthlyIncome || application.legacy.annualIncome || "0"}
                            </p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                            <p className="text-xs text-green-700 font-medium mb-1">Unit Rent</p>
                            <p className="text-xl font-bold text-green-600">
                              ${application.applicationMetadata.unitRent?.toLocaleString() || "0"}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600 font-medium">Move-in Date</span>
                            <span className="font-bold text-gray-900">
                              {application.personalInfo.moveInDate 
                                ? new Date(application.personalInfo.moveInDate).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: "100%" }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Unit Deposit</p>
                            <p className="text-2xl font-bold text-green-600">
                              ${application.applicationMetadata.unitDeposit?.toLocaleString() || "0"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 font-medium">Applied Date</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {application.submittedAt 
                                ? new Date(
                                    typeof application.submittedAt === 'object' && 'seconds' in application.submittedAt
                                      ? application.submittedAt.seconds * 1000
                                      : application.submittedAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                        </div>

                        {/* Application Details */}
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 font-medium mb-2">Application Details</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                              Unit: {application.applicationMetadata.unitNumber}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                              {application.applicationMetadata.unitBedrooms} bed, {application.applicationMetadata.unitBathrooms} bath
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700">
                              {application.applicationMetadata.selectedLeaseTermMonths} months
                            </span>
                            {application.additionalInfo.pets.hasPets && (
                              <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                                Has Pets
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleViewApplicationDetails(application)}
                            className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-all duration-200"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </motion.button>
                          
                          {/* Status Change Buttons - Only show for pending applications */}
                          {application.status === 'pending' && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleStatusUpdate(application.id, 'approved')}
                                className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Approve
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleStatusUpdate(application.id, 'rejected')}
                                className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </motion.button>
                            </>
                          )}
                          
                          {/* Show status for non-pending applications */}
                          {application.status !== 'pending' && (
                            <div className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 rounded-lg">
                              <span className={`text-sm font-medium ${
                                application.status === 'approved' 
                                  ? 'text-green-700' 
                                  : application.status === 'rejected'
                                  ? 'text-red-700'
                                  : 'text-gray-700'
                              }`}>
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </span>
                            </div>
                          )}
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-all duration-200"
                          >
                            <Settings className="h-4 w-4" />
                          </motion.button>
                </div>
              </div>
            </motion.div>
                  ))
                )}
          </div>
            )}
          </motion.div>
        )}

        {/* Work Orders Tab
        {activeTab === "maintenance" && (
          <div className="space-y-6">
            <div className=" flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                  Work Orders
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage maintenance requests and work orders
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-3 md:mt-0">
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  {urgentMaintenance} Urgent
                </Badge>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Maintenance Management
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Track and manage maintenance requests from tenants. Schedule
                  repairs, assign contractors, and monitor work progress.
                </p>
                <div className="flex flex-col md:flex-row justify-center  gap-y-2 md:gap-y-0 space-x-0 md:space-x-3">
                  <Button
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    View All Work Orders
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Work Order
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )} */}

        {/* Maintenance Requests Tab */}
        {activeTab === "maintenance-requests" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row  justify-between items-start md:items-center">
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                  Maintenance Requests
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage maintenance requests and work orders from reter
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-2 md:mt-0 ">
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  {maintenanceRequests.filter(req => req.priority === 'emergency' || req.priority === 'high').length} Urgent
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                  {maintenanceRequests.filter(req => req.status === 'submitted').length} Pending
                </Badge>
              </div>
            </div>

            {/* Loading State */}
            {maintenanceLoading && (
              <Loader 
                message="Loading Maintenance Requests" 
                subMessage="Retrieving your property maintenance requests..."
              />
            )}

            {/* Maintenance Requests Table */}
            {!maintenanceLoading && maintenanceRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Wrench className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Maintenance Requests
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    You haven't received any maintenance requests yet. They will appear here when tenants submit them.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                          Issue
                        </th>
                       
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                          Description
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider  w-24 ">
                          Status
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Priority
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                          Category
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                          Unit
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                          Submitted
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {maintenanceRequests.map((request, index) => (
                        <motion.tr
                          key={request.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-4 py-4 whitespace-nowrap w-48">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                                request.priority === 'emergency' ? 'bg-red-100' :
                                request.priority === 'high' ? 'bg-orange-100' :
                                request.priority === 'medium' ? 'bg-yellow-100' :
                                'bg-green-100'
                              }`}>
                                <Wrench className={`h-5 w-5 ${
                                  request.priority === 'emergency' ? 'text-red-600' :
                                  request.priority === 'high' ? 'text-orange-600' :
                                  request.priority === 'medium' ? 'text-yellow-600' :
                                  'text-green-600'
                                }`} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {request.title}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {request.propertyAddress || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                         
                          <td className="px-4 py-4 w-64">
                            <div className="text-sm text-gray-900 max-w-full truncate">
                              {request.description}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <Popover>
                              <PopoverTrigger asChild>
                                <div className="cursor-pointer transition-all hover:scale-105 transform duration-200">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                    request.status === 'submitted' ? "bg-yellow-100 text-yellow-700" :
                                    request.status === 'in_progress' ? "bg-blue-100 text-blue-700" :
                                    request.status === 'completed' ? "bg-green-100 text-green-700" :
                                    "bg-gray-100 text-gray-700"
                                  }`}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    <ChevronRight className="w-3 h-3 rotate-90" />
                                  </span>
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 rounded-lg shadow-lg border-0 overflow-hidden">
                                <div className="py-2">
                                  <div className="px-4 py-3 text-sm font-medium bg-gray-50 border-b">
                                    <span className="text-gray-700">Change Status</span>
                                  </div>
                                  <div className="p-1">
                                    {[
                                      { value: 'submitted', label: 'Submitted' },
                                      { value: 'in_progress', label: 'In Progress' },
                                      { value: 'completed', label: 'Completed' },
                                      { value: 'cancelled', label: 'Cancelled' },
                                    ].map((status) => (
                                      <div
                                        key={status.value}
                                        className={`px-3 py-2 text-sm cursor-pointer rounded m-1 flex items-center transition-all ${
                                          request.status === status.value
                                            ? "bg-gray-100"
                                            : "hover:bg-gray-100"
                                        }`}
                                        onClick={() => {
                                          if (request.id && request.status !== status.value) {
                                            handleInlineStatusChange(request.id, status.value as MaintenanceRequest['status']);
                                          }
                                        }}
                                      >
                                        <span className="mr-2"></span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                          status.value === 'submitted' ? "bg-yellow-100 text-yellow-700" :
                                          status.value === 'in_progress' ? "bg-blue-100 text-blue-700" :
                                          status.value === 'completed' ? "bg-green-100 text-green-700" :
                                          "bg-gray-100 text-gray-700"
                                        }`}>
                                          {status.label}
                                        </span>
                                        {request.status === status.value && (
                                          <svg
                                            className="ml-auto h-4 w-4 text-blue-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap ">
                            <Popover>
                              <PopoverTrigger asChild>
                                <div className="cursor-pointer transition-all hover:scale-105 transform duration-200">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                    request.priority === 'emergency' ? 'bg-red-100 text-red-700' :
                                    request.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                    request.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                                    <ChevronRight className="w-3 h-3 rotate-90" />
                                  </span>
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 rounded-lg shadow-lg border-0 overflow-hidden">
                                <div className="py-2">
                                  <div className="px-4 py-3 text-sm font-medium bg-gray-50 border-b">
                                    <span className="text-gray-700">Change Priority</span>
                                  </div>
                                  <div className="p-1">
                                    {[
                                      { value: 'low', label: 'Low' },
                                      { value: 'medium', label: 'Medium' },
                                      { value: 'high', label: 'High' },
                                      { value: 'emergency', label: 'Emergency' },
                                    ].map((priority) => (
                                      <div
                                        key={priority.value}
                                        className={`px-3 py-2 text-sm cursor-pointer rounded m-1 flex items-center transition-all ${
                                          request.priority === priority.value
                                            ? "bg-gray-100"
                                            : "hover:bg-gray-100"
                                        }`}
                                        onClick={() => {
                                          if (request.id && request.priority !== priority.value) {
                                            handleInlinePriorityChange(request.id, priority.value as MaintenanceRequest['priority']);
                                          }
                                        }}
                                      >
                                        <span className="mr-2"></span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                          priority.value === 'low' ? "bg-green-100 text-green-700" :
                                          priority.value === 'medium' ? "bg-yellow-100 text-yellow-700" :
                                          priority.value === 'high' ? "bg-orange-100 text-orange-700" :
                                          "bg-red-100 text-red-700"
                                        }`}>
                                          {priority.label}
                                        </span>
                                        {request.priority === priority.value && (
                                          <svg
                                            className="ml-auto h-4 w-4 text-blue-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap w-24">
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                              {request.category.charAt(0).toUpperCase() + request.category.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap w-20">
                            <div className="text-sm text-gray-900">
                              {request.unitNumber || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap w-28">
                            <div className="text-sm text-gray-900">
                              {new Date(request.submittedAt).toLocaleDateString()}
                            </div>
                            {request.scheduledDate && (
                              <div className="text-xs text-gray-500">
                                Scheduled: {new Date(request.scheduledDate).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium w-20">
                            <Popover 
                              open={openDropdownId === request.id} 
                              onOpenChange={(open) => setOpenDropdownId(open ? request.id || null : null)}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-48 p-1" align="end">
                                <div className="space-y-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                    onClick={() => {
                                      setSelectedMaintenanceRequest(request);
                                      setShowMaintenanceModal(true);
                                      setOpenDropdownId(null);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Button>
                                  
                                  {/* {request.status === 'submitted' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start text-orange-600 hover:text-orange-900 hover:bg-orange-50"
                                      onClick={() => {
                                        if (request.id) {
                                          handleStatusChange(request.id, 'in_progress');
                                        }
                                        setOpenDropdownId(null);
                                      }}
                                    >
                                      <Play className="h-4 w-4 mr-2" />
                                      Start Work
                                    </Button>
                                  )}
                                    
                                  {request.status === 'in_progress' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start text-green-600 hover:text-green-900 hover:bg-green-50"
                                      onClick={() => {
                                        if (request.id) {
                                          handleStatusChange(request.id, 'completed');
                                        }
                                        setOpenDropdownId(null);
                                      }}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark Complete
                                    </Button>
                                  )}
                                   */}
                                
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                                    onClick={() => {
                                      handleScheduleMaintenance(request);
                                      setOpenDropdownId(null);
                                    }}
                                  >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule
                                  </Button>
                                  
                                  {/* <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                    onClick={() => {
                                      handleAddNotes(request);
                                      setOpenDropdownId(null);
                                    }}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Add Notes
                                  </Button> */}
                                  
                                  {request.status !== 'cancelled' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full justify-start text-red-600 hover:text-red-900 hover:bg-red-50"
                                      onClick={() => {
                                        if (request.id) {
                                          handleCancelRequest(request.id);
                                        }
                                        setOpenDropdownId(null);
                                      }}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Cancel Request
                                    </Button>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Analytics & Reports
                </h2>
                <p className="text-gray-600 mt-1">
                  Track performance, occupancy, and revenue metrics
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Business Intelligence
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Generate comprehensive reports on occupancy rates, revenue
                  trends, lead conversion, and property performance analytics.
                </p>
                <div className="flex justify-center space-x-3">
                  <Button
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Reports
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-gray-600 mt-1">
                  Manage your account, employees, and preferences
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Landlord Settings
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Manage your organization, employee roles, notification
                  preferences, and property management settings.
                </p>
                <div className="flex justify-center space-x-3">
                  <Button
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Employees
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Account Settings
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {showApplicationModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100"
          >
            {/* Modern Header with Gradient Background */}
            <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 p-6 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl"
                  >
                    <Users className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">
                      {selectedApplication.personalInfo.firstName} {selectedApplication.personalInfo.lastName}
                    </h2>
                    <p className="text-white/90 text-sm">
                      Application for {selectedApplication.applicationMetadata.propertyName || 'Property'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          Applied: {selectedApplication.submittedAt 
                            ? new Date(
                                typeof selectedApplication.submittedAt === 'object' && 'seconds' in selectedApplication.submittedAt
                                  ? selectedApplication.submittedAt.seconds * 1000
                                  : selectedApplication.submittedAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedApplication.status === 'pending'
                          ? "bg-yellow-100 text-yellow-700"
                          : selectedApplication.status === 'approved'
                          ? "bg-green-100 text-green-700"
                          : selectedApplication.status === 'rejected'
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCloseApplicationModal}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Security Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 px-6 py-3">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-emerald-800">
                  All application information is secure and verified
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Personal Information */}
                <div className="space-y-6">
                  {/* Personal Information Card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 font-medium">Email</p>
                          <p className="font-semibold text-gray-900">{selectedApplication.personalInfo.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                          <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 font-medium">Phone</p>
                          <p className="font-semibold text-gray-900">{selectedApplication.personalInfo.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 font-medium">Date of Birth</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(selectedApplication.personalInfo.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 font-medium">Move-in Date</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(selectedApplication.personalInfo.moveInDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information Card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Financial Information</h3>
                    </div>
                    <div className="space-y-6">
                      {/* Financial Highlights */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-blue-700 font-semibold">Monthly Income</p>
                            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                              <DollarSign className="h-3 w-3 text-blue-700" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-blue-900">
                            ${selectedApplication.leaseHoldersAndGuarantors.leaseHolders[0]?.monthlyIncome || selectedApplication.legacy.annualIncome || "0"}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-green-700 font-semibold">Unit Rent</p>
                            <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                              <Home className="h-3 w-3 text-green-700" />
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-green-900">
                            ${selectedApplication.applicationMetadata.unitRent?.toLocaleString() || "0"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Employment Information */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-indigo-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Employment Details</h4>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-600 font-medium">Status</p>
                            <p className="font-semibold text-gray-900">{selectedApplication.financialInfo.employment}</p>
                          </div>
                          {selectedApplication.financialInfo.employerName && (
                            <div>
                              <p className="text-sm text-gray-600 font-medium">Employer</p>
                              <p className="font-semibold text-gray-900">{selectedApplication.financialInfo.employerName}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Housing History Card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                        <Home className="h-5 w-5 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Housing History</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                        <div className="flex items-center mb-3">
                          <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                            <Home className="h-3 w-3 text-purple-700" />
                          </div>
                          <h4 className="text-lg font-semibold text-purple-900">Current Address</h4>
                        </div>
                        <p className="font-semibold text-gray-900 mb-2">{selectedApplication.housingHistory.currentAddress.fullAddress}</p>
                        <p className="text-sm text-purple-700 font-medium">Duration: {selectedApplication.housingHistory.currentAddress.duration}</p>
                      </div>
                      {selectedApplication.housingHistory.previousAddress.fullAddress && (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                          <div className="flex items-center mb-3">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                              <Home className="h-3 w-3 text-gray-700" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900">Previous Address</h4>
                          </div>
                          <p className="font-semibold text-gray-900">{selectedApplication.housingHistory.previousAddress.fullAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Additional Information */}
                <div className="space-y-6">
                  {/* Application Details Card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mr-3">
                        <FileText className="h-5 w-5 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Application Details</h3>
                    </div>
                    <div className="space-y-6">
                      {/* Unit Information Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-indigo-200 rounded-full flex items-center justify-center mr-2">
                              <Home className="h-3 w-3 text-indigo-700" />
                            </div>
                            <p className="text-sm text-indigo-700 font-semibold">Unit</p>
                          </div>
                          <p className="text-lg font-bold text-indigo-900">{selectedApplication.applicationMetadata.unitNumber}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center mr-2">
                              <Calendar className="h-3 w-3 text-blue-700" />
                            </div>
                            <p className="text-sm text-blue-700 font-semibold">Lease Term</p>
                          </div>
                          <p className="text-lg font-bold text-blue-900">{selectedApplication.applicationMetadata.selectedLeaseTermMonths} months</p>
                        </div>
                      </div>
                      
                      {/* Unit Specifications */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center mr-2">
                              <Home className="h-3 w-3 text-green-700" />
                            </div>
                            <p className="text-sm text-green-700 font-semibold">Bedrooms</p>
                          </div>
                          <p className="text-lg font-bold text-green-900">{selectedApplication.applicationMetadata.unitBedrooms}</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center mr-2">
                              <Home className="h-3 w-3 text-orange-700" />
                            </div>
                            <p className="text-sm text-orange-700 font-semibold">Bathrooms</p>
                          </div>
                          <p className="text-lg font-bold text-orange-900">{selectedApplication.applicationMetadata.unitBathrooms}</p>
                        </div>
                      </div>
                      
                      {/* Security Deposit Highlight */}
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-emerald-200 rounded-full flex items-center justify-center mr-3">
                              <DollarSign className="h-4 w-4 text-emerald-700" />
                            </div>
                            <h4 className="text-lg font-semibold text-emerald-900">Security Deposit</h4>
                          </div>
                          <div className="bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold">
                            Required
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-emerald-900">
                          ${selectedApplication.applicationMetadata.unitDeposit?.toLocaleString() || "0"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact Card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3">
                        <Phone className="h-5 w-5 text-red-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Emergency Contact</h3>
                    </div>
                    <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center">
                            <User className="h-4 w-4 text-red-700" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-red-700 font-medium">Name</p>
                            <p className="font-semibold text-gray-900">{selectedApplication.additionalInfo.emergencyContact.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center">
                            <Phone className="h-4 w-4 text-red-700" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-red-700 font-medium">Phone</p>
                            <p className="font-semibold text-gray-900">{selectedApplication.additionalInfo.emergencyContact.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-red-200 rounded-lg flex items-center justify-center">
                            <Heart className="h-4 w-4 text-red-700" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-red-700 font-medium">Relation</p>
                            <p className="font-semibold text-gray-900">{selectedApplication.additionalInfo.emergencyContact.relation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pets & Vehicles Card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center mr-3">
                        <Heart className="h-5 w-5 text-pink-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Pets & Vehicles</h3>
                    </div>
                    <div className="space-y-6">
                      {/* Pets Section */}
                      <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-2xl p-6 border border-pink-200">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-pink-200 rounded-lg flex items-center justify-center mr-3">
                            <Heart className="h-4 w-4 text-pink-700" />
                          </div>
                          <h4 className="text-lg font-semibold text-pink-900">Pets</h4>
                        </div>
                        {selectedApplication.additionalInfo.pets.hasPets ? (
                          <div className="space-y-3">
                            {selectedApplication.additionalInfo.pets.pets.map((pet, index) => (
                              <div key={index} className="bg-white rounded-xl p-4 border border-pink-200">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-semibold text-gray-900">{pet.type} - {pet.breed}</p>
                                  <div className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full text-xs font-medium">
                                    Pet
                                  </div>
                                </div>
                                <p className="text-sm text-pink-700">Age: {pet.age}, Weight: {pet.weight}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Heart className="h-6 w-6 text-pink-400" />
                            </div>
                            <p className="text-pink-600 font-medium">No pets</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Vehicles Section */}
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                        <div className="flex items-center mb-4">
                          <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center mr-3">
                            <Home className="h-4 w-4 text-blue-700" />
                          </div>
                          <h4 className="text-lg font-semibold text-blue-900">Vehicles</h4>
                        </div>
                        {selectedApplication.additionalInfo.vehicles.hasVehicles ? (
                          <div className="space-y-3">
                            {selectedApplication.additionalInfo.vehicles.vehicles.map((vehicle, index) => (
                              <div key={index} className="bg-white rounded-xl p-4 border border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-semibold text-gray-900">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                                  <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                    Vehicle
                                  </div>
                                </div>
                                <p className="text-sm text-blue-700">License: {vehicle.licensePlate}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Home className="h-6 w-6 text-blue-400" />
                            </div>
                            <p className="text-blue-600 font-medium">No vehicles</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes Card */}
                  {selectedApplication.additionalInfo.notes && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Additional Notes</h3>
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                        <p className="text-gray-700 leading-relaxed">{selectedApplication.additionalInfo.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modern Footer with Action Buttons */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedApplication.status === 'pending'
                        ? "bg-yellow-400"
                        : selectedApplication.status === 'approved'
                        ? "bg-green-400"
                        : selectedApplication.status === 'rejected'
                        ? "bg-red-400"
                        : "bg-gray-400"
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      Status: {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleCloseApplicationModal}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all">
                    <Users className="h-4 w-4 mr-2" />
                    Screen Applicant
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all">
                    <FileText className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        )}

        {/* Property Details Modal */}
        {showPropertyDetailsModal && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header - Green Background */}
              <div className="bg-green-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Home className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedProperty.title || 'Property Details'}
                      </h2>
                     
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedProperty.available ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={handleClosePropertyDetailsModal}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-green-100 text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Listed: {selectedProperty.availableDate ? 
                    (typeof selectedProperty.availableDate === 'object' && 'seconds' in selectedProperty.availableDate
                      ? new Date(selectedProperty.availableDate.seconds * 1000).toLocaleDateString()
                      : new Date(selectedProperty.availableDate).toLocaleDateString()) : 
                    'N/A'
                  }
                </div>
              </div>

              {/* Security Verification Bar */}
              <div className="bg-green-50 border-l-4 border-green-400 px-4 py-2">
                <div className="flex items-center text-green-800 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  All property information is secure and verified
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Property Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Home className="h-5 w-5 mr-2 text-blue-600" />
                        Property Information
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Bed className="h-5 w-5 text-blue-600 mr-3" />
                            <span className="text-gray-700 font-medium">Bedrooms</span>
                          </div>
                          <span className="text-2xl font-bold text-blue-600">
                            {selectedProperty.bedrooms || 'N/A'}
                          </span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Bath className="h-5 w-5 text-green-600 mr-3" />
                            <span className="text-gray-700 font-medium">Bathrooms</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            {selectedProperty.bathrooms || 'N/A'}
                          </span>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Square className="h-5 w-5 text-orange-600 mr-3" />
                            <span className="text-gray-700 font-medium">Square Feet</span>
                          </div>
                          <span className="text-2xl font-bold text-orange-600">
                            {selectedProperty.squareFeet || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                        Financial Information
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-gray-700 font-medium">Monthly Rent</span>
                          </div>
                          <span className="text-3xl font-bold text-blue-600">
                            ${selectedProperty.rent || '0'}
                          </span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <Home className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-gray-700 font-medium">Security Deposit</span>
                            <span className="ml-2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                              Required
                            </span>
                          </div>
                          <span className="text-3xl font-bold text-green-600">
                            ${selectedProperty.deposit || '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Property Details */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        Property Details
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Home className="h-5 w-5 text-blue-600 mr-3" />
                            <span className="text-gray-700 font-medium">Property Type</span>
                          </div>
                          <span className="text-lg font-semibold text-blue-600">
                            Apartment
                          </span>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                            <span className="text-gray-700 font-medium">Lease Term</span>
                          </div>
                          <span className="text-lg font-semibold text-blue-600">
                            12 months
                          </span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Bed className="h-5 w-5 text-green-600 mr-3" />
                            <span className="text-gray-700 font-medium">Bedrooms</span>
                          </div>
                          <span className="text-lg font-semibold text-green-600">
                            {selectedProperty.bedrooms || 'N/A'}
                          </span>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Bath className="h-5 w-5 text-orange-600 mr-3" />
                            <span className="text-gray-700 font-medium">Bathrooms</span>
                          </div>
                          <span className="text-lg font-semibold text-orange-600">
                            {selectedProperty.bathrooms || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                        Location Information
                      </h3>
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <MapPin className="h-4 w-4 text-gray-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">Address</span>
                          </div>
                          <p className="text-gray-900">
                            {selectedProperty.property?.address?.line1 || 'Address not available'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <Building className="h-4 w-4 text-gray-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">City</span>
                          </div>
                          <p className="text-gray-900">
                            {selectedProperty.property?.address?.city || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <MapPin className="h-4 w-4 text-gray-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">State</span>
                          </div>
                          <p className="text-gray-900">
                            {selectedProperty.property?.address?.region || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Star className="h-5 w-5 mr-2 text-purple-600" />
                        Amenities
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProperty.amenities && selectedProperty.amenities.length > 0 ? (
                          selectedProperty.amenities.map((amenity: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                            >
                              {amenity}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No amenities listed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
           
            </motion.div>
          </div>
        )}

        {/* Property View Modal */}
        {showPropertyViewModal && selectedPropertyForView && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header - Green Background */}
              <div className="bg-green-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Home className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedPropertyForView.name || selectedPropertyForView.title || 'Property Details'}
                      </h2>
                     
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedPropertyForView.is_available 
                        ? 'bg-green-500' 
                        : 'bg-gray-500'
                    }`}>
                      {selectedPropertyForView.is_available ? 'Available' : 'Unavailable'}
                    </span>
                    <button
                      onClick={handleClosePropertyViewModal}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-green-100 text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Available: {selectedPropertyForView.available_date ? 
                    new Date(selectedPropertyForView.available_date).toLocaleDateString() : 
                    'N/A'
                  }
                </div>
              </div>

              {/* Security Verification Bar */}
              <div className="bg-green-50 border-l-4 border-green-400 px-4 py-2">
                <div className="flex items-center text-green-800 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  All property information is secure and verified
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Property Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Home className="h-5 w-5 mr-2 text-blue-600" />
                        Property Information
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Bed className="h-5 w-5 text-blue-600 mr-3" />
                            <span className="text-gray-700 font-medium">Bedrooms</span>
                          </div>
                          <span className="text-2xl font-bold text-blue-600">
                            {selectedPropertyForView.bedrooms || 'N/A'}
                          </span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Bath className="h-5 w-5 text-green-600 mr-3" />
                            <span className="text-gray-700 font-medium">Bathrooms</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            {selectedPropertyForView.bathrooms || 'N/A'}
                          </span>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Square className="h-5 w-5 text-orange-600 mr-3" />
                            <span className="text-gray-700 font-medium">Square Feet</span>
                          </div>
                          <span className="text-2xl font-bold text-orange-600">
                            {selectedPropertyForView.square_feet || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                        Financial Information
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="text-gray-700 font-medium">Monthly Rent</span>
                          </div>
                          <span className="text-3xl font-bold text-blue-600">
                            ${selectedPropertyForView.rent_amount || '0'}
                          </span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <Home className="h-5 w-5 text-green-600 mr-2" />
                            <span className="text-gray-700 font-medium">Security Deposit</span>
                            <span className="ml-2 bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                              Required
                            </span>
                          </div>
                          <span className="text-3xl font-bold text-green-600">
                            ${selectedPropertyForView.rent_amount ? Math.round(selectedPropertyForView.rent_amount * 0.5) : '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Property Details */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        Property Details
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Home className="h-5 w-5 text-blue-600 mr-3" />
                            <span className="text-gray-700 font-medium">Property Type</span>
                          </div>
                          <span className="text-lg font-semibold text-blue-600">
                            {selectedPropertyForView.property_type || 'Apartment'}
                          </span>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                            <span className="text-gray-700 font-medium">Available Date</span>
                          </div>
                          <span className="text-lg font-semibold text-blue-600">
                            {selectedPropertyForView.available_date ? 
                              new Date(selectedPropertyForView.available_date).toLocaleDateString() : 
                              'N/A'
                            }
                          </span>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Bed className="h-5 w-5 text-green-600 mr-3" />
                            <span className="text-gray-700 font-medium">Bedrooms</span>
                          </div>
                          <span className="text-lg font-semibold text-green-600">
                            {selectedPropertyForView.bedrooms || 'N/A'}
                          </span>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <Bath className="h-5 w-5 text-orange-600 mr-3" />
                            <span className="text-gray-700 font-medium">Bathrooms</span>
                          </div>
                          <span className="text-lg font-semibold text-orange-600">
                            {selectedPropertyForView.bathrooms || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                        Location Information
                      </h3>
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <MapPin className="h-4 w-4 text-gray-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">Address</span>
                          </div>
                          <p className="text-gray-900">
                            {selectedPropertyForView.address?.line1 || 'Address not available'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <Building className="h-4 w-4 text-gray-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">City</span>
                          </div>
                          <p className="text-gray-900">
                            {selectedPropertyForView.address?.city || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <MapPin className="h-4 w-4 text-gray-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">State</span>
                          </div>
                          <p className="text-gray-900">
                            {selectedPropertyForView.address?.region || 'N/A'}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center mb-1">
                            <MapPin className="h-4 w-4 text-gray-600 mr-2" />
                            <span className="text-sm font-medium text-gray-600">ZIP Code</span>
                          </div>
                          <p className="text-gray-900">
                            {selectedPropertyForView.address?.postalCode || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Star className="h-5 w-5 mr-2 text-purple-600" />
                        Amenities
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPropertyForView.amenities && selectedPropertyForView.amenities.length > 0 ? (
                          selectedPropertyForView.amenities.map((amenity: string, index: number) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                            >
                              {amenity}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No amenities listed</span>
                        )}
                      </div>
                    </div>

                    {/* Property Description */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-gray-600" />
                        Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedPropertyForView.description || 
                         'No description available for this property. Contact the property manager for more details.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              
            </motion.div>
          </div>
        )}

        {/* Maintenance Request Details Modal */}
        {showMaintenanceModal && selectedMaintenanceRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modern Header with Gradient Background */}
              <div className="relative bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 p-6 text-white">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl"
                    >
                      <Wrench className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-1">
                        {selectedMaintenanceRequest.title}
                      </h2>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            Submitted: {new Date(selectedMaintenanceRequest.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                       
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedMaintenanceRequest.status === 'submitted'
                        ? "bg-yellow-100 text-yellow-700"
                        : selectedMaintenanceRequest.status === 'in_progress'
                        ? "bg-blue-100 text-blue-700"
                        : selectedMaintenanceRequest.status === 'completed'
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {selectedMaintenanceRequest.status.charAt(0).toUpperCase() + selectedMaintenanceRequest.status.slice(1)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMaintenanceModal(false)}
                      className="text-white hover:bg-white/20 p-2 rounded-xl"
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Request Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Wrench className="h-5 w-5 mr-2 text-gray-600" />
                        Request Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">Category</span>
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                            {selectedMaintenanceRequest.category.charAt(0).toUpperCase() + selectedMaintenanceRequest.category.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">Priority</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedMaintenanceRequest.priority === 'emergency' ? 'bg-red-100 text-red-700' :
                            selectedMaintenanceRequest.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            selectedMaintenanceRequest.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {selectedMaintenanceRequest.priority.charAt(0).toUpperCase() + selectedMaintenanceRequest.priority.slice(1)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">Status</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedMaintenanceRequest.status === 'submitted' ? "bg-yellow-100 text-yellow-700" :
                            selectedMaintenanceRequest.status === 'in_progress' ? "bg-blue-100 text-blue-700" :
                            selectedMaintenanceRequest.status === 'completed' ? "bg-green-100 text-green-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {selectedMaintenanceRequest.status.charAt(0).toUpperCase() + selectedMaintenanceRequest.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Property Information */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Building className="h-5 w-5 mr-2 text-gray-600" />
                        Property Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">Address</span>
                          </div>
                          <span className="text-sm text-gray-900 text-right max-w-48 truncate">
                            {selectedMaintenanceRequest.propertyAddress}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Home className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">Unit</span>
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                            {selectedMaintenanceRequest.unitNumber || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          {/* <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">Tenant ID</span>
                          </div>
                          <span className="text-sm text-gray-900 font-mono text-xs">
                            {selectedMaintenanceRequest.tenantId.slice(0, 8)}...
                          </span> */}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Timeline */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-gray-600" />
                        Timeline
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">Submitted</span>
                          </div>
                          <span className="text-sm text-gray-900">
                            {new Date(selectedMaintenanceRequest.submittedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {selectedMaintenanceRequest.scheduledDate && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm font-medium text-gray-600">Scheduled</span>
                            </div>
                            <span className="text-sm text-gray-900">
                              {new Date(selectedMaintenanceRequest.scheduledDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {selectedMaintenanceRequest.completedDate && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Check className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-sm font-medium text-gray-600">Completed</span>
                            </div>
                            <span className="text-sm text-gray-900">
                              {new Date(selectedMaintenanceRequest.completedDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                       
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-gray-600" />
                        Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm">
                        {selectedMaintenanceRequest.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Images */}
                    {selectedMaintenanceRequest.images && selectedMaintenanceRequest.images.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Eye className="h-5 w-5 mr-2 text-gray-600" />
                          Attached Images
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {selectedMaintenanceRequest.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Maintenance request image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedMaintenanceRequest.notes && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-gray-600" />
                          Your Notes
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {selectedMaintenanceRequest.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  Close
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    // Handle update action
                    console.log('Update maintenance request:', selectedMaintenanceRequest.id);
                    setShowMaintenanceModal(false);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Property Modal */}
        <DeletePropertyModal
          isOpen={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          property={selectedPropertyForDelete}
          isLoading={isDeleting}
          applications={applications}
          maintenanceRequests={maintenanceRequests}
          listings={listings}
          units={units}
        />

        {/* Schedule Maintenance Modal */}
        <ScheduleMaintenanceModal
          open={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          maintenanceRequest={selectedRequestForSchedule}
          onSchedule={handleScheduleComplete}
        />
      </div>
    );
  };

export default LandlordPropertyManagement;
