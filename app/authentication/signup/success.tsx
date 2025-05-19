import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useColorScheme } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../../App';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignupData } from './personal';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Success'>;

export default function SuccessScreen() {
  const navigation = useNavigation<NavigationProp>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { setSignupComplete } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [signupData, setSignupData] = useState<SignupData | null>(null);

  // Load signup data from AsyncStorage
  useEffect(() => {
    const loadSignupData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('signupData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setSignupData(parsedData);
        }
      } catch (error) {
        console.error('Error loading signup data from AsyncStorage:', error);
      }
    };

    loadSignupData();
  }, []);

  // Create Firebase user and save all data
  const createUserAndSaveData = async () => {
    if (!signupData || !signupData.email || !signupData.password) {
      Alert.alert('Error', 'Missing email or password information');
      return false;
    }

    try {
      // Create the Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        signupData.email, 
        signupData.password
      );
      
      if (!userCredential.user) {
        throw new Error('Failed to create user account');
      }

      const uid = userCredential.user.uid;
      
      // Create profile document
      await setDoc(doc(db, 'profiles', uid), {
        email: signupData.email,
        createdAt: new Date().toISOString(),
        signupComplete: true,
        subjects: signupData.subjects || {},
      });
      
      // Create user document with all the personal details
      await setDoc(doc(db, 'users', uid), {
        name: signupData.name,
        surname: signupData.surname,
        gender: signupData.gender,
        highSchool: signupData.highSchool,
        nationality: signupData.nationality,
        phoneNumber: signupData.phoneNumber,
        email: signupData.email,
        grade: signupData.grade,
        source: signupData.source,
        createdAt: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error creating user account:', error);
      return false;
    }
  };

  // Complete the signup process
  const handleContinue = async () => {
    if (!signupData) {
      Alert.alert('Error', 'No signup data found');
      return;
    }

    setProcessing(true);
    
    try {
      const success = await createUserAndSaveData();
      
      if (success) {
        // Update the local state that tracks signup completion
        setSignupComplete(true);
        
        // Clear signup data from AsyncStorage
        await AsyncStorage.removeItem('signupData');
      } else {
        Alert.alert('Error', 'Failed to create your account. Please try again.');
      }
    } catch (error) {
      console.error('Error completing signup:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Image 
        source={require('../../../icons/cherry-icon.png')} 
        style={styles.icon}
        resizeMode="contain"
      />
      <View style={styles.textContainer}>
        <Text style={[styles.title, isDark && styles.textDark]}>
          Welcome to Cherry!
        </Text>
        <Text style={[styles.subtitle, isDark && styles.textDark]}>
          Your account is ready to be created.
        </Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          processing && styles.buttonDisabled
        ]}
        onPress={handleContinue}
        disabled={processing}
      >
        {processing ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  containerDark: {
    backgroundColor: '#000',
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  textDark: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#FF69B4',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 