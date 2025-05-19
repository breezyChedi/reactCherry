import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import UniversityCard from './UniversityCard';
import FacultySpinner from './FacultySpinner';
import DegreeGrid from './DegreeGrid';
import DegreeDetailsScreen from '../screens/DegreeDetailsScreen';
import { University, Faculty, Degree } from '../types';

interface UniversitiesListProps {
  universities: University[];
  filterByEligibility: boolean;
  onDegreeDetailsVisibility?: (isViewing: boolean) => void;
}

const UniversitiesList: React.FC<UniversitiesListProps> = ({ 
  universities,
  filterByEligibility,
  onDegreeDetailsVisibility,
}) => {
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [selectedDegreeId, setSelectedDegreeId] = useState<number | null>(null);

  // Log universities data on mount
  useEffect(() => {
    console.log('UniversitiesList - Universities data:', {
      count: universities.length,
      universities: universities.map(u => ({
        id: u.id,
        name: u.name,
        facultiesCount: u.faculties?.length ?? 0
      }))
    });
  }, [universities]);

  // Reset faculty and degrees when university changes
  useEffect(() => {
    console.log('UniversitiesList - Selected university changed:', {
      universityId: selectedUniversity?.id,
      universityName: selectedUniversity?.name,
      facultiesCount: selectedUniversity?.faculties?.length ?? 0
    });
    
    setSelectedFaculty(null);
    setDegrees([]);
  }, [selectedUniversity?.id]);

  const handleSelectUniversity = useCallback((university: University) => {
    console.log('UniversitiesList - University selection:', {
      clickedId: university.id,
      clickedName: university.name,
      currentSelectedId: selectedUniversity?.id,
      willSelect: selectedUniversity?.id !== university.id
    });
    
    setSelectedUniversity(prev => prev?.id === university.id ? null : university);
  }, []);

  const handleDegreesLoaded = useCallback((newDegrees: Degree[]) => {
    console.log('UniversitiesList - Degrees loaded:', {
      count: newDegrees.length,
      universityId: selectedUniversity?.id,
      facultyId: selectedFaculty?.id
    });
    
    setDegrees(newDegrees);
  }, [selectedUniversity?.id, selectedFaculty?.id]);

  const handleViewDegreeDetails = useCallback((degreeId: number) => {
    console.log('UniversitiesList - View degree details:', degreeId);
    setSelectedDegreeId(degreeId);
    // Notify parent component that we're viewing degree details
    onDegreeDetailsVisibility?.(true);
  }, [onDegreeDetailsVisibility]);

  const handleBackFromDegreeDetails = useCallback(() => {
    setSelectedDegreeId(null);
    // Notify parent component that we're no longer viewing degree details
    onDegreeDetailsVisibility?.(false);
  }, [onDegreeDetailsVisibility]);

  // If a degree is selected, show the degree details screen
  if (selectedDegreeId !== null) {
    return (
      <DegreeDetailsScreen 
        degreeId={selectedDegreeId} 
        onBack={handleBackFromDegreeDetails} 
        parentScreenName="Universities"
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.universitiesScroll}
        contentContainerStyle={styles.universitiesContent}
      >
        {universities.map((university) => (
          <View key={`university-${university.id}`} style={styles.cardWrapper}>
            <UniversityCard
              university={university}
              isSelected={selectedUniversity?.id === university.id}
              onSelect={handleSelectUniversity}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.facultyContainer}>
        <FacultySpinner
          faculties={selectedUniversity?.faculties || []}
          filterByEligibility={filterByEligibility}
          onDegreesLoaded={handleDegreesLoaded}
        />
      </View>

      {degrees.length > 0 && (
        <DegreeGrid
          degrees={degrees}
          filterByEligibility={filterByEligibility}
          faculty={selectedFaculty?.name}
          onViewDegreeDetails={handleViewDegreeDetails}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  universitiesScroll: {
    maxHeight: 320,
    minHeight: 320,
  },
  universitiesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
  },
  cardWrapper: {
    marginRight: 16,
  },
  facultyContainer: {
    marginTop: 1,
    alignItems: 'center',
  },
});

export default UniversitiesList; 