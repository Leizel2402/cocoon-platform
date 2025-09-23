# Rent My Place - Mobile-First Property Rental App

A modern, responsive React web application for property rental management with authentication, application forms, and analytics dashboard. Built with React, TypeScript, Firebase, and Tailwind CSS.

## 🚀 Features

### Public Features
- ✅ **Landing + Property Search**: Advanced filtering by city, price range, beds, and baths
- ✅ **Responsive Design**: Mobile-first approach with smooth animations
- ✅ **Property Cards**: Interactive cards with hover effects and micro-interactions
- ✅ **Search Results**: Results list with images, prices, and key property facts
- ✅ **Enter/Exit Animations**: Smooth card animations and hover states

### Authenticated Features
- ✅ **Auth + Protected Routes**: Firebase Auth with email/password sign-in/sign-up
- ✅ **Application Form**: Complete rental application with client-side validation
- ✅ **Owner/Leasing Dashboard**: Analytics cards, charts, and application management
- ✅ **Data Persistence**: Firebase Firestore for application storage
- ✅ **Route Protection**: Client-side route protection for authenticated features

### Technical Features
- ✅ **UX & Animations**: Mobile-first responsive design with page transitions
- ✅ **Micro-interactions**: Button hover effects, card animations, loading states
- ✅ **Data Visualization**: Interactive charts using Recharts
- ✅ **Form Validation**: Client-side validation with Zod and React Hook Form
- ✅ **Real-time Data**: Firebase Firestore integration

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Routing**: React Router v6 with protected routes
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Build Tool**: Vite

## ✅ Feature Completion Status

All required features have been implemented:

### 1. Landing + Property Search (Public) ✅
- Search bar with filters: City, Price range, Beds/baths
- Results list with image, price, key facts
- Enter/exit animations for cards, hover/tap micro-interactions
- **Data Source**: Option A - Using seed JSON data (18 sample properties)

### 2. Auth + Protected Routes ✅
- Sign-in / Sign-up pages with form validation
- Protected routes for Apply and Dashboard pages
- Client-side route protection
- **Auth Method**: Firebase Auth (email/password)

### 3. Application Form (Authenticated) ✅
- All required fields: Full name, Email, Phone, Monthly income, Move-in date, Selected property, Notes
- Client-side validation with friendly error states
- Form submission persists to Firebase Firestore
- **Datastore**: Firebase Firestore with 'applications' collection

### 4. Owner/Leasing Dashboard (Authenticated) ✅
- Summary cards: Applications (today/7d/30d), Total properties
- Charts: Applications per day (last 14 days), Average rent by city
- Applications table with search functionality and Pagination
- Top properties by application count
- **Charts**: Using Recharts library

### 5. UX & Animations ✅
- Mobile-first, responsive design
- Multiple micro-interactions: Button hover effects, card animations, loading states
- Page transition animations using Framer Motion
- Smooth enter/exit animations throughout the app

## 📋 Setup Instructions

### Prerequisites
- Node.js 16+ 
- Firebase project with Auth and Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rent-my-place
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication with Email/Password provider
   - Enable Firestore Database
   - Copy your Firebase config

4. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   ```

5. **Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /applications/{document} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## 🔥 Firebase Configuration

### Authentication Setup
1. Navigate to Authentication > Sign-in method
2. Enable Email/Password provider
3. Disable email verification for development

### Firestore Setup
1. Create Firestore database in test mode
2. Create `applications` collection (will be auto-created on first submission)
3. Apply security rules above

### Data Structure

**Applications Collection**
```typescript
{
  id: string;
  name: string;
  email: string;
  phone: string;
  income: number;
  move_in_date: string;
  property_id: string;
  notes?: string;
  created_at: string;
  user_id: string;
}
```

🚀 **Deployment on Vercel**

Follow these steps to deploy Rent My Place on Vercel
:

1. Push Code to GitHub

Make sure your project is committed and pushed to a GitHub repository.

2. Create Vercel Account

Go to Vercel
 and sign up (you can log in with GitHub).

3. Import Project

Click New Project → Import Git Repository

Select your rent-my-place repo.

4. Configure Project

Framework preset: Vite (React + TypeScript)

Root directory: project root (/)

Build command:

npm run build


Output directory:

dist

5. Add Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add all the Firebase keys from your .env file:

VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456


⚠️ Important: Use the VITE_ prefix because Vite only exposes env variables starting with VITE_.

6. Deploy 🚀

Click Deploy.

Vercel will build and deploy your app.

Once done, you’ll get a live URL like:

https://rent-my-place.vercel.app

7. (Optional) Custom Domain

In Vercel Dashboard → Domains, add your custom domain if you have one.