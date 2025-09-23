import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Debug logging (disabled)
// console.log('Firebase config loaded:', {
//   apiKey: firebaseConfig.apiKey ? '***' : 'MISSING',
//   authDomain: firebaseConfig.authDomain,
//   projectId: firebaseConfig.projectId,
//   storageBucket: firebaseConfig.storageBucket,
//   messagingSenderId: firebaseConfig.messagingSenderId,
//   appId: firebaseConfig.appId ? '***' : 'MISSING'
// });

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Functions
export const functions = getFunctions(app);

// Connect to emulators in development (disabled for now)
// if (import.meta.env.DEV) {
//   try {
//     connectAuthEmulator(auth, 'http://localhost:9099');
//     connectFirestoreEmulator(db, 'localhost', 8080);
//     connectStorageEmulator(storage, 'localhost', 9199);
//     connectFunctionsEmulator(functions, 'localhost', 5001);
//   } catch (error) {
//     // Emulators already connected or not available
//     console.log('Firebase emulators not available or already connected');
//   }
// }

export default app;