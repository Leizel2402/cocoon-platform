// Export all constants
export * from './testimonials';

// Common constants
export const APP_CONFIG = {
  name: 'Cocoon',
  tagline: 'Find Your Perfect Rental Home',
  description: 'Forget everything you know about renting',
} as const;

export const NAVIGATION_LINKS = [
  { name: 'Property Search', href: '/property' },
  { name: 'Manager Portal', href: '/manager' },
  { name: 'Renter Portal', href: '/renter' },
  { name: 'FAQs', href: '/faq' },
] as const;

export const SOCIAL_LINKS = [
  { name: 'Facebook', href: '#' },
  { name: 'Twitter', href: '#' },
  { name: 'Instagram', href: '#' },
  { name: 'LinkedIn', href: '#' },
  { name: 'YouTube', href: '#' },
] as const;
