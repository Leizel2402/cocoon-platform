import { CREDIT_SCORE_RANGES, LOCAL_STORAGE_KEYS } from './constants';

// Types
export interface PrequalAnswers {
  location?: string;
  moveIn?: string;
  budget?: string;
  bedrooms?: string;
  pets?: boolean;
  adults?: string;
  children?: string;
  incomeBand?: string;
  creditBand?: string;
  voucher?: boolean;
}

export interface Listing {
  id: string;
  title: string;
  address: string;
  rent: string;
  beds: number;
  baths: number;
  size: string;
  available: string;
  network?: boolean;
  nearMiss?: boolean;
  explainers?: string[];
}

// Utility Functions

/**
 * Convert money strings like "$1,800" or "1800" to numeric value
 */
export const parseMoney = (m?: string): number | null => {
  if (!m) return null;
  
  // Remove all non-digit characters except decimal points
  const cleaned = m.replace(/[^\d.]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
};

/**
 * Rank a listing based on how well it fits the user's answers
 * Returns a score from 0-100, with +10% boost for network listings
 */
export const rankListing = (listing: Listing, answers: PrequalAnswers): number => {
  let score = 0;
  let factors = 0;

  // Budget match (40% weight)
  const userBudget = parseMoney(answers.budget);
  const listingRent = parseMoney(listing.rent);
  
  if (userBudget && listingRent) {
    const budgetDiff = Math.abs(listingRent - userBudget) / userBudget;
    const budgetScore = Math.max(0, 100 - (budgetDiff * 100));
    score += budgetScore * 0.4;
    factors++;
  }

  // Bedroom match (30% weight)
  if (answers.bedrooms && listing.beds) {
    const userBeds = parseInt(answers.bedrooms);
    const bedroomScore = userBeds === listing.beds ? 100 : 
                        Math.abs(userBeds - listing.beds) === 1 ? 80 : 60;
    score += bedroomScore * 0.3;
    factors++;
  }

  // Location preference (20% weight)
  if (answers.location && listing.address) {
    const locationMatch = listing.address.toLowerCase()
      .includes(answers.location.toLowerCase());
    const locationScore = locationMatch ? 100 : 70;
    score += locationScore * 0.2;
    factors++;
  }

  // Availability match (10% weight)
  if (answers.moveIn) {
    const availabilityScore = listing.available.toLowerCase().includes('now') ? 100 : 85;
    score += availabilityScore * 0.1;
    factors++;
  }

  // Normalize score if we don't have all factors
  const finalScore = factors > 0 ? score / factors * 100 : 70;

  // Network boost (+10%)
  const networkBoost = listing.network ? 1.1 : 1.0;
  
  return Math.round(Math.min(100, finalScore * networkBoost));
};

/**
 * Generate up to 3 explainer bullets for why a listing matches
 */
export const explainersFor = (listing: Listing, answers: PrequalAnswers): string[] => {
  const explainers: string[] = [];
  
  // Budget fit explanation
  const userBudget = parseMoney(answers.budget);
  const listingRent = parseMoney(listing.rent);
  
  if (userBudget && listingRent) {
    const diff = listingRent - userBudget;
    if (Math.abs(diff) <= 100) {
      explainers.push("Perfect budget match within your range");
    } else if (diff < 0) {
      explainers.push(`Great value - $${Math.abs(diff)} under your budget`);
    } else if (diff <= 300) {
      explainers.push(`Slightly over budget but includes premium features`);
    }
  }

  // Bedroom match explanation
  if (answers.bedrooms && listing.beds) {
    const userBeds = parseInt(answers.bedrooms);
    if (userBeds === listing.beds) {
      explainers.push(`Perfect match - ${listing.beds} bedroom${listing.beds !== 1 ? 's' : ''} as requested`);
    } else if (listing.beds > userBeds) {
      explainers.push(`Extra space with ${listing.beds} bedrooms`);
    }
  }

  // Pet-friendly explanation
  if (answers.pets && listing.explainers?.some(e => 
    e.toLowerCase().includes('pet') || 
    e.toLowerCase().includes('dog') || 
    e.toLowerCase().includes('cat')
  )) {
    explainers.push("Pet-friendly building perfect for your furry friend");
  }

  // Availability explanation
  if (listing.available.toLowerCase().includes('now')) {
    explainers.push("Available immediately for quick move-in");
  } else if (answers.moveIn) {
    explainers.push(`Available ${listing.available.toLowerCase()}`);
  }

  // Location explanation
  if (answers.location && listing.address.toLowerCase().includes(answers.location.toLowerCase())) {
    explainers.push(`Great location in your preferred ${answers.location} area`);
  }

  // Network verification
  if (listing.network) {
    explainers.push("RentWise verified property with trusted landlord");
  }

  // Return up to 3 explainers
  return explainers.slice(0, 3);
};

/**
 * Build a shareable link with current search parameters
 */
export const buildShareLink = (params: {
  answers?: PrequalAnswers;
  query?: string;
  nearMisses?: boolean;
  base?: string;
} = {}): string => {
  const { answers, query, nearMisses, base = window.location.origin } = params;
  const url = new URL(`${base}/renter/results`);
  
  // Add non-PII search parameters
  if (answers?.location) {
    url.searchParams.set('location', answers.location);
  }
  
  if (answers?.bedrooms) {
    url.searchParams.set('beds', answers.bedrooms);
  }
  
  if (answers?.budget) {
    // Only include budget range, not exact amount
    const budget = parseMoney(answers.budget);
    if (budget) {
      if (budget < 1500) url.searchParams.set('range', 'under-1500');
      else if (budget < 2000) url.searchParams.set('range', '1500-2000');
      else if (budget < 2500) url.searchParams.set('range', '2000-2500');
      else url.searchParams.set('range', 'over-2500');
    }
  }
  
  if (answers?.pets) {
    url.searchParams.set('pets', 'true');
  }
  
  if (query) {
    url.searchParams.set('q', query);
  }
  
  if (nearMisses) {
    url.searchParams.set('include_near_misses', 'true');
  }
  
  return url.toString();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const getCreditScoreLabel = (score: number): string => {
  if (score >= CREDIT_SCORE_RANGES.EXCELLENT.min) return CREDIT_SCORE_RANGES.EXCELLENT.label;
  if (score >= CREDIT_SCORE_RANGES.GOOD.min) return CREDIT_SCORE_RANGES.GOOD.label;
  if (score >= CREDIT_SCORE_RANGES.FAIR.min) return CREDIT_SCORE_RANGES.FAIR.label;
  return CREDIT_SCORE_RANGES.POOR.label;
};

export const calculateRentToIncomeRatio = (rent: number, monthlyIncome: number): number => {
  return (rent / monthlyIncome) * 100;
};

export const isAffordable = (rent: number, monthlyIncome: number, maxRatio: number = 30): boolean => {
  return calculateRentToIncomeRatio(rent, monthlyIncome) <= maxRatio;
};

export const savePrequalData = (data: any): void => {
  localStorage.setItem(LOCAL_STORAGE_KEYS.PREQUAL_DATA, JSON.stringify(data));
};

export const getPrequalData = (): any | null => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PREQUAL_DATA);
  return stored ? JSON.parse(stored) : null;
};

export const clearPrequalData = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.PREQUAL_DATA);
};

export const generateMatchScore = (listing: any, userPrefs: any): number => {
  let score = 0;
  const factors = [];

  // Budget match (40% weight)
  const budgetDiff = Math.abs(listing.rent - parseInt(userPrefs.desiredRent || '0'));
  const budgetScore = Math.max(0, 100 - (budgetDiff / parseInt(userPrefs.desiredRent || '1')) * 100);
  score += budgetScore * 0.4;
  factors.push({ name: 'Budget', score: budgetScore, weight: 0.4 });

  // Location match (30% weight) - simplified
  const locationScore = userPrefs.location && listing.address?.toLowerCase().includes(userPrefs.location.toLowerCase()) ? 100 : 70;
  score += locationScore * 0.3;
  factors.push({ name: 'Location', score: locationScore, weight: 0.3 });

  // Bedroom match (20% weight)
  const bedroomScore = listing.bedrooms.toString() === userPrefs.bedrooms ? 100 : 80;
  score += bedroomScore * 0.2;
  factors.push({ name: 'Bedrooms', score: bedroomScore, weight: 0.2 });

  // Availability (10% weight)
  const availabilityScore = listing.available === 'Available Now' ? 100 : 90;
  score += availabilityScore * 0.1;
  factors.push({ name: 'Availability', score: availabilityScore, weight: 0.1 });

  return Math.round(Math.max(0, Math.min(100, score)));
};