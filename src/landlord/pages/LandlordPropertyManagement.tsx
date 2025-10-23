import React, { useState, useEffect, useCallback } from "react";
import PropertyForm from "../components/PropertyForm/PropertyForm";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/badge";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
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
  Loader2,
  BarChart3,
  Bath,
  Bed,
  Square,
} from "lucide-react";

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

const LandlordPropertyManagement: React.FC = () => {
  const { user } = useAuth();
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
        console.log("listingsData", listingsData);
        
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
      console.log("Fetching applications for landlordId:", user.uid);
      console.log("Current user object:", user);
      
      // First, let's try to get all applications to see what's in the collection
      const allApplicationsQuery = query(collection(db, "applications"));
      const allSnapshot = await getDocs(allApplicationsQuery);
      console.log("Total applications in collection:", allSnapshot.docs.length);
      
      if (allSnapshot.docs.length > 0) {
        const sampleData = allSnapshot.docs[0].data();
        console.log("Sample application data:", sampleData);
        console.log("Sample application landlordId:", sampleData.landlordId);
        console.log("Sample application applicationMetadata:", sampleData.applicationMetadata);
        console.log("Sample application applicationMetadata.landlordId:", sampleData.applicationMetadata?.landlordId);
        console.log("All available fields in sample application:", Object.keys(sampleData));
      } else {
        console.log("No applications found in the collection");
      }
      
      // Check if any applications match the current user ID in any field
      if (allSnapshot.docs.length > 0) {
        const matchingApps = allSnapshot.docs.filter(doc => {
          const data = doc.data();
          return data.landlordId === user.uid || 
                 data.applicationMetadata?.landlordId === user.uid ||
                 data.submittedBy === user.uid;
        });
        console.log("Applications matching current user ID:", matchingApps.length);
        if (matchingApps.length > 0) {
          console.log("Matching application data:", matchingApps[0].data());
        }
      }

      // Since the queries are not working, let's use manual filtering
      let applicationsData: ApplicationData[] = [];
      
      console.log("Using manual filtering approach");
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
          
          console.log(`Checking app ${app.id}:`, {
            appLandlordId,
            directLandlordId,
            submittedBy,
            userUid: user.uid
          });
          
          return appLandlordId === user.uid || 
                 directLandlordId === user.uid ||
                 submittedBy === user.uid;
        }) as ApplicationData[];
      
      console.log("applicationsData from manual filtering:", applicationsData);
      
      console.log("Final applicationsData:", applicationsData);
      
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

  useEffect(() => {
    fetchProperties();
  }, [user, fetchProperties]);

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

  const recentActivity = [
    {
      id: "1",
      type: "application",
      message: "New application received for Unit 3A",
      time: "2 hours ago",
      status: "pending",
      property: "Downtown Apartments",
      priority: "medium",
    },
    {
      id: "2",
      type: "maintenance",
      message: "Maintenance request completed for Unit 5B",
      time: "4 hours ago",
      status: "completed",
      property: "Garden View Complex",
      priority: "low",
    },
    {
      id: "3",
      type: "payment",
      message: "Rent payment received from Unit 2C",
      time: "1 day ago",
      status: "paid",
      property: "Downtown Apartments",
      priority: "low",
    },
    {
      id: "4",
      type: "maintenance",
      message: "Urgent: Water leak reported in Unit 1A",
      time: "3 hours ago",
      status: "urgent",
      property: "Sunset Heights",
      priority: "high",
    },
    {
      id: "5",
      type: "application",
      message: "Application approved for Unit 4B",
      time: "1 day ago",
      status: "approved",
      property: "Garden View Complex",
      priority: "low",
    },
  ];

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

  if (showPropertyForm) {
    return <PropertyForm setPropertyFormOpen={(open: boolean) => setShowPropertyForm(open)} />;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading property management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header Banner */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
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
            <nav className="flex space-x-2">
              {[
                { id: "overview", label: "Dashboard", icon: TrendingUp },
                { id: "properties", label: "Properties", icon: Building },
                { id: "listings", label: "Listings", icon: List },
                { id: "applications", label: "Applications", icon: Users },
                { id: "maintenance", label: "Work Orders", icon: Wrench },
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
                <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
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

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">
                  Loading properties...
                </span>
              </div>
            )}

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
            {!loading && !error && (
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
                <h2 className="text-2xl font-bold text-gray-900">
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
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Loading listings...</span>
              </div>
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
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Tenant Applications
                </h2>
                <p className="text-gray-600 mt-1">
                  Review, screen, and manage rental applications
                </p>
              </div>
              <div className="flex items-center space-x-2">
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
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <span className="ml-2 text-gray-600">Loading applications...</span>
              </div>
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
                            className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-all duration-200"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-all duration-200"
                          >
                    <Users className="h-4 w-4 mr-2" />
                            Screen
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

        {/* Work Orders Tab */}
        {activeTab === "maintenance" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Work Orders
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage maintenance requests and work orders
                </p>
              </div>
              <div className="flex items-center space-x-2">
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
                <div className="flex justify-center space-x-3">
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
    </div>
  );
};

export default LandlordPropertyManagement;
