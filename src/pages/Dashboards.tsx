import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { Search, MapPin, ChevronDown } from "lucide-react";
import { useTranslation } from "../hooks/useTranslations";
import { collection, query, limit, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import heroImage from "../assets/images/hero-apartments.jpg";
import QualifiedProperties from "../Prospect/QualifiedProperties";
import ApplicationProcess from "../Prospect/ApplicationProcess";
import UnitsComparison from "../components/rentar/unitSelecttion/UnitsComparison";
// import PropertyManagementForm from '../landlord/property-management/PropertyManagementForm';
// import PropertyManagementSuccess from '../landlord/property-management/PropertyManagementSuccess';
// import PropertiesList from '../landlord/shared/PropertiesList';
import DashboardMap from "../components/DashboardMap";
// import SubmissionsDashboard from "../components/SubmissionsDashboard";
// import AccountManagement from '../landlord/shared/AccountManagement';
import { useToast } from "../hooks/use-toast";
// import { generateMockComparisonUnits } from "../lib/mockUnits";
import PropertyDetailsModal from "../components/rentar/unitSelecttion/PropertyDetailsModal";
import ScheduleTourModal from "../components/rentar/unitSelecttion/ScheduleTourModal";
import { saveSearch } from "../services/savedSearchService";
import { ModernPropertyCard } from "../components/ModernPropertyCard";
import { CalendarPopover } from "../components/CalendarPopover";
import SearchFilters from "../components/PropertyAllFilter";
import ProductSelection from "../components/ProductSelection";
import PaymentPage from "../components/payment/PaymentPage";
import PrequalificationInfo from "../Prospect/PrequalificationInfo";
import {
  geocodeSearchTerm,
  searchPropertiesByName,
  isLocationSearch,
  getSearchSuggestions,
  SearchSuggestion,
} from "../services/geocodingService";
import AutoSuggest from "../components/AutoSuggest";
import { Loader } from "../components/ui/Loader";

// Helper function to determine if a search term is a country name
const isCountryName = (searchTerm: string): boolean => {
  const countryNames = [
    "united states",
    "usa",
    "us",
    "america",
    "canada",
    "mexico",
    "brazil",
    "argentina",
    "chile",
    "colombia",
    "peru",
    "venezuela",
    "united kingdom",
    "uk",
    "england",
    "scotland",
    "wales",
    "ireland",
    "france",
    "germany",
    "spain",
    "italy",
    "portugal",
    "netherlands",
    "belgium",
    "switzerland",
    "austria",
    "poland",
    "czech republic",
    "hungary",
    "romania",
    "bulgaria",
    "croatia",
    "serbia",
    "slovakia",
    "slovenia",
    "russia",
    "ukraine",
    "belarus",
    "estonia",
    "latvia",
    "lithuania",
    "finland",
    "sweden",
    "norway",
    "denmark",
    "china",
    "japan",
    "south korea",
    "north korea",
    "india",
    "pakistan",
    "bangladesh",
    "sri lanka",
    "thailand",
    "vietnam",
    "philippines",
    "indonesia",
    "malaysia",
    "singapore",
    "myanmar",
    "cambodia",
    "laos",
    "australia",
    "new zealand",
    "fiji",
    "papua new guinea",
    "south africa",
    "egypt",
    "nigeria",
    "kenya",
    "morocco",
    "tunisia",
    "algeria",
    "ethiopia",
    "ghana",
    "tanzania",
    "israel",
    "palestine",
    "jordan",
    "lebanon",
    "syria",
    "iraq",
    "iran",
    "saudi arabia",
    "uae",
    "qatar",
    "kuwait",
    "bahrain",
    "turkey",
    "greece",
    "cyprus",
    "armenia",
    "georgia",
    "azerbaijan",
    "afghanistan",
    "uzbekistan",
    "kazakhstan",
    "kyrgyzstan",
    "tajikistan",
    "turkmenistan",
    "mongolia",
  ];

  return countryNames.some(
    (country) => country.includes(searchTerm) || searchTerm.includes(country)
  );
};

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
  const [scheduleTourModalOpen, setScheduleTourModalOpen] = useState(false);
  const [selectedPropertyForTour, setSelectedPropertyForTour] =
    useState<any>(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [userLocation] = useState(""); // Default to Austin, would be IP-based in production
  const [isPrequalified] = useState(false);
  const [selectedLanguage] = useState<"EN" | "ES" | "FR" | "DE">("EN");
  const { t } = useTranslation(selectedLanguage);

  // Search and geocoding state
  const [searchCoordinates, setSearchCoordinates] = useState<
    [number, number] | null
  >(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [justSelectedSuggestion, setJustSelectedSuggestion] = useState(false);
  const [hasActiveSearch, setHasActiveSearch] = useState(false);

  // Save Search Modal states
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [savingSearch, setSavingSearch] = useState(false);

  // Search functions will be defined after databaseProperties is declared

  // Search effect will be defined after search functions are declared

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

  // Handle save search functionality
  const handleSaveSearch = async () => {
    if (!user?.uid) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save searches",
        variant: "destructive",
      });
      return;
    }

    if (!searchName.trim()) {
      toast({
        title: "Search name required",
        description: "Please enter a name for your saved search",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingSearch(true);

      const searchData = {
        searchName: searchName.trim(),
        searchLocation,
        priceRange,
        selectedBeds,
        selectedBaths,
        selectedHomeTypes,
        selectedAmenities,
        selectedFeatures,
        petPolicy,
        parkingType,
        utilityPolicy,
        squareFootage,
        yearBuilt,
        additionalSpecialties,
        laundryFacilities,
        selectedRating,
        propertyFeatures,
        showOnlyRentWise,
        moveInDate,
        subscriptionsEnabled: true, // Default to enabled
        filteredPropertiesCount: filteredProperties.length,
        filteredPropertyIds: filteredProperties.map((p: any) => p.id),
      };

      const result = await saveSearch(user.uid, searchData);

      if (result.success) {
        toast({
          title: "Search saved successfully",
          description: `"${searchName}" has been saved to your searches`,
        });
        setShowSaveSearchModal(false);
        setSearchName("");
      } else {
        toast({
          title: "Error saving search",
          description: result.error || "Failed to save search",
        });
      }
    } catch (error) {
      console.error("Error saving search:", error);
      toast({
        title: "Error saving search",
        description: "Failed to save search",
        variant: "destructive",
      });
    } finally {
      setSavingSearch(false);
    }
  };

  // Enhanced filter states with better state management
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedBeds, setSelectedBeds] = useState<string[]>([]);
  const [selectedBaths, setSelectedBaths] = useState<string[]>([]);

  const [selectedHomeTypes, setSelectedHomeTypes] = useState<string[]>([]);
  const [moveInDate, setMoveInDate] = useState<Date>();
  const [showAllFilters, setShowAllFilters] = useState(false);

  // Enhanced search summary state
  const [searchSummary, setSearchSummary] = useState({
    activeFilters: 0,
    totalResults: 0,
    lastUpdated: new Date(),
    filterDetails: [] as Array<{ type: string; value: string; label: string }>,
    searchInsights: {
      averagePrice: 0,
      priceRange: { min: 0, max: 0 },
      popularAmenities: [] as string[],
      topLocations: [] as string[],
    },
  });

  // Helper function for filter management
  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case "location":
        setSearchLocation("");
        break;
      case "price":
        setPriceRange([0, 10000]);
        break;
      case "beds":
        setSelectedBeds([]);
        break;
      case "baths":
        setSelectedBaths([]);
        break;
      case "homeTypes":
        setSelectedHomeTypes([]);
        break;
      case "moveInDate":
        setMoveInDate(undefined);
        break;
      case "amenities":
        setSelectedAmenities([]);
        break;
      case "features":
        setSelectedFeatures([]);
        break;
      case "petPolicy":
        setPetPolicy("");
        break;
      case "parking":
        setParkingType([]);
        break;
      case "utilities":
        setUtilityPolicy([]);
        break;
      case "specialties":
        setAdditionalSpecialties([]);
        break;
      case "laundry":
        setLaundryFacilities([]);
        break;
      case "rating":
        setSelectedRating("");
        break;
      case "propertyFeatures":
        setPropertyFeatures([]);
        break;
    }
  };

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
  const [squareFootage, setSquareFootage] = useState<[number, number]>([
    0, 10000,
  ]);
  const [yearBuilt, setYearBuilt] = useState<[number, number]>([1900, 2030]);
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
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [unitsError, setUnitsError] = useState<string | null>(null);

  // Handle search functionality - memoized to prevent infinite loops
  const handleSearch = React.useCallback(
    async (searchTerm: string) => {
      if (!searchTerm || searchTerm.trim().length === 0) {
        setSearchCoordinates(null);
        setGeocodingError(null);
        setSearchResults([]);
        return;
      }

      const trimmedTerm = searchTerm.trim();

      try {
        setIsGeocoding(true);
        setGeocodingError(null);

        // Check if it's a location search or property name search
        if (isLocationSearch(trimmedTerm)) {
          // Geocode the location
          const result = await geocodeSearchTerm(trimmedTerm);

          if ("error" in result) {
            setGeocodingError(result.message);
            setSearchCoordinates(null);
          } else {
            setSearchCoordinates([result.lng, result.lat]);
            setGeocodingError(null);

            // Check if this is a country search and provide appropriate feedback
            const isCountrySearch = isCountryName(trimmedTerm.toLowerCase());
            if (isCountrySearch) {
              // Check if any properties exist in this country
              const countryProperties = databaseProperties.filter(
                (property) =>
                  property.country &&
                  property.country
                    .toLowerCase()
                    .includes(trimmedTerm.toLowerCase())
              );

              if (countryProperties.length === 0) {
                toast({
                  title: "No properties found",
                  description: `We don't have any properties in ${trimmedTerm} yet. Try searching for a specific city or state.`,
                  variant: "destructive",
                });
              } else {
                toast({
                  title: "Location found",
                  description: `Found ${countryProperties.length} properties in ${trimmedTerm}`,
                });
              }
            } else {
              toast({
                title: "Location found",
                description: `Centered map on ${trimmedTerm}`,
              });
            }
          }
        } else {
          // Search for properties by name
          const propertyResults = searchPropertiesByName(
            databaseProperties,
            trimmedTerm
          );
          setSearchResults(propertyResults);
          setSearchCoordinates(null);

          if (propertyResults.length > 0) {
            toast({
              title: "Properties found",
              description: `Found ${propertyResults.length} properties matching "${trimmedTerm}"`,
            });
          } else {
            toast({
              title: "No properties found",
              description: `No properties found matching "${trimmedTerm}"`,
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Search error:", error);
        setGeocodingError("Search failed. Please try again.");
        setSearchCoordinates(null);
        setSearchResults([]);
      } finally {
        setIsGeocoding(false);
      }
    },
    [databaseProperties, toast]
  );

  // Debounced search handler - memoized to prevent infinite loops
  const debouncedSearch = React.useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => handleSearch(searchTerm), 500);
      };
    })(),
    [handleSearch]
  );

  // Load suggestions as user types
  const loadSuggestions = React.useCallback(
    async (searchTerm: string) => {
      if (searchTerm.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const newSuggestions = await getSearchSuggestions(
          searchTerm,
          databaseProperties
        );
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error("Error loading suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    },
    [databaseProperties]
  );

  // Debounced suggestions loader
  const debouncedLoadSuggestions = React.useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (searchTerm: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => loadSuggestions(searchTerm), 300);
      };
    })(),
    [loadSuggestions]
  );

  // Handle search input change
  const handleSearchInputChange = (value: string) => {
    setSearchLocation(value);
    debouncedLoadSuggestions(value);
    // Don't clear search results when typing - keep existing map visible
    // Only clear if the input is completely empty
    if (!value.trim()) {
      setSearchCoordinates(null);
      setSearchResults([]);
      setGeocodingError(null);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    // Set flag to prevent search effect from interfering
    setJustSelectedSuggestion(true);

    // Set flag to indicate we have an active search
    setHasActiveSearch(true);

    // Update the search input
    setSearchLocation(suggestion.text);

    if (suggestion.type === "location" && suggestion.coordinates) {
      // For location suggestions, directly set coordinates and clear other results
      setSearchCoordinates(suggestion.coordinates);
      setGeocodingError(null);
      setSearchResults([]);
      toast({
        title: "Location selected",
        description: `Centered map on ${suggestion.text}`,
      });
    } else if (suggestion.type === "property" && suggestion.property) {
      // For property suggestions, set the property results and clear coordinates
      setSearchResults([suggestion.property]);
      setSearchCoordinates(null);
      setGeocodingError(null);
      // toast({
      //   title: "Property selected",
      //   description: `Showing ${suggestion.text}`,
      // });
    }

    // Clear suggestions after selection
    setSuggestions([]);

    // Reset the flag after a short delay
    setTimeout(() => setJustSelectedSuggestion(false), 100);
  };

  // Handle manual search trigger (search button or Enter key)
  const handleManualSearch = () => {
    if (searchLocation && searchLocation.trim().length > 0) {
      // Set flag to indicate we have an active search
      setHasActiveSearch(true);

      // Clear any existing results first
      setSearchCoordinates(null);
      setSearchResults([]);
      setGeocodingError(null);

      // Trigger the search
      handleSearch(searchLocation.trim());
    }
  };

  // Clear search results when search input is cleared
  useEffect(() => {
    if (!searchLocation) {
      setSearchCoordinates(null);
      setGeocodingError(null);
      setSearchResults([]);
      setSuggestions([]);
      setHasActiveSearch(false); // Reset active search flag
    }
  }, [searchLocation]);

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
        } catch {
          // No properties found, trying listings collection...
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
          setDatabaseProperties([]);
          return;
        }

        // Transform Firebase data to match expected format

        const transformedProperties = querySnapshot.docs.map((doc: any) => {
          const prop = doc.data();
          console.log("prop", prop);

          // Handle different data structures from listings vs properties
          if (collectionName === "listings") {
            // Data from listings collection (migrated data)
            // Based on Firestore console: amenities, available, availableDate, bathrooms, bedrooms, deposit, description, images, propertyId, publishedAt, rent, title
            return {
              id: doc.id,
              name: prop.title || "",
              address: prop.address || "",
              priceRange: prop.rent ? `$${prop.rent.toLocaleString()}` : "",
              beds: prop.bedrooms
                ? `${prop.bedrooms} ${prop.bedrooms === 1 ? "Bed" : "Beds"}`
                : "",
              rating: prop.rating || 0,
              amenities: prop.amenities || [],
              image: prop.images?.[0] || "",
              coordinates: prop.coordinates || ([0, 0] as [number, number]),
              propertyType: prop.propertyType || "",
              isRentWiseNetwork: prop.isRentWiseNetwork || false,
              rent_amount: prop.rent,
              bedrooms: prop.bedrooms,
              bathrooms: prop.bathrooms,
              city: prop.city || "",
              state: prop.state || "",
              zip_code: prop.zip_code || "",
              description: prop.description,
              pet_friendly: prop.pet_friendly || false,
              available_date: prop.availableDate,
              lease_term_options: prop.lease_term_options || [],
              lease_term_months: prop.lease_term_months,
              security_deposit_months: prop.security_deposit_months,
              first_month_rent_required: prop.first_month_rent_required,
              last_month_rent_required: prop.last_month_rent_required,
              pet_deposit: prop.pet_deposit,
              application_fee: prop.application_fee,
            };
          } else {
            console.log("prop properties", prop);
            // Data from properties collection (new landlord form format)
            // Handle both string and object address formats
            let addressString = "";
            let city = "";
            let state = "";
            let zip_code = "";
            let country = "";

            if (typeof prop.address === "string") {
              addressString = prop.address;
            } else if (prop.address && typeof prop.address === "object") {
              addressString = `${prop.address.line1}${
                prop.address.line2 ? ", " + prop.address.line2 : ""
              }`;
              city = prop.address.city || "";
              state = prop.address.region || "";
              zip_code = prop.address.postalCode || "";
              country = prop.address.country || "";
            }

            // Handle location coordinates
            let coordinates: [number, number] = [0, 0]; // Default to 0,0 if no coordinates
            if (prop.location && prop.location.lat && prop.location.lng) {
              coordinates = [prop.location.lng, prop.location.lat];
            } else if (prop.lat && prop.lng) {
              coordinates = [prop.lng, prop.lat];
            }

            // Handle images - use first image if available
            let imageUrl = "";
            if (prop.images && prop.images.length > 0 && prop.images[0]) {
              imageUrl = prop.images[0];
            } else if (prop.image) {
              imageUrl = prop.image;
            }

            // Handle timestamps
            let createdAt = null;
            let updatedAt = null;
            if (prop.createdAt) {
              if (prop.createdAt.seconds) {
                createdAt = new Date(prop.createdAt.seconds * 1000);
              } else {
                createdAt = new Date(prop.createdAt);
              }
            }
            if (prop.updatedAt) {
              if (prop.updatedAt.seconds) {
                updatedAt = new Date(prop.updatedAt.seconds * 1000);
              } else {
                updatedAt = new Date(prop.updatedAt);
              }
            }
            console.log("doc", doc.id);

            return {
              id: doc.id,
              name: prop.name || prop.title || "",
              title: prop.title || prop.name || "",
              address: addressString || "",
              priceRange: prop.rent_amount
                ? `$${prop.rent_amount.toLocaleString()}`
                : "",
              beds: prop.bedrooms
                ? `${prop.bedrooms} ${prop.bedrooms === 1 ? "Bed" : "Beds"}`
                : "",
              rating: prop.rating || 0,
              amenities: prop.amenities || [],
              image: imageUrl,
              coordinates: coordinates,
              propertyType: prop.propertyType || prop.property_type || "",
              isRentWiseNetwork: prop.isRentWiseNetwork || false,
              rent_amount: prop.rent_amount,
              bedrooms: prop.bedrooms,
              bathrooms: prop.bathrooms,
              city: city || prop.city || "",
              state: state || prop.state || "",
              zip_code: zip_code || prop.zip_code || "",
              country: country || prop.country || "",
              description: prop.description,
              pet_friendly: prop.pet_friendly,
              available_date: prop.available_date,
              is_available: prop.is_available,
              square_feet: prop.square_feet,
              lat: prop.location?.lat || prop.lat,
              lng: prop.location?.lng || prop.lng,
              landlordId: prop.landlordId,
              createdAt: createdAt,
              updatedAt: updatedAt,
              created_at: prop.created_at,
              updated_at: prop.updated_at,
              // Social feeds
              socialFeeds: prop.socialFeeds,
              // Images array
              images: prop.images || [],
              // Property type details (keep both for compatibility)
              property_type: prop.property_type,
              // Location object
              location: prop.location,
              // Address object (keep original for detailed display)
              addressObject: prop.address,
              // Future fields (will be undefined if not present)
              year_built: prop.year_built,
              yearBuilt: prop.yearBuilt,
              features: prop.features,
              parkingType: prop.parkingType,
              utilityPolicy: prop.utilityPolicy,
              specialties: prop.specialties,
              laundryFacilities: prop.laundryFacilities,
              propertyFeatures: prop.propertyFeatures,
              // Lease and application details
              lease_term_options: prop.lease_term_options || [],
              lease_term_months: prop.lease_term_months,
              security_deposit_months: prop.security_deposit_months,
              first_month_rent_required: prop.first_month_rent_required,
              last_month_rent_required: prop.last_month_rent_required,
              pet_deposit: prop.pet_deposit,
              application_fee: prop.application_fee,
            };
          }
        });

        console.log(
          "Transformed properties count:",
          transformedProperties.length
        );
        console.log("Transformed properties:", transformedProperties);
        setDatabaseProperties(transformedProperties);
      } catch (error) {
        console.error("Error loading properties from Firebase:", error);
        setDatabaseProperties([]);
      } finally {
        setPropertiesLoading(false);
      }
    };

    // Initial load
    loadProperties();

    // Set up real-time listener for properties collection
    const propertiesQuery = query(
      collection(db, "properties"),
      limit(20)
    );
    
    const unsubscribeProperties = onSnapshot(propertiesQuery, (snapshot) => {
      console.log('Properties updated in real-time on Dashboards:', snapshot.docs.length);
      
      // Filter available properties in memory
      const availableProperties = snapshot.docs.filter((doc) => {
        const data = doc.data();
        return data.is_available === true;
      });

      if (availableProperties.length === 0) {
        setDatabaseProperties([]);
        return;
      }

      // Transform properties for real-time updates
      const transformedProperties = availableProperties.map((doc: any) => {
        const prop = doc.data();
        
        // Handle address - could be string or object
        let addressString = "";
        let city = "";
        let state = "";
        let zip_code = "";
        let country = "";

        if (typeof prop.address === "string") {
          addressString = prop.address;
        } else if (prop.address && typeof prop.address === "object") {
          addressString = `${prop.address.line1}${
            prop.address.line2 ? ", " + prop.address.line2 : ""
          }`;
          city = prop.address.city || "";
          state = prop.address.region || "";
          zip_code = prop.address.postalCode || "";
          country = prop.address.country || "";
        }

        // Handle location coordinates
        let coordinates: [number, number] = [0, 0];
        if (prop.location && prop.location.lat && prop.location.lng) {
          coordinates = [prop.location.lng, prop.location.lat];
        } else if (prop.lat && prop.lng) {
          coordinates = [prop.lng, prop.lat];
        }

        // Handle images - use first image if available
        let imageUrl = "";
        if (prop.images && prop.images.length > 0 && prop.images[0]) {
          imageUrl = prop.images[0];
        } else if (prop.image) {
          imageUrl = prop.image;
        }

        // Handle timestamps
        let createdAt = null;
        let updatedAt = null;
        if (prop.createdAt) {
          if (prop.createdAt.seconds) {
            createdAt = new Date(prop.createdAt.seconds * 1000);
          } else {
            createdAt = new Date(prop.createdAt);
          }
        }
        if (prop.updatedAt) {
          if (prop.updatedAt.seconds) {
            updatedAt = new Date(prop.updatedAt.seconds * 1000);
          } else {
            updatedAt = new Date(prop.updatedAt);
          }
        }

        return {
          id: doc.id,
          name: prop.name || prop.title || "",
          title: prop.title || prop.name || "",
          address: addressString || "",
          city: city,
          state: state,
          zip_code: zip_code,
          country: country,
          priceRange: prop.rent_amount
            ? `$${prop.rent_amount.toLocaleString()}`
            : "",
          beds: prop.bedrooms
            ? `${prop.bedrooms} ${prop.bedrooms === 1 ? "Bed" : "Beds"}`
            : "",
          rating: prop.rating || 0,
          amenities: prop.amenities || [],
          image: imageUrl || "",
          coordinates: coordinates,
          propertyType: prop.propertyType || "",
          bathrooms: prop.bathrooms || 0,
          squareFeet: prop.sqft || 0,
          rent: prop.rent_amount || 0,
          deposit: prop.deposit || 0,
          description: prop.description || "",
          availableDate: prop.available_date || "",
          publishedAt: prop.createdAt || new Date(),
          is_available: prop.is_available || false,
          createdAt: createdAt,
          updatedAt: updatedAt,
        };
      });

      setDatabaseProperties(transformedProperties);
    });

    // Set up real-time listener for listings collection as fallback
    const listingsQuery = query(collection(db, "listings"), limit(20));
    
    const unsubscribeListings = onSnapshot(listingsQuery, (snapshot) => {
      console.log('Listings updated in real-time on Dashboards:', snapshot.docs.length);
      
      // Filter available listings in memory
      const availableListings = snapshot.docs.filter((doc) => {
        const data = doc.data();
        return data.available === true;
      });

      if (availableListings.length === 0) {
        // Only update if we don't have properties from the properties collection
        if (databaseProperties.length === 0) {
          setDatabaseProperties([]);
        }
        return;
      }

      // Transform listings for real-time updates
      const transformedListings = availableListings.map((doc: any) => {
        const prop = doc.data();
        
        return {
          id: doc.id,
          name: prop.title || "",
          address: prop.address || "",
          priceRange: prop.rent ? `$${prop.rent.toLocaleString()}` : "",
          beds: prop.bedrooms
            ? `${prop.bedrooms} ${prop.bedrooms === 1 ? "Bed" : "Beds"}`
            : "",
          rating: prop.rating || 0,
          amenities: prop.amenities || [],
          image: prop.images?.[0] || "",
          coordinates: prop.coordinates || ([0, 0] as [number, number]),
          propertyType: prop.propertyType || "",
          bathrooms: prop.bathrooms || 0,
          squareFeet: prop.squareFeet || 0,
          rent: prop.rent || 0,
          deposit: prop.deposit || 0,
          description: prop.description || "",
          availableDate: prop.availableDate || "",
          publishedAt: prop.publishedAt || new Date(),
          is_available: prop.available || false,
          createdAt: prop.publishedAt || new Date(),
          updatedAt: prop.publishedAt || new Date(),
        };
      });

      // Only update if we don't have properties from the properties collection
      if (databaseProperties.length === 0) {
        setDatabaseProperties(transformedListings);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeProperties();
      unsubscribeListings();
    };
  }, [databaseProperties.length]);

  // Handle URL parameters for search filters and property details
  useEffect(() => {
    const propertyId = searchParams.get("propertyId");
 
    // Handle property details - only proceed if data has finished loading
    if (propertyId && !propertiesLoading && databaseProperties?.length > 0) {
      // Find the property by ID
      const foundProperty = databaseProperties.find(
        (p: any) => p.id === propertyId
      );
 
      if (foundProperty) {
        setSelectedProperty(foundProperty);
        setCurrentView("property-details");
      } else {
        toast({
          title: "Property not found",
          description: "The requested property could not be found.",
          variant: "destructive",
        });
      }
    }

    // Handle search filter parameters from saved search
    const location = searchParams.get("location");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const beds = searchParams.get("beds");
    const baths = searchParams.get("baths");
    const types = searchParams.get("types");
    const amenities = searchParams.get("amenities");
    const features = searchParams.get("features");
    const petPolicy = searchParams.get("petPolicy");
    const parking = searchParams.get("parking");
    const utilities = searchParams.get("utilities");
    const minSqft = searchParams.get("minSqft");
    const maxSqft = searchParams.get("maxSqft");
    const minYear = searchParams.get("minYear");
    const maxYear = searchParams.get("maxYear");
    const specialties = searchParams.get("specialties");
    const laundry = searchParams.get("laundry");
    const rating = searchParams.get("rating");
    const propertyFeatures = searchParams.get("propertyFeatures");
    const rentwise = searchParams.get("rentwise");
    const moveInDate = searchParams.get("moveInDate");

    // Apply filters from URL parameters
    if (location) setSearchLocation(location);
    if (minPrice && maxPrice) {
      setPriceRange([parseInt(minPrice), parseInt(maxPrice)]);
    }
    if (beds) setSelectedBeds(beds.split(","));
    if (baths) setSelectedBaths(baths.split(","));
    if (types) setSelectedHomeTypes(types.split(","));
    if (amenities) setSelectedAmenities(amenities.split(","));
    if (features) setSelectedFeatures(features.split(","));
    if (petPolicy) setPetPolicy(petPolicy);
    if (parking) setParkingType(parking.split(","));
    if (utilities) setUtilityPolicy(utilities.split(","));
    if (minSqft && maxSqft) {
      setSquareFootage([parseInt(minSqft), parseInt(maxSqft)]);
    }
    if (minYear && maxYear) {
      setYearBuilt([parseInt(minYear), parseInt(maxYear)]);
    }
    if (specialties) setAdditionalSpecialties(specialties.split(","));
    if (laundry) setLaundryFacilities(laundry.split(","));
    if (rating) setSelectedRating(rating);
    if (propertyFeatures) setPropertyFeatures(propertyFeatures.split(","));
    if (rentwise === "true") setShowOnlyRentWise(true);
    if (moveInDate) setMoveInDate(new Date(moveInDate));

    // Show info message if filters were applied from saved search
    if (location || minPrice || beds || types || amenities) {
      toast({
        title: "Search filters applied",
        description:
          "Your saved search criteria have been applied to the current search.",
      });
    }
  }, [searchParams, databaseProperties, toast]);

  // Load units data from Firebase
  // const loadUnitsData = async () => {
  //   try {
  //     // setUnitsLoading(true);

  //     // Load from units collection (your actual unit data)
  //     const unitsQuery = query(collection(db, "units"), limit(50));
  //     const querySnapshot = await getDocs(unitsQuery);

  //     if (querySnapshot.empty) {
  //       setUnitsData([]);
  //       return;
  //     }

  //     // Transform Firebase units data to match UnitsComparison format
  //     const transformedUnits = querySnapshot.docs.map((doc) => {
  //       const unit = doc.data();

  //       // Based on your Firestore console data structure:
  //       // amenities, available, availableDate, bathrooms, bedrooms, createdAt, deposit, description, images, propertyId
  //       return {
  //         id: doc.id,
  //         unitNumber: unit.unitNumber || `Unit ${doc.id.slice(-4)}`,
  //         bedrooms: unit.bedrooms || 0,
  //         bathrooms: unit.bathrooms || 0,
  //         sqft: unit.squareFeet || unit.sqft || 0,
  //         available: unit.available !== false,
  //         availableDate: unit.availableDate || new Date().toISOString(),
  //         floorPlan: unit.floorPlan || "",
  //         rent: unit.rent || unit.rentAmount || 0,
  //         deposit: unit.deposit || 0,
  //         leaseTerms: unit.leaseTerms || [
  //           {
  //             months: 12,
  //             rent: unit.rent || unit.rentAmount || 0,
  //             popular: true,
  //             savings: null,
  //             concession: null,
  //           },
  //         ],
  //         amenities: unit.amenities || [],
  //         images: unit.images || [],
  //         qualified: unit.qualified !== false,
  //         qualifiedStatus: unit.qualifiedStatus || "qualified" as const,
  //         parkingIncluded: unit.parkingIncluded || false,
  //         petFriendly: unit.petFriendly || false,
  //         furnished: unit.furnished || false,
  //         floor: unit.floor || 0,
  //         view: unit.view || "",
  //         description: unit.description || "",
  //         propertyId: unit.propertyId || "",
  //       };
  //     });

  //     setUnitsData(transformedUnits);
  //   } catch (error) {
  //     console.error("Error loading units from Firebase:", error);
  //     setUnitsData([]);
  //   } finally {
  //     // setUnitsLoading(false);
  //   }
  // };

  // Load units for a specific property with proper error handling
  const loadUnitsForProperty = async (propertyId: string) => {
    try {
      setUnitsLoading(true);
      setUnitsError(null);

      // Load units from Firebase that match the property ID
      const unitsQuery = query(
        collection(db, "units")
        // Note: We'll filter in memory to avoid index requirements
      );
      const querySnapshot = await getDocs(unitsQuery);

      if (querySnapshot.empty) {
        setUnitsError("No units found for this property");
        return [];
      }

      // Filter units for the specific property and transform
      const propertyUnits = querySnapshot.docs
        .filter((doc) => {
          const unit = doc.data();
          return unit.propertyId === propertyId;
        })
        .map((doc) => {
          const unit = doc.data();

          return {
            id: doc.id,
            unitNumber: unit.unitNumber || `Unit ${doc.id.slice(-4)}`,
            bedrooms: unit.bedrooms || 0,
            bathrooms: unit.bathrooms || 0,
            sqft: unit.squareFeet || unit.sqft || 0,
            available: unit.available !== false,
            availableDate: unit.availableDate || new Date().toISOString(),
            floorPlan: unit.floorPlan || "",
            rent: unit.rent || unit.rentAmount || 0,
            deposit: unit.deposit || 0,
            amenities: unit.amenities || [],
            images: unit.images || [],
            description: unit.description || "",
            propertyId: unit.propertyId || "",
            // Additional unit details
            floor: unit.floor || 0,
            view: unit.view || "",
            parkingIncluded: unit.parkingIncluded || false,
            petFriendly: unit.petFriendly || false,
            furnished: unit.furnished || false,
            leaseTerms: unit.leaseTerms || [
              {
                months: 12,
                rent: unit.rent || unit.rentAmount || 0,
                popular: true,
                savings: null,
                concession: null,
              },
            ],
            lease_term_options: unit.lease_term_options || ["12 Months"],
            lease_term_months: unit.lease_term_months,
            security_deposit_months: unit.security_deposit_months,
            first_month_rent_required: unit.first_month_rent_required,
            last_month_rent_required: unit.last_month_rent_required,
            pet_deposit: unit.pet_deposit,
            application_fee: unit.application_fee,
          };
        });

      if (propertyUnits.length === 0) {
        setUnitsError("No units found for this property");
      }

      return propertyUnits;
    } catch (error) {
      console.error("Error loading units for property:", error);
      setUnitsError("Failed to load units. Please try again.");
      return [];
    } finally {
      setUnitsLoading(false);
    }
  };

  // Use only database properties - no static fallbacks
  const featuredProperties = databaseProperties;
  console.log("featuredProperties", featuredProperties);

  // Real-time filter updates and search summary
  useEffect(() => {
    let activeFilters = 0;
    const filterDetails: Array<{ type: string; value: string; label: string }> =
      [];

    // Location filter
    if (searchLocation.trim()) {
      activeFilters++;
      filterDetails.push({
        type: "location",
        value: searchLocation,
        label: `Location: ${searchLocation}`,
      });
    }

    // Price range filter
    if (priceRange[0] !== 0 || priceRange[1] !== 10000) {
      activeFilters++;
      const priceLabel =
        priceRange[1] === 10000
          ? `Price: Up To $${(priceRange[1] / 1000).toFixed(1)}k`
          : `Price: $${priceRange[0].toLocaleString()} - $${priceRange[1].toLocaleString()}`;
      filterDetails.push({
        type: "price",
        value: `${priceRange[0]}-${priceRange[1]}`,
        label: priceLabel,
      });
    }

    // Bedrooms filter
    if (selectedBeds.length > 0) {
      activeFilters++;
      const bedLabel =
        selectedBeds.length === 1
          ? `Beds: ${selectedBeds[0]}`
          : `Beds: ${selectedBeds.join(", ")}`;
      filterDetails.push({
        type: "beds",
        value: selectedBeds.join(","),
        label: bedLabel,
      });
    }

    // Bathrooms filter
    if (selectedBaths.length > 0) {
      activeFilters++;
      const bathLabel =
        selectedBaths.length === 1
          ? `Baths: ${selectedBaths[0]}`
          : `Baths: ${selectedBaths.join(", ")}`;
      filterDetails.push({
        type: "baths",
        value: selectedBaths.join(","),
        label: bathLabel,
      });
    }

    // Home types filter
    if (selectedHomeTypes.length > 0) {
      activeFilters++;
      filterDetails.push({
        type: "homeTypes",
        value: selectedHomeTypes.join(","),
        label: `Property Types: ${selectedHomeTypes.join(", ")}`,
      });
    }

    // Move-in date filter
    if (moveInDate) {
      activeFilters++;
      filterDetails.push({
        type: "moveInDate",
        value: moveInDate.toISOString(),
        label: `Move-in: ${moveInDate.toLocaleDateString()}`,
      });
    }

    // Amenities filter
    if (selectedAmenities.length > 0) {
      activeFilters++;
      filterDetails.push({
        type: "amenities",
        value: selectedAmenities.join(","),
        label: `Amenities: ${selectedAmenities.join(", ")}`,
      });
    }

    // Features filter
    if (selectedFeatures.length > 0) {
      activeFilters++;
      filterDetails.push({
        type: "features",
        value: selectedFeatures.join(","),
        label: `Features: ${selectedFeatures.join(", ")}`,
      });
    }

    // Pet policy filter
    if (petPolicy) {
      activeFilters++;
      filterDetails.push({
        type: "petPolicy",
        value: petPolicy,
        label: `Pet Policy: ${petPolicy}`,
      });
    }

    // Parking type filter
    if (parkingType.length > 0) {
      activeFilters++;
      filterDetails.push({
        type: "parking",
        value: parkingType.join(","),
        label: `Parking: ${parkingType.join(", ")}`,
      });
    }

    // Utility policy filter
    if (utilityPolicy.length > 0) {
      activeFilters++;
      filterDetails.push({
        type: "utilities",
        value: utilityPolicy.join(","),
        label: `Utilities: ${utilityPolicy.join(", ")}`,
      });
    }

    // Additional specialties filter
    if (additionalSpecialties.length > 0) {
      activeFilters++;
      filterDetails.push({
        type: "specialties",
        value: additionalSpecialties.join(","),
        label: `Specialties: ${additionalSpecialties.join(", ")}`,
      });
    }

    // Laundry facilities filter
    if (laundryFacilities.length > 0) {
      activeFilters++;
      filterDetails.push({
        type: "laundry",
        value: laundryFacilities.join(","),
        label: `Laundry: ${laundryFacilities.join(", ")}`,
      });
    }

    // Rating filter
    if (selectedRating) {
      activeFilters++;
      filterDetails.push({
        type: "rating",
        value: selectedRating,
        label: `Rating: ${selectedRating}+ stars`,
      });
    }

    // Property features filter
    if (propertyFeatures.length > 0) {
      activeFilters++;
      filterDetails.push({
        type: "propertyFeatures",
        value: propertyFeatures.join(","),
        label: `Property Features: ${propertyFeatures.join(", ")}`,
      });
    }

    setSearchSummary((prev) => ({
      ...prev,
      activeFilters,
      filterDetails,
      lastUpdated: new Date(),
    }));
  }, [
    searchLocation,
    selectedBeds,
    selectedBaths,
    selectedHomeTypes,
    selectedAmenities,
    selectedFeatures,
    petPolicy,
    parkingType,
    utilityPolicy,
    additionalSpecialties,
    laundryFacilities,
    selectedRating,
    propertyFeatures,
    priceRange,
    moveInDate,
  ]);

  // Filter properties based on selected filters
  const filteredProperties = featuredProperties.filter((property) => {
    // If we have search results from property name search, only process those
    // BUT still apply all filters (bed, bath, price, etc.)
    if (searchResults.length > 0) {
      const isMatch = searchResults.some((result) => result.id === property.id);
      if (isMatch) {
        // Continue to apply filters instead of returning early
      } else {
        // Property not in search results, skip it
        return false;
      }
    }

    // Search location filter - handle different search scenarios
    let locationMatch = true; // Default to showing all properties

    if (hasActiveSearch && searchLocation.trim()) {
      // We have an active search with a location
      if (searchCoordinates !== null) {
        // We have coordinates from geocoding (e.g., country, city, address)
        // For now, we'll show all properties since we don't have geographic proximity filtering
        // In a real implementation, you'd filter by distance from searchCoordinates
        // For countries, we should check if any properties exist in that country
        const searchTerm = searchLocation.toLowerCase();

        // Check if the search term is a country name
        const isCountrySearch = isCountryName(searchTerm);

        if (isCountrySearch) {
          // For country searches, check if any properties exist in that country
          locationMatch =
            property.country &&
            property.country.toLowerCase().includes(searchTerm);
        } else {
          // For city/address searches, check city, state, and address fields
          locationMatch =
            (property.city &&
              property.city.toLowerCase().includes(searchTerm)) ||
            (property.state &&
              property.state.toLowerCase().includes(searchTerm)) ||
            (property.address &&
              property.address.toLowerCase().includes(searchTerm));
        }
      } else if (geocodingError) {
        // Geocoding failed - show no results
        locationMatch = false;
      }
    }

    // Price filter - handle both database and sample data formats
    let priceInRange = true;

    // Skip price filtering if range is set to show all prices (0 to 10000)
    if (priceRange[0] === 0 && priceRange[1] === 10000) {
      priceInRange = true;
    } else if (property.rent_amount && property.rent_amount > 0) {
      // Database format: numeric rent_amount (preferred)
      const rent = Number(property.rent_amount);
      priceInRange = rent >= priceRange[0] && rent <= priceRange[1];
    } else if (property.priceRange) {
      // Sample data format: "$1,255 - $2,849" or single price "$3,500"
      if (property.priceRange.includes(" - ")) {
        // Range format: "$1,255 - $2,849"
        const priceParts = property.priceRange.split(" - ");
        if (priceParts.length >= 2) {
          const minPrice = parseInt(priceParts[0]?.replace(/[$,]/g, "") || "0");
          const maxPrice = parseInt(priceParts[1]?.replace(/[$,]/g, "") || "0");
          // Check if any part of the price range overlaps with the selected range
          priceInRange =
            (minPrice >= priceRange[0] && minPrice <= priceRange[1]) ||
            (maxPrice >= priceRange[0] && maxPrice <= priceRange[1]) ||
            (minPrice <= priceRange[0] && maxPrice >= priceRange[1]);
        }
      } else {
        // Single price format: "$3,500"
        const price = parseInt(property.priceRange.replace(/[$,]/g, "") || "0");
        priceInRange = price >= priceRange[0] && price <= priceRange[1];
      }
    }

    // Beds filter
    const bedsMatch =
      selectedBeds.length === 0 ||
      selectedBeds.some((bed) => {
        if (bed === "Studio") {
          return property.beds?.includes("Studio") || property.bedrooms === 0;
        } else if (bed === "4+") {
          return property.beds?.includes("4") || property.bedrooms >= 4;
        } else {
          return (
            property.beds?.includes(bed) || property.bedrooms === parseInt(bed)
          );
        }
      });

    // Bathrooms filter
    const bathsMatch =
      selectedBaths.length === 0 ||
      selectedBaths.some((bath) => {
        if (bath === "4+") {
          return property.bathrooms >= 4;
        } else if (bath.includes("+")) {
          const minBaths = parseFloat(bath.replace("+", ""));
          return property.bathrooms >= minBaths;
        } else {
          return property.bathrooms === parseFloat(bath);
        }
      });

    // Home type filter using the actual propertyType field
    const typeMatch =
      selectedHomeTypes.length === 0 ||
      selectedHomeTypes.includes(
        property.propertyType || property.property_type || "Apartment"
      );

    // Amenities filter
    const amenitiesMatch =
      selectedAmenities.length === 0 ||
      selectedAmenities.every((amenity) =>
        property.amenities?.includes(amenity)
      );

    // Features filter - check both features field and amenities array
    const featuresMatch =
      selectedFeatures.length === 0 ||
      selectedFeatures.every(
        (feature) =>
          property.features?.includes(feature) ||
          property.amenities?.some(
            (amenity: string) =>
              amenity.toLowerCase().includes(feature.toLowerCase()) ||
              feature.toLowerCase().includes(amenity.toLowerCase())
          )
      );

    // Pet policy filter - check pet_friendly field from Firebase
    const petPolicyMatch =
      !petPolicy ||
      (petPolicy === "Pet Friendly" && property.pet_friendly) ||
      (petPolicy === "No Pets" && !property.pet_friendly) ||
      property.petPolicy === petPolicy;

    // Parking type filter - check both parkingType field and amenities array
    const parkingMatch =
      parkingType.length === 0 ||
      parkingType.some(
        (parking) =>
          property.parkingType?.includes(parking) ||
          property.amenities?.some(
            (amenity: string) =>
              amenity.toLowerCase().includes(parking.toLowerCase()) ||
              (parking.toLowerCase().includes("parking") &&
                amenity.toLowerCase().includes("parking"))
          )
      );

    // Utility policy filter - check both utilityPolicy field and amenities array
    const utilityMatch =
      utilityPolicy.length === 0 ||
      utilityPolicy.some(
        (utility) =>
          property.utilityPolicy?.includes(utility) ||
          property.amenities?.some((amenity: string) =>
            amenity.toLowerCase().includes(utility.toLowerCase())
          )
      );

    // Square footage filter - check both possible field names
    const squareFootageMatch =
      (!property.square_feet && !property.squareFootage) ||
      (property.square_feet &&
        property.square_feet >= squareFootage[0] &&
        property.square_feet <= squareFootage[1]) ||
      (property.squareFootage &&
        property.squareFootage >= squareFootage[0] &&
        property.squareFootage <= squareFootage[1]);

    // Year built filter - check both possible field names
    const yearBuiltMatch =
      (!property.year_built && !property.yearBuilt) ||
      (property.year_built &&
        property.year_built >= yearBuilt[0] &&
        property.year_built <= yearBuilt[1]) ||
      (property.yearBuilt &&
        property.yearBuilt >= yearBuilt[0] &&
        property.yearBuilt <= yearBuilt[1]);

    // Additional specialties filter - check both specialties field and amenities array
    const specialtiesMatch =
      additionalSpecialties.length === 0 ||
      additionalSpecialties.some(
        (specialty) =>
          property.specialties?.includes(specialty) ||
          property.amenities?.some((amenity: string) =>
            amenity.toLowerCase().includes(specialty.toLowerCase())
          )
      );

    // Laundry facilities filter - check both laundryFacilities field and amenities array
    const laundryMatch =
      laundryFacilities.length === 0 ||
      laundryFacilities.some(
        (laundry) =>
          property.laundryFacilities?.includes(laundry) ||
          property.amenities?.some(
            (amenity: string) =>
              amenity.toLowerCase().includes(laundry.toLowerCase()) ||
              (laundry.toLowerCase().includes("laundry") &&
                amenity.toLowerCase().includes("laundry"))
          )
      );

    // Rating filter
    const ratingMatch =
      !selectedRating ||
      (property.rating && property.rating >= parseFloat(selectedRating));

    // Property features filter - check both propertyFeatures field and amenities array
    const propertyFeaturesMatch =
      propertyFeatures.length === 0 ||
      propertyFeatures.some(
        (feature) =>
          property.propertyFeatures?.includes(feature) ||
          property.amenities?.some((amenity: string) =>
            amenity.toLowerCase().includes(feature.toLowerCase())
          )
      );

    // Move-in date filter - check if property is available by the selected move-in date
    const moveInDateMatch = (() => {
      // If no move-in date is selected, show all properties
      if (!moveInDate) return true;

      // If property has no available_date or it's undefined/null/empty, show it (assume available)
      if (!property.available_date) return false;

      // Try to parse the date and compare
      try {
        const availableDate = new Date(property.available_date);
        return availableDate <= moveInDate;
      } catch (error) {
        // If date parsing fails, show the property (assume it's available)
        return true;
      }
    })();

    // RentWise Network filter
    const rentwiseMatch =
      !showOnlyRentWise || property.isRentWiseNetwork === true;

    const finalResult =
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
      moveInDateMatch &&
      rentwiseMatch;

    // Debug logging for failed filters (simplified)
    if (!finalResult) {
      console.log("Property filtered out:", property.id, property.name);
    }

    return finalResult;
  });

  // Update search summary with filtered results count
  useEffect(() => {
    console.log("Filtered properties count:", filteredProperties.length);
    console.log("Filtered properties:", filteredProperties);
    setSearchSummary((prev) => ({
      ...prev,
      totalResults: filteredProperties.length,
    }));
  }, [filteredProperties.length]);

  // Check for URL parameters to show specific view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get("view");

    if (view === "account" && (user || devBypass)) {
      setCurrentView("account-management");
    } else if (view === "dashboard" && (user || devBypass)) {
      setCurrentView("dashboard");
    }
  }, [user, devBypass]);

  useEffect(() => {
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
      <Loader 
        message="Loading Dashboard" 
        subMessage="Preparing your property search and filters..."
      />
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
                  <h1 className="text-4xl md:text-7xl font-bold text-white mb-8 leading-tight">
                    Let's get you Home
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 mb-8 font-light">
                    Discover your perfect home with our intelligent matching
                    system
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center  space-x-0 gap-y-3  sm:gap-y-0 sm:space-x-4">
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
            <section className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-lg py-4 sticky top-16 z-30 px-4 md:px-8">
              <div className="container mx-auto  px-auto">
                <div className="flex items-center space-x-0 xl:space-x-4 flex-wrap 2xl:gap-0 gap-3">
                  <div className="relative">
                    <AutoSuggest
                      value={searchLocation}
                      onChange={handleSearchInputChange}
                      onSelect={handleSuggestionSelect}
                      onSearch={handleManualSearch}
                      suggestions={suggestions}
                      isLoading={isLoadingSuggestions}
                      placeholder="City, neighborhood, or property name..."
                      className="w-64"
                    />
                  </div>
                  {geocodingError && (
                    <div className="absolute top-full left-0 mt-2 bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700 max-w-64 z-50">
                      {geocodingError}
                    </div>
                  )}

                  {/* Price Filter Popover - Matching the shared image design */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className={`text-sm px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                          priceRange[0] === 0 && priceRange[1] === 10000
                            ? "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            : "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        }`}
                      >
                        {priceRange[0] === 0 && priceRange[1] === 10000
                          ? "Any Price"
                          : priceRange[0] === 0
                          ? `Up to $${(priceRange[1] / 1000).toFixed(1)}k`
                          : `$${priceRange[0].toLocaleString()} - $${priceRange[1].toLocaleString()}`}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-6 bg-white border-2 border-gray-200 shadow-2xl rounded-lg z-50">
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-800 text-lg">
                            Price Range
                          </h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            ${(priceRange[1] - priceRange[0]).toLocaleString()}{" "}
                            range
                          </span>
                        </div>

                        {/* Price Range Slider */}
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  ${priceRange[0].toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">Min</div>
                              </div>
                              <div className="flex-1 mx-4">
                                <div className="relative">
                                  {/* Background track */}
                                  <div className="h-3 bg-blue-200 rounded-full">
                                    {/* Active range bar */}
                                    <div
                                      className="h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full absolute"
                                      style={{
                                        left: `${
                                          (priceRange[0] / 10000) * 100
                                        }%`,
                                        width: `${
                                          ((priceRange[1] - priceRange[0]) /
                                            10000) *
                                          100
                                        }%`,
                                      }}
                                    />
                                  </div>

                                  {/* Min slider */}
                                  <input
                                    type="range"
                                    min="0"
                                    max="10000"
                                    step="100"
                                    value={priceRange[0]}
                                    onChange={(e) => {
                                      const newMin = parseInt(e.target.value);
                                      const newMax = Math.max(
                                        newMin + 100,
                                        priceRange[1]
                                      );
                                      setPriceRange([newMin, newMax]);
                                    }}
                                    className="absolute top-0 w-full h-3 opacity-0 cursor-pointer z-10"
                                  />

                                  {/* Max slider */}
                                  <input
                                    type="range"
                                    min="0"
                                    max="10000"
                                    step="100"
                                    value={priceRange[1]}
                                    onChange={(e) => {
                                      const newMax = parseInt(e.target.value);
                                      const newMin = Math.min(
                                        newMax - 100,
                                        priceRange[0]
                                      );
                                      setPriceRange([newMin, newMax]);
                                    }}
                                    className="absolute top-0 w-full h-3 opacity-0 cursor-pointer z-20"
                                  />
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  ${priceRange[1].toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">Max</div>
                              </div>
                            </div>
                          </div>

                          {/* Price Input Fields - Matching the shared image */}
                          <div className="flex flex-row gap-4">
                            {/* Minimum Price */}
                            <div className="relative w-1/2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Minimum
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max="10000"
                                  step="100"
                                  value={priceRange[0]}
                                  onChange={(e) => {
                                    const newMin =
                                      parseInt(e.target.value) || 0;
                                    const newMax = Math.max(
                                      newMin + 100,
                                      priceRange[1]
                                    );
                                    setPriceRange([newMin, newMax]);
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="0"
                                />

                                {/* Spinner Controls */}
                              </div>
                            </div>

                            {/* Maximum Price */}
                            <div className="relative w-1/2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max="10000"
                                  step="100"
                                  value={priceRange[1]}
                                  onChange={(e) => {
                                    const newMax =
                                      parseInt(e.target.value) || 0;
                                    const newMin = Math.min(
                                      newMax - 100,
                                      priceRange[0]
                                    );
                                    setPriceRange([newMin, newMax]);
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="10000"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Range Buttons */}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <Button
                            variant="outline"
                            onClick={() => setPriceRange([0, 10000])}
                            className="text-sm px-6 py-2 rounded-lg border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            Reset
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
                    className="text-sm pl-4 py-3 w-auto rounded-lg border-gray-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
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
                        setPriceRange([500, 10000]);
                        setSelectedBeds([]);
                        setSelectedBaths([]);
                        setSelectedHomeTypes([]);
                        setMoveInDate(undefined);
                        setSelectedAmenities([]);
                        setSelectedFeatures([]);
                        setPetPolicy("");
                        setParkingType([]);
                        setUtilityPolicy([]);
                        setSquareFootage([0, 10000] as [number, number]);
                        setYearBuilt([1900, 2030] as [number, number]);
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
                      onClick={() => setShowSaveSearchModal(true)}
                      className="text-sm px-4 py-3 bg-blue-50 text-black-600 border-blue-200 rounded-lg hover:bg-blue-100 transition-all duration-200"
                    >
                      ♡ Save Filters
                    </Button>

                    <Button
                      onClick={handleManualSearch}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-sm px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Search className="h-4 w-4 mr-1" />
                      Search
                    </Button>
                  </div>

                  {/* <a
                      href="/saved-properties"
                     
                      // onClick={() => navigate('/saved-properties')}
                      className=" font-medium text-md -600 hover:underline  px-6 py-3 "
                    >
                    
                      Saved Homes
                    </a>

                    <a
                      href="/saved-searches"
                      className=" font-medium text-md -600 hover:underline  px-6 py-3 "
                    >
                      Saved Searches
                    </a> */}
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
            <section className="flex flex-col xl:flex-row h-auto xl:h-screen-minus-140">
              {/* Map Section - Left Side */}
              <div className="xl:w-[60%] w-full bg-gradient-to-br from-gray-50 to-gray-100 relative">
                <DashboardMap
                  properties={filteredProperties}
                  isPrequalified={isPrequalified}
                  language={selectedLanguage}
                  searchCoordinates={searchCoordinates}
                  searchLocation={searchLocation}
                  onPropertySelect={(property) => {
                    setCurrentView("unit-selection");
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
              <div className="w-full xl:w-[40%] overflow-y-auto bg-gradient-to-br from-white to-green-50/30">
                <div className="py-6 px-4">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold ">
                        {t("apartmentsForRent")} {userLocation}
                      </h2>
                      {/* Enhanced Filter Summary - Only show when filters are applied */}
                      {searchSummary.activeFilters > 0 && (
                        <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                          {/* Header with Remove All */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-600">
                                {searchSummary.activeFilters} filter
                                {searchSummary.activeFilters > 1
                                  ? "s"
                                  : ""}{" "}
                                applied
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setSearchLocation("");
                                setPriceRange([0, 10000]);
                                setSelectedBeds([]);
                                setSelectedBaths([]);
                                setSelectedHomeTypes([]);
                                setMoveInDate(undefined);
                                setSelectedAmenities([]);
                                setSelectedFeatures([]);
                                setPetPolicy("");
                                setParkingType([]);
                                setUtilityPolicy([]);
                                setSquareFootage([0, 10000] as [
                                  number,
                                  number
                                ]);
                                setYearBuilt([1900, 2030] as [number, number]);
                                setAdditionalSpecialties([]);
                                setLaundryFacilities([]);
                                setSelectedRating("");
                                setPropertyFeatures([]);
                                setShowOnlyRentWise(false);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline transition-colors"
                            >
                              Remove all filters
                            </button>
                          </div>

                          {/* Filter Chips */}
                          <div className="flex flex-wrap gap-2">
                            {searchSummary.filterDetails.map(
                              (filter, index) => (
                                <div
                                  key={index}
                                  className="group flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-sm transition-all duration-200"
                                >
                                  <span className="text-gray-700 font-medium">
                                    {filter.label}
                                  </span>
                                  <button
                                    onClick={() => removeFilter(filter.type)}
                                    className="text-gray-400 hover:text-red-500 transition-colors ml-1 opacity-0 group-hover:opacity-100"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600 font-medium">{t('sort')}</span>
                      <Button variant="outline" size="sm" className="rounded-lg px-4 py-2 border-gray-200 hover:bg-green-50">{t('default')} ▼</Button>
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
                          {databaseProperties.length === 0
                            ? "No Properties Available"
                            : "No Properties Match Your Filters"}
                        </h3>
                        <p className="text-gray-600 text-lg mb-6">
                          {databaseProperties.length === 0
                            ? "No properties are currently available in the database. Please check back later or contact support."
                            : "Try adjusting your search criteria to find more properties."}
                        </p>
                        {databaseProperties.length === 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                            <p className="text-sm text-blue-800">
                              <strong>Tip:</strong> If you're a landlord, you
                              can add properties through the property management
                              section.
                            </p>
                          </div>
                        )}
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

                              await loadUnitsForProperty(
                                property.id.toString()
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
          <PrequalificationInfo onBack={() => setCurrentView("dashboard")} />
        ) : // <PrequalificationInfo onBack={() => setCurrentView('dashboard')} />
        currentView === "unit-selection" ? (
          <QualifiedProperties
            onUnitSelect={(property, unit) => {
              setSelectedProperty(property);
              setSelectedUnit(unit);
              setCurrentView("application-process");
            }}
            // onNavigateToLeaseHolders={() => {
            //   setCurrentView('application-process');
            //   setApplicationStep(3); // Step 3 is "Lease Holders & Guarantors"
            // }}
            // onNavigateToGuarantors={() => {
            //   setCurrentView('application-process');
            //   setApplicationStep(3); // Step 3 is "Lease Holders & Guarantors"
            // }}
            onCompareUnits={(units) => {
              setComparisonUnits(units);
              setCurrentView("unit-comparison");
            }}
            onBack={handleBack}
            selectedProperty={selectedProperty}
          />
        ) : currentView === "unit-comparison" ? (
          <UnitsComparison
            comparisonUnits={comparisonUnits}
            onBack={() => setCurrentView("unit-selection")}
            onProceedToProducts={(property, unit, leaseTerm) => {
              setSelectedProperty(property);
              setSelectedUnit(unit);
              setSelectedLeaseTerm(leaseTerm);
              // setCurrentView('product-selection');
              setCurrentView("application-process");
              setApplicationStep(0);
            }}
            onUnitSelect={() => {
              // Navigate to next step in application process
              setCurrentView("application-process");
              setApplicationStep(2); // Move to next application step
            }}
            onShowDetails={() => {
              // Show details functionality
            }}
          />
        ) : currentView === "product-selection" ? (
          <ProductSelection
            property={selectedProperty}
            unit={selectedUnit}
            selectedLeaseTerm={selectedLeaseTerm?.months || 12}
            selectedLeaseTermRent={selectedLeaseTerm?.rent}
            applicantData={{
              unitType: selectedUnit?.bedrooms
                ? `${selectedUnit.bedrooms} bedroom${
                    selectedUnit.bedrooms > 1 ? "s" : ""
                  }`
                : "Any",
              petDescription: "", // This should come from application data
              petName: "",
              petBreed: "",
              petWeight: "",
              creditScore: 0, // No default credit score
              applicationId: null, // This should be the actual application ID
            }}
            onBack={() => setCurrentView("unit-comparison")}
            onPaymentProcess={(data) => {
              setPaymentData(data);
              setCurrentView("payment-page");
            }}
          />
        ) : currentView === "payment-page" ? (
          <PaymentPage
            totalAmount={paymentData?.totals?.total || 0}
            paymentType={paymentData?.annualPayment ? "annual" : "monthly"}
            onBack={() => setCurrentView("product-selection")}
            onPaymentComplete={() => {
              setCurrentView("dashboard");
            }}
          />
        ) : currentView === "property-details" ? (
          <PropertyDetailsModal
            property={selectedProperty}
            isOpen={true}
            onClose={() => {
              setCurrentView("dashboard");
              // Clear URL parameters when closing modal
              navigate("/property", { replace: true });
            }}
            onScheduleTour={() => {
              setSelectedPropertyForTour(selectedProperty);
              setScheduleTourModalOpen(true);
            }}
            onApplyNow={() => {
              setCurrentView("unit-selection");
            }}
            onViewUnits={async () => {
              // Load units for this specific property
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
              property={selectedProperty}
              selectedUnit={selectedUnit}
              type="apply"
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
          navigate("/property", { replace: true });
        }}
      />

      {/* Save Search Modal */}
      {showSaveSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Save Filters</h3>
              <button
                onClick={() => {
                  setShowSaveSearchModal(false);
                  setSearchName("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Downtown Apartments, Budget Studios"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Filter Criteria:
                </h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {searchLocation && <div>📍 Location: {searchLocation}</div>}
                  <div>
                    💰 Price: ${priceRange[0].toLocaleString()} - $
                    {priceRange[1].toLocaleString()}
                  </div>
                  {selectedBeds.length > 0 && (
                    <div>🛏️ Beds: {selectedBeds.join(", ")}</div>
                  )}
                  {selectedBaths.length > 0 && (
                    <div>🚿 Baths: {selectedBaths.join(", ")}</div>
                  )}
                  {selectedHomeTypes.length > 0 && (
                    <div>🏠 Type: {selectedHomeTypes.join(", ")}</div>
                  )}
                  {moveInDate && (
                    <div>📅 Move-in: {moveInDate.toLocaleDateString()}</div>
                  )}
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="font-medium text-green-600">
                      📊 {filteredProperties.length} properties match your
                      criteria
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="subscriptions"
                  defaultChecked
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <label htmlFor="subscriptions" className="text-sm text-gray-700">
                  Enable email notifications for new matches
                </label>
              </div> */}
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSaveSearchModal(false);
                  setSearchName("");
                }}
                className="flex-1"
                disabled={savingSearch}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveSearch}
                disabled={savingSearch || !searchName.trim()}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {savingSearch ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  "Save Filters"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboards;
