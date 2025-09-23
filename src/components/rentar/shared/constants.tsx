// Brand Colors
export const BRAND_COLORS = {
  bgLight: "#EAF3FA",
  primary: "#2C5AA0",
  primaryHover: "#244a85"
} as const;

// Comparison Limits
export const MAX_COMPARE = 5;

// Mock Rental Listings for Demo
export const MOCK_LISTINGS = [
  {
    id: "1",
    title: "Modern Riverside Apartment",
    address: "1425 Riverside Ave, Riverside, Jacksonville, FL 32204",
    photo: "/placeholder.svg",
    rent: "$1,850",
    beds: 2,
    baths: 2,
    size: "1,100 sqft",
    available: "Available Now",
    commute: "8 mins to Downtown",
    network: true,
    nearMiss: false,
    tours: "Available today & tomorrow",
    explainers: [
      "Perfect match for your 2-bedroom preference",
      "Within walking distance of trendy shops and restaurants",
      "Recently renovated with modern appliances",
      "Pet-friendly building with dog park nearby"
    ]
  },
  {
    id: "2",
    title: "Historic Avondale Charm",
    address: "3847 St. Johns Ave, Avondale, Jacksonville, FL 32205",
    photo: "/placeholder.svg",
    rent: "$1,720",
    beds: 1,
    baths: 1,
    size: "875 sqft",
    available: "Available Dec 15",
    commute: "12 mins to Downtown",
    network: true,
    nearMiss: true,
    tours: "Tours available weekends",
    explainers: [
      "Charming historic neighborhood with tree-lined streets",
      "Close to Avondale shopping district",
      "Original hardwood floors and high ceilings",
      "Only 1 bedroom but spacious layout"
    ]
  },
  {
    id: "3",
    title: "Downtown Loft Living",
    address: "620 W Bay St, Downtown, Jacksonville, FL 32202",
    photo: "/placeholder.svg",
    rent: "$2,100",
    beds: 2,
    baths: 1,
    size: "1,050 sqft",
    available: "Available Jan 1",
    commute: "Walk to work downtown",
    network: false,
    nearMiss: false,
    tours: "Self-guided tours available",
    explainers: [
      "Prime downtown location with city views",
      "Walking distance to restaurants and nightlife",
      "Industrial loft-style with exposed brick",
      "Rooftop terrace access included"
    ]
  },
  {
    id: "4",
    title: "Murray Hill Family Home",
    address: "1256 Edgewood Ave S, Murray Hill, Jacksonville, FL 32205",
    photo: "/placeholder.svg",
    rent: "$1,650",
    beds: 3,
    baths: 2,
    size: "1,350 sqft",
    available: "Available Now",
    commute: "15 mins to Downtown",
    network: true,
    nearMiss: false,
    tours: "Tours Mon-Fri 10am-4pm",
    explainers: [
      "Perfect for families with 3 bedrooms",
      "Quiet residential neighborhood",
      "Large backyard and front porch",
      "Great value for the space provided"
    ]
  },
  {
    id: "5",
    title: "San Marco Waterfront View",
    address: "1935 San Marco Blvd, San Marco, Jacksonville, FL 32207",
    photo: "/placeholder.svg",
    rent: "$1,950",
    beds: 2,
    baths: 2,
    size: "1,200 sqft",
    available: "Available Feb 1",
    commute: "10 mins to Downtown via Acosta Bridge",
    network: true,
    nearMiss: false,
    tours: "Virtual tours available now",
    explainers: [
      "Stunning river views from living room",
      "Upscale San Marco neighborhood",
      "Walking distance to San Marco Square",
      "In-unit washer/dryer and balcony"
    ]
  },
  {
    id: "6",
    title: "Springfield Historic District",
    address: "842 N Pearl St, Springfield, Jacksonville, FL 32206",
    photo: "/placeholder.svg",
    rent: "$1,495",
    beds: 2,
    baths: 1,
    size: "950 sqft",
    available: "Available Now",
    commute: "6 mins to Downtown",
    network: false,
    nearMiss: true,
    tours: "Open house Saturdays 1-3pm",
    explainers: [
      "Affordable option in up-and-coming area",
      "Historic character with original details",
      "Close to parks and community gardens",
      "Only 1 bathroom but great location value"
    ]
  }
] as const;

export const RENTER_ROUTES = {
  PREQUAL: '/renter/prequal',
  RESULTS: '/renter/results',
  COMPARE: '/renter/compare'
} as const;

export const CREDIT_SCORE_RANGES = {
  EXCELLENT: { min: 750, max: 850, label: 'Excellent (750+)' },
  GOOD: { min: 700, max: 749, label: 'Good (700-749)' },
  FAIR: { min: 650, max: 699, label: 'Fair (650-699)' },
  POOR: { min: 300, max: 649, label: 'Poor (below 650)' },
} as const;

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: 'fullTime', label: 'Full-time' },
  { value: 'partTime', label: 'Part-time' },
  { value: 'contract', label: 'Contract/Freelance' },
  { value: 'selfEmployed', label: 'Self-employed' },
  { value: 'unemployed', label: 'Unemployed' },
] as const;

export const BEDROOM_OPTIONS = [
  { value: 'studio', label: 'Studio' },
  { value: '1', label: '1 bedroom' },
  { value: '2', label: '2 bedrooms' },
  { value: '3', label: '3 bedrooms' },
  { value: '4+', label: '4+ bedrooms' },
] as const;

export const LOCAL_STORAGE_KEYS = {
  PREQUAL_DATA: 'prequalData',
  USER_SESSION: 'userSession',
  SAVED_LISTINGS: 'rentwise_saved_listings'
} as const;