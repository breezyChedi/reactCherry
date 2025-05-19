import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';

type RootStackParamList = {
  SignIn: undefined;
  Personal: undefined;
  ForgotPassword: undefined;
};

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    resetEmail: '',
  });
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const { signIn, resetPassword } = useAuth();

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
      resetEmail: '',
    };

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateResetEmail = () => {
    if (!resetEmail.trim()) {
      setErrors(prev => ({
        ...prev,
        resetEmail: 'Email is required'
      }));
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setErrors(prev => ({
        ...prev,
        resetEmail: 'Please enter a valid email address'
      }));
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      // Navigation should happen automatically via the AuthContext's state management
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = 'Sign in failed. Please check your credentials and try again.';
      
      // Handle common Firebase auth errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is invalid.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many unsuccessful login attempts. Please try again later.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: 'email' | 'password' | 'resetEmail', value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    } else if (field === 'resetEmail') {
      setResetEmail(value);
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleForgotPassword = () => {
    // Open the password reset modal
    setResetEmail(email); // Pre-fill with the email if it exists
    setResetModalVisible(true);
  };

  const handleSendResetEmail = async () => {
    if (!validateResetEmail()) {
      return;
    }

    setIsResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetModalVisible(false);
      Alert.alert(
        "Password Reset Email Sent",
        "Check your email inbox for instructions to reset your password."
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to send password reset email. Please try again.';
      
      // Handle common Firebase auth errors for password reset
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is invalid.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image 
          source={require('../../../icons/cherry-icon.png')} 
          style={styles.logo}
          resizeMode="contain" 
        />
        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.subText}>Log in to cherry-pick your course</Text>
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address *</Text>
          <TextInput
            style={[styles.input, errors.email ? styles.inputError : null]}
            value={email}
            onChangeText={(text) => handleInputChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password*</Text>
          <TextInput
            style={[styles.input, errors.password ? styles.inputError : null]}
            value={password}
            onChangeText={(text) => handleInputChange('password', text)}
            secureTextEntry
            editable={!isLoading}
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>
        
        <TouchableOpacity 
          style={[styles.signInButton, isLoading && styles.buttonDisabled]} 
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.signInButtonText}>Sign in</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.forgotPasswordButton}
          onPress={handleForgotPassword}
          disabled={isLoading}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password</Text>
        </TouchableOpacity>
      </View>

      {/* Password Reset Modal */}
      <Modal
        visible={resetModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setResetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalText}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>
            
            <View style={styles.modalInputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[styles.input, errors.resetEmail ? styles.inputError : null]}
                value={resetEmail}
                onChangeText={(text) => handleInputChange('resetEmail', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isResetLoading}
              />
              {errors.resetEmail ? <Text style={styles.errorText}>{errors.resetEmail}</Text> : null}
            </View>
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setResetModalVisible(false)}
                disabled={isResetLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.resetButton, isResetLoading && styles.buttonDisabled]} 
                onPress={handleSendResetEmail}
                disabled={isResetLoading}
              >
                {isResetLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.resetButtonText}>Send Reset Email</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#FFD7F7', // Light pink background
    padding: 20,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subText: {
    fontSize: 14,
    color: '#333',
  },
  formContainer: {
    padding: 20,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 6,
    color: '#000',
    fontWeight: '500',
  },
  input: {
    height: 45,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 16,
    paddingVertical: 8,
  },
  inputError: {
    borderBottomColor: '#ff0000',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 14,
    marginTop: 5,
  },
  signInButton: {
    backgroundColor: '#B318B3', // Purple color similar to the image
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  signInButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  forgotPasswordText: {
    color: '#000',
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#B318B3',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 