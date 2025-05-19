import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { getBookmarkedDegrees, toggleBookmark } from '../services/bookmarkService';
import { theme } from '../theme';
import { Degree } from '../types';
import { fetchDegree } from '../services/neo4jService';
import DegreeDetailsScreen from './DegreeDetailsScreen';

interface PreferencesScreenProps {
  onBack: () => void;
}

const PreferencesScreen: React.FC<PreferencesScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [bookmarkedDegrees, setBookmarkedDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDegreeId, setSelectedDegreeId] = useState<number | null>(null);

  const loadBookmarkedDegrees = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get bookmarked degree IDs
      const bookmarkedIds = await getBookmarkedDegrees(user.uid);
      console.log('Bookmarked degree IDs:', bookmarkedIds);
      
      // Fetch full degree details for each bookmarked ID
      const degreesPromises = bookmarkedIds.map(id => fetchDegree(id));
      const degrees = await Promise.all(degreesPromises);
      
      console.log('Fetched bookmarked degrees:', degrees);
      setBookmarkedDegrees(degrees.filter(Boolean));
    } catch (error) {
      console.error('Error loading bookmarked degrees:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBookmarkedDegrees();
  }, [loadBookmarkedDegrees]);

  const handleBookmarkToggle = async (degreeId: number) => {
    if (!user) return;

    try {
      await toggleBookmark(user.uid, degreeId);
      // Remove this degree from the list
      setBookmarkedDegrees(prev => prev.filter(degree => degree.id !== degreeId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const handleViewDegreeDetails = (degreeId: number) => {
    setSelectedDegreeId(degreeId);
  };

  const handleBackFromDegreeDetails = () => {
    setSelectedDegreeId(null);
  };

  // Show the degree details screen if a degree is selected
  if (selectedDegreeId !== null) {
    return (
      <DegreeDetailsScreen 
        degreeId={selectedDegreeId} 
        onBack={handleBackFromDegreeDetails}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Bookmarked Degrees</Text>
        <View style={styles.placeholderIcon} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your bookmarks...</Text>
        </View>
      ) : bookmarkedDegrees.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={60} color="grey" />
          <Text style={styles.emptyText}>No bookmarked degrees yet</Text>
          <Text style={styles.emptySubText}>
            Bookmark degrees you're interested in to view them here
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {bookmarkedDegrees.map((degree) => (
            <View key={`degree-${degree.id}`} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.degreeName}>{degree.name}</Text>
                <TouchableOpacity 
                  onPress={() => handleBookmarkToggle(degree.id)}
                  style={styles.bookmarkButton}
                >
                  <Ionicons 
                    name="bookmark" 
                    size={24} 
                    color="#e300f3" 
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.points}>
                Minimum Points: {degree.pointRequirement || 'Not specified'}
              </Text>
              
              {degree.subjectRequirements && degree.subjectRequirements.length > 0 && (
                <View>
                  <Text style={styles.requirementsTitle}>Subject Requirements:</Text>
                  {degree.subjectRequirements.map((req, index) => (
                    <View key={`requirement-${degree.id}-${index}`} style={styles.requirementRow}>
                      <View style={styles.iconContainer}>
                        {(req.subject || '').toLowerCase().includes('mathematics') && (
                          <Text style={styles.subjectIcon}>∫χ</Text>
                        )}
                        {(req.subject || '').toLowerCase().includes('physical') && (
                          <Ionicons name="flask-outline" size={20} color="#e300f3" />
                        )}
                        {(req.subject || '').toLowerCase().includes('english') && (
                          <Ionicons name="globe-outline" size={20} color="#e300f3" />
                        )}
                        {(req.subject || '').toLowerCase().includes('life') && (
                          <Ionicons name="leaf-outline" size={20} color="#e300f3" />
                        )}
                      </View>
                      <Text style={styles.requirement}>
                        {req.subject || 'Subject'}: {req.minPoints || 0}
                        {req.orSubject && (
                          <Text style={styles.orText}>{` OR ${req.orSubject}: ${req.minPoints || 0}`}</Text>
                        )}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              
              <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => handleViewDegreeDetails(degree.id)}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    padding: 16,
    paddingTop: 0,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  placeholderIcon: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'gray',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  degreeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    flex: 1,
  },
  bookmarkButton: {
    padding: 8,
  },
  points: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: 'black',
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: 'black',
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  subjectIcon: {
    fontSize: 20,
    color: '#e300f3',
  },
  requirement: {
    flex: 1,
    fontSize: 14,
    color: 'black',
  },
  orText: {
    color: '#666666',
  },
  viewDetailsButton: {
    backgroundColor: '#e300f3',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default PreferencesScreen; 