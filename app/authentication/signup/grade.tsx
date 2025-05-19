import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignupData } from './personal';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Grade'>;

export default function GradeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SignupData>({});

  // Load existing signup data
  useEffect(() => {
    const loadSignupData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('signupData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setFormData(parsedData);
          if (parsedData.grade) {
            setSelectedGrade(parsedData.grade);
          }
        }
      } catch (error) {
        console.error('Error loading signup data from AsyncStorage:', error);
      }
    };

    loadSignupData();
  }, []);

  const saveGradeData = async () => {
    if (!selectedGrade) {
      return false;
    }

    try {
      // Update the stored signup data with grade information
      const updatedData = {
        ...formData,
        grade: selectedGrade
      };
      
      await AsyncStorage.setItem('signupData', JSON.stringify(updatedData));
      return true;
    } catch (error) {
      console.error('Error saving grade data to AsyncStorage:', error);
      return false;
    }
  };

  const handleNext = async () => {
    if (!selectedGrade) {
      Alert.alert('Required', 'Please select your grade');
      return;
    }

    setIsLoading(true);
    try {
      const success = await saveGradeData();
      if (success) {
        navigation.navigate('Source');
      } else {
        Alert.alert('Error', 'Failed to save your grade. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const gradeIcons = [
    { grade: 9, label: 'Grade 9', icon: require('../../../icons/tabler--ladder.png') },
    { grade: 10, label: 'Grade 10', icon: require('../../../icons/majesticons--lightbulb-shine.png') },
    { grade: 11, label: 'Grade 11', icon: require('../../../icons/game-icons--arrow-wings.png') },
    { grade: 12, label: 'Grade 12', icon: require('../../../icons/stash--graduation-cap-solid.png') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What Grade are you in?</Text>

        <View style={styles.gradeGrid}>
          <View style={styles.row}>
            {gradeIcons.slice(0, 2).map((item) => (
              <Pressable 
                key={item.grade} 
                style={[
                  styles.gradeItem,
                  selectedGrade === item.grade && styles.selectedGrade
                ]}
                onPress={() => setSelectedGrade(item.grade)}
              >
                <View style={[
                  styles.iconCircle,
                  selectedGrade === item.grade && styles.selectedCircle
                ]}>
                  <Image
                    source={item.icon}
                    style={styles.iconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[
                  styles.gradeText,
                  selectedGrade === item.grade && styles.selectedText
                ]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.row}>
            {gradeIcons.slice(2, 4).map((item) => (
              <Pressable 
                key={item.grade} 
                style={[
                  styles.gradeItem,
                  selectedGrade === item.grade && styles.selectedGrade
                ]}
                onPress={() => setSelectedGrade(item.grade)}
              >
                <View style={[
                  styles.iconCircle,
                  selectedGrade === item.grade && styles.selectedCircle
                ]}>
                  <Image
                    source={item.icon}
                    style={styles.iconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[
                  styles.gradeText,
                  selectedGrade === item.grade && styles.selectedText
                ]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable 
          style={[
            styles.button, 
            (!selectedGrade || isLoading) && styles.buttonDisabled
          ]} 
          onPress={handleNext}
          disabled={!selectedGrade || isLoading}
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
    marginBottom: 40,
  },
  gradeGrid: {
    flex: 1,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  gradeItem: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
  },
  selectedGrade: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedCircle: {
    backgroundColor: '#800080',
  },
  iconImage: {
    width: 40,
    height: 40,
  },
  gradeText: {
    fontSize: 16,
    color: '#000',
    marginTop: 5,
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#800080',
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