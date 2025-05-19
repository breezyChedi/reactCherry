import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, Text, Alert } from 'react-native';
import UniversitiesList from '../components/UniversitiesList';
import { fetchUniversitiesWithFaculties } from '../services/neo4jService';
import { University } from '../types';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Universities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [isEligibilityEnabled, setEligibilityEnabled] = useState(false);
  const [isViewingDegreeDetails, setIsViewingDegreeDetails] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadUniversities();
    loadEligibilityState();
  }, []);

  const loadUniversities = async () => {
    try {
      const data = await fetchUniversitiesWithFaculties();
      setUniversities(data);
    } catch (error) {
      console.error('Error loading universities:', error);
    }
  };

  const loadEligibilityState = async () => {
    try {
      const state = await AsyncStorage.getItem('eligibilitySwitchState');
      setEligibilityEnabled(state === 'true');
    } catch (error) {
      console.error('Error loading eligibility state:', error);
    }
  };

  const toggleEligibilityFilter = async (value: boolean) => {
    if (!user && value) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in or sign up to use this feature.',
        [{ text: 'OK' }]
      );
      return;
    }
    setEligibilityEnabled(value);
    await AsyncStorage.setItem('eligibilitySwitchState', value.toString());
  };

  const handleDegreeDetailsVisibility = (isViewing: boolean) => {
    setIsViewingDegreeDetails(isViewing);
  };

  return (
    <View style={styles.container}>
      {!isViewingDegreeDetails && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Filter by eligibility</Text>
          <Switch
            value={isEligibilityEnabled}
            onValueChange={toggleEligibilityFilter}
            trackColor={{ false: '#767577', true: '#e300f3' }}
            thumbColor={isEligibilityEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      )}
      <UniversitiesList 
        universities={universities}
        filterByEligibility={isEligibilityEnabled}
        onDegreeDetailsVisibility={handleDegreeDetailsVisibility}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1C1C1E',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
}); 