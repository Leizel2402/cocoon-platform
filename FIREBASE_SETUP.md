# Firebase Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `cocoon-platform`
4. Enable Google Analytics (optional)
5. Create the project

## 2. Enable Required Services

In your Firebase project, enable these services:

### Authentication
1. Go to "Authentication" → "Sign-in method"
2. Enable "Email/Password"
3. Save

### Fir
estore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Start in "test mode" (we'll secure it later)
4. Choose a location close to your users

### Storage
1. Go to "Storage"
2. Click "Get started"
3. Start in "test mode"
4. Choose the same location as Firestore

### Functions (Optional - for AI features)
1. Go to "Functions"
2. Click "Get started"
3. Follow the setup instructions

## 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" icon (`</>`)
4. Register app with name: `cocoon-platform`
5. Copy the Firebase config object

## 4. Set Up Environment Variables

Create a `.env.local` file in your project root with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id_here
```

## 5. Deploy Security Rules

Install Firebase CLI and deploy the security rules:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select these services:
# ✅ Firestore
# ✅ Functions  
# ✅ Hosting
# ✅ Storage
# ✅ Authentication

# Deploy the rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Sign up with a new account (role: "Cocoon Staff")
3. Navigate to `/migrate` to run the data migration
4. Check your Firestore console to see the migrated data

## 7. Next Steps

After successful setup:
- [ ] Migrate static data to Firestore
- [ ] Test authentication with different roles
- [ ] Build property management interface
- [ ] Implement Addy AI chat system
- [ ] Add Stripe payment integration

## Troubleshooting

### Common Issues:

1. **"Firebase not initialized"** - Check your environment variables
2. **"Permission denied"** - Deploy the security rules
3. **"Module not found"** - Run `npm install` to install dependencies
4. **"Invalid API key"** - Double-check your Firebase config

### Getting Help:

- Check the Firebase Console for error logs
- Verify your environment variables are correct
- Make sure you've enabled the required services
- Check that the security rules are deployed
