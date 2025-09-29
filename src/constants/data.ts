import { 
  Star, 
  User, 
  UserCheck, 
  UserPlus, 
  GraduationCap, 
  Stethoscope, 
  Briefcase 
} from "lucide-react";

// Testimonial data
export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: React.ComponentType<{ className?: string }>;
  date: string;
}

export const testimonialsData: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    location: "Downtown Apartment",
    rating: 5,
    text: "Found my dream apartment in just 2 weeks! The platform made it so easy to filter and compare properties. The application process was seamless.",
    avatar: Briefcase,
    date: "2 weeks ago"
  },
  {
    id: "2",
    name: "Mike Chen",
    location: "Riverside House",
    rating: 5,
    text: "Amazing experience! The AI chat helped me find exactly what I was looking for. The property details were accurate and the photos were beautiful.",
    avatar: User,
    date: "1 month ago"
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    location: "Midtown Condo",
    rating: 5,
    text: "Love this platform! The search filters are incredible and I found my perfect condo within my budget. Highly recommend to anyone looking for rentals.",
    avatar: UserCheck,
    date: "3 weeks ago"
  },
  {
    id: "4",
    name: "David Kim",
    location: "Westside Loft",
    rating: 5,
    text: "The customer service is outstanding! They helped me through every step of the process. Found my perfect loft in a great neighborhood.",
    avatar: GraduationCap,
    date: "1 week ago"
  },
  {
    id: "5",
    name: "Lisa Thompson",
    location: "East Village Studio",
    rating: 5,
    text: "As a first-time renter, I was nervous about the process. This platform made everything so simple and transparent. Highly recommend!",
    avatar: Stethoscope,
    date: "2 months ago"
  },
  {
    id: "6",
    name: "James Wilson",
    location: "North Hills Townhouse",
    rating: 5,
    text: "The property matching algorithm is incredible! It found me exactly what I was looking for based on my preferences. Saved me so much time!",
    avatar: UserPlus,
    date: "1 month ago"
  }
];

// FAQ data
export interface FAQItem {
  question: string;
  answer: string;
}

export const faqData: FAQItem[] = [
  {
    question: "How do I apply for a rental property?",
    answer: "Simply browse our properties, click on the one you like, and use our streamlined application process. You can apply to multiple properties at once and track your applications in real-time."
  },
  {
    question: "What documents do I need to rent an apartment?",
    answer: "Typically, you'll need proof of income (pay stubs, tax returns), bank statements, references, and a valid ID. Our platform will guide you through the specific requirements for each property."
  },
  {
    question: "How much should I budget for rent?",
    answer: "A general rule is to spend no more than 30% of your gross monthly income on rent. Our rent calculator can help you determine what you can afford based on your income and expenses."
  },
  {
    question: "Can I negotiate rent prices?",
    answer: "While rent prices are often fixed, there may be room for negotiation, especially for longer lease terms or if you're an ideal tenant. Our platform can help you understand market rates in your area."
  },
  {
    question: "What's included in my rent?",
    answer: "This varies by property. Some include utilities, parking, or amenities, while others don't. Each listing clearly shows what's included, and you can filter properties based on your preferences."
  },
  {
    question: "How long does the rental application process take?",
    answer: "Our streamlined process typically takes 1-3 business days. You'll receive real-time updates on your application status, and our team is available to help if you have any questions."
  },
  {
    question: "What if I have pets?",
    answer: "Many of our properties are pet-friendly! Use our pet-friendly filter to find suitable options. We'll help you understand any pet deposits, fees, or restrictions upfront."
  },
  {
    question: "Can I break my lease early?",
    answer: "Lease terms vary by property. Some allow early termination with notice and fees, while others may require finding a replacement tenant. We'll help you understand your options before you sign."
  }
];

// App configuration
export const APP_CONFIG = {
  name: 'Cocoon',
  tagline: 'Find Your Perfect Rental Home',
  description: 'Forget everything you know about renting',
} as const;
