import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { fetchDegree } from '../services/neo4jService';
import { toggleBookmark, getBookmarkedDegrees } from '../services/bookmarkService';
import { theme } from '../theme';
import { Degree } from '../types';

interface DegreeDetailsScreenProps {
  degreeId: number;
  onBack: () => void;
}

const DegreeDetailsScreen: React.FC<DegreeDetailsScreenProps> = ({ degreeId, onBack }) => {
  const { user } = useAuth();
  const [degree, setDegree] = useState<Degree | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDegree = async () => {
      setLoading(true);
      try {
        // Fetch the degree details
        const degreeData = await fetchDegree(degreeId);
        setDegree(degreeData);

        // Check if it's bookmarked (only if user is logged in)
        if (user) {
          const bookmarkedDegrees = await getBookmarkedDegrees(user.uid);
          setIsBookmarked(bookmarkedDegrees.includes(degreeId));
        }
      } catch (error) {
        console.error('Error loading degree details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDegree();
  }, [degreeId, user]);

  const handleBookmarkToggle = async () => {
    if (!user || !degree) return;

    try {
      const isNowBookmarked = await toggleBookmark(user.uid, degree.id);
      setIsBookmarked(isNowBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Function to format description with bold text (** ** syntax)
  const formatDescription = (description: string) => {
    if (!description) return null;

    // Split the description by bold markers
    const parts = description.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
      // Check if this part is a bold section (surrounded by **)
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove the ** markers and render as bold
        const boldText = part.substring(2, part.length - 2);
        return (
          <Text key={index} style={styles.boldText}>
            {boldText}
          </Text>
        );
      }
      // Regular text
      return <Text key={index}>{part}</Text>;
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Degree Details</Text>
          <View style={styles.placeholderIcon} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading degree details...</Text>
        </View>
      </View>
    );
  }

  if (!degree) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Degree Details</Text>
          <View style={styles.placeholderIcon} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="grey" />
          <Text style={styles.errorText}>Degree not found</Text>
          <TouchableOpacity onPress={onBack} style={styles.returnButton}>
            <Text style={styles.returnButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Degree Details</Text>
        <View style={styles.placeholderIcon} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.card}>
          <View style={styles.degreeTitleContainer}>
            <Text style={styles.degreeName}>{degree.name}</Text>
            {user && (
              <TouchableOpacity 
                onPress={handleBookmarkToggle}
                style={styles.bookmarkButton}
              >
                <Ionicons 
                  name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                  size={24} 
                  color="#e300f3" 
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.pointsContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="trophy-outline" size={24} color="#e300f3" />
            </View>
            <Text style={styles.points}>
              Minimum Points: {degree.pointRequirement || 'Not specified'}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {degree.description ? 
                formatDescription(degree.description) : 
                'No description available for this degree.'
              }
            </Text>
          </View>

          {degree.subjectRequirements && degree.subjectRequirements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subject Requirements</Text>
              {degree.subjectRequirements.map((req, index) => (
                <View key={`requirement-${index}`} style={styles.requirementRow}>
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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Point Calculation</Text>
            <Text style={styles.pointCalculation}>
              Method: Standard APS
            </Text>
          </View>
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 16,
  },
  returnButton: {
    backgroundColor: '#e300f3',
    borderRadius: 8,
    padding: 12,
    marginTop: 20,
    width: '50%',
    alignItems: 'center',
  },
  returnButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  degreeTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  degreeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    flex: 1,
  },
  bookmarkButton: {
    padding: 8,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  points: {
    fontSize: 16,
    fontWeight: '500',
    color: 'black',
  },
  section: {
    marginBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  boldText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
  },
  subjectIcon: {
    fontSize: 20,
    color: '#e300f3',
  },
  requirement: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  orText: {
    color: '#666666',
  },
  pointCalculation: {
    fontSize: 16,
    color: '#333',
  },
});

export default DegreeDetailsScreen; 