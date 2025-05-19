import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, UserCredential, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

interface AuthContextData {
  user: {
    uid: string;
    profile: any;
  } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signupComplete: boolean;
  setSignupComplete: (complete: boolean) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string; profile: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [signupComplete, setSignupComplete] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userProfile = await getDoc(doc(db, 'profiles', firebaseUser.uid));
        
        // Check if user has completed signup flow
        const userData = userProfile.data();
        setSignupComplete(userData?.signupComplete ?? false);

        setUser({
          uid: firebaseUser.uid,
          profile: userData || {}
        });
      } else {
        setUser(null);
        setSignupComplete(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      if (response.user) {
        const userProfile = await getDoc(doc(db, 'profiles', response.user.uid));

        setUser({
          uid: response.user.uid,
          profile: userProfile.data() || {}
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string): Promise<UserCredential> => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      
      if (response.user) {
        // Create an empty profile document for the new user
        await setDoc(doc(db, 'profiles', response.user.uid), {
          email,
          createdAt: new Date().toISOString(),
          signupComplete: false,
          subjects: {}, // Initialize empty subjects object
        });

        setUser({
          uid: response.user.uid,
          profile: { email, createdAt: new Date().toISOString(), signupComplete: false, subjects: {} }
        });
        setSignupComplete(false);
      }
      
      return response;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      resetPassword,
      signupComplete, 
      setSignupComplete 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider; 