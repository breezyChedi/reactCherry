import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

// Your Firebase configuration
// Read environment variables properly in both Expo Go and native builds
const getEnvVars = () => {
  // When running in Expo Go, process.env will have the values
  // In native builds, we need to get values from Constants.expoConfig.extra
  if (Constants.expoConfig && Constants.expoConfig.extra) {
    return Constants.expoConfig.extra;
  }
  return process.env;
};

const env = getEnvVars();

const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase first
const app = initializeApp(firebaseConfig);
export { app };

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);

export { auth, db }; 