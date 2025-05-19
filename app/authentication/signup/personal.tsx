import React, { useState } from 'react';
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
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Personal'>;

// SADC Countries
const SADC_COUNTRIES = [
  "Angola",
  "Botswana",
  "Comoros",
  "Democratic Republic of Congo",
  "Eswatini",
  "Lesotho",
  "Madagascar",
  "Malawi",
  "Mauritius",
  "Mozambique",
  "Namibia",
  "Seychelles",
  "South Africa",
  "Tanzania",
  "Zambia",
  "Zimbabwe"
];

// Gender options
const GENDER_OPTIONS = ["Male", "Female"];

export interface SignupData {
  // Personal screen
  name?: string;
  surname?: string;
  gender?: string;
  highSchool?: string;
  nationality?: string;
  
  // Contact screen
  phoneNumber?: string;
  email?: string;
  password?: string;
  
  // Other screens
  grade?: number;
  source?: string;
  subjects?: Record<string, string>;
}

// Custom picker component
const CustomPicker = ({ 
  label, 
  value, 
  onValueChange, 
  options, 
  placeholder,
  error
}) => {
  const [showPicker, setShowPicker] = useState(false);
  
  if (Platform.OS === 'ios') {
    return (
      <View>
        <TouchableOpacity 
          style={[styles.input, error ? styles.inputError : null]}
          onPress={() => setShowPicker(true)}
        >
          <Text style={[styles.pickerText, !value && styles.placeholderText]}>
            {value || placeholder}
          </Text>
        </TouchableOpacity>
        
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.modalButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={value}
                onValueChange={(itemValue) => {
                  onValueChange(itemValue);
                  setShowPicker(false);
                }}
                style={styles.iosPicker}
              >
                <Picker.Item label={placeholder} value="" color="#666666" />
                {options.map((option, idx) => (
                  <Picker.Item 
                    key={idx} 
                    label={option} 
                    value={option} 
                    color="#000000" 
                  />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>
        
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
      </View>
    );
  }

  // Android picker
  return (
    <View>
      <View style={[styles.pickerContainer, error ? styles.inputError : null]}>
        <Picker
          selectedValue={value}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor="#000000"
          mode="dropdown"
        >
          <Picker.Item 
            label={placeholder} 
            value="" 
            color="#666666"
          />
          {options.map((option, idx) => (
            <Picker.Item 
              key={idx} 
              label={option} 
              value={option} 
              color="#000000" 
            />
          ))}
        </Picker>
      </View>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
};

export default function PersonalScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [formData, setFormData] = useState<SignupData>({
    name: '',
    surname: '',
    gender: '',
    highSchool: '',
    nationality: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    surname: '',
    gender: '',
    highSchool: '',
    nationality: ''
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      surname: '',
      gender: '',
      highSchool: '',
      nationality: ''
    };

    if (!formData.name?.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.surname?.trim()) {
      newErrors.surname = 'Surname is required';
      isValid = false;
    }
    
    if (!formData.gender?.trim()) {
      newErrors.gender = 'Gender is required';
      isValid = false;
    }
    
    if (!formData.highSchool?.trim()) {
      newErrors.highSchool = 'High School is required';
      isValid = false;
    }
    
    if (!formData.nationality?.trim()) {
      newErrors.nationality = 'Nationality is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const saveUserData = async () => {
    try {
      // Store data in AsyncStorage without creating Firebase user yet
      await AsyncStorage.setItem('signupData', JSON.stringify(formData));
      return true;
    } catch (error) {
      console.error('Error saving user data to AsyncStorage:', error);
      return false;
    }
  };

  const handleNext = async () => {
    if (validateForm()) {
      await saveUserData();
      navigation.navigate('Contact');
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
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                placeholder="Name*"
                placeholderTextColor="#000"
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                autoCapitalize="words"
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}

              <TextInput
                style={[styles.input, errors.surname ? styles.inputError : null]}
                placeholder="Surname*"
                placeholderTextColor="#000"
                value={formData.surname}
                onChangeText={(text) => handleInputChange('surname', text)}
                autoCapitalize="words"
              />
              {errors.surname ? (
                <Text style={styles.errorText}>{errors.surname}</Text>
              ) : null}
              
              <CustomPicker
                label="Gender"
                value={formData.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
                options={GENDER_OPTIONS}
                placeholder="Select Gender*"
                error={errors.gender}
              />
              
              <TextInput
                style={[styles.input, errors.highSchool ? styles.inputError : null]}
                placeholder="High School*"
                placeholderTextColor="#000"
                value={formData.highSchool}
                onChangeText={(text) => handleInputChange('highSchool', text)}
                autoCapitalize="words"
              />
              {errors.highSchool ? (
                <Text style={styles.errorText}>{errors.highSchool}</Text>
              ) : null}
              
              <CustomPicker
                label="Nationality"
                value={formData.nationality}
                onValueChange={(value) => handleInputChange('nationality', value)}
                options={SADC_COUNTRIES}
                placeholder="Select Nationality*"
                error={errors.nationality}
              />
            </View>

            <Pressable 
              style={styles.button}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>Enter</Text>
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
  inputContainer: {
    width: '100%',
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
  pickerContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    marginBottom: 15,
  },
  picker: {
    color: '#000',
    height: 50,
  },
  pickerText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    color: '#666',
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
    marginTop: 'auto',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    padding: 15,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalButton: {
    color: '#e300f3',
    fontSize: 16,
    fontWeight: '600',
  },
  iosPicker: {
    height: 200,
  },
}); 