import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignupData } from './personal';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Source'>;

export default function SourceScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
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
          if (parsedData.source) {
            setSelectedSource(parsedData.source);
          }
        }
      } catch (error) {
        console.error('Error loading signup data from AsyncStorage:', error);
      }
    };

    loadSignupData();
  }, []);

  const saveSourceData = async () => {
    if (!selectedSource) {
      return false;
    }

    try {
      // Update the stored signup data with source information
      const updatedData = {
        ...formData,
        source: selectedSource
      };
      
      await AsyncStorage.setItem('signupData', JSON.stringify(updatedData));
      return true;
    } catch (error) {
      console.error('Error saving source data to AsyncStorage:', error);
      return false;
    }
  };

  const handleNext = async () => {
    if (!selectedSource) {
      Alert.alert('Required', 'Please select how you heard about us');
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await saveSourceData();
      if (success) {
        navigation.navigate('Subjects');
      } else {
        Alert.alert('Error', 'Failed to save your selection. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleNext:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const sources = [
    { id: 'google', name: 'Google Search', icon: require('../../../icons/Google_logo.png') },
    { id: 'instagram', name: 'Instagram', icon: require('../../../icons/Instagram_logo.png') },
    { id: 'facebook', name: 'Facebook', icon: require('../../../icons/facebook_logo.png') },
    { id: 'tiktok', name: 'TikTok', icon: require('../../../icons/tiktok_logo.png') },
    { id: 'friends', name: 'Friends & Family', icon: require('../../../icons/friends_icon.png') },
    { id: 'other', name: 'Other', icon: require('../../../icons/question_mark.png') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Where did you hear about us?</Text>

        <View style={styles.sourceList}>
          {sources.map((source) => (
            <Pressable
              key={source.id}
              style={[
                styles.sourceItem,
                selectedSource === source.id && styles.selectedSourceItem
              ]}
              onPress={() => setSelectedSource(source.id)}
            >
              <Image
                source={source.icon}
                style={styles.sourceIcon}
                resizeMode="contain"
              />
              <Text 
                style={[
                  styles.sourceName,
                  selectedSource === source.id && styles.selectedSourceText
                ]}
              >
                {source.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Enter Button */}
        <Pressable 
          style={[
            styles.button, 
            (!selectedSource || isLoading) && styles.buttonDisabled
          ]} 
          onPress={handleNext}
          disabled={!selectedSource || isLoading}
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
  sourceList: {
    flex: 1,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
  },
  selectedSourceItem: {
    backgroundColor: '#800080',
    borderColor: '#fff',
    borderWidth: 2,
  },
  sourceIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  sourceName: {
    fontSize: 16,
    color: '#000',
  },
  selectedSourceText: {
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