import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Text, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { theme } from '../theme';

interface PersonalInfoScreenProps {
  onBack: () => void;
}

const PersonalInfoScreen: React.FC<PersonalInfoScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    surname: '',
    email: '',
    phoneNumber: '',
    gender: '',
    nationality: '',
    highSchool: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('User data fetched:', data);
          
          setUserData({
            name: data.name || '',
            surname: data.surname || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
            gender: data.gender || '',
            nationality: data.nationality || '',
            highSchool: data.highSchool || ''
          });
        } else {
          console.log('No user document found in users collection');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load your information');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        ...userData,
        updatedAt: new Date().toISOString()
      });
      
      Alert.alert('Success', 'Your information has been updated');
    } catch (error) {
      console.error('Error updating user data:', error);
      Alert.alert('Error', 'Failed to update your information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Personal Information</Text>
            <View style={styles.placeholder} />
          </View>
          
          {/* Form */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.formGroup}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={userData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="Enter your first name"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={userData.surname}
                  onChangeText={(value) => handleInputChange('surname', value)}
                  placeholder="Enter your last name"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={userData.email}
                  editable={false}
                  placeholder="Your email address"
                  placeholderTextColor="#999"
                />
                <Text style={styles.helperText}>Email cannot be changed</Text>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={userData.phoneNumber}
                  onChangeText={(value) => handleInputChange('phoneNumber', value)}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Gender</Text>
                <TextInput
                  style={styles.input}
                  value={userData.gender}
                  onChangeText={(value) => handleInputChange('gender', value)}
                  placeholder="Enter your gender"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Nationality</Text>
                <TextInput
                  style={styles.input}
                  value={userData.nationality}
                  onChangeText={(value) => handleInputChange('nationality', value)}
                  placeholder="Enter your nationality"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>High School</Text>
                <TextInput
                  style={styles.input}
                  value={userData.highSchool}
                  onChangeText={(value) => handleInputChange('highSchool', value)}
                  placeholder="Enter your high school"
                  placeholderTextColor="#999"
                />
              </View>
            </Card.Content>
          </Card>
          
          {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  card: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#555',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  disabledInput: {
    backgroundColor: '#eee',
    color: '#888',
  },
  helperText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#e300f3',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PersonalInfoScreen; 