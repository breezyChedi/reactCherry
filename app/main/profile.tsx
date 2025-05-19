import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text, Card, Title, Avatar } from 'react-native-paper';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { Ionicons, FontAwesome, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import MarksScreen from '../screens/MarksScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function Profile() {
  const { user, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user data from the 'users' collection
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          console.log('User data from users collection:', userDoc.data());
          setUserData(userDoc.data());
        } else {
          console.log('No user document found in users collection');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <View style={styles.container}>
        <Card style={styles.loginCard}>
          <Card.Content>
            <Title style={styles.title}>Welcome to Cherry</Title>
            <Text style={styles.subtitle}>Sign in to access your profile</Text>
            <TouchableOpacity style={styles.signInButton}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createAccountButton}>
              <Text style={styles.outlineButtonText}>Create Account</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>
    );
  }

  if (currentScreen === 'marks') {
    return (
      <MarksScreen onBack={() => setCurrentScreen('profile')} />
    );
  }

  if (currentScreen === 'personalInfo') {
    return (
      <PersonalInfoScreen onBack={() => setCurrentScreen('profile')} />
    );
  }

  if (currentScreen === 'preferences') {
    return (
      <PreferencesScreen onBack={() => setCurrentScreen('profile')} />
    );
  }

  // Get display name with priority: users collection name > users collection surname > profile name > email username
  const getDisplayName = () => {
    if (userData) {
      const firstName = userData.name || '';
      const lastName = userData.surname || '';
      
      if (firstName && lastName) {
        return `${firstName} ${lastName}`;
      } else if (firstName) {
        return firstName;
      } else if (lastName) {
        return lastName;
      }
    }
    
    // Fallbacks if userData not available or name/surname not present
    return user.profile?.name || user.profile?.email?.split('@')[0] || 'User';
  };

  return (
    <View style={styles.container}>
    
      {/* Profile Card */}
      <Card style={styles.profileCard}>
        <View style={styles.profileContent}>
          <View style={styles.avatarContainer}>
            <Image 
              source={require('../../assets/cherry-icon.png')} 
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.userName}>
            {getDisplayName()}
          </Text>
          {userData?.email && (
            <Text style={styles.userEmail}>{userData.email}</Text>
          )}
        </View>
      </Card>
      
      {/* Quick Actions Row */}
      <View style={styles.quickActionsRow}>
        {/* Progress (renamed from Marks, with Analytics icon) */}
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => setCurrentScreen('marks')}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="chart-line" size={30} color="black" />
          </View>
          <Text style={styles.actionText}>Progress</Text>
        </TouchableOpacity>
        
        {/* Preference */}
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => setCurrentScreen('preferences')}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="bookmark-outline" size={30} color="black" />
          </View>
          <Text style={styles.actionText}>Preference</Text>
        </TouchableOpacity>
      </View>
      
      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <Card style={styles.accountCard}>
        <View style={styles.accountList}>
          <TouchableOpacity 
            style={styles.accountItem}
            onPress={() => setCurrentScreen('personalInfo')}
          >
            <Ionicons name="person-outline" size={24} color="gray" />
            <Text style={styles.accountItemText}>Personal Info</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.accountItem}>
            <MaterialIcons name="description" size={24} color="gray" />
            <Text style={styles.accountItemText}>Terms & Conditions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.accountItem}>
            <MaterialIcons name="message" size={24} color="gray" />
            <Text style={styles.accountItemText}>Message Us</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.accountItem}>
            <MaterialIcons name="star-outline" size={24} color="gray" />
            <Text style={styles.accountItemText}>Review Us</Text>
          </TouchableOpacity>
        </View>
      </Card>
      
      {/* Log Out Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={signOut}
      >
        <Ionicons name="log-out-outline" size={22} color="black" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: 16,
    paddingTop: 16,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 16,
  },
  profileCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#e1f5fe',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  avatar: {
    width: 60,
    height: 60,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    width: '48%',
    height: 100,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 16,
  },
  accountCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    backgroundColor: 'white',
  },
  accountList: {
    padding: 5,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  accountItemText: {
    marginLeft: 16,
    fontSize: 16,
    color: 'black',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  createAccountButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  outlineButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  loginCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
  },
}); 