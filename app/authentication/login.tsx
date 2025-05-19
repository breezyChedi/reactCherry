import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  SafeAreaView,
  useColorScheme,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isDarkMode = useColorScheme() === 'dark';
  const { signIn } = useAuth();
  const navigation = useNavigation();

  const handleSignIn = async () => {
    navigation.navigate('SignIn');
  };

  const handleSignUp = () => {
    navigation.navigate('Personal');
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <View style={styles.content}>
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../../icons/cherry-icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Welcome Text */}
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          Hi, we're Cherry
        </Text>
        <Text style={[styles.subtitle, isDarkMode && styles.darkText]}>
          Get your APS Score in 60 seconds
        </Text>

        

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable 
            style={styles.button}
            onPress={handleSignIn}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </Pressable>

          <Pressable 
            style={[styles.button, styles.buttonSpacing]}
            onPress={handleSignUp}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#E4A8FF',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  logo: {
    width: 180,
    height: 180,
    tintColor: '#000',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000',
    textAlign: 'center',
  },
  darkText: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 20,
    color: '#000',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#333',
    color: '#fff',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 24,
  },
  button: {
    backgroundColor: '#E4A8FF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.8,
  },
  buttonSpacing: {
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 