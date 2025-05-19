import 'dotenv/config';

export default {
  name: "reactCherry",
  slug: "reactCherry",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./icons/cherry-icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./icons/cherry-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.cherry.app"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./icons/cherry-icon.png",
      backgroundColor: "#ffffff"
    },
    package: "com.cherry.app"
  },
  web: {
    favicon: "./icons/cherry-icon.png",
    bundler: "metro"
  },
  plugins: [
    "expo-splash-screen",
    "expo-font"
  ],
  scheme: "react-cherry",
  experiments: {
    typedRoutes: false,
    tsconfigPaths: true
  },
  newArchEnabled: true,
  // Add this extra section to pass env variables to native build
  extra: {
    EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  }
}; 