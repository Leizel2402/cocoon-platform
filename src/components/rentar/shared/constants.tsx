// Brand Colors
export const BRAND_COLORS = {
  bgLight: "#EAF3FA",
  primary: "#2C5AA0",
  primaryHover: "#244a85"
} as const;

// Comparison Limits
export const MAX_COMPARE = 5;


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