import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Platform, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

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

const CircularProgress = ({ progress }) => {
  const size = 120;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressOffset = circumference - (progress * circumference);

  return (
    <View style={styles.scoreCircle}>
      <Svg width={size} height={size}>
        <Circle
          stroke="#333333"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke="#E4A8FF"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progressOffset}
        />
      </Svg>
      <Text style={styles.scoreText}>APS Score: {Math.round(progress * 42)}</Text>
    </View>
  );
};

const SubjectRow = ({ 
  index, 
  onSubjectChange, 
  onPercentageChange, 
  subjectOptions,
  value,
  percentage 
}) => {
  const [showPicker, setShowPicker] = useState(false);

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.subjectRow}>
        <TouchableOpacity 
          style={styles.subjectPicker}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.pickerText}>
            {value || 'Select Subject'}
          </Text>
        </TouchableOpacity>
        <TextInput
          style={styles.percentageInput}
          placeholder="Enter %"
          keyboardType="numeric"
          value={percentage}
          onChangeText={onPercentageChange}
          placeholderTextColor="#666666"
          maxLength={3}
        />
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
                  onSubjectChange(itemValue);
                  setShowPicker(false);
                }}
                style={styles.iosPicker}
              >
                <Picker.Item label="Select Subject" value="" color="#666666" />
                {subjectOptions.map((subject, idx) => (
                  <Picker.Item 
                    key={idx} 
                    label={subject} 
                    value={subject} 
                    color="#000000"
                  />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.subjectRow}>
      <View style={styles.subjectPicker}>
        <Picker
          selectedValue={value}
          onValueChange={onSubjectChange}
          style={styles.picker}
          dropdownIconColor="#FFFFFF"
          mode="dropdown"
        >
          <Picker.Item label="Select Subject" value="" />
          {subjectOptions.map((subject, idx) => (
            <Picker.Item 
              key={idx} 
              label={subject} 
              value={subject} 
              color="#FFFFFF"
            />
          ))}
        </Picker>
      </View>
      <TextInput
        style={styles.percentageInput}
        placeholder="Enter %"
        keyboardType="numeric"
        value={percentage}
        onChangeText={onPercentageChange}
        placeholderTextColor="#666666"
        maxLength={3}
      />
    </View>
  );
};

export default function APSCalculator() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState(Array(7).fill(""));
  const [percentages, setPercentages] = useState(Array(7).fill(""));
  const [apsScore, setApsScore] = useState(0);
  const [nbtScores, setNbtScores] = useState({ AL: "", QL: "", MAT: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [availableSubjectOptions, setAvailableSubjectOptions] = useState(Array(7).fill([]));

  // Load user's subjects from profile when component mounts
  useEffect(() => {
    const loadUserSubjects = async () => {
      if (!user) return;
      
      try {
        const userProfile = await getDoc(doc(db, 'profiles', user.uid));
        const userData = userProfile.data();
        
        if (userData && userData.subjects) {
          // Create an array to hold the subjects, preserving the order
          const subjectArray = Array(7).fill("");
          Object.entries(userData.subjects).forEach(([key, value]) => {
            const index = parseInt(key.replace('subject', '')) - 1;
            if (index >= 0 && index < 7) {
              subjectArray[index] = value;
            }
          });
          
          setSubjects(subjectArray);
          
          // Also load marks if available
          if (userData.marks) {
            const marksArray = Array(7).fill("");
            Object.entries(userData.marks).forEach(([key, value]) => {
              const index = parseInt(key.replace('mark', '')) - 1;
              if (index >= 0 && index < 7) {
                marksArray[index] = value;
              }
            });
            setPercentages(marksArray);
          }
          
          // Load NBT scores if available
          if (userData.nbtScores) {
            setNbtScores({
              AL: userData.nbtScores.nbtAL || "",
              QL: userData.nbtScores.nbtQL || "",
              MAT: userData.nbtScores.nbtMAT || ""
            });
          }
        }
      } catch (error) {
        console.error('Error loading user subjects:', error);
      }
    };
    
    loadUserSubjects();
  }, [user]);

  useEffect(() => {
    // Update available subject options when subjects change
    const newAvailableOptions = [...Array(7)].map((_, index) => {
      let baseOptions = [];
      
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
        
        // Keep the subject if it's not selected elsewhere or it's the current selection
        return !isSelectedElsewhere;
      });
    });
    
    setAvailableSubjectOptions(newAvailableOptions);
    console.log('Updated available subjects:', newAvailableOptions);
  }, [subjects]);

  const getSubjectOptions = (index) => {
    return availableSubjectOptions[index] || [];
  };

  const calculateAPS = () => {
    const getPointsForMark = (mark: number) => {
      if (mark >= 80) return 7;
      if (mark >= 70) return 6;
      if (mark >= 60) return 5;
      if (mark >= 50) return 4;
      if (mark >= 40) return 3;
      if (mark >= 30) return 2;
      return 0;
    };

    const totalScore = percentages
      .slice(0, 6)
      .map(p => parseInt(p) || 0)
      .reduce((sum, mark) => sum + getPointsForMark(mark), 0);

    setApsScore(totalScore);
  };

  const saveToProfile = async () => {
    if (!user) {
      Alert.alert("Not Signed In", "Please sign in to save your data to your profile.");
      return;
    }

    setIsSaving(true);
    try {
      const userDocRef = doc(db, 'profiles', user.uid);
      
      // Check if document exists
      const userDoc = await getDoc(userDocRef);
      
      // Create an object with subjectX and markX entries
      const subjectsData = {};
      const marksData = {};
      
      subjects.forEach((subject, index) => {
        if (subject) {
          subjectsData[`subject${index + 1}`] = subject;
          marksData[`mark${index + 1}`] = percentages[index] || "0";
        }
      });
      
      const userData = {
        subjects: subjectsData,
        marks: marksData,
        apsScore: apsScore.toString(),
        nbtScores: {
          nbtAL: nbtScores.AL || "0",
          nbtMAT: nbtScores.MAT || "0", 
          nbtQL: nbtScores.QL || "0"
        },
        savedAt: new Date().toISOString()
      };
      
      if (userDoc.exists()) {
        // Update existing document
        await updateDoc(userDocRef, userData);
      } else {
        // Create new document
        await setDoc(userDocRef, userData);
      }
      
      Alert.alert("Success", "Your data has been saved to your profile.");
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "There was a problem saving your data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const openNbtRegistration = () => {
    Linking.openURL('https://nbtests.uct.ac.za/tests/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Subject Rows */}
          {[...Array(7)].map((_, index) => (
            <SubjectRow
              key={index}
              index={index}
              value={subjects[index]}
              percentage={percentages[index]}
              subjectOptions={getSubjectOptions(index)}
              onSubjectChange={(value) => {
                const newSubjects = [...subjects];
                newSubjects[index] = value;
                setSubjects(newSubjects);
              }}
              onPercentageChange={(value) => {
                const newPercentages = [...percentages];
                newPercentages[index] = value;
                setPercentages(newPercentages);
              }}
            />
          ))}

          {/* APS Score Display */}
          <View style={styles.scoreContainer}>
            <CircularProgress progress={apsScore / 42} />
          </View>

          {/* Calculate Button */}
          <TouchableOpacity 
            style={styles.calculateButton}
            onPress={calculateAPS}
          >
            <Text style={styles.buttonText}>Calculate APS Score</Text>
          </TouchableOpacity>

          {/* NBT Section */}
          <View style={styles.nbtContainer}>
            <View style={styles.nbtInputContainer}>
              <TextInput
                style={styles.nbtInput}
                placeholder="NBT (AL)"
                value={nbtScores.AL}
                onChangeText={(value) => setNbtScores({...nbtScores, AL: value})}
                placeholderTextColor="#666666"
                keyboardType="numeric"
                maxLength={3}
              />
              <TextInput
                style={styles.nbtInput}
                placeholder="NBT (QL)"
                value={nbtScores.QL}
                onChangeText={(value) => setNbtScores({...nbtScores, QL: value})}
                placeholderTextColor="#666666"
                keyboardType="numeric"
                maxLength={3}
              />
              <TextInput
                style={styles.nbtInput}
                placeholder="NBT (MAT)"
                value={nbtScores.MAT}
                onChangeText={(value) => setNbtScores({...nbtScores, MAT: value})}
                placeholderTextColor="#666666"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            
            {/* NBT Action Buttons */}
            <View style={styles.nbtActionContainer}>
              <TouchableOpacity 
                style={styles.nbtActionButton}
                onPress={openNbtRegistration}
              >
                <Text style={styles.nbtButtonText}>Book a NBT Test</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.nbtActionButton, isSaving && styles.disabledButton]}
                onPress={saveToProfile}
                disabled={isSaving}
              >
                <Text style={styles.nbtButtonText}>
                  {isSaving ? "Saving..." : "Save to Profile"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  subjectRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  subjectPicker: {
    flex: 3,
    backgroundColor: '#333333',
    borderRadius: 8,
    marginRight: 10,
    height: 50,
    justifyContent: 'center',
  },
  pickerText: {
    color: '#FFFFFF',
    paddingHorizontal: 10,
  },
  percentageInput: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 10,
    color: '#FFFFFF',
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
    color: '#E4A8FF',
    fontSize: 16,
    fontWeight: '600',
  },
  iosPicker: {
    height: 200,
  },
  picker: {
    color: '#FFFFFF',
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  scoreCircle: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    position: 'absolute',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  calculateButton: {
    backgroundColor: '#E4A8FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  nbtContainer: {
    marginTop: 20,
  },
  nbtInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nbtInput: {
    flex: 1,
    backgroundColor: '#333333',
    borderRadius: 8,
    height: 50,
    marginHorizontal: 5,
    paddingHorizontal: 10,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  nbtActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  nbtActionButton: {
    flex: 1,
    backgroundColor: '#E4A8FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  nbtButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#9A8A9F',
  },
}); 