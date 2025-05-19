import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Degree } from '../types';
import { toggleBookmark, getBookmarkedDegrees } from '../services/bookmarkService';

interface DegreeGridProps {
  degrees: Degree[];
  filterByEligibility: boolean;
  faculty: string | undefined;
  onViewDegreeDetails: (degreeId: number) => void;
}

const DegreeGrid: React.FC<DegreeGridProps> = ({ 
  degrees, 
  filterByEligibility, 
  faculty,
  onViewDegreeDetails 
}) => {
  const { user } = useAuth();
  const [bookmarkedDegrees, setBookmarkedDegrees] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadBookmarkedDegrees = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      console.log('Loading bookmarked degrees for user:', user.uid);
      const bookmarked = await getBookmarkedDegrees(user.uid);
      console.log('Bookmarked degrees loaded:', bookmarked);
      setBookmarkedDegrees(bookmarked);
    } catch (error) {
      console.error('Error loading bookmarked degrees:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load bookmarked degrees when user or degrees change
  useEffect(() => {
    loadBookmarkedDegrees();
  }, [loadBookmarkedDegrees, degrees]);

  const handleBookmarkToggle = async (degreeId: number) => {
    if (!user) {
      ToastAndroid.show('Please login to bookmark degrees', ToastAndroid.SHORT);
      return;
    }

    try {
      console.log('Toggling bookmark for degree:', degreeId);
      const isBookmarked = await toggleBookmark(user.uid, degreeId);
      console.log('Bookmark toggled, is now bookmarked:', isBookmarked);
      
      // Update local state
      setBookmarkedDegrees(prev => {
        if (isBookmarked) {
          return [...prev, degreeId];
        } else {
          return prev.filter(id => id !== degreeId);
        }
      });
      
      // Show confirmation
      ToastAndroid.show(
        isBookmarked ? 'Degree bookmarked' : 'Bookmark removed', 
        ToastAndroid.SHORT
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      ToastAndroid.show('Failed to update bookmark', ToastAndroid.SHORT);
    }
  };

  const isBookmarked = (degreeId: number) => {
    const result = bookmarkedDegrees.includes(degreeId);
    console.log(`Degree ${degreeId} is bookmarked: ${result}`, 
                `(Bookmarked list: ${bookmarkedDegrees.join(', ')})`);
    return result;
  };

  if (!degrees.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {filterByEligibility
            ? 'No eligible degrees found'
            : 'No degrees available for this faculty'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.facultyHeader}>
        <Text style={styles.facultyName}>{faculty}</Text>
      </View>
      {degrees.map((degree) => (
        <View key={`degree-${degree.id || Math.random().toString()}`} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.degreeName}>{degree.name}</Text>
            <TouchableOpacity 
              onPress={() => handleBookmarkToggle(degree.id)}
              style={styles.bookmarkButton}
              disabled={isLoading}
            >
              <Ionicons 
                name={isBookmarked(degree.id) ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color="#e300f3" 
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.points}>
            Minimum Points: {degree.pointRequirement || 'Not specified'}
          </Text>
          <View style={styles.requirements}>
            <Text style={styles.requirementsTitle}>Subject Requirements:</Text>
            {(degree.subjectRequirements || []).map((req, index) => (
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
          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={() => onViewDegreeDetails(degree.id)}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    marginTop: 8,
  },
  facultyHeader: {
    backgroundColor: '#1C1C1E',
    padding: 8,
    marginBottom: 8,
  },
  facultyName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
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
    color: '#000000',
    flex: 1,
  },
  bookmarkButton: {
    padding: 8,
  },
  points: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    color: '#000000',
  },
  requirements: {
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    color: '#000000',
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
    color: '#000000',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    color: '#666666',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DegreeGrid; 