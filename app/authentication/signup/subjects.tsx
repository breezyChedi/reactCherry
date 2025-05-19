import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Platform,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignupData } from './personal';
//The project is using an incompatible version (AGP 8.8.2) of the Android Gradle plugin. Latest supported version is AGP 8.7.1
type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Subjects'>;

// Define subject categories - match exactly with aps-calculator.tsx
const SUBJECTS = {
  mathOptions: ["Mathematics", "Mathematical Literacy"],
  languages: ["English HL", "Afrikaans HL", "isiZulu HL"],
  additionalLanguages: [
    "Sesotho FAL", "Isizulu FAL", "Afrikaans FAL",
    "Sepedi FAL", "English FAL", "Xitsonga FAL",
    "Setswana FAL", "TshiVenda FAL"
  ],
  allSubjects: [
    "Physical Science", "History", "Geography",
    "Art", "Economics", "Biology",
    "Information Technology", "Computing and Technology",
    "Dramatic Arts"
  ],
  lifeOrientation: ["Life Orientation"]
};

// Subject row component for consistent UI
const SubjectRow = ({ 
  label,
  value,
  onValueChange,
  options,
  required = false
}) => {
  const [showPicker, setShowPicker] = useState(false);
  
  // Debug: log the options
  console.log(`SubjectRow ${label} options:`, options);

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.pickerContainer}>
        <TouchableOpacity 
          style={styles.pickerButton}
          onPress={() => setShowPicker(true)}
        >
          <Text style={[styles.pickerText, !value && styles.placeholderText]}>
            {value || `Select a subject (${label})`}
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
                <Picker.Item label={`Select a subject (${label})`} value="" color="#666666" />
                {Array.isArray(options) && options.length > 0 ? (
                  options.map((option, idx) => (
                    <Picker.Item 
                      key={idx} 
                      label={option} 
                      value={option} 
                      color="#000000" 
                    />
                  ))
                ) : (
                  <Picker.Item label="No options available" value="" color="#FF0000" />
                )}
              </Picker>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // Android picker
  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={[styles.picker, {color: '#000000', backgroundColor: '#ffffff'}]} 
        dropdownIconColor="#000000"
        mode="dropdown"
      >
        <Picker.Item 
          label={`Select a subject (${label})`} 
          value="" 
          color="#666666"
          style={{fontSize: 16}}
        />
        {Array.isArray(options) && options.length > 0 ? (
          options.map((option, idx) => (
            <Picker.Item 
              key={idx} 
              label={option} 
              value={option} 
              color="#000000" 
              style={{fontSize: 16}}
            />
          ))
        ) : (
          <Picker.Item 
            label="No options available" 
            value="" 
            color="#FF0000"
            style={{fontSize: 16}}
          />
        )}
      </Picker>
    </View>
  );
};

export default function SubjectsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [subjects, setSubjects] = useState(Array(7).fill(""));
  const [availableSubjectOptions, setAvailableSubjectOptions] = useState(Array(7).fill([]));
  const [formData, setFormData] = useState<SignupData>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Load existing signup data
  useEffect(() => {
    const loadSignupData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('signupData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setFormData(parsedData);
          
          // If we have existing subjects data, load it
          if (parsedData.subjects) {
            const subjectValues = Array(7).fill("");
            Object.entries(parsedData.subjects).forEach(([key, value]) => {
              const index = parseInt(key.replace('subject', '')) - 1;
              if (index >= 0 && index < 7) {
                subjectValues[index] = value as string;
              }
            });
            setSubjects(subjectValues);
          }
        }
      } catch (error) {
        console.error('Error loading signup data from AsyncStorage:', error);
      }
    };

    loadSignupData();
  }, []);
  
  // Update available options when subjects change
  useEffect(() => {
    console.log('Current subjects:', subjects);
    
    // Create array of available options for each position
    const newAvailableOptions = [...Array(7)].map((_, index) => {
      let baseOptions = [];
      
      // Assign appropriate subject list based on index
      switch(index) {
        case 0: baseOptions = SUBJECTS.mathOptions; break;
        case 1: baseOptions = SUBJECTS.languages; break;
        case 2: baseOptions = SUBJECTS.additionalLanguages; break;
        case 3:
        case 4:
        case 5: baseOptions = SUBJECTS.allSubjects; break;
        case 6: baseOptions = SUBJECTS.lifeOrientation; break;
        default: baseOptions = [];
      }
      
      // Filter out subjects that have already been selected in other rows
      return baseOptions.filter(subject => {
        // Check if this subject is selected in any other row
        const isSelectedElsewhere = subjects.some(
          (selectedSubject, i) => selectedSubject === subject && i !== index
        );
        
        // Keep the subject if it's not selected elsewhere
        return !isSelectedElsewhere;
      });
    });
    
    console.log('Updated available options:', newAvailableOptions);
    setAvailableSubjectOptions(newAvailableOptions);
  }, [subjects]);

  // Get options for a specific dropdown
  const getSubjectOptions = (index) => {
    return availableSubjectOptions[index] || [];
  };

  // Handle subject selection
  const handleSubjectChange = (value, index) => {
    console.log(`Changing subject at index ${index} to:`, value);
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  // Save subject choices to AsyncStorage
  const saveSubjectsData = async () => {
    try {
      // Format subject data
      const subjectData = {};
      subjects.forEach((subject, index) => {
        if (subject) {
          subjectData[`subject${index + 1}`] = subject;
        }
      });

      // Update the stored signup data with subject information
      const updatedData = {
        ...formData,
        subjects: subjectData
      };
      
      await AsyncStorage.setItem('signupData', JSON.stringify(updatedData));
      return true;
    } catch (error) {
      console.error('Error saving subjects data to AsyncStorage:', error);
      return false;
    }
  };

  // Validation and navigation
  const handleNext = async () => {
    // Check if required subjects are selected
    if (!subjects[0] || !subjects[1] || !subjects[2] || !subjects[6]) {
      Alert.alert('Required', 'Please select your Mathematics option, Home Language, Additional Language, and Life Orientation');
      return;
    }

    // Check if at least one other subject is selected
    if (!subjects[3] && !subjects[4] && !subjects[5]) {
      Alert.alert('Required', 'Please select at least one additional subject');
      return;
    }

    setIsLoading(true);
    try {
      // Save subjects to AsyncStorage
      const saveSuccess = await saveSubjectsData();
      
      if (!saveSuccess) {
        Alert.alert('Error', 'Failed to save your subject choices. Please try again.');
        return;
      }

      // Navigate to Success screen to complete signup
      navigation.navigate('Success');
    } catch (error) {
      console.error('Error in handleNext:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Choose your Subjects</Text>

        <View style={styles.form}>
          {/* Mathematics Options */}
          <SubjectRow
            label="Mathematics Option"
            value={subjects[0]}
            onValueChange={(value) => handleSubjectChange(value, 0)}
            options={getSubjectOptions(0)}
            required
          />

          {/* Home Language */}
          <SubjectRow
            label="Home Language"
            value={subjects[1]}
            onValueChange={(value) => handleSubjectChange(value, 1)}
            options={getSubjectOptions(1)}
            required
          />

          {/* Additional Language */}
          <SubjectRow
            label="Additional Language"
            value={subjects[2]}
            onValueChange={(value) => handleSubjectChange(value, 2)}
            options={getSubjectOptions(2)}
            required
          />

          {/* Additional Subjects */}
          {[3, 4, 5].map((index) => (
            <SubjectRow
              key={`subject-${index}`}
              label={`Subject ${index - 2}`}
              value={subjects[index]}
              onValueChange={(value) => handleSubjectChange(value, index)}
              options={getSubjectOptions(index)}
            />
          ))}

          {/* Life Orientation */}
          <SubjectRow
            label="Life Orientation"
            value={subjects[6]}
            onValueChange={(value) => handleSubjectChange(value, 6)}
            options={getSubjectOptions(6)}
            required
          />
        </View>

        {/* Enter Button */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e300f3',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    flex: 1,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
    height: 50,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pickerButton: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  pickerText: {
    fontSize: 16,
    color: '#000000',
  },
  placeholderText: {
    color: '#666666',
    fontStyle: 'italic',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#000000',
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
  },
  debugText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#800080',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
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