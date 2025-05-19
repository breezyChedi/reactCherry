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
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { theme } from './theme';
import { useAuth } from './context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Color palette for the graph lines
const colorPalette = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#8AC926', '#1982C4', '#6A4C93', '#F94144'
];

interface MarksScreenProps {
  onBack?: () => void;
}

export default function MarksScreen({ onBack }: MarksScreenProps) {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [newSubject, setNewSubject] = useState('');
  const [newGrade, setNewGrade] = useState(12);
  const [newTermNumber, setNewTermNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const screenWidth = Dimensions.get('window').width - 32; // -32 for padding

  useEffect(() => {
    // Load data when user object is available
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Initialize terms - this would also come from Firebase in a full implementation
      setTerms([]);
      
      // Get subjects from user profile if available
      if (user && user.profile) {
        const userSubjects = [];
        
        // Handle different possible structures in user profile
        if (user.profile.subjects && Array.isArray(user.profile.subjects)) {
          // If subjects is an array of strings
          userSubjects.push(...user.profile.subjects.map((subjectName, index) => ({
            id: index + 1,
            name: subjectName
          })));
        } else if (user.profile.subjects && typeof user.profile.subjects === 'object') {
          // If subjects is an object with key-value pairs
          Object.entries(user.profile.subjects).forEach(([key, value], index) => {
            if (key !== 'homeLanguage' && key !== 'additionalLanguage' && key !== 'mathematics' && 
                !key.startsWith('subject') && value) {
              userSubjects.push({
                id: index + 1,
                name: value
              });
            } else if ((key === 'homeLanguage' || key === 'additionalLanguage' || key === 'mathematics' || 
                      key.startsWith('subject')) && value) {
              userSubjects.push({
                id: index + 1,
                name: value.toString()
              });
            }
          });
        } else {
          // Legacy format used in signup flow
          const subjectFields = ['homeLanguage', 'additionalLanguage', 'mathematics', 'subject4', 'subject5', 'subject6'];
          
          subjectFields.forEach((fieldName, index) => {
            if (user.profile[fieldName]) {
              userSubjects.push({
                id: index + 1,
                name: user.profile[fieldName]
              });
            }
          });
        }
        
        setSubjects(userSubjects);
        
        // Initialize marks data structure
        const initialMarksData = {};
        userSubjects.forEach(subject => {
          initialMarksData[subject.id] = {};
        });
        
        // Load any existing terms and marks from the user's profile
        if (user.profile.marksData) {
          const storedTerms = new Set();
          const newTerms = [];
          
          // Extract terms from keys (format: subjectName_grX_termY)
          Object.keys(user.profile.marksData).forEach(key => {
            const parts = key.split('_');
            if (parts.length >= 3) {
              const gradeMatch = parts[parts.length - 2].match(/gr(\d+)/);
              const termMatch = parts[parts.length - 1].match(/term(\d+)/);
              
              if (gradeMatch && termMatch) {
                const grade = parseInt(gradeMatch[1]);
                const termNumber = parseInt(termMatch[1]);
                const termKey = `gr${grade}_term${termNumber}`;
                
                // Add term if we haven't seen it before
                if (!storedTerms.has(termKey)) {
                  storedTerms.add(termKey);
                  
                  const termId = newTerms.length + 1;
                  newTerms.push({
                    id: termId,
                    name: generateTermName(grade, termNumber),
                    grade,
                    termNumber
                  });
                }
              }
            }
          });
          
          // Set the loaded terms
          if (newTerms.length > 0) {
            setTerms(newTerms);
            
            // Update initialMarksData with the terms
            userSubjects.forEach(subject => {
              newTerms.forEach(term => {
                const key = `${subject.name}_gr${term.grade}_term${term.termNumber}`;
                const mark = user.profile.marksData[key];
                
                initialMarksData[subject.id][term.id] = mark !== undefined ? mark : null;
              });
            });
          }
        }
        
        setMarksData(initialMarksData);
      } else {
        setSubjects([]);
        setMarksData({});
      }
    } catch (error) {
      console.error('Error loading subject data:', error);
      Alert.alert('Error', 'Failed to load your subjects. Please try again.');
    } finally {
      setLoading(false);
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

  // Handle adding a new subject
  const addSubject = () => {
    if (!newSubject.trim()) return;
    
    const newSubjectId = subjects.length > 0 
      ? Math.max(...subjects.map(s => s.id)) + 1 
      : 1;
    
    setSubjects([...subjects, { id: newSubjectId, name: newSubject }]);
    
    // Initialize marks for the new subject for all terms
    const subjectMarks = {};
    terms.forEach(term => {
      subjectMarks[term.id] = null;
    });
    
    setMarksData({
      ...marksData,
      [newSubjectId]: subjectMarks
    });
    
    setNewSubject('');
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

  // Handle removing a subject
  const removeSubject = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    
    Alert.alert(
      'Remove Subject',
      `Are you sure you want to remove ${subject ? subject.name : 'this subject'} from your marks tracking? This will not remove it from your profile.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSubjects(subjects.filter(subject => subject.id !== subjectId));
            
            // Remove the subject's marks data
            const updatedMarksData = { ...marksData };
            delete updatedMarksData[subjectId];
            setMarksData(updatedMarksData);
          }
        }
      ]
    );
  };

  // Handle removing a term
  const removeTerm = (termId) => {
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

  // Save marks to backend (would be implemented in a real app)
  const saveMarks = async () => {
    try {
      setSaving(true);
      
      if (!user) {
        Alert.alert('Error', 'You must be signed in to save marks.');
        return;
      }

      // Format the marks data for storage
      const formattedMarks = {};
      subjects.forEach(subject => {
        Object.entries(marksData[subject.id] || {}).forEach(([termId, mark]) => {
          const term = terms.find(t => t.id === parseInt(termId));
          if (term && mark !== null) {
            const key = `${subject.name}_gr${term.grade}_term${term.termNumber}`;
            formattedMarks[key] = mark;
          }
        });
      });

      // Update the user's profile in Firestore
      const userDocRef = doc(db, 'profiles', user.uid);
      await updateDoc(userDocRef, {
        'marksData': formattedMarks
      });

      Alert.alert('Success', 'Your marks have been saved successfully.');
    } catch (error) {
      console.error('Error saving marks:', error);
      Alert.alert('Error', 'Failed to save your marks. Please try again.');
    } finally {
      setSaving(false);
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
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading your subjects and marks...</Text>
            </View>
          ) : (
            <>
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
                    style={styles.addButton}
                  >
                    Add Term
                  </Button>
                </Card.Content>
              </Card>
              
              {/* Add Subject */}
              <Card style={styles.card}>
                <Card.Content>
                  <Title style={styles.cardTitle}>Add a Subject</Title>
                  <Paragraph style={styles.subtitle}>
                    Your registered subjects are loaded from your profile. You can add additional subjects here.
                  </Paragraph>
                  <View style={styles.addSubjectContainer}>
                    <TextInput
                      style={styles.input}
                      value={newSubject}
                      onChangeText={setNewSubject}
                      placeholder="Enter subject name"
                      placeholderTextColor="#999"
                    />
                    <Button
                      mode="contained"
                      onPress={addSubject}
                      style={styles.addButton}
                      disabled={!newSubject.trim()}
                    >
                      Add Subject
                    </Button>
                  </View>
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
                          {terms.map(term => (
                            <View key={term.id} style={styles.tableCell}>
                              <Text style={styles.tableCellText}>{term.name.replace('\n', ' ')}</Text>
                              <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeTerm(term.id)}
                              >
                                <Ionicons name="close-circle" size={16} color="red" />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                        
                        {/* Table Rows */}
                        {subjects.map(subject => (
                          <View key={subject.id} style={styles.tableRow}>
                            <View style={[styles.tableCell, styles.subjectCell]}>
                              <Text style={styles.tableCellText}>{subject.name}</Text>
                              <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => removeSubject(subject.id)}
                              >
                                <Ionicons name="close-circle" size={16} color="red" />
                              </TouchableOpacity>
                            </View>
                            {terms.map(term => (
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
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Marks'}
                    </Button>
                    {saving && (
                      <View style={styles.savingContainer}>
                        <ActivityIndicator 
                          size="small" 
                          color={theme.colors.primary} 
                        />
                        <Text style={styles.savingText}>Saving your marks...</Text>
                      </View>
                    )}
                  </Card.Content>
                </Card>
              ) : (
                <Card style={styles.card}>
                  <Card.Content>
                    {subjects.length === 0 ? (
                      <View>
                        <Paragraph style={styles.emptyText}>
                          No subjects found in your profile.
                        </Paragraph>
                        <Paragraph style={styles.emptyText}>
                          Please add subjects to your profile or use the form above to add subjects for marks tracking.
                        </Paragraph>
                      </View>
                    ) : (
                      <Paragraph style={styles.emptyText}>
                        Add at least one term to start tracking your marks.
                      </Paragraph>
                    )}
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
            </>
          )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
  addSubjectContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
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
  },
  loadingContainer: {
    padding: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  savingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  }
}); 