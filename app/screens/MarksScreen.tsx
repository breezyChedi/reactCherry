import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Text,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { ensureMultipleMarks } from '../utils/marks';

// Color palette for the graph lines
const colorPalette = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F94144'
];

// Define term date ranges
const TERM_DATES = {
  1: { end: new Date('2023-03-28') },
  2: { end: new Date('2023-06-27') },
  3: { end: new Date('2023-10-04') },
  4: { end: new Date('2023-12-12') }
};

interface MarksScreenProps {
  onBack?: () => void;
}

export default function MarksScreen({ onBack }: MarksScreenProps) {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [newGrade, setNewGrade] = useState(12);
  const [newTermNumber, setNewTermNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMultipleMarks, setHasMultipleMarks] = useState(false);
  const screenWidth = Dimensions.get('window').width - 32; // -32 for padding

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Function to check if a term is adjacent to existing terms
  const isTermAdjacent = () => {
    // If no terms exist yet, any term can be added
    if (terms.length === 0) {
      return true;
    }

    // Sort existing terms by grade and term number
    const sortedTerms = [...terms].sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      return a.termNumber - b.termNumber;
    });

    // Check if the selected term is adjacent to any existing term
    for (const term of sortedTerms) {
      // Calculate the "term index" (grade * 4 + termNumber)
      const existingTermIndex = term.grade * 4 + term.termNumber;
      const newTermIndex = newGrade * 4 + newTermNumber;
      
      // The term is adjacent if it's exactly 1 position before or after an existing term
      if (Math.abs(existingTermIndex - newTermIndex) === 1) {
        return true;
      }
    }

    return false;
  };

  // Function to get button style based on adjacency
  const getAddTermButtonStyle = () => {
    const isAdjacent = isTermAdjacent();
    const exists = terms.some(t => t.grade === newGrade && t.termNumber === newTermNumber);
    
    if (!isAdjacent || exists) {
      return [styles.addButton, styles.disabledButton];
    }
    
    return styles.addButton;
  };

  // Function to determine current term based on date
  const getCurrentTerm = () => {
    const now = new Date();
    const year = now.getFullYear();
    
    // Update term end dates to current year
    const currentYearTerms = {};
    Object.entries(TERM_DATES).forEach(([term, data]) => {
      const endDate = new Date(data.end);
      endDate.setFullYear(year);
      currentYearTerms[term] = { end: endDate };
    });
    
    // Find the most recent completed term
    let currentTerm = 4; // Default to term 4 of previous year if none found
    for (let i = 1; i <= 4; i++) {
      if (now < currentYearTerms[i].end) {
        currentTerm = i > 1 ? i - 1 : 4; // If before first term end, use term 4 of prev year
        break;
      }
    }
    
    return currentTerm;
  };

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      console.log("=== MARKS DEBUG: Starting loadUserData ===");
      
      // Call the utility function to ensure multipleMarks data is created if needed
      if (user) {
        console.log(`MARKS DEBUG: Checking multipleMarks for user: ${user.uid}`);
        await ensureMultipleMarks(user.uid);
        console.log("MARKS DEBUG: ensureMultipleMarks completed");
      }
      
      // First, check if user has data in multipleMarks collection
      const multipleMarksQuery = query(
        collection(db, 'multipleMarks'),
        where('userId', '==', user.uid)
      );
      
      console.log("MARKS DEBUG: Querying multipleMarks collection");
      const multipleMarksSnapshot = await getDocs(multipleMarksQuery);
      console.log(`MARKS DEBUG: Query returned ${multipleMarksSnapshot.size} documents`);
      
      if (!multipleMarksSnapshot.empty) {
        // User has multiple marks data, load it
        console.log("MARKS DEBUG: Found multipleMarks document");
        setHasMultipleMarks(true);
        const multipleMarksDoc = multipleMarksSnapshot.docs[0];
        const multipleMarksData = multipleMarksDoc.data();
        console.log(`MARKS DEBUG: multipleMarks document ID: ${multipleMarksDoc.id}`);
        
        // Log structure of the data
        console.log("MARKS DEBUG: multipleMarks data structure:", JSON.stringify({
          hasTerms: !!multipleMarksData.terms,
          termsLength: multipleMarksData.terms?.length || 0,
          hasMarksData: !!multipleMarksData.marksData,
          marksDataKeys: Object.keys(multipleMarksData.marksData || {})
        }));
        
        // Load terms from multipleMarks
        if (multipleMarksData.terms) {
          console.log(`MARKS DEBUG: Setting ${multipleMarksData.terms.length} terms`);
          setTerms(multipleMarksData.terms);
        } else {
          console.log("MARKS DEBUG: No terms found in multipleMarks");
        }
        
        // Load marks data from multipleMarks
        if (multipleMarksData.marksData) {
          console.log(`MARKS DEBUG: Setting marksData with ${Object.keys(multipleMarksData.marksData).length} subjects`);
          setMarksData(multipleMarksData.marksData);
          
          // Extract subject information from the profile to populate the subjects list
          const profileRef = doc(db, 'profiles', user.uid);
          console.log("MARKS DEBUG: Getting profile data for subjects");
          const profileSnapshot = await getDoc(profileRef);
          
          if (profileSnapshot.exists()) {
            const profileData = profileSnapshot.data();
            if (profileData.subjects) {
              const subjectEntries = Object.entries(profileData.subjects);
              console.log(`MARKS DEBUG: Found ${subjectEntries.length} subjects in profile`);
              
              const subjectsList = subjectEntries.map(([key, value], index) => ({
                id: index + 1,
                name: value,
                key: key
              }));
              console.log("MARKS DEBUG: Setting subjects from profile:", subjectsList.map(s => s.name).join(", "));
              setSubjects(subjectsList);
            } else {
              console.log("MARKS DEBUG: No subjects found in profile");
            }
          } else {
            console.log("MARKS DEBUG: Profile document does not exist");
          }
        } else {
          console.log("MARKS DEBUG: No marksData found in multipleMarks");
        }
      } else {
        console.log("MARKS DEBUG: No multipleMarks document found, proceeding with fallback logic");
        // Get current term and assume grade 12 if not specified in user data
        let userGrade = 12;
        const currentTerm = getCurrentTerm();
        setNewTermNumber(currentTerm);
        
        // Get user profile to load subjects
        const profileRef = doc(db, 'profiles', user.uid);
        const profileSnapshot = await getDoc(profileRef);
        
        if (profileSnapshot.exists()) {
          const profileData = profileSnapshot.data();
          console.log("MARKS DEBUG: Profile data:", JSON.stringify({
            hasSubjects: !!profileData.subjects,
            subjectKeys: Object.keys(profileData.subjects || {}),
            hasMarks: !!profileData.marks,
            markKeys: Object.keys(profileData.marks || {})
          }));
          
          // Get user's grade from users collection if available
          const userRef = doc(db, 'users', user.uid);
          const userSnapshot = await getDoc(userRef);
          
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            if (userData.grade) {
              userGrade = parseInt(userData.grade);
              setNewGrade(userGrade);
              console.log(`MARKS DEBUG: User grade from users collection: ${userGrade}`);
            }
          }
          
          // Load subjects from profile
          if (profileData.subjects) {
            const subjectEntries = Object.entries(profileData.subjects);
            console.log(`MARKS DEBUG: Found ${subjectEntries.length} subjects in profile`);
            
            const subjectsList = subjectEntries.map(([key, value], index) => ({
              id: index + 1,
              name: value,
              key: key // Store the original key (e.g., 'subject1') to maintain order
            }));
            
            console.log("MARKS DEBUG: Setting subjects:", subjectsList.map(s => s.name).join(", "));
            setSubjects(subjectsList);
            
            // Create a term for the current grade and term
            const termId = 1;
            const termName = generateTermName(userGrade, currentTerm);
            console.log(`MARKS DEBUG: Creating term: ${termName}`);
            setTerms([{ id: termId, name: termName, grade: userGrade, termNumber: currentTerm }]);
            
            // Initialize marks data structure
            const initialMarksData = {};
            subjectsList.forEach(subject => {
              // If marks exist in profile, use those values
              const markKey = `mark${parseInt(subject.key.replace('subject', ''))}`;
              const markValue = profileData.marks && profileData.marks[markKey] ? 
                                parseInt(profileData.marks[markKey]) : null;
              
              initialMarksData[subject.id] = { [termId]: markValue };
            });
            
            console.log(`MARKS DEBUG: Setting initial marksData with ${Object.keys(initialMarksData).length} subjects`);
            setMarksData(initialMarksData);
          } else {
            console.log("MARKS DEBUG: No subjects found in profile");
          }
        } else {
          console.log("MARKS DEBUG: Profile document does not exist");
        }
      }
    } catch (error) {
      console.error('MARKS DEBUG ERROR:', error);
      Alert.alert('Error', 'Failed to load your data. Please try again.');
    } finally {
      console.log(`MARKS DEBUG: Finished loading. Subjects: ${subjects.length}, Terms: ${terms.length}`);
      setIsLoading(false);
    }
  };

  // Function to generate term name based on grade and term number
  const generateTermName = (grade, termNumber) => {
    return `Gr${grade}\nTerm ${termNumber}`;
  };

  // Handle adding a new term
  const addTerm = () => {
    // Check if this term already exists
    const exists = terms.some(t => t.grade === newGrade && t.termNumber === newTermNumber);
    if (exists) {
      Alert.alert('Term exists', 'This term already exists in your table.');
      return;
    }

    // Check if the term is adjacent to existing terms
    if (!isTermAdjacent()) {
      Alert.alert(
        'Invalid Term', 
        'You can only add terms that are adjacent to existing terms. For example, after Grade 10 Term 4, you can add Grade 11 Term 1.'
      );
      return;
    }

    const newTermId = terms.length > 0 ? Math.max(...terms.map(t => t.id)) + 1 : 1;
    const newTermName = generateTermName(newGrade, newTermNumber);
    
    setTerms([...terms, { id: newTermId, name: newTermName, grade: newGrade, termNumber: newTermNumber }]);
    
    // Initialize marks for the new term for all subjects
    const updatedMarksData = { ...marksData };
    subjects.forEach(subject => {
      updatedMarksData[subject.id] = {
        ...updatedMarksData[subject.id],
        [newTermId]: null
      };
    });
    setMarksData(updatedMarksData);
  };

  // Determine if a term is on the edge (earliest or latest)
  const isTermOnEdge = (termId) => {
    if (terms.length <= 1) return true; // If there's only one term, it's on the edge
    
    // Sort terms by grade and term
    const sortedTerms = [...terms].sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      return a.termNumber - b.termNumber;
    });
    
    // Get the term we're checking
    const termToCheck = terms.find(t => t.id === termId);
    if (!termToCheck) return false;
    
    // Find its position in the sorted array
    const index = sortedTerms.findIndex(t => 
      t.grade === termToCheck.grade && t.termNumber === termToCheck.termNumber
    );
    
    // It's on the edge if it's the first or last term
    return index === 0 || index === sortedTerms.length - 1;
  };

  // Handle removing a term
  const removeTerm = (termId) => {
    // Check if term is on the edge
    if (!isTermOnEdge(termId)) {
      Alert.alert(
        "Cannot Remove Term", 
        "You can only remove terms at the beginning or end of your academic timeline."
      );
      return;
    }
    
    setTerms(terms.filter(term => term.id !== termId));
    
    // Remove the term's marks from all subjects
    const updatedMarksData = { ...marksData };
    Object.keys(updatedMarksData).forEach(subjectId => {
      const subjectMarks = { ...updatedMarksData[subjectId] };
      delete subjectMarks[termId];
      updatedMarksData[subjectId] = subjectMarks;
    });
    setMarksData(updatedMarksData);
  };

  // Handle mark input change
  const handleMarkChange = (subjectId, termId, value) => {
    // Ensure the value is between 0 and 100
    let parsedValue = parseInt(value);
    if (isNaN(parsedValue)) parsedValue = null;
    if (parsedValue < 0) parsedValue = 0;
    if (parsedValue > 100) parsedValue = 100;
    
    setMarksData({
      ...marksData,
      [subjectId]: {
        ...marksData[subjectId],
        [termId]: parsedValue
      }
    });
  };

  // Prepare data for the chart
  const prepareChartData = () => {
    if (terms.length === 0 || subjects.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Sort terms by grade and term number
    const sortedTerms = [...terms].sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      return a.termNumber - b.termNumber;
    });

    const labels = sortedTerms.map(term => `G${term.grade}T${term.termNumber}`);
    const datasets = subjects.map((subject, index) => {
      const data = sortedTerms.map(term => {
        const mark = marksData[subject.id]?.[term.id];
        return mark !== null && mark !== undefined ? mark : 0;
      });

      return {
        data,
        color: () => colorPalette[index % colorPalette.length],
        strokeWidth: 2
      };
    });

    return {
      labels,
      datasets
    };
  };

  const chartData = prepareChartData();

  // Save marks to backend
  const saveMarks = async () => {
    if (!user) {
      Alert.alert("Not Signed In", "Please sign in to save your data to your profile.");
      return;
    }

    try {
      setIsLoading(true);
      
      // 1. Determine the most recent term (highest grade, and within grade, highest term)
      const latestTerm = [...terms].sort((a, b) => {
        if (a.grade !== b.grade) return b.grade - a.grade; // Higher grade first
        return b.termNumber - a.termNumber; // Higher term number first
      })[0];

      if (!latestTerm) {
        Alert.alert("Error", "No terms found to save.");
        setIsLoading(false);
        return;
      }
      
      console.log(`Using latest term: Grade ${latestTerm.grade}, Term ${latestTerm.termNumber} for profile marks`);
      
      // 2. Create data structures for profile update
      const profileMarksData = {};
      const profileSubjectsData = {};
      
      // 3. Prepare profile data using only the latest term's marks
      subjects.forEach((subject, index) => {
        // Use the original subject key if available, or generate one
        const subjectKey = subject.key || `subject${index + 1}`;
        // Corresponding mark key based on subject key
        const markKey = `mark${parseInt(subjectKey.replace('subject', ''))}`;
        
        // Save subject name to profile subjects
        profileSubjectsData[subjectKey] = subject.name;
        
        // Get the mark from the latest term for this subject
        const latestMark = marksData[subject.id]?.[latestTerm.id];
        profileMarksData[markKey] = latestMark !== null && latestMark !== undefined 
          ? latestMark.toString() 
          : "0";
      });

      // 4. Prepare complete data for multipleMarks collection
      const multipleMarksData = {
        userId: user.uid,
        terms: terms,
        marksData: marksData,
        updatedAt: new Date().toISOString()
      };
      
      // 5. Execute database operations
      // First, update the profile with latest marks
      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, {
        subjects: profileSubjectsData,
        marks: profileMarksData,
        savedAt: new Date().toISOString()
      });
      console.log("Saved latest marks to profile document");
      
      // Then, save/update the multipleMarks document
      if (hasMultipleMarks) {
        // Update existing document
        const multipleMarksQuery = query(
          collection(db, 'multipleMarks'),
          where('userId', '==', user.uid)
        );
        
        const multipleMarksSnapshot = await getDocs(multipleMarksQuery);
        if (!multipleMarksSnapshot.empty) {
          const docRef = multipleMarksSnapshot.docs[0].ref;
          await updateDoc(docRef, multipleMarksData);
          console.log("Updated existing multipleMarks document");
        } else {
          // Handle case where hasMultipleMarks is true but document not found
          await setDoc(doc(collection(db, 'multipleMarks')), multipleMarksData);
          console.log("Created new multipleMarks document despite hasMultipleMarks=true");
        }
      } else {
        // Create new document
        await setDoc(doc(collection(db, 'multipleMarks')), multipleMarksData);
        setHasMultipleMarks(true);
        console.log("Created new multipleMarks document");
      }
      
      Alert.alert('Success', 'Your marks have been saved successfully to both your profile and your academic history.');
    } catch (error) {
      console.error('Error saving marks:', error);
      Alert.alert('Error', 'There was a problem saving your data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Sign in Required</Title>
            <Paragraph style={styles.subtitle}>You need to be signed in to view your marks.</Paragraph>
            <Button
              mode="contained"
              style={styles.button}
              onPress={handleBack}
            >
              Go Back
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }
  
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Title>Loading your marks...</Title>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Academic Marks</Text>
          </View>
          
          {/* Term Selection Controls */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Add a Term</Title>
              <View style={styles.formRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Grade:</Text>
                  <View style={styles.pickerContainer}>
                    {[8, 9, 10, 11, 12].map(grade => (
                      <TouchableOpacity
                        key={grade}
                        style={[
                          styles.pickerItem,
                          newGrade === grade && styles.pickerItemSelected
                        ]}
                        onPress={() => setNewGrade(grade)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          newGrade === grade && styles.pickerItemTextSelected
                        ]}>
                          {grade}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Term:</Text>
                  <View style={styles.pickerContainer}>
                    {[1, 2, 3, 4].map(term => (
                      <TouchableOpacity
                        key={term}
                        style={[
                          styles.pickerItem,
                          newTermNumber === term && styles.pickerItemSelected
                        ]}
                        onPress={() => setNewTermNumber(term)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          newTermNumber === term && styles.pickerItemTextSelected
                        ]}>
                          {term}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              
              <Button
                mode="contained"
                onPress={addTerm}
                style={getAddTermButtonStyle()}
                disabled={!isTermAdjacent() || terms.some(t => t.grade === newGrade && t.termNumber === newTermNumber)}
              >
                Add Term
              </Button>
            </Card.Content>
          </Card>
          
          {/* Marks Table */}
          {subjects.length > 0 && terms.length > 0 ? (
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Enter Your Marks</Title>
                <ScrollView horizontal>
                  <View>
                    {/* Table Header */}
                    <View style={styles.tableRow}>
                      <View style={[styles.tableCell, styles.subjectCell]}>
                        <Text style={styles.tableCellText}>Subject</Text>
                      </View>
                      {/* Sort terms by grade and term number for display */}
                      {[...terms].sort((a, b) => {
                        if (a.grade !== b.grade) return a.grade - b.grade;
                        return a.termNumber - b.termNumber;
                      }).map(term => (
                        <View key={term.id} style={styles.tableCell}>
                          <Text style={styles.tableCellText}>{term.name.replace('\n', ' ')}</Text>
                          {isTermOnEdge(term.id) && (
                            <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() => removeTerm(term.id)}
                            >
                              <Ionicons name="close-circle" size={16} color="red" />
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                    
                    {/* Table Rows */}
                    {subjects.map(subject => (
                      <View key={subject.id} style={styles.tableRow}>
                        <View style={[styles.tableCell, styles.subjectCell]}>
                          <Text style={styles.tableCellText}>{subject.name}</Text>
                        </View>
                        {/* Sort terms by grade and term number for display */}
                        {[...terms].sort((a, b) => {
                          if (a.grade !== b.grade) return a.grade - b.grade;
                          return a.termNumber - b.termNumber;
                        }).map(term => (
                          <View key={term.id} style={styles.tableCell}>
                            <TextInput
                              style={styles.markInput}
                              keyboardType="numeric"
                              value={marksData[subject.id]?.[term.id]?.toString() || ''}
                              onChangeText={(text) => handleMarkChange(subject.id, term.id, text)}
                              placeholder="0-100"
                              maxLength={3}
                            />
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                </ScrollView>
                <Button
                  mode="contained"
                  onPress={saveMarks}
                  style={styles.saveButton}
                >
                  Save Marks
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <Card style={styles.card}>
              <Card.Content>
                <Paragraph style={styles.emptyText}>
                  {subjects.length === 0 ? 
                    "No subjects found. Please complete your profile with subject choices first." : 
                    "Add at least one term to start tracking your marks."}
                </Paragraph>
              </Card.Content>
            </Card>
          )}
          
          {/* Chart */}
          {subjects.length > 0 && terms.length > 0 ? (
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.cardTitle}>Performance Trends</Title>
                <ScrollView horizontal>
                  <LineChart
                    data={chartData}
                    width={Math.max(screenWidth, terms.length * 80)}
                    height={220}
                    chartConfig={{
                      backgroundColor: '#ffffff',
                      backgroundGradientFrom: '#ffffff',
                      backgroundGradientTo: '#ffffff',
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      style: {
                        borderRadius: 16,
                      },
                      propsForDots: {
                        r: '6',
                        strokeWidth: '2',
                      }
                    }}
                    bezier
                    style={styles.chart}
                  />
                </ScrollView>
                <View style={styles.legend}>
                  {subjects.map((subject, index) => (
                    <View key={subject.id} style={styles.legendItem}>
                      <View 
                        style={[
                          styles.legendColor, 
                          { backgroundColor: colorPalette[index % colorPalette.length] }
                        ]} 
                      />
                      <Text style={styles.legendText}>{subject.name}</Text>
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: theme.colors.primary,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
    borderRadius: theme.borderRadius.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginVertical: 8,
  },
  formRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  formGroup: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
  },
  pickerItem: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  pickerItemSelected: {
    backgroundColor: theme.colors.primary,
  },
  pickerItemText: {
    color: '#333',
  },
  pickerItemTextSelected: {
    color: 'white',
  },
  addButton: {
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableCell: {
    width: 80,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  subjectCell: {
    width: 120,
    alignItems: 'flex-start',
  },
  tableCellText: {
    fontSize: 14,
  },
  markInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 6,
    width: 60,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    padding: 20,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  }
}); 