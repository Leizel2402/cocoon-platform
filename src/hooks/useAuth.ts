import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, UserRole } from '../types';
 
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          let userData = userDoc.data();
          
          // If no user document exists, wait a bit and try again (in case signUp is still writing)
          if (!userData) {
            // Wait 100ms and try again
            await new Promise(resolve => setTimeout(resolve, 100));
            const retryDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            userData = retryDoc.data();
            
            // If still no data, create with prospect role
            if (!userData) {
              userData = {
                uid: firebaseUser.uid,
                role: 'prospect' as UserRole,
                displayName: firebaseUser.displayName || '',
                email: firebaseUser.email || '',
                ...(firebaseUser.phoneNumber && { phone: firebaseUser.phoneNumber }),
                customClaims: {},
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              };
              
              // Create the user document
              await setDoc(doc(db, 'users', firebaseUser.uid), userData);
            }
          }
          
          const appUser: User = {
            uid: firebaseUser.uid,
            role: userData.role || 'prospect',
            displayName: userData.displayName || firebaseUser.displayName || '',
            email: userData.email || firebaseUser.email || '',
            phone: userData.phone || firebaseUser.phoneNumber || undefined,
            landlordId: userData.landlordId,
            customClaims: userData.customClaims || {},
            createdAt: userData.createdAt?.toDate() || new Date(),
            updatedAt: userData.updatedAt?.toDate(),
          };
          
          setUser(appUser);
        } catch (error) {
          console.error('Error fetching user data:', error);
          
          // Fallback: create basic user with prospect role
          const appUser: User = {
            uid: firebaseUser.uid,
            role: 'prospect',
            displayName: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            ...(firebaseUser.phoneNumber && { phone: firebaseUser.phoneNumber }),
            customClaims: {},
            createdAt: new Date(),
          };
          
          setUser(appUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
 
    return unsubscribe;
  }, []);
 
  // Legacy signIn function - deprecated in favor of magic links
  const signIn = async () => {
    throw new Error('Password authentication is disabled. Please use magic link authentication.');
  };
 
  const signUp = async (
    email: string, 
    password: string, 
    displayName: string,
    role: UserRole = 'prospect',
    phone?: string,
    landlordId?: string
  ) => {
    try {
      // Debug logging (disabled)
      // console.log('useAuth signUp called with:', {
      //   email,
      //   password: password ? '***' : 'EMPTY',
      //   displayName,
      //   role,
      //   phone,
      //   landlordId
      // });
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update Firebase Auth profile
      await updateProfile(result.user, {
        displayName: displayName,
      });
      
      // COMMENTED OUT FOR TESTING: Send email verification
      // await sendEmailVerification(result.user);
      
      // Create user document in Firestore with proper structure
      const userData = {
        uid: result.user.uid,
        role: role,
        displayName: displayName,
        email: result.user.email,
        ...(phone && { phone: phone }),
        ...(landlordId && { landlordId: landlordId }),
        customClaims: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(doc(db, 'users', result.user.uid), userData);
      
      return result;
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const errorCode = (error as { code?: string })?.code || 'unknown';
      throw new Error(getAuthErrorMessage(errorCode));
    }
  };
 
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(userRef, updateData);
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile');
    }
  };
 
  const logout = () => {
    return signOut(auth);
  };

  // COMMENTED OUT FOR TESTING: Magic Link Authentication
  // const sendMagicLink = async (email: string) => {
  //   try {
  //     // Rate limiting: Check if user has sent too many requests
  //     const lastSent = localStorage.getItem(`magicLink_${email}_lastSent`);
  //     const now = Date.now();
  //     const cooldownPeriod = 60000; // 1 minute cooldown
      
  //     if (lastSent && (now - parseInt(lastSent)) < cooldownPeriod) {
  //       throw new Error('Please wait before requesting another magic link. Try again in a minute.');
  //     }

  //     const actionCodeSettings = {
  //       // URL you want to redirect back to after clicking the magic link
  //       url: `${window.location.origin}/magic-link-verify`,
  //       // This must be true for magic links to work
  //       handleCodeInApp: true,
  //     };

  //     await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
  //     // Save the email to localStorage for later use
  //     localStorage.setItem('emailForSignIn', email);
      
  //     // Record the time this magic link was sent
  //     localStorage.setItem(`magicLink_${email}_lastSent`, now.toString());
      
  //     return true;
  //   } catch (error: unknown) {
  //     console.error('Magic link error:', error);
  //     const errorCode = (error as { code?: string })?.code || 'unknown';
      
  //     // Handle quota exceeded error specifically
  //     if (errorCode === 'auth/too-many-requests' || errorCode === 'auth/quota-exceeded') {
  //       throw new Error('Too many magic link requests. Please try again later or contact support.');
  //     }
      
  //     throw new Error(getAuthErrorMessage(errorCode));
  //   }
  // };

  // COMMENTED OUT FOR TESTING: Magic link verification
  // const verifyMagicLink = async (email: string) => {
  //   try {
  //     if (isSignInWithEmailLink(auth, window.location.href)) {
  //       // Get the email from localStorage
  //       const savedEmail = localStorage.getItem('emailForSignIn');
  //       const emailToSignIn = email || savedEmail;
        
  //       if (!emailToSignIn) {
  //         throw new Error('No email found for magic link sign in');
  //       }

  //       // Sign in with the magic link
  //       const result = await signInWithEmailLink(auth, emailToSignIn, window.location.href);
        
  //       // Clear the email from localStorage
  //       localStorage.removeItem('emailForSignIn');
        
  //       // Check if this is a new user
  //       const additionalUserInfo = getAdditionalUserInfo(result);
  //       const isNewUser = additionalUserInfo?.isNewUser;
        
  //       if (isNewUser) {
  //         // Create user document for new users
  //         const userData = {
  //           uid: result.user.uid,
  //           role: 'prospect' as UserRole,
  //           displayName: result.user.displayName || '',
  //           email: result.user.email || '',
  //           customClaims: {},
  //           createdAt: serverTimestamp(),
  //           updatedAt: serverTimestamp(),
  //         };
          
  //         await setDoc(doc(db, 'users', result.user.uid), userData);
  //       }
        
  //       return result;
  //     } else {
  //       throw new Error('Invalid magic link');
  //     }
  //   } catch (error: unknown) {
  //     console.error('Magic link verification error:', error);
  //     const errorCode = (error as { code?: string })?.code || 'unknown';
  //     throw new Error(getAuthErrorMessage(errorCode));
  //   }
  // };
 
  // Helper function to check if user has specific role
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };
 
  // Helper function to check if user has any of the specified roles
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };
 
  // Helper function to check if user is landlord (admin or employee)
  const isLandlord = (): boolean => {
    return hasAnyRole(['landlord_admin', 'landlord_employee']);
  };
 
  // Helper function to check if user is Cocoon staff
  const isCocoonStaff = (): boolean => {
    return hasAnyRole(['cocoon_admin', 'cocoon_employee']);
  };
 
  return {
    user,
    loading,
    signIn,
    signUp,
    updateUserProfile,
    logout,
    // COMMENTED OUT FOR TESTING: Magic link functions
    // sendMagicLink,
    // verifyMagicLink,
    hasRole,
    hasAnyRole,
    isLandlord,
    isCocoonStaff,
  };
}

function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many requests. Please wait a moment and try again.';
    case 'auth/quota-exceeded':
      return 'Daily quota exceeded. Please try again tomorrow or contact support.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    default:
      return 'An error occurred during authentication. Please try again.';
  }
}