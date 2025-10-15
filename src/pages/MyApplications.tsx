import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Application, Property } from "../types";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  Eye,
  MessageSquare,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  Search,
  MoreVertical,
  Phone,
  Mail,
  FileCheck,
  TrendingUp,
  BarChart3,
  Home,
  User,
  Users,
  Shield,
  UserPlus,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useToast } from "../hooks/use-toast";

// Extended Application interface with comprehensive details matching ApplicationProcess
interface ExtendedApplication extends Application {
  // Override status to include additional states
  status: "submitted" | "under_review" | "approved" | "rejected" | "withdrawn" | "started" | "screening";
  status_updated_at: Date;
  landlord_notes?: string;
  documents_required?: string[];
  documents_submitted?: string[];
  communication_count?: number;
  last_communication?: Date;
  
  // Add missing required properties from base Application interface
  prospectId: string;
  landlordId: string;
  propertyId: string;
  appFeeCents: number;
  piiTokens: {
    ssnToken?: string;
    ssnLast4?: string;
  };
  employmentInfo: {
    employer: string;
    position: string;
    monthlyIncome: number;
    employmentLength: number;
  };
  housingHistory: {
    currentAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
      duration: string;
    };
    previousAddress?: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  createdAt: Date;
  updatedAt?: Date;

  // Personal Information (from ApplicationProcess)
  personalInfo?: {
    firstName: string;
    middleInitial?: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    ssn?: string;
    isCitizen: boolean;
  };

  // Financial Information
  financialInfo?: {
    employment: string;
    employerName?: string;
    employers: Array<{
      name: string;
      industry: string;
      position: string;
      income: string;
      employmentStatus: string;
    }>;
    hasOtherIncome: boolean;
    otherIncomeDetails?: string;
  };


  // Lease Holders & Guarantors
  leaseHolders?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    ssn?: string;
    employmentStatus: string;
  }>;

  guarantors?: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    ssn?: string;
  }>;

  // Additional Occupants
  additionalOccupants?: Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    relationship: string;
  }>;

  // Additional Information
  additionalInfo?: {
    pets: Array<{
      type: string;
      breed: string;
      age: string;
      weight: string;
      isServiceAnimal: boolean;
    }>;
    hasPets: boolean;
    vehicles: Array<{
      type: string;
      make: string;
      model: string;
      year: string;
      color: string;
      licensePlate: string;
    }>;
    hasVehicles: boolean;
    emergencyContact: {
      name: string;
      phone: string;
      email: string;
      relation: string;
    };
    additionalInfo?: string;
  };

  // Documents
  documents?: {
    id: Array<{ name: string; url: string; type: string }>;
    payStubs?: Array<{ name: string; url: string; type: string }>;
    bankStatements?: Array<{ name: string; url: string; type: string }>;
    taxReturns?: Array<{ name: string; url: string; type: string }>;
    references?: Array<{ name: string; url: string; type: string }>;
    other?: Array<{ name: string; url: string; type: string }>;
  };

  // Additional fields from your Firebase structure
  desiredLeaseTerm?: string;
  references?: Array<{ name: string; url: string; type: string }>;
  moveInDate: Date;
  leaseLength: number;

  // Permissions
  permissions?: {
    backgroundCheckPermission: boolean;
    textMessagePermission: boolean;
  };

  // Application Timeline
  timeline?: Array<{
    date: Date;
    status: string;
    message: string;
    updatedBy: string;
  }>;
}

export function MyApplications() {
  const [applications, setApplications] = useState<ExtendedApplication[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedApplication, setSelectedApplication] =
    useState<ExtendedApplication | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadApplications = async (isRefresh = false) => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Load user's applications from Firebase
        const applicationsQuery = query(
          collection(db, "applications"),
        where("submittedBy", "==", user.uid),
        orderBy("submittedAt", "desc")
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);

      console.log("Firebase Applications Query Results:", {
        totalDocs: applicationsSnapshot.docs.length,
        userUid: user.uid,
        docs: applicationsSnapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        })),
      });

        const applicationsData = applicationsSnapshot.docs.map((doc) => {
          const data = doc.data();

        // Debug log for each document
        console.log("Processing application document:", {
          docId: doc.id,
          data: data,
          timelineType: typeof data.timeline,
          timelineIsArray: Array.isArray(data.timeline),
        });

          return {
            id: doc.id,
          // Required properties from base Application interface
          prospectId: data.submittedBy || user.uid,
          landlordId: data.landlordId || "unknown",
          propertyId: data.propertyId || "general-application",
          appFeeCents: data.appFeeCents || 0,
          piiTokens: {
            ssnToken: data.ssnToken || "",
            ssnLast4: data.ssnLast4 || ""
          },
          employmentInfo: {
            employer: data.employerName || data.employers?.[0]?.name || "",
            position: data.employers?.[0]?.position || "",
            monthlyIncome: data.employers?.[0]?.income ? parseInt(data.employers[0].income.replace(/[,$]/g, '')) : 0,
            employmentLength: 0 // Default value
          },
          housingHistory: {
            currentAddress: {
              street: data.currentStreet || "",
              city: data.currentCity || "",
              state: data.currentState || "",
              zip: data.currentZip || "",
              duration: data.currentDuration || ""
            },
            previousAddress: data.previousStreet ? {
              street: data.previousStreet || "",
              city: data.previousCity || "",
              state: data.previousState || "",
              zip: data.previousZip || ""
            } : undefined
          },
          createdAt: data.submittedAt ? (data.submittedAt.toDate ? data.submittedAt.toDate() : new Date(data.submittedAt)) : new Date(),
          updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)) : undefined,
          
          // Map your Firebase structure to the expected structure
          user_id: data.submittedBy,
          property_id: data.propertyId,
          move_in_date: data.moveInDate
            ? data.moveInDate.toDate
              ? data.moveInDate.toDate()
              : new Date(data.moveInDate)
            : new Date(),
          income: data.income || 0,
          notes: data.notes || data.additionalInfo || "",
          created_at: data.submittedAt
            ? data.submittedAt.toDate
              ? data.submittedAt.toDate()
              : new Date(data.submittedAt)
            : new Date(),
          status: data.status === "pending" ? "submitted" : data.status,
          status_updated_at: data.submittedAt
            ? data.submittedAt.toDate
              ? data.submittedAt.toDate()
              : new Date(data.submittedAt)
            : new Date(),
          landlord_notes: data.landlordNotes || "",
          documents_required: Array.isArray(data.documentsRequired)
            ? data.documentsRequired
            : [],
          documents_submitted: Array.isArray(data.documentsSubmitted)
            ? data.documentsSubmitted
            : [],
          communication_count: data.communicationCount || 0,
          last_communication: data.lastCommunication
            ? data.lastCommunication.toDate
              ? data.lastCommunication.toDate()
              : new Date(data.lastCommunication)
            : undefined,

          // Map additional fields from your Firebase structure
          personalInfo: {
            firstName: data.firstName || "",
            middleInitial: data.middleInitial || "",
            lastName: data.lastName || "",
            email: data.email || "",
            phone: data.phone || "",
            dateOfBirth: data.dateOfBirth || "",
            ssn: data.ssn || "",
            isCitizen: data.isCitizen || true,
          },

          financialInfo: {
            employment: data.employment || "",
            employerName: data.employerName || "",
            employers: Array.isArray(data.employers) ? data.employers : [],
            hasOtherIncome: data.hasOtherIncome || false,
            otherIncomeDetails: data.otherIncomeDetails || "",
          },


          // Lease Holders & Guarantors
          leaseHolders: Array.isArray(data.leaseHolders)
            ? data.leaseHolders
            : [],
          guarantors: Array.isArray(data.guarantors) ? data.guarantors : [],

          // Additional Occupants
          additionalOccupants: Array.isArray(data.additionalOccupants)
            ? data.additionalOccupants
            : [],

          additionalInfo: {
            pets: Array.isArray(data.pets) ? data.pets : [],
            hasPets: data.hasPets || false,
            vehicles: Array.isArray(data.vehicles) ? data.vehicles : [],
            hasVehicles: data.hasVehicles || false,
            emergencyContact: data.emergencyContact || {
              name: "",
              phone: "",
              email: "",
              relation: "",
            },
            additionalInfo: data.additionalInfo || "",
          },

          documents: {
            id: Array.isArray(data.documents?.id) ? data.documents.id : [],
            payStubs: Array.isArray(data.documents?.payStubs)
              ? data.documents.payStubs
              : [],
            bankStatements: Array.isArray(data.documents?.bankStatements)
              ? data.documents.bankStatements
              : [],
            taxReturns: Array.isArray(data.documents?.taxReturns)
              ? data.documents.taxReturns
              : [],
            references: Array.isArray(data.documents?.references)
              ? data.documents.references
              : [],
            other: Array.isArray(data.documents?.other)
              ? data.documents.other
              : [],
          },

          permissions: {
            backgroundCheckPermission: data.backgroundCheckPermission || false,
            textMessagePermission: data.textMessagePermission || true,
          },

          // Additional fields from your structure
          desiredLeaseTerm: data.desiredLeaseTerm || "",
          
          // Add missing properties for ExtendedApplication
          references: data.references || [],
          moveInDate: data.moveInDate ? (data.moveInDate.toDate ? data.moveInDate.toDate() : new Date(data.moveInDate)) : new Date(),
          leaseLength: data.leaseLength || 12,

          timeline: Array.isArray(data.timeline)
            ? data.timeline.map((event: any) => ({
                ...event,
                date: event.date?.toDate
                  ? event.date.toDate()
                  : new Date(event.date),
              }))
            : [],
        };
      }) as ExtendedApplication[];

      // Load properties from Firebase or JSON
      let propertiesData: Property[] = [];
      try {
        // Try to load from Firebase first
        const propertiesQuery = query(collection(db, "properties"));
        const propertiesSnapshot = await getDocs(propertiesQuery);
        propertiesData = propertiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Property[];

        console.log("Firebase Properties Query Results:", {
          totalProperties: propertiesData.length,
          properties: propertiesData,
        });
      } catch (firebaseError) {
        console.log("Properties not found in Firebase, trying JSON fallback");
        try {
          // Fallback to JSON file
        const propertiesResponse = await fetch("/data/properties.json");
          propertiesData = await propertiesResponse.json();
        } catch (jsonError) {
          console.error("Error loading properties:", jsonError);
        }
      }

        // Enrich applications with property data
        const enrichedApplications = applicationsData.map((app) => ({
          ...app,
        property: propertiesData.find((p) => p.id === app.property_id) || {
          id: app.property_id,
          title:
            app.property_id === "general-application"
              ? "General Application"
              : "Property",
          city: "Unknown",
          state: "Unknown",
          rent: 0,
          image:
            "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
        },
        }));

        setApplications(enrichedApplications);
        setProperties(propertiesData);

      if (isRefresh) {
        toast({
          title: "Applications refreshed",
          description: "Your applications have been updated.",
        });
      }
      } catch (error) {
        console.error("Error loading applications:", error);
      setApplications([]);
      toast({
        title: "Error loading applications",
        description: "Failed to load your applications. Please try again.",
        variant: "destructive",
      });
      } finally {
        setLoading(false);
      setRefreshing(false);
      }
    };

  useEffect(() => {
    loadApplications();
  }, [user]);

  const handleRefresh = () => {
    loadApplications(true);
  };

  // Helper functions
  const getStatusColor = (status: ExtendedApplication["status"]) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "withdrawn":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: ExtendedApplication["status"]) => {
    switch (status) {
      case "submitted":
        return <FileText className="h-3 w-3" />;
      case "under_review":
        return <RefreshCw className="h-3 w-3" />;
      case "approved":
        return <CheckCircle className="h-3 w-3" />;
      case "rejected":
        return <X className="h-3 w-3" />;
      case "withdrawn":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getStatusDisplayName = (status: ExtendedApplication["status"]) => {
    switch (status) {
      case "submitted":
        return "Submitted";
      case "under_review":
        return "Under Review";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "withdrawn":
        return "Withdrawn";
      default:
        return "Unknown";
    }
  };

  // Filter and sort applications
  const filteredApplications = applications
    .filter((app) => {
      const matchesSearch =
        app.property?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.property?.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.property?.state.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "status":
          return a.status.localeCompare(b.status);
        case "property":
          return (a.property?.title || "").localeCompare(b.property?.title || "");
        default:
          return 0;
      }
    });

  // Application statistics
  const stats = {
    total: applications.length,
    submitted: applications.filter((app) => app.status === "submitted").length,
    underReview: applications.filter((app) => app.status === "under_review")
      .length,
    approved: applications.filter((app) => app.status === "approved").length,
    rejected: applications.filter((app) => app.status === "rejected").length,
  };

  const handleViewDetails = (application: ExtendedApplication) => {
    setSelectedApplication(application);
    setDetailsModalOpen(true);
  };

  const handleWithdrawApplication = async (applicationId: string) => {
    try {
      // Update in Firebase
      const applicationRef = doc(db, "applications", applicationId);
      await updateDoc(applicationRef, {
        status: "withdrawn",
        status_updated_at: serverTimestamp(),
        timeline: serverTimestamp(), // This will be handled by a cloud function or manually updated
      });

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: "withdrawn" as const,
                status_updated_at: new Date(),
                timeline: [
                  ...(app.timeline || []),
                  {
                    date: new Date(),
                    status: "withdrawn",
                    message: "Application withdrawn by applicant",
                    updatedBy: user?.user_metadata?.first_name || "You",
                  },
                ],
              }
            : app
        )
      );

      toast({
        title: "Application withdrawn",
        description: "Your application has been successfully withdrawn.",
      });
    } catch (error) {
      console.error("Error withdrawing application:", error);
      toast({
        title: "Error",
        description: "Failed to withdraw application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleContactLandlord = (application: ExtendedApplication) => {
    // This would typically open a messaging interface or redirect to a communication page
    toast({
      title: "Contact landlord",
      description: `Opening communication for ${application.property?.title}`,
    });
    // You could implement actual messaging functionality here
    // For example: navigate(`/messages?application=${application.id}`)
  };

  const handleDownloadDocument = (
    documentUrl: string,
    documentName: string
  ) => {
    // This would handle document download
    toast({
      title: "Downloading document",
      description: `Downloading ${documentName}`,
    });
    // You could implement actual document download functionality here
    // For example: window.open(documentUrl, '_blank')
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-12 border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <div className="text-lg font-semibold text-gray-700">
                Loading your applications...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header Banner */}
      <div className="sticky top-16 z-30 bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">My Applications</h1>
                <p className="text-xs sm:text-sm text-green-50">
                  Track your rental applications and their status •{" "}
                  {stats.total} Application{stats.total !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between lg:justify-end space-x-4">
              {/* <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="text-center">
                  <div className="text-sm sm:text-lg font-bold text-white">{stats.approved}</div>
                  <div className="text-xs text-green-50">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-sm sm:text-lg font-bold text-white">{stats.underReview}</div>
                  <div className="text-xs text-green-50">Under Review</div>
                </div>
                <div className="text-center">
                  <div className="text-sm sm:text-lg font-bold text-white">{stats.submitted}</div>
                  <div className="text-xs text-green-50">Submitted</div>
                </div>
              </div> */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 text-xs sm:text-sm"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-4"></div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <Search className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Search & Filter
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="font-semibold">Applications:</span>{" "}
                <span className="font-semibold text-green-600">
                  {filteredApplications.length}
                </span>{" "}
                found
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-green-50 p-2 rounded-lg">
                  <Search className="h-5 w-5 text-green-600" />
                </div>
                <Input
                  placeholder="Search by property name, city, or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-16 pr-4 py-3 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white/80 backdrop-blur-sm text-sm placeholder-gray-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] lg:w-[200px] h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px] lg:w-[200px] h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="status">By Status</SelectItem>
                  <SelectItem value="property">By Property</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {applications.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden border border-white/20"
          >
            <div className="p-6">
              <div className="grid gap-6">
                {filteredApplications.map((application, index) => (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white rounded-2xl shadow-lg border transition-all duration-300 hover:shadow-xl hover:border-green-300"
                  >
                    <div className="flex flex-col lg:flex-row">
                  {/* Property Image */}
                      <div className="lg:w-1/3">
                        <div className="relative h-48 sm:h-56 lg:h-full">
                          <img
                            src={
                              application.property?.image ||
                              "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800"
                            }
                            alt={application.property?.title || "Property"}
                            className="w-full h-full object-cover lg:rounded-l-2xl "
                          />
                          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                            <Badge
                              className={`${getStatusColor(
                                application.status
                              )} flex items-center gap-1 text-xs sm:text-sm`}
                            >
                              {getStatusIcon(application.status)}
                              <span className="hidden sm:inline">{getStatusDisplayName(application.status)}</span>
                            </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Application Details */}
                      <div className="lg:w-2/3 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-3 sm:space-y-0">
                          <div className="flex-1">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                              {application.property?.title ||
                                "Property Application"}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-500" />
                              <span className="text-sm sm:text-lg">
                                {application.property?.city},{" "}
                                {application.property?.state}
                          </span>
                        </div>
                      </div>
                          <div className="text-left sm:text-right">
                            <div className="text-2xl sm:text-3xl font-bold text-green-600">
                          ${application.property?.rent.toLocaleString()}
                        </div>
                            <div className="text-sm sm:text-base text-gray-500">per month</div>
                      </div>
                    </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center mb-2">
                              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                <Calendar className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="font-semibold text-gray-700">
                                Move-in Date
                              </span>
                        </div>
                        <p className="text-gray-900 font-medium">
                              {new Date(
                                application.move_in_date
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                          })}
                        </p>
                      </div>

                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center mb-2">
                              <div className="bg-green-100 p-2 rounded-lg mr-3">
                                <DollarSign className="h-4 w-4 text-green-600" />
                              </div>
                              <span className="font-semibold text-gray-700">
                                Monthly Income
                              </span>
                        </div>
                        <p className="text-gray-900 font-medium">
                          ${application.income.toLocaleString()}
                        </p>
                      </div>

                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <div className="flex items-center mb-2">
                              <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                <Clock className="h-4 w-4 text-purple-600" />
                              </div>
                              <span className="font-semibold text-gray-700">
                                Applied
                              </span>
                        </div>
                        <p className="text-gray-900 font-medium">
                              {new Date(
                                application.created_at
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {application.notes && (
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Additional Notes
                            </h4>
                        <p className="text-gray-600">{application.notes}</p>
                      </div>
                    )}

                        {/* Landlord Notes */}
                        {application.landlord_notes && (
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200 mt-4">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                              <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                              Landlord Notes
                            </h4>
                            <p className="text-gray-600">
                              {application.landlord_notes}
                            </p>
                          </div>
                        )}

                        {/* Document Status */}
                        {application.documents_required && (
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200 mt-4">
                            <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                              <FileCheck className="h-4 w-4 mr-2 text-purple-600" />
                              Document Status
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Required:</span>
                                <span className="ml-2 font-medium">
                                  {application.documents_required.length}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">
                                  Submitted:
                                </span>
                                <span className="ml-2 font-medium text-green-600">
                                  {application.documents_submitted?.length || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(application)}
                              // className="border-gray-200 hover:bg-gray-50 "
                              className="w-full  text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            {/* {application.communication_count && application.communication_count > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleContactLandlord(application)}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Messages ({application.communication_count})
                              </Button>
                            )} */}
                          </div>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            {application.status === "submitted" ||
                            application.status === "under_review" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleWithdrawApplication(application.id)
                                }
                                className="border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm"
                              >
                                <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Withdraw</span>
                              </Button>
                            ) : null}
                            {application.status === "approved" && (
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 text-xs sm:text-sm"
                              >
                                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Contact to Sign Lease</span>
                              </Button>
                            )}
                          </div>
                        </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-12 text-center border border-white/20"
          >
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-3 sm:p-4 rounded-full mb-4 sm:mb-6">
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-green-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                No Applications Yet
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md px-4">
                {user
                  ? "You haven't submitted any rental applications yet. Start browsing properties to find your perfect home!"
                  : "Please sign in to view your rental applications."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md px-4">
                {user ? (
                  <>
                    <motion.button
                      onClick={() => navigate("/property")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                Browse Properties
                    </motion.button>
                    <motion.button
                      onClick={handleRefresh}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      <RefreshCw
                        className={`h-4 w-4 mr-2 ${
                          refreshing ? "animate-spin" : ""
                        }`}
                      />
                      Refresh
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    onClick={() => navigate("/auth/login")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    Sign In
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Application Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-4xl lg:max-w-6xl h-[90vh] mx-auto p-0 overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
          <DialogHeader className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 p-4 sm:p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-lg"
                >
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </motion.div>
                <div>
                  <DialogTitle className="text-lg sm:text-2xl font-bold text-white">
                    Application Details
                  </DialogTitle>
                  <p className="text-green-100 text-xs sm:text-sm mt-1">
                    {selectedApplication?.property?.title ||
                      "Property Application"}
                  </p>
                </div>
              </div>
            </div>
          </DialogHeader>

          {selectedApplication && (
            <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto bg-gray-50">
              {/* Application Timeline */}
              {selectedApplication.timeline &&
                selectedApplication.timeline.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                      <Clock className="h-6 w-6 mr-3 text-green-600" />
                      Application Timeline
                    </h3>
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                      <div className="space-y-6">
                        {selectedApplication.timeline.map((event, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-4"
                          >
                            <div
                              className={`w-4 h-4 rounded-full mt-2 shadow-sm ${
                                event.status === "submitted"
                                  ? "bg-blue-500"
                                  : event.status === "under_review"
                                  ? "bg-yellow-500"
                                  : event.status === "approved"
                                  ? "bg-green-500"
                                  : event.status === "rejected"
                                  ? "bg-red-500"
                                  : "bg-gray-500"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-base font-semibold text-gray-900">
                                  {event.message}
                                </p>
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                  {new Date(event.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                Updated by: {event.updatedBy}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Property Information */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Home className="h-5 w-5 mr-2 text-green-600" />
                    Property Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Property:</span>
                      <p className="font-medium">
                        {selectedApplication.property?.title}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Location:</span>
                      <p className="font-medium">
                        {selectedApplication.property?.city},{" "}
                        {selectedApplication.property?.state}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">
                        Monthly Rent:
                      </span>
                      <p className="font-medium text-green-600">
                        ${selectedApplication.property?.rent.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">
                        Move-in Date:
                      </span>
                      <p className="font-medium">
                        {new Date(
                          selectedApplication.move_in_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Application Status */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Application Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge
                        className={`${getStatusColor(
                          selectedApplication.status
                        )} flex items-center gap-1`}
                      >
                        {getStatusIcon(selectedApplication.status)}
                        {getStatusDisplayName(selectedApplication.status)}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Applied:</span>
                      <p className="font-medium">
                        {new Date(
                          selectedApplication.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">
                        Last Updated:
                      </span>
                      <p className="font-medium">
                        {new Date(
                          selectedApplication.status_updated_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">
                        Monthly Income:
                      </span>
                      <p className="font-medium">
                        ${selectedApplication.income.toLocaleString()}
                      </p>
                    </div>
                    {selectedApplication.desiredLeaseTerm && (
                      <div>
                        <span className="text-sm text-gray-600">
                          Desired Lease Term:
                        </span>
                        <p className="font-medium">
                          {selectedApplication.desiredLeaseTerm} months
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Personal Information */}
                {selectedApplication.personalInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2 text-green-600" />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">Name:</span>
                        <p className="font-medium">
                          {selectedApplication.personalInfo.firstName}{" "}
                          {selectedApplication.personalInfo.middleInitial}{" "}
                          {selectedApplication.personalInfo.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <p className="font-medium">
                          {selectedApplication.personalInfo.email}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Phone:</span>
                        <p className="font-medium">
                          {selectedApplication.personalInfo.phone}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Date of Birth:
                        </span>
                        <p className="font-medium">
                          {new Date(
                            selectedApplication.personalInfo.dateOfBirth
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          Citizenship:
                        </span>
                        <p className="font-medium">
                          {selectedApplication.personalInfo.isCitizen
                            ? "US Citizen"
                            : "Non-Citizen"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Financial Information */}
                {selectedApplication.financialInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      Financial Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">
                          Employment Status:
                        </span>
                        <p className="font-medium capitalize">
                          {selectedApplication.financialInfo.employment}
                        </p>
                      </div>
                      {selectedApplication.financialInfo.employers.map(
                        (employer, index) => (
                          <div
                            key={index}
                            className="border-l-2 border-green-200 pl-3"
                          >
                            <div>
                              <span className="text-sm text-gray-600">
                                Employer:
                              </span>
                              <p className="font-medium">{employer.name}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">
                                Position:
                              </span>
                              <p className="font-medium">{employer.position}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-600">
                                Income:
                              </span>
                              <p className="font-medium">
                                ${employer.income}/month
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Housing History */}
                {selectedApplication.housingHistory && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Home className="h-5 w-5 mr-2 text-green-600" />
                      Housing History
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">
                          Current Address:
                        </span>
                        <p className="font-medium">
                          {
                            selectedApplication.housingHistory.currentAddress
                              .street
                          }
                          <br />
                          {
                            selectedApplication.housingHistory.currentAddress
                              .city
                          }
                          ,{" "}
                          {
                            selectedApplication.housingHistory.currentAddress
                              .state
                          }{" "}
                          {
                            selectedApplication.housingHistory.currentAddress
                              .zip
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          Duration:{" "}
                          {
                            selectedApplication.housingHistory.currentAddress
                              .duration
                          }
                        </p>
                      </div>
                      {selectedApplication.housingHistory.previousAddress && (
                        <div>
                          <span className="text-sm text-gray-600">
                            Previous Address:
                          </span>
                          <p className="font-medium">
                            {
                              selectedApplication.housingHistory.previousAddress
                                .street
                            }
                            <br />
                            {
                              selectedApplication.housingHistory.previousAddress
                                .city
                            }
                            ,{" "}
                            {
                              selectedApplication.housingHistory.previousAddress
                                .state
                            }{" "}
                            {
                              selectedApplication.housingHistory.previousAddress
                                .zip
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Additional Information */}
                {selectedApplication.additionalInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-green-600" />
                      Additional Information
                    </h3>
                    <div className="space-y-3">
                      {selectedApplication.additionalInfo.hasPets &&
                        selectedApplication.additionalInfo.pets.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600">Pets:</span>
                            {selectedApplication.additionalInfo.pets.map(
                              (pet, index) => (
                                <p key={index} className="font-medium">
                                  {pet.type} - {pet.breed} ({pet.age} years,{" "}
                                  {pet.weight} lbs)
                                </p>
                              )
                            )}
                          </div>
                        )}
                      {selectedApplication.additionalInfo.hasVehicles &&
                        selectedApplication.additionalInfo.vehicles.length >
                          0 && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Vehicles:
                            </span>
                            {selectedApplication.additionalInfo.vehicles.map(
                              (vehicle, index) => (
                                <p key={index} className="font-medium">
                                  {vehicle.year} {vehicle.make} {vehicle.model}{" "}
                                  ({vehicle.color})
                                </p>
                              )
                            )}
                          </div>
                        )}
                      <div>
                        <span className="text-sm text-gray-600">
                          Emergency Contact:
                        </span>
                        <p className="font-medium">
                          {
                            selectedApplication.additionalInfo.emergencyContact
                              .name
                          }
                        </p>
                        <p className="text-sm text-gray-500">
                          {
                            selectedApplication.additionalInfo.emergencyContact
                              .phone
                          }{" "}
                          -{" "}
                          {
                            selectedApplication.additionalInfo.emergencyContact
                              .relation
                          }
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Lease Holders */}
                {selectedApplication.leaseHolders &&
                  selectedApplication.leaseHolders.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-green-600" />
                        Lease Holders
                      </h3>
                      <div className="space-y-4">
                        {selectedApplication.leaseHolders.map(
                          (holder, index) => (
                            <div
                              key={index}
                              className="border-l-2 border-green-200 pl-3"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <span className="text-sm text-gray-600">
                                    Name:
                                  </span>
                                  <p className="font-medium">
                                    {holder.firstName} {holder.middleInitial}{" "}
                                    {holder.lastName}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">
                                    Email:
                                  </span>
                                  <p className="font-medium">{holder.email}</p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">
                                    Phone:
                                  </span>
                                  <p className="font-medium">{holder.phone}</p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">
                                    Monthly Income:
                                  </span>
                                  <p className="font-medium">
                                    ${holder.monthlyIncome}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">
                                    Employer:
                                  </span>
                                  <p className="font-medium">
                                    {holder.employerName}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">
                                    Position:
                                  </span>
                                  <p className="font-medium">
                                    {holder.position}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}

                {/* Guarantors */}
                {selectedApplication.guarantors &&
                  selectedApplication.guarantors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-green-600" />
                        Guarantors
                      </h3>
                      <div className="space-y-4">
                        {selectedApplication.guarantors.map(
                          (guarantor, index) => (
                            <div
                              key={index}
                              className="border-l-2 border-green-200 pl-3"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <span className="text-sm text-gray-600">
                                    Name:
                                  </span>
                                  <p className="font-medium">
                                    {guarantor.firstName} {guarantor.lastName}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">
                                    Email:
                                  </span>
                                  <p className="font-medium">
                                    {guarantor.email}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">
                                    Phone:
                                  </span>
                                  <p className="font-medium">
                                    {guarantor.phone}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">
                                    Date of Birth:
                                  </span>
                                  <p className="font-medium">
                                    {guarantor.dateOfBirth}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}

                {/* Additional Occupants */}
                {selectedApplication.additionalOccupants &&
                  selectedApplication.additionalOccupants.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0 }}
                      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <UserPlus className="h-5 w-5 mr-2 text-green-600" />
                        Additional Occupants
                      </h3>
                      <div className="space-y-4">
                        {selectedApplication.additionalOccupants.map(
                          (occupant, index) => (
                            <div
                              key={index}
                              className="border-l-2 border-green-200 pl-3"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <span className="text-sm text-gray-600">
                                    Name:
                                  </span>
                                  <p className="font-medium">
                                    {occupant.firstName}{" "}
                                    {occupant.middleInitial} {occupant.lastName}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">
                                    Date of Birth:
                                  </span>
                                  <p className="font-medium">
                                    {occupant.dateOfBirth}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">
                                    Age:
                                  </span>
                                  <p className="font-medium">
                                    {occupant.age} years old
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}

                {/* Documents */}
                {selectedApplication.documents && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileCheck className="h-5 w-5 mr-2 text-green-600" />
                      Documents
                    </h3>
                    <div className="space-y-3">
                      {selectedApplication.documents.id &&
                        selectedApplication.documents.id.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600">
                              ID Documents:
                            </span>
                            {selectedApplication.documents.id.map(
                              (doc, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-white rounded-lg mt-1"
                                >
                                  <span className="text-sm">{doc.name}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() =>
                                      handleDownloadDocument(doc.url, doc.name)
                                    }
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      {selectedApplication.documents.payStubs &&
                        selectedApplication.documents.payStubs.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Pay Stubs:
                            </span>
                            {selectedApplication.documents.payStubs.map(
                              (doc, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-white rounded-lg mt-1"
                                >
                                  <span className="text-sm">{doc.name}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() =>
                                      handleDownloadDocument(doc.url, doc.name)
                                    }
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      {selectedApplication.documents.bankStatements &&
                        selectedApplication.documents.bankStatements.length >
                          0 && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Bank Statements:
                            </span>
                            {selectedApplication.documents.bankStatements.map(
                              (doc, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-white rounded-lg mt-1"
                                >
                                  <span className="text-sm">{doc.name}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() =>
                                      handleDownloadDocument(doc.url, doc.name)
                                    }
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      {selectedApplication.documents.taxReturns &&
                        selectedApplication.documents.taxReturns.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Tax Returns:
                            </span>
                            {selectedApplication.documents.taxReturns.map(
                              (doc, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-white rounded-lg mt-1"
                                >
                                  <span className="text-sm">{doc.name}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() =>
                                      handleDownloadDocument(doc.url, doc.name)
                                    }
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      {selectedApplication.documents.references &&
                        selectedApplication.documents.references.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600">
                              References:
                            </span>
                            {selectedApplication.documents.references.map(
                              (doc, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-white rounded-lg mt-1"
                                >
                                  <span className="text-sm">{doc.name}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() =>
                                      handleDownloadDocument(doc.url, doc.name)
                                    }
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      {selectedApplication.documents.other &&
                        selectedApplication.documents.other.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Other Documents:
                            </span>
                            {selectedApplication.documents.other.map(
                              (doc, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-2 bg-white rounded-lg mt-1"
                                >
                                  <span className="text-sm">{doc.name}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() =>
                                      handleDownloadDocument(doc.url, doc.name)
                                    }
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        )}
                    </div>
                  </motion.div>
                )}

                {/* Communication */}
                {/* <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                    Communication
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Messages:</span>
                      <p className="font-medium">
                        {selectedApplication.communication_count || 0}
                      </p>
                    </div>
                    {selectedApplication.last_communication && (
                      <div>
                        <span className="text-sm text-gray-600">
                          Last Message:
                        </span>
                        <p className="font-medium">
                          {new Date(
                            selectedApplication.last_communication
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div> */}
              </div>

              {/* Notes */}
              {(selectedApplication.notes ||
                selectedApplication.landlord_notes) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="mt-8 space-y-6"
                >
                  {selectedApplication.notes && (
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 shadow-sm">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        Your Notes
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedApplication.notes}
                      </p>
                    </div>
                  )}
                  {selectedApplication.landlord_notes && (
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-200 shadow-sm">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                        <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                        Landlord Notes
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedApplication.landlord_notes}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}
          <div className="bg-white border-t border-gray-200 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={() => setDetailsModalOpen(false)}
                  variant="outline"
                  className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg transition-all duration-200"
                >
                  Close
                </Button>
              </motion.div>
              {selectedApplication && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button
                    onClick={() => handleContactLandlord(selectedApplication)}
                    className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Contact Landlord</span>
                    <span className="sm:hidden">Contact</span>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
          {/* Footer with Action Buttons */}
        </DialogContent>
      </Dialog>
    </div>
  );
}

