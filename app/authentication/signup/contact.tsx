import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  SafeAreaView,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignupData } from './personal';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Contact'>;

export default function ContactScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SignupData>({
    phoneNumber: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({
    phoneNumber: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
  });

  // Load existing signup data
  useEffect(() => {
    const loadSignupData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('signupData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setFormData(prev => ({
            ...parsedData,
            phoneNumber: prev.phoneNumber || '',
            email: prev.email || '',
            confirmEmail: prev.confirmEmail || '',
            password: prev.password || '',
            confirmPassword: prev.confirmPassword || '',
          }));
        }
      } catch (error) {
        console.error('Error loading signup data from AsyncStorage:', error);
      }
    };

    loadSignupData();
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      phoneNumber: '',
      email: '',
      confirmEmail: '',
      password: '',
      confirmPassword: '',
    };

    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (!validatePhone(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
      isValid = false;
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.confirmEmail?.trim()) {
      newErrors.confirmEmail = 'Please confirm your email';
      isValid = false;
    } else if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Emails do not match';
      isValid = false;
    }

    if (!formData.password?.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!formData.confirmPassword?.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const saveContactData = async () => {
    try {
      // Update combined signup data
      await AsyncStorage.setItem('signupData', JSON.stringify(formData));
      return true;
    } catch (error) {
      console.error('Error saving contact data:', error);
      return false;
    }
  };

  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await saveContactData();
      navigation.navigate('Grade');
    } catch (error) {
      console.error('Error saving contact data:', error);
      Alert.alert('Error', 'Failed to save your contact information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SignupData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoCircle}>
                <Image
                  source={require('../../../icons/cherry-icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.headerText}>Personal Details</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={[styles.input, errors.phoneNumber ? styles.inputError : null]}
                placeholder="Phone Number*"
                placeholderTextColor="#000"
                value={formData.phoneNumber}
                onChangeText={(text) => handleInputChange('phoneNumber', text)}
                keyboardType="phone-pad"
              />
              {errors.phoneNumber ? (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              ) : null}

              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                placeholder="Email Address*"
                placeholderTextColor="#000"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}

              <TextInput
                style={[styles.input, errors.confirmEmail ? styles.inputError : null]}
                placeholder="Confirm Email Address*"
                placeholderTextColor="#000"
                value={formData.confirmEmail}
                onChangeText={(text) => handleInputChange('confirmEmail', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.confirmEmail ? (
                <Text style={styles.errorText}>{errors.confirmEmail}</Text>
              ) : null}

              <TextInput
                style={[styles.input, errors.password ? styles.inputError : null]}
                placeholder="Password*"
                placeholderTextColor="#000"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                secureTextEntry
              />
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}

              <TextInput
                style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
                placeholder="Confirm Password*"
                placeholderTextColor="#000"
                value={formData.confirmPassword}
                onChangeText={(text) => handleInputChange('confirmPassword', text)}
                secureTextEntry
              />
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            <Pressable
              style={[
                styles.button, 
                isLoading && styles.buttonDisabled
              ]} 
              onPress={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Enter</Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e300f3',
    opacity: 0.8,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    tintColor: '#000',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginTop: 10,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
    color: '#000',
  },
  inputError: {
    borderBottomColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 14,
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    backgroundColor: '#8a00e6',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 