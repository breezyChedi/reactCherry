import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthProvider from './app/context/AuthContext';
import APSCalculator from './app/main/aps-calculator';
import Universities from './app/main/universities';
import InfoScreen from './app/main/info';
import LoginScreen from './app/authentication/login';
import Profile from './app/main/profile';
import SignInScreen from './app/screens/auth-screens/SignInScreen';
import PersonalScreen from './app/authentication/signup/personal';
import ContactScreen from './app/authentication/signup/contact';
import GradeScreen from './app/authentication/signup/grade';
import SourceScreen from './app/authentication/signup/source';
import SubjectsScreen from './app/authentication/signup/subjects';
import SuccessScreen from './app/authentication/signup/success';
import OnboardingScreen from './app/screens/OnboardingScreen';
import { useAuth } from './app/context/AuthContext';
import UniversityPage from './app/screens/UniversityPage';

// Define types for the tab navigator
export type MainTabParamList = {
  'APS Calculator': undefined;
  Universities: undefined;
  Info: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Define types for the profile stack navigator
export type ProfileStackParamList = {
  Login: undefined;
  SignIn: undefined;
  Personal: undefined;
  Contact: undefined;
  Grade: undefined;
  Source: undefined;
  Subjects: undefined;
  Success: undefined;
};

const ProfileStackNav = createNativeStackNavigator<ProfileStackParamList>();

function ProfileStack() {
  const { user } = useAuth();
  
  if (user) {
    return <Profile />;
  }

  return (
    <ProfileStackNav.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <ProfileStackNav.Screen name="Login" component={LoginScreen} />
      <ProfileStackNav.Screen name="SignIn" component={SignInScreen} />
      <ProfileStackNav.Screen name="Personal" component={PersonalScreen} />
      <ProfileStackNav.Screen name="Contact" component={ContactScreen} />
      <ProfileStackNav.Screen name="Grade" component={GradeScreen} />
      <ProfileStackNav.Screen name="Source" component={SourceScreen} />
      <ProfileStackNav.Screen name="Subjects" component={SubjectsScreen} />
      <ProfileStackNav.Screen name="Success" component={SuccessScreen} />
    </ProfileStackNav.Navigator>
  );
}

function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: 'person' | 'calculate' | 'school' | 'info' = 'info';
          if (route.name === 'APS Calculator') {
            iconName = 'calculate';
          } else if (route.name === 'Universities') {
            iconName = 'school';
          } else if (route.name === 'Info') {
            iconName = 'info';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E4A8FF',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: { backgroundColor: '#000000', borderTopColor: '#333333' }
      })}
    >
      <Tab.Screen 
        name="APS Calculator" 
        component={APSTabScreen}
        options={{ 
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTitleAlign: 'left',
          headerTitleContainerStyle: {
            paddingLeft: 16
          },
          headerTintColor: '#fff'
        }}
      />
      <Tab.Screen 
        name="Universities" 
        component={Universities}
        options={{ 
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTitleAlign: 'left',
          headerTitleContainerStyle: {
            paddingLeft: 16
          },
          headerTintColor: '#fff'
        }}
      />
      <Tab.Screen 
        name="Info" 
        component={InfoScreen}
        options={{ 
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTitleAlign: 'left',
          headerTitleContainerStyle: {
            paddingLeft: 16
          },
          headerTintColor: '#fff'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{ 
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTitleAlign: 'left',
          headerTitleContainerStyle: {
            paddingLeft: 16
          },
          headerTintColor: '#fff'
        }}
      />
    </Tab.Navigator>
  );
}

const APSTabScreen = APSCalculator;

const RootStack = createNativeStackNavigator();

// Event handler for when onboarding is completed
// Replace EventTarget with simple events object
export const onboardingEvents = {
  listeners: {},
  on: function(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },
  off: function(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  },
  emit: function(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
};

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  
  // Event listener for onboarding completion
  useEffect(() => {
    const handleOnboardingComplete = () => {
      setIsFirstLaunch(false);
    };
    
    // Add event listener using our custom events system
    onboardingEvents.on('complete', handleOnboardingComplete);
    
    // Clean up
    return () => {
      onboardingEvents.off('complete', handleOnboardingComplete);
    };
  }, []);
  
  useEffect(() => {
    // Check if it's the first time the app is launched
    const checkFirstLaunch = async () => {
      try {
        const value = await AsyncStorage.getItem('onboardingCompleted');
        setIsFirstLaunch(value === null);
      } catch (error) {
        console.error('Error checking first launch:', error);
        setIsFirstLaunch(false);
      }
    };
    
    checkFirstLaunch();
  }, []);

  // Show loading while checking if onboarding is completed
  if (isFirstLaunch === null) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
              {isFirstLaunch ? (
                <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
              ) : (
                <RootStack.Screen name="Main" component={MainNavigator} />
              )}
              <RootStack.Screen name="UniversityPage" component={UniversityPage} options={{ headerShown: true, title: 'University Info' }} />
            </RootStack.Navigator>
          </NavigationContainer>
          <StatusBar style="light" />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 15,
    color: '#FFFFFF',
  },
}); 