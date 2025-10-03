import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from "../components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Checkbox } from "../components/ui/checkbox";
// import {Slider}  from '../components/ui/slider';
import {
  Search,
  MapPin,
  ChevronDown,
  DollarSign,
} from "lucide-react";
import { useTranslation } from "../hooks/useTranslations";
import {
  collection,
  query,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import heroImage from "../assets/images/hero-apartments.jpg";
import QualifiedProperties from "../Prospect/QualifiedProperties";
import ApplicationProcess from "../Prospect/ApplicationProcess";
import UnitsComparison from "../components/rentar/unitSelecttion/UnitsComparison";
// import ProductSelection from '../components/renter/product-selection/ProductSelection';
// import PaymentPage from '../renter/payment/PaymentPage';
// import PropertyManagementForm from '../landlord/property-management/PropertyManagementForm';
// import PropertyManagementSuccess from '../landlord/property-management/PropertyManagementSuccess';
// import PropertiesList from '../landlord/shared/PropertiesList';
// import PrequalificationInfo from '../renter/application/PrequalificationInfo';
// import PropertyDetailsModal from '../renter/unit-selection/PropertyDetailsModal';
// import ScheduleTourModal from '../renter/unit-selection/ScheduleTourModal';
import DashboardMap from "../components/DashboardMap";
import SubmissionsDashboard from "../components/SubmissionsDashboard";
// import AccountManagement from '../landlord/shared/AccountManagement';
import { useToast } from "../hooks/use-toast";
import { generateMockComparisonUnits } from "../lib/mockUnits";
import PropertyDetailsModal from "../components/rentar/unitSelecttion/PropertyDetailsModal";
import ScheduleTourModal from "../components/rentar/unitSelecttion/ScheduleTourModal";

import { ModernPropertyCard } from "../components/ModernPropertyCard";
import { CalendarPopover } from "../components/CalendarPopover";
import SearchFilters from "../components/PropertyAllFilter";
import ProductSelection from "../components/ProductSelection";
import PaymentPage from "../components/payment/PaymentPage";

const Dashboards = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const bypassRole =
    typeof window !== "undefined"
      ? (localStorage.getItem("dev_auth_bypass_role") as
          | "renter"
          | "landlord"
          | "prospect"
          | null)
      : null;
  const devBypass =
    typeof window !== "undefined" &&
    (localStorage.getItem("dev_auth_bypass") === "true" || bypassRole !== null);
  const effectiveUserRole =
    user?.role ?? (devBypass ? bypassRole || "renter" : "renter");
  const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "s"
    | "applications"
    | "profile"
    | "unit-selection"
    | "application-process"
    | "unit-comparison"
    | "product-selection"
    | "payment-page"
    | "property-management"
    | "property-success"
    | "properties-list"
    | "prequalification-info"
    | "property-details"
    | "account-management"
  >("dashboard");
  const [applicationStep, setApplicationStep] = useState<number | null>(null);
  const [comparisonUnits, setComparisonUnits] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [selectedLeaseTerm, setSelectedLeaseTerm] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [scheduleTourModalOpen, setScheduleTourModalOpen] = useState(false);
  const [selectedPropertyForTour, setSelectedPropertyForTour] =
    useState<any>(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [userLocation] = useState("Austin, TX"); // Default to Austin, would be IP-based in production
  const [isPrequalified, setIsPrequalified] = useState(false);
  const [selectedLanguage] = useState<"EN" | "ES" | "FR" | "DE">("EN");
  const { t } = useTranslation(selectedLanguage);

  // Simple in-app view history for back navigation
  // const [viewHistory, setViewHistory] = useState<(typeof currentView)[]>([]);
  const prevView = useRef<typeof currentView | null>(null);
  const isBackNav = useRef(false);

  useEffect(() => {
    if (prevView.current && prevView.current !== currentView) {
      if (isBackNav.current) {
        // Skip pushing history when navigating back
        isBackNav.current = false;
      } else {
        // setViewHistory((h) => [...h, prevView.current as typeof currentView]);
      }
    }
    prevView.current = currentView;
  }, [currentView]);

  const handleBack = () => {
    isBackNav.current = true;
    // setViewHistory((h) => {
    //   if (h.length === 0) {
    //     setCurrentView("dashboard");
    //     return h;
    //   }
    //   const last = h[h.length - 1];
    //   setCurrentView(last);
    //   return h.slice(0, -1);
    // });
        setCurrentView("dashboard");
  };

  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const [selectedBaths, setSelectedBaths] = useState<string[]>([]);
  const [selectedHomeTypes, setSelectedHomeTypes] = useState<string[]>([]);
  const [moveInDate, setMoveInDate] = useState<Date>();
  const [showAllFilters, setShowAllFilters] = useState(false);
  

  // All possible filter options
  const bedOptions = ["Studio", "1", "2", "3", "4+"];
  const bathOptions = ["1", "1.5", "2", "2.5", "3", "3.5", "4+"];
  const homeTypeOptions = [
    "Apartment",
    "Condo",
    "Townhome",
    "House",
    "Loft",
    "Student Housing",
    "55+ Active Adult",
  ];

  // Additional filter states
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [petPolicy, setPetPolicy] = useState<string>("");
  const [parkingType, setParkingType] = useState<string[]>([]);
  const [utilityPolicy, setUtilityPolicy] = useState<string[]>([]);
  const [squareFootage, setSquareFootage] = useState<[number, number]>([500, 3000]);
  const [yearBuilt, setYearBuilt] = useState<[number, number]>([1980, 2024]);
  const [additionalSpecialties, setAdditionalSpecialties] = useState<string[]>(
    []
  );
  const [laundryFacilities, setLaundryFacilities] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<string>("");
  const [propertyFeatures, setPropertyFeatures] = useState<string[]>([]);
  const [showOnlyRentWise, setShowOnlyRentWise] = useState<boolean>(false);

  // Database properties state
  const [databaseProperties, setDatabaseProperties] = useState<any[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  // Units data state
  const [unitsData, setUnitsData] = useState<any[]>([]);
  // const [unitsLoading, setUnitsLoading] = useState(false);
console.log("Selected Property", selectedProperty);

  // Load properties from Firebase
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setPropertiesLoading(true);

        // First try to load from properties collection
        let querySnapshot;
        let collectionName = "properties";

        try {
          // First try to load from properties collection
          // Use simple query without composite index requirement
          const propertiesQuery = query(
            collection(db, "properties"),
            limit(20)
          );
          querySnapshot = await getDocs(propertiesQuery);

          if (querySnapshot.empty) {
            throw new Error("No properties found");
          }

          // Filter available properties in memory to avoid index requirement
          const availableProperties = querySnapshot.docs.filter((doc) => {
            const data = doc.data();
            return data.is_available === true;
          });

          if (availableProperties.length === 0) {
            throw new Error("No available properties found");
          }

          // Create a new query snapshot with only available properties
          querySnapshot = {
            docs: availableProperties,
            empty: false,
            size: availableProperties.length,
            forEach: (callback: any) => availableProperties.forEach(callback),
            docChanges: () => [],
            isEqual: () => false,
            metadata: { fromCache: false, hasPendingWrites: false },
          } as any;
        } catch (propertiesError) {
          console.log("No properties found, trying listings collection...");
          // Fallback to listings collection
          const listingsQuery = query(collection(db, "listings"), limit(20));
          querySnapshot = await getDocs(listingsQuery);

          // Filter available listings in memory
          const availableListings = querySnapshot.docs.filter((doc) => {
            const data = doc.data();
            return data.available === true;
          });

          if (availableListings.length > 0) {
            querySnapshot = {
              docs: availableListings,
              empty: false,
              size: availableListings.length,
              forEach: (callback: any) => availableListings.forEach(callback),
              docChanges: () => [],
              isEqual: () => false,
              metadata: { fromCache: false, hasPendingWrites: false },
            } as any;
            collectionName = "listings";
          } else {
            throw new Error("No available properties found");
          }
        }

        if (querySnapshot.empty) {
          console.log("No properties found in Firebase");
          setDatabaseProperties([]);
          return;
        }

        // Transform Firebase data to match expected format
        const transformedProperties = querySnapshot.docs.map((doc, index) => {
          const prop = doc.data();
          console.log("prop", prop);
          // Handle different data structures from listings vs properties
          if (collectionName === "listings") {
            // Data from listings collection (migrated data)
            // Based on Firestore console: amenities, available, availableDate, bathrooms, bedrooms, deposit, description, images, propertyId, publishedAt, rent, title
            return {
              id: doc.id,
              name: prop.title || "Property",
              address: `123 ${(prop.title || "Property").replace(
                /\s+/g,
                ""
              )} St, City, State 00000`, // Generate address since not in listings
              priceRange: prop.rent
                ? `$${prop.rent.toLocaleString()}`
                : "$1,500 - $2,500",
              beds: prop.bedrooms
                ? `${prop.bedrooms} ${prop.bedrooms === 1 ? "Bed" : "Beds"}`
                : "1-2 Beds",
              rating: 4.2 + (index % 10) * 0.1, // Generate ratings between 4.2-5.0
              amenities: prop.amenities || ["Pool", "Gym", "Pet Friendly"],
              image:
                prop.images?.[0] ||
                "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
              coordinates: [
                -97.7437 + (Math.random() - 0.5) * 0.1,
                30.2672 + (Math.random() - 0.5) * 0.1,
              ] as [number, number],
              propertyType: "Apartment",
              isRentWiseNetwork: Math.random() > 0.5, // Random RentWise status
              rent_amount: prop.rent,
              bedrooms: prop.bedrooms,
              bathrooms: prop.bathrooms,
              city: "City", // Not available in listings, will be generated
              state: "State", // Not available in listings, will be generated
              zip_code: "00000", // Not available in listings, will be generated
              description: prop.description,
              pet_friendly: prop.amenities?.includes("Pet Friendly") || false,
              available_date: prop.availableDate,
            };
          } else {
            // Data from properties collection (original format)
            return {
              id: doc.id,
              name: prop.title || prop.name || "Property",
              address:
                prop.address ||
                `${prop.city || ""}, ${prop.state || ""} ${
                  prop.zip_code || ""
                }`.trim(),
              priceRange: prop.rent_amount
                ? `$${prop.rent_amount.toLocaleString()}`
                : "$1,500 - $2,500",
              beds: prop.bedrooms
                ? `${prop.bedrooms} ${prop.bedrooms === 1 ? "Bed" : "Beds"}`
                : "1-2 Beds",
              rating: prop.rating || 4.2 + (index % 10) * 0.1,
              amenities: prop.amenities || ["Pool", "Gym", "Pet Friendly"],
              image:
                prop.image ||
                "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800",
              coordinates:
                prop.coordinates ||
                ([
                  -97.7437 + (Math.random() - 0.5) * 0.1,
                  30.2672 + (Math.random() - 0.5) * 0.1,
                ] as [number, number]),
              propertyType:
                prop.property_type || prop.propertyType || "Apartment",
              isRentWiseNetwork: prop.isRentWiseNetwork || false,
              rent_amount: prop.rent_amount,
              bedrooms: prop.bedrooms,
              bathrooms: prop.bathrooms,
              city: prop.city,
              state: prop.state,
              zip_code: prop.zip_code,
              description: prop.description,
              pet_friendly: prop.pet_friendly,
              available_date: prop.available_date,
              // Additional fields from your Firebase data
              square_feet: prop.square_feet,
              lat: prop.lat,
              lng: prop.lng,
              country: prop.country,
              landlordId: prop.landlordId,
              createdAt: prop.createdAt,
              updatedAt: prop.updatedAt,
              created_at: prop.created_at,
              updated_at: prop.updated_at,
            };
          }
        });

        setDatabaseProperties(transformedProperties);
        // console.log(`Loaded ${transformedProperties.length} properties from Firebase (${collectionName} collection)`);
      } catch (error) {
        console.error("Error loading properties from Firebase:", error);
        setDatabaseProperties([]);
      } finally {
        setPropertiesLoading(false);
      }
    };

    loadProperties();
  }, []);

  // Handle propertyId from URL parameter
  useEffect(() => {
    const propertyId = searchParams.get('propertyId');
    console.log('Dashboards: propertyId from URL =', propertyId);
    console.log('Dashboards: databaseProperties.length =', databaseProperties.length);
    
    if (propertyId && databaseProperties.length > 0) {
      // Find the property by ID
      const foundProperty = databaseProperties.find(p => p.id === propertyId);
      console.log('Dashboards: foundProperty =', foundProperty);
      
      if (foundProperty) {
        console.log('Found property from URL:', foundProperty);
        setSelectedProperty(foundProperty);
        setCurrentView('property-details');
      } else {
        console.log('Property not found for ID:', propertyId);
        console.log('Available property IDs:', databaseProperties.map(p => p.id));
        toast({
          title: "Property not found",
          description: "The requested property could not be found.",
          variant: "destructive"
        });
      }
    }
  }, [searchParams, databaseProperties, toast]);

  // Load units data from Firebase
  const loadUnitsData = async () => {
    try {
      // setUnitsLoading(true);

      // Load from units collection (your actual unit data)
      const unitsQuery = query(collection(db, "units"), limit(50));
      const querySnapshot = await getDocs(unitsQuery);

      if (querySnapshot.empty) {
        console.log("No units found in Firebase");
        setUnitsData([]);
        return;
      }

      // Transform Firebase units data to match UnitsComparison format
      const transformedUnits = querySnapshot.docs.map((doc) => {
        const unit = doc.data();

        // Based on your Firestore console data structure:
        // amenities, available, availableDate, bathrooms, bedrooms, createdAt, deposit, description, images, propertyId
        return {
          id: doc.id,
          unitNumber: unit.unitNumber || `Unit ${doc.id.slice(-4)}`, // Use last 4 chars of ID
          bedrooms: unit.bedrooms || 1,
          bathrooms: unit.bathrooms || 1,
          sqft: unit.squareFeet || unit.sqft || 1000, // Handle different field names
          available: unit.available !== false,
          availableDate: unit.availableDate || new Date().toISOString(),
          floorPlan: unit.floorPlan || "Open Floor Plan",
          rent: unit.rent || unit.rentAmount || 2000, // Handle different field names
          deposit:
            unit.deposit ||
            Math.round((unit.rent || unit.rentAmount || 2000) * 1.5),
          leaseTerms: [
            {
              months: 6,
              rent: Math.round((unit.rent || unit.rentAmount || 2000) * 1.1),
              popular: false,
              savings: null,
              concession: null,
            },
            {
              months: 12,
              rent: unit.rent || unit.rentAmount || 2000,
              popular: true,
              savings: null,
              concession: "2 weeks free rent",
            },
            {
              months: 18,
              rent: Math.round((unit.rent || unit.rentAmount || 2000) * 0.95),
              popular: false,
              savings: 100,
              concession: "1 month free rent",
            },
          ],
          amenities: unit.amenities || ["Pool", "Gym", "Pet Friendly"],
          images: unit.images || [],
          qualified: true, // Assume qualified for now
          qualifiedStatus: "qualified" as const,
          parkingIncluded:
            unit.amenities?.includes("Garage") ||
            unit.amenities?.includes("Parking") ||
            true,
          petFriendly:
            unit.amenities?.some(
              (amenity: string) =>
                amenity.toLowerCase().includes("pet") ||
                amenity.toLowerCase().includes("dog")
            ) || false,
          furnished: unit.furnished || false,
          floor: unit.floor || Math.floor(Math.random() * 10) + 1,
          view: unit.view || "City View",
          description: unit.description || "",
          propertyId: unit.propertyId || "",
        };
      });

      setUnitsData(transformedUnits);
      // console.log(`Loaded ${transformedUnits.length} units from Firebase units collection`);
    } catch (error) {
      console.error("Error loading units from Firebase:", error);
      setUnitsData([]);
    } finally {
      // setUnitsLoading(false);
    }
  };

  // Load units for a specific property
  const loadUnitsForProperty = async (propertyId: string) => {
    try {
      console.log("Loading units for property ID:", propertyId);
      // Load units from Firebase that match the property ID
      const unitsQuery = query(
        collection(db, "units")
        // Note: We'll filter in memory to avoid index requirements
      );
      const querySnapshot = await getDocs(unitsQuery);

      if (querySnapshot.empty) {
        console.log("No units found in Firebase");
        return [];
      }

      // Filter units for the specific property and transform
      const propertyUnits = querySnapshot.docs
        .filter((doc) => {
          const unit = doc.data();
          console.log(
            "Checking unit:",
            unit.unitNumber,
            "propertyId:",
            unit.propertyId,
            "matches:",
            propertyId
          );
          return unit.propertyId === propertyId;
        })
        .map((doc) => {
          const unit = doc.data();

          return {
            id: doc.id,
            unitNumber: unit.unitNumber || `Unit ${doc.id.slice(-4)}`,
            bedrooms: unit.bedrooms || 1,
            bathrooms: unit.bathrooms || 1,
            sqft: unit.squareFeet || unit.sqft || 1000,
            available: unit.available !== false,
            availableDate: unit.availableDate || new Date().toISOString(),
            floorPlan: unit.floorPlan || "Open Floor Plan",
            rent: unit.rent || unit.rentAmount || 2000,
            deposit:
              unit.deposit ||
              Math.round((unit.rent || unit.rentAmount || 2000) * 1.5),
            amenities: unit.amenities || ["Pool", "Gym", "Pet Friendly"],
            images: unit.images || [],
            description: unit.description || "",
            propertyId: unit.propertyId || "",
            // Additional unit details
            floor: unit.floor || Math.floor(Math.random() * 10) + 1,
            view: unit.view || "City View",
            parkingIncluded:
              unit.amenities?.includes("Garage") ||
              unit.amenities?.includes("Parking") ||
              false,
            petFriendly:
              unit.amenities?.some(
                (amenity: string) =>
                  amenity.toLowerCase().includes("pet") ||
                  amenity.toLowerCase().includes("dog")
              ) || false,
            furnished: unit.furnished || false,
            leaseTerms: [
              {
                months: 6,
                rent: Math.round((unit.rent || unit.rentAmount || 2000) * 1.1),
                popular: false,
                savings: null,
                concession: null,
              },
              {
                months: 12,
                rent: unit.rent || unit.rentAmount || 2000,
                popular: true,
                savings: null,
                concession: "2 weeks free rent",
              },
              {
                months: 18,
                rent: Math.round((unit.rent || unit.rentAmount || 2000) * 0.95),
                popular: false,
                savings: 100,
                concession: "1 month free rent",
              },
            ],
          };
        });

      console.log(
        `Loaded ${propertyUnits.length} units for property ${propertyId}`
      );
      console.log("Property Units:", propertyUnits);
      setUnitsData(propertyUnits);
      return propertyUnits;
    } catch (error) {
      console.error("Error loading units for property:", error);
      return [];
    }
  };

  // Use database properties if available, otherwise fallback to sample data
  const featuredProperties =
    databaseProperties.length > 0
      ? databaseProperties
      : [
          {
            id: 1,
            name: "The Lodge at Autumn Willow",
            address: "1200 Autumn Willow Dr, Austin, TX 78745",
            priceRange: "$1,255 - $2,849",
            beds: "Studio - 2 Beds",
            rating: 4.5,
            amenities: ["Pool", "Gym", "Pet Friendly", "In Unit Laundry"],
            image: "",
            coordinates: [-97.8008, 30.224] as [number, number],
            propertyType: "Apartment",
            isRentWiseNetwork: true,
          },
        ];

  // Filter properties based on selected filters
  const filteredProperties = featuredProperties.filter((property) => {
    // Search location filter
    const locationMatch =
      !searchLocation ||
      property.name?.toLowerCase().includes(searchLocation.toLowerCase()) ||
      property.address?.toLowerCase().includes(searchLocation.toLowerCase());

    // Price filter - handle both database and sample data formats
    let priceInRange = true;

    // Skip price filtering if range is set to show all prices (0 to 5000)
    if (priceRange[0] === 0 && priceRange[1] === 5000) {
      priceInRange = true;
    } else if (property.rent_amount && property.rent_amount > 0) {
      // Database format: numeric rent_amount (preferred)
      const rent = Number(property.rent_amount);
      priceInRange = rent >= priceRange[0] && rent <= priceRange[1];
      console.log(`Property ${property.name}: rent_amount=${rent}, filter=[${priceRange[0]}, ${priceRange[1]}], priceInRange=${priceInRange}`);
    } else if (property.priceRange) {
      // Sample data format: "$1,255 - $2,849" or single price "$3,500"
      if (property.priceRange.includes(" - ")) {
        // Range format: "$1,255 - $2,849"
      const priceParts = property.priceRange.split(" - ");
      if (priceParts.length >= 2) {
        const minPrice = parseInt(priceParts[0]?.replace(/[$,]/g, "") || "0");
        const maxPrice = parseInt(priceParts[1]?.replace(/[$,]/g, "") || "0");
        // Check if any part of the price range overlaps with the selected range
        priceInRange = (minPrice >= priceRange[0] && minPrice <= priceRange[1]) ||
                      (maxPrice >= priceRange[0] && maxPrice <= priceRange[1]) ||
                      (minPrice <= priceRange[0] && maxPrice >= priceRange[1]);
      }
      } else {
        // Single price format: "$3,500"
        const price = parseInt(property.priceRange.replace(/[$,]/g, "") || "0");
        priceInRange = price >= priceRange[0] && price <= priceRange[1];
        console.log(`Property ${property.name}: priceRange="${property.priceRange}", parsed=${price}, filter=[${priceRange[0]}, ${priceRange[1]}], priceInRange=${priceInRange}`);
      }
    }

    // Beds filter
    const bedsMatch =
      selectedBeds.length === 0 ||
      selectedBeds.some((bed) => {
        if (bed === "Studio")
          return property.beds?.includes("Studio") || property.bedrooms === 0;
        if (bed === "4+")
          return property.beds?.includes("4") || property.bedrooms >= 4;
        return (
          property.beds?.includes(bed) || property.bedrooms === parseInt(bed)
        );
      });

    // Bathrooms filter
    const bathsMatch =
      selectedBaths.length === 0 ||
      selectedBaths.some((bath) => {
        if (bath === "4+")
          return property.bathrooms >= 4;
        if (bath.includes("+")) {
          const minBaths = parseFloat(bath.replace("+", ""));
          return property.bathrooms >= minBaths;
        }
        return property.bathrooms === parseFloat(bath);
      });

    // Home type filter using the actual propertyType field
    const typeMatch =
      selectedHomeTypes.length === 0 ||
      selectedHomeTypes.includes(property.propertyType || "Apartment") ||
      selectedHomeTypes.includes(property.property_type || "Apartment");

    // Amenities filter
    const amenitiesMatch =
      selectedAmenities.length === 0 ||
      selectedAmenities.every((amenity) =>
        property.amenities?.includes(amenity)
      );

    // Features filter
    const featuresMatch =
      selectedFeatures.length === 0 ||
      selectedFeatures.every((feature) =>
        property.features?.includes(feature)
      );

    // Pet policy filter
    const petPolicyMatch =
      !petPolicy || property.petPolicy === petPolicy;

    // Parking type filter
    const parkingMatch =
      parkingType.length === 0 ||
      parkingType.some((parking) =>
        property.parkingType?.includes(parking)
      );

    // Utility policy filter
    const utilityMatch =
      utilityPolicy.length === 0 ||
      utilityPolicy.some((utility) =>
        property.utilityPolicy?.includes(utility)
      );

    // Square footage filter
    const squareFootageMatch =
      !property.squareFootage ||
      (property.squareFootage >= squareFootage[0] && property.squareFootage <= squareFootage[1]);

    // Year built filter
    const yearBuiltMatch =
      !property.yearBuilt ||
      (property.yearBuilt >= yearBuilt[0] && property.yearBuilt <= yearBuilt[1]);

    // Additional specialties filter
    const specialtiesMatch =
      additionalSpecialties.length === 0 ||
      additionalSpecialties.some((specialty) =>
        property.specialties?.includes(specialty)
      );

    // Laundry facilities filter
    const laundryMatch =
      laundryFacilities.length === 0 ||
      laundryFacilities.some((laundry) =>
        property.laundryFacilities?.includes(laundry)
      );

    // Rating filter
    const ratingMatch =
      !selectedRating ||
      (property.rating && property.rating >= parseFloat(selectedRating));

    // Property features filter
    const propertyFeaturesMatch =
      propertyFeatures.length === 0 ||
      propertyFeatures.some((feature) =>
        property.propertyFeatures?.includes(feature)
      );

    // RentWise Network filter
    const rentwiseMatch =
      !showOnlyRentWise || property.isRentWiseNetwork === true;

    return (
      locationMatch &&
      priceInRange &&
      bedsMatch &&
      bathsMatch &&
      typeMatch &&
      amenitiesMatch &&
      featuresMatch &&
      petPolicyMatch &&
      parkingMatch &&
      utilityMatch &&
      squareFootageMatch &&
      yearBuiltMatch &&
      specialtiesMatch &&
      laundryMatch &&
      ratingMatch &&
      propertyFeaturesMatch &&
      rentwiseMatch
    );
  });

  
  // Check for URL parameters to show specific view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");

    console.log(
      "URL params effect - view:",
      view,
      "user:",
      user,
      "devBypass:",
      devBypass,
      "currentView:",
      currentView
    );

    if (view === "account" && (user || devBypass)) {
      console.log("Setting currentView to account-management");
      setCurrentView("account-management");
    } else if (view === "dashboard" && (user || devBypass)) {
      console.log("Setting currentView to dashboard");
      setCurrentView("dashboard");
    }
  }, [user, devBypass]);

  useEffect(() => {
    console.log(
      "Auth redirect effect - user:",
      user,
      "loading:",
      loading,
      "devBypass:",
      devBypass,
      "effectiveUserRole:",
      effectiveUserRole
    );

    // if (!loading && !user && !devBypass) {
    //   navigate("/signin");
    // }
    // Remove auto-redirect logic that was causing bouncing
  }, [user, loading, devBypass, navigate]);

  // Handle Stripe Checkout return messages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const canceled = params.get("canceled");

    if (success === "true") {
      toast({
        title: "Payment successful",
        description: "Thank you! Your subscription is now active.",
      });
      // checkSubscription?.();
      window.history.replaceState({}, "", window.location.pathname);
    } else if (canceled === "true") {
      toast({
        title: "Payment canceled",
        description: "No charges were made. You can try again anytime.",
        variant: "destructive",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [toast]);


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        {/* Content skeleton */}
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-muted animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // if (!user && !devBypass) {
  //   return null;
  // }

  if (effectiveUserRole === "landlord" && currentView !== "dashboard") {
    // Keep existing landlord functionality for non-dashboard views
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <main className="container mx-auto px-4 py-8">
          {currentView === "properties-list" ? (
            <></>
          ) : // <PropertiesList
          //   onBack={() => setCurrentView('dashboard')}
          //   onAddProperty={() => {
          //     setEditingProperty(null);
          //     setCurrentView('property-management');
          //   }}
          //   onEditProperty={(property) => {
          //     setEditingProperty(property);
          //     setCurrentView('property-management');
          //   }}
          // />
          currentView === "property-management" ? (
            <></>
          ) : // <PropertyManagementForm
          //   onBack={() => setCurrentView(editingProperty ? 'properties-list' : 'dashboard')}
          //   onSubmit={(property) => {
          //     setCurrentView('property-success');
          //   }}
          //   editingProperty={editingProperty}
          // />
          currentView === "property-success" ? (
            <></>
          ) : // <PropertyManagementSuccess
          //   onNavigateToPropertyList={() => setCurrentView('properties-list')}
          //   onAddAnotherProperty={() => {
          //     setEditingProperty(null);
          //     setCurrentView('property-management');
          //   }}
          //   property={editingProperty}
          // />
          null}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <main>
        {(() => {
          console.log(
            "Dashboard render - user:",
            user,
            "userRole:",
            user?.role,
            "effectiveUserRole:",
            effectiveUserRole,
            "currentView:",
            currentView
          );
          return null;
        })()}

        {currentView === "dashboard" ? (
          <div>
            {/* Modern Hero Section */}
            <section
              className="relative bg-cover bg-center bg-no-repeat py-32"
              style={{ backgroundImage: `url(${heroImage})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
              <div className="relative z-10 container mx-auto px-6 text-center">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
                    Let's get you Home
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 mb-8 font-light">
                    Discover your perfect home with our intelligent matching
                    system
                  </p>
                  <div className="flex justify-center space-x-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                      <span className="text-white font-semibold">
                        🏠 Premium Properties
                      </span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                      <span className="text-white font-semibold">
                        ⚡ Instant Matching
                      </span>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                      <span className="text-white font-semibold">
                        🔒 Secure Process
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* Modern Separator */}
            <div className="h-1.5 bg-gradient-to-r  from-green-600 via-emerald-500 to-teal-600"></div>

            {/* Modern Search Filters Bar */}
            <section className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg py-4 sticky top-16 z-40">
              <div className="container mx-auto  px-auto">
                <div className="flex items-center space-x-4 flex-wrap">
                  <Input
                    placeholder="City, neighborhood..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-64 px-4 py-3 rounded-lg border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 bg-white/80 backdrop-blur-sm"
                  />

                  {/* Simple Price Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                      >
                        {priceRange[0] === 0 && priceRange[1] === 5000 
                          ? "Any Price" 
                          : `$${priceRange[0].toLocaleString()} - $${priceRange[1].toLocaleString()}`
                        } <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-6 bg-white border-2 border-gray-200 shadow-2xl rounded-xl z-50">
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-800 text-lg">Price Range</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            ${(priceRange[1] - priceRange[0]).toLocaleString()} range
                          </span>
                        </div>

                        {/* Current Range Display */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                ${priceRange[0].toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">Min</div>
                            </div>
                            <div className="flex-1 mx-4">
                              <div className="h-2 bg-green-200 rounded-full">
                                <div 
                                  className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                                  style={{
                                    width: `${((priceRange[1] - priceRange[0]) / (5000 - 0)) * 100}%`,
                                    marginLeft: `${((priceRange[0] - 0) / (5000 - 0)) * 100}%`
                                  }}
                                />
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                ${priceRange[1].toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">Max</div>
                            </div>
                          </div>
                        </div>

                        {/* Manual Input Fields */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                              Min Price
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                type="number"
                                placeholder="0"
                                value={priceRange[0]}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  const newMin = Math.max(0, Math.min(value, priceRange[1] - 1));
                                  setPriceRange([newMin, priceRange[1]]);
                                }}
                                className="h-10 pl-10 pr-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                              Max Price
                            </label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input
                                type="number"
                                placeholder="5000"
                                value={priceRange[1]}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 5000;
                                  const newMax = Math.min(5000, Math.max(value, priceRange[0] + 1));
                                  setPriceRange([priceRange[0], newMax]);
                                }}
                                className="h-10 pl-10 pr-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Quick Range Buttons */}
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-600">Quick Select:</p>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setPriceRange([500, 1500])}
                              className="flex items-center justify-center p-3 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-gray-50 transition-all duration-200"
                            >
                              <span className="text-sm font-medium">Budget</span>
                            </button>
                            <button
                              onClick={() => setPriceRange([1500, 3000])}
                              className="flex items-center justify-center p-3 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-gray-50 transition-all duration-200"
                            >
                              <span className="text-sm font-medium">Mid-range</span>
                            </button>
                            <button
                              onClick={() => setPriceRange([3000, 5000])}
                              className="flex items-center justify-center p-3 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-gray-50 transition-all duration-200"
                            >
                              <span className="text-sm font-medium">Premium</span>
                            </button>
                            <button
                              onClick={() => setPriceRange([0, 5000])}
                              className="flex items-center justify-center p-3 rounded-lg border-2 border-gray-200 hover:border-green-300 hover:bg-gray-50 transition-all duration-200"
                            >
                              <span className="text-sm font-medium">Any Price</span>
                            </button>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <Button
                            variant="outline"
                            onClick={() => setPriceRange([0, 5000])}
                            className="text-sm px-6 py-2 rounded-lg border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            Reset
                          </Button>
                          <Button
                            onClick={() => {/* Close popover automatically */}}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                          >
                            Apply Filter
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Beds/Baths Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                      >
                        Beds & Baths <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-3">{t("bedrooms")}</h4>
                          <div className="flex flex-wrap gap-2">
                            {bedOptions.map((bed) => (
                              <div
                                key={bed}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`bed-${bed}`}
                                  checked={selectedBeds.includes(bed)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedBeds([...selectedBeds, bed]);
                                    } else {
                                      setSelectedBeds(
                                        selectedBeds.filter((b) => b !== bed)
                                      );
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`bed-${bed}`}
                                  className="text-sm"
                                >
                                  {bed}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">{t("bathrooms")}</h4>
                          <div className="flex flex-wrap gap-2">
                            {bathOptions.map((bath) => (
                              <div
                                key={bath}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`bath-${bath}`}
                                  checked={selectedBaths.includes(bath)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedBaths([
                                        ...selectedBaths,
                                        bath,
                                      ]);
                                    } else {
                                      setSelectedBaths(
                                        selectedBaths.filter((b) => b !== bath)
                                      );
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`bath-${bath}`}
                                  className="text-sm"
                                >
                                  {bath}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Home Type Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-sm px-4 py-3 rounded-lg border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                      >
                        Property Type <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-4">
                      <div className="space-y-4">
                        <h4 className="font-medium">{t("propertyType")}</h4>
                        <div className="space-y-2">
                          {homeTypeOptions.map((type) => (
                            <div
                              key={type}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`type-${type}`}
                                checked={selectedHomeTypes.includes(type)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedHomeTypes([
                                      ...selectedHomeTypes,
                                      type,
                                    ]);
                                  } else {
                                    setSelectedHomeTypes(
                                      selectedHomeTypes.filter(
                                        (t) => t !== type
                                      )
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`type-${type}`}
                                className="text-sm"
                              >
                                {type}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Move-In Date Filter */}
                  <CalendarPopover
                    selectedDate={moveInDate}
                    onDateSelect={setMoveInDate}
                    placeholder="Move-in Date"
                    className="text-sm px-4 py-3 w-auto rounded-lg border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                        disabled={(date) => date < new Date()}
                      />

                  {/* Refine Search Button */}
                  <Button
                    variant="outline"
                    className="text-sm px-4 py-3 bg-blue-50 text-black-600 border-blue-200 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    onClick={() => setShowAllFilters(!showAllFilters)}
                  >
                    All Filters
                  </Button>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchLocation("");
                        setPriceRange([500, 5000]);
                        setSelectedBeds([]);
                        setSelectedBaths([]);
                        setSelectedHomeTypes([]);
                        setMoveInDate(undefined);
                        setSelectedAmenities([]);
                        setSelectedFeatures([]);
                        setPetPolicy("");
                        setParkingType([]);
                        setUtilityPolicy([]);
                        setSquareFootage([500, 3000] as [number, number]);
                        setYearBuilt([1980, 2024] as [number, number]);
                        setAdditionalSpecialties([]);
                        setLaundryFacilities([]);
                        setSelectedRating("");
                        setPropertyFeatures([]);
                        setShowOnlyRentWise(false);
                      }}
                      className="text-sm px-4 py-3 bg-blue-50 text-black-600 border-blue-200 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    >
                      Reset
                    </Button>

                    <Button
                      variant="outline"
                      className="text-sm px-4 py-3 bg-blue-50 text-black-600 border-blue-200 rounded-lg hover:bg-blue-100 transition-all duration-200"

                    >
                      ♡ Save
                    </Button>

                    <Button
                      onClick={() => setShowAllFilters(false)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Search className="h-4 w-4 mr-1" />
                      Search
                    </Button>
                  </div>

                  <a
                      href="/saved-properties"
                     
                      // onClick={() => navigate('/saved-properties')}
                      className=" font-medium text-md -600 hover:underline  px-6 py-3 "
                    >
                    
                      Saved Homes
                    </a>
                </div>
                
                {/* Refine Search Expanded Section */}
                {showAllFilters && (
                  <div className="mt-4">
                    <SearchFilters
                      searchLocation={searchLocation}
                      setSearchLocation={setSearchLocation}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                      selectedBeds={selectedBeds}
                      setSelectedBeds={setSelectedBeds}
                      selectedBaths={selectedBaths}
                      setSelectedBaths={setSelectedBaths}
                      selectedHomeTypes={selectedHomeTypes}
                      setSelectedHomeTypes={setSelectedHomeTypes}
                      moveInDate={moveInDate}
                      setMoveInDate={setMoveInDate}
                      selectedAmenities={selectedAmenities}
                      setSelectedAmenities={setSelectedAmenities}
                      selectedFeatures={selectedFeatures}
                      setSelectedFeatures={setSelectedFeatures}
                      squareFootage={squareFootage}
                      setSquareFootage={setSquareFootage}
                      yearBuilt={yearBuilt}
                      setYearBuilt={setYearBuilt}
                      showOnlyRentWise={showOnlyRentWise}
                      setShowOnlyRentWise={setShowOnlyRentWise}
                      onClose={() => setShowAllFilters(false)}
                      showSearch={true}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Modern Main Content Area - Map + Listings */}
            <section className="flex" style={{ height: "calc(100vh - 140px)" }}>
              {/* Map Section - Left Side */}
              <div className="w-[60%] bg-gradient-to-br from-gray-50 to-gray-100 relative">
             
                <DashboardMap 
                  properties={filteredProperties} 
                  isPrequalified={isPrequalified}
                  language={selectedLanguage}
                  onPropertySelect={(property) => {
                    console.log('Selected property from map:', property);
                    setCurrentView('unit-selection');
                  }}
                  // onViewUnits={async (property) => {
                  //   setSelectedProperty(property);
                  //   // Load units for this specific property
                  //   console.log(
                  //     "Loading units for property:",
                  //     property.id
                  //   );
                  //   const loadedUnits =
                  //     await loadUnitsForProperty(property.id);
                  //   console.log(
                  //     "Units loaded, setting view to unit-selection. Units count:",
                  //     loadedUnits.length
                  //   );
                  //   setCurrentView("unit-selection");
                  // }}
                />
              </div>

              {/* Listings Section - Right Side - Scrollable */}
              <div className="w-[40%] overflow-y-auto bg-gradient-to-br from-white to-green-50/30">
                <div className="py-6 px-4">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold ">
                        {t("apartmentsForRent")} {userLocation}
                      </h2>
                      <p className="text-lg text-gray-600 mt-1">
                        {filteredProperties.length} {t("rentals")} • Best
                        matched homes for you
                      </p>
                    </div>
                   
                    {/* <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600 font-medium">{t('sort')}</span>
                      <Button variant="outline" size="sm" className="rounded-xl px-4 py-2 border-gray-200 hover:bg-green-50">{t('default')} ▼</Button>
                    </div> */}
                  </div>

                  {/* Property Listings */}
                  <div className="space-y-6">
                    {propertiesLoading ? (
                      <div className="text-center py-16">
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          Loading Properties...
                        </h3>
                        <p className="text-gray-600 text-lg">
                          Fetching the latest available properties
                        </p>
                      </div>
                    ) : filteredProperties.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                          <MapPin className="h-12 w-12 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          {t("noPropertiesFound")}
                        </h3>
                        <p className="text-gray-600 text-lg">
                          {t("adjustFilters")}
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Modern Property Cards */}
                        {filteredProperties.map((property, index) => (
                          <ModernPropertyCard
                            key={property.id}
                            property={property}
                            index={index}
                            onViewUnits={async (property) => {
                                      setSelectedProperty(property);
                                      // Load units for this specific property
                                      console.log(
                                        "Loading units for property:",
                                        property.id
                                      );
                                      const loadedUnits =
                                        await loadUnitsForProperty(property.id);
                                      console.log(
                                        "Units loaded, setting view to unit-selection. Units count:",
                                        loadedUnits.length
                                      );
                                      setCurrentView("unit-selection");
                                    }}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : currentView === "prequalification-info" ? (
          <></>
        ) : 
        // <PrequalificationInfo onBack={() => setCurrentView('dashboard')} />
        currentView === "unit-selection" ? (
          <QualifiedProperties
            onUnitSelect={(property, unit) => {
              console.log("Selected unit:", unit, "from property:", property);
              // Navigate to rental application
              setSelectedProperty(property);
              // setSelectedUnit(unit);
              setCurrentView("application-process");
            }}
            onNavigateToLeaseHolders={() => {
              setCurrentView("application-process");
              setApplicationStep(3); // Step 3 is "Lease Holders & Guarantors"
            }}
            onNavigateToGuarantors={() => {
              setCurrentView("application-process");
              setApplicationStep(3); // Step 3 is "Lease Holders & Guarantors"
            }}
            onCompareUnits={async (/* units */) => {
              // Load real units data from Firebase
              await loadUnitsData();
              // Generate comparison units using real data
              const mockUnits = generateMockComparisonUnits(databaseProperties);
              setComparisonUnits(mockUnits);
              setCurrentView("unit-comparison");
            }}
            onBack={handleBack}
            applicantData={{
              unitType: "1-2 Bedrooms",
              desiredTourDate: "2024-01-15",
              moveInDate: "2024-02-01",
              desiredLeaseTerm: "12",
              rentalRange: "$1,200 - $1,800",
              location: "Downtown Austin",
              amenities: ["Pool", "Gym", "Parking", "W/D"],
              petFriendly: true,
            }}
            // Pass dynamic properties data
            dynamicProperties={databaseProperties}
            useDynamicData={databaseProperties.length > 0}
            // Pass selected property to show units for specific property
            selectedProperty={selectedProperty}
            unitsData={unitsData}
          />
        ) : currentView === "unit-comparison" ? (
          <UnitsComparison
            comparisonUnits={comparisonUnits}
            onBack={() => setCurrentView("unit-selection")}
            onProceedToProducts={(property, unit, leaseTerm) => {
              console.log("[Dashboard] Proceed to products", {
                property,
                unit,
                leaseTerm,
              });
              setSelectedProperty(property);
              // setSelectedUnit(unit);
              // setSelectedLeaseTerm(leaseTerm);
              setCurrentView("product-selection");
            }}
            onUnitSelect={(property, unit, leaseTerm) => {
              console.log(
                "Selected unit:",
                unit,
                "from property:",
                property,
                "with lease term:",
                leaseTerm
              );
              // Navigate to next step in application process
              setCurrentView("application-process");
              setApplicationStep(2); // Move to next application step
            }}
            onShowDetails={(property, unit) => {
              console.log(
                "Show details for:",
                unit,
                "from property:",
                property
              );
            }}
          />
        ) : currentView === "product-selection" ? (
          <ProductSelection
            property={selectedProperty}
            unit={selectedUnit}
            selectedLeaseTerm={selectedLeaseTerm?.months || 12}
            selectedLeaseTermRent={selectedLeaseTerm?.rent}
            applicantData={{
              unitType: `${selectedUnit?.bedrooms} bedroom`,
              petDescription: '', // This should come from application data
              petName: '',
              petBreed: '',
              petWeight: '',
              creditScore: 720,
              applicationId: null // This should be the actual application ID
            }}
            onBack={() => setCurrentView('unit-comparison')}
            onPaymentProcess={(data) => {
              setPaymentData(data);
              setCurrentView('payment-page');
            }}
          />
        ) : currentView === 'payment-page' ? (
          <PaymentPage
            totalAmount={paymentData?.totals?.total || 0}
            paymentType={paymentData?.annualPayment ? 'annual' : 'monthly'}
            onBack={() => setCurrentView('product-selection')}
            onPaymentComplete={() => {
              console.log('Payment completed successfully');
              setCurrentView('dashboard');
            }}
          />
        ) : currentView === "property-details" ? (
          <PropertyDetailsModal
            property={selectedProperty}
            isOpen={true}
            onClose={() => {
              setCurrentView("dashboard");
              // Clear URL parameters when closing modal
              navigate('/property', { replace: true });
            }}
            onScheduleTour={() => {
              setSelectedPropertyForTour(selectedProperty);
              setScheduleTourModalOpen(true);
            }}
            onApplyNow={() => {
              setCurrentView("unit-selection");
            }}
            onViewUnits={async (property) => {
              setSelectedProperty(property);
              // Load units for this specific property
              console.log(
                "Loading units for property:",
                property.id
              );
              const loadedUnits =
                await loadUnitsForProperty(property.id);
              console.log(
                "Units loaded, setting view to unit-selection. Units count:",
                loadedUnits.length
              );
              setCurrentView("unit-selection");
            }}
          />
        ) : currentView === "account-management" ? (
          <></>
        ) : // <AccountManagement
        //   onBack={() => setCurrentView('dashboard')}
        // />
        currentView === "application-process" ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">
                Complete Your Application
              </h2>
              <Button
                variant="outline"
                onClick={() => setCurrentView("unit-selection")}
              >
                ← Back to Units
              </Button>
            </div>
            <ApplicationProcess
              isOpen={true}
              onClose={() => setCurrentView("unit-selection")}
              type="prequalify"
              initialStep={applicationStep}
              onNavigateToUnitSelection={() => setCurrentView("unit-selection")}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Feature Coming Soon</h3>
            <p className="text-muted-foreground">
              This feature is currently under development.
            </p>
          </div>
        )}

        {/* Submissions Dashboard for Landlords and Staff */}
        {/* {(effectiveUserRole === "landlord_admin" || effectiveUserRole === "landlord_employee" || effectiveUserRole === "cocoon_admin" || effectiveUserRole === "cocoon_employee") && (
          <section className="bg-white border-t border-gray-200">
            <div className="container mx-auto px-6 py-8">
              <SubmissionsDashboard 
                userRole={effectiveUserRole?.includes("landlord") ? "landlord" : "staff"} 
                userId={user?.uid}
              />
            </div>
          </section>
        )} */}
      </main>

      {/* Schedule Tour Modal */}
      <ScheduleTourModal
        property={selectedPropertyForTour}
        isOpen={scheduleTourModalOpen}
        onClose={() => {
          setScheduleTourModalOpen(false);
          // Clear URL parameters when closing modal
          navigate('/property', { replace: true });
        }}
      />
    </div>
    
  );
};

export default Dashboards;
