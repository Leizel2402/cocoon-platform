import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format property addresses consistently
export function formatPropertyAddress(address: string | {
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}): string {
  if (typeof address === 'string') {
    return address;
  }
  
  return `${address.line1}, ${address.city}, ${address.region}`;
}