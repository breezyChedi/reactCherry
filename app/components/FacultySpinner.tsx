import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, Platform, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Faculty, Degree } from '../types';
import { fetchDegrees } from '../services/neo4jService';

interface FacultySpinnerProps {
  faculties: Faculty[];
  filterByEligibility: boolean;
  onDegreesLoaded?: (degrees: Degree[]) => void;
}

const FacultySpinner: React.FC<FacultySpinnerProps> = ({
  faculties,
  filterByEligibility,
  onDegreesLoaded,
}) => {
  const [selectedFacultyId, setSelectedFacultyId] = useState<number | string>("");
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  
  // Find the currently selected faculty name
  const selectedFaculty = faculties.find(f => f.id === selectedFacultyId);
  const selectedFacultyName = selectedFaculty ? selectedFaculty.name : '';

  // Log faculties whenever they change
  useEffect(() => {
    console.log('FacultySpinner - Received faculties:', {
      count: faculties.length,
      faculties: faculties.map(f => ({ id: f.id, name: f.name }))
    });
  }, [faculties]);

  const loadDegrees = useCallback(async (facultyId: number | string) => {
    console.log('FacultySpinner - Loading degrees for faculty ID:', facultyId);
    if (facultyId === "" || facultyId === null) {
      console.log('FacultySpinner - No faculty selected, clearing degrees');
      onDegreesLoaded?.([]);
      return;
    }

    setLoading(true);
    try {
      const degrees = await fetchDegrees(Number(facultyId));
      console.log('FacultySpinner - Loaded degrees:', {
        facultyId,
        count: degrees.length
      });
      onDegreesLoaded?.(degrees);
    } catch (error) {
      console.error('FacultySpinner - Error fetching degrees:', error);
      onDegreesLoaded?.([]);
    } finally {
      setLoading(false);
    }
  }, [onDegreesLoaded]);

  useEffect(() => {
    loadDegrees(selectedFacultyId);
  }, [selectedFacultyId, loadDegrees]);

  const handleValueChange = (value: number | string) => {
    console.log('FacultySpinner - Value changed:', {
      rawValue: value,
      currentSelectedId: selectedFacultyId
    });
    
    if (value !== selectedFacultyId) {
      console.log('FacultySpinner - Setting new faculty ID:', value);
      setSelectedFacultyId(value);
    }
  };

  // If no faculties available, show a message
  if (!faculties || faculties.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.pickerContainer}>
          {Platform.OS === 'ios' ? (
            <TouchableOpacity 
              style={styles.pickerTouchable}
              disabled={true}
            >
              <Text style={styles.pickerText}>Please select a university above</Text>
            </TouchableOpacity>
          ) : (
            <Picker
              enabled={false}
              selectedValue=""
              style={styles.picker}
              dropdownIconColor="#666"
            >
              <Picker.Item 
                label="Please select a university above" 
                value="" 
                color="#666"
              />
            </Picker>
          )}
        </View>
      </View>
    );
  }

  // iOS specific picker
  if (Platform.OS === 'ios') {
    return (
      <View style={styles.container}>
        <View style={styles.pickerContainer}>
          <TouchableOpacity 
            style={styles.pickerTouchable}
            onPress={() => setShowPicker(true)}
            disabled={loading || faculties.length === 0}
          >
            <Text style={styles.pickerText}>
              {selectedFacultyName || 'Select a faculty'}
            </Text>
          </TouchableOpacity>
          
          <Modal
            visible={showPicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text style={styles.modalButton}>Done</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  selectedValue={selectedFacultyId}
                  onValueChange={(value) => {
                    handleValueChange(value);
                    setShowPicker(false);
                  }}
                  style={styles.iosPicker}
                >
                  <Picker.Item label="Select a faculty" value="" color="#666" />
                  {faculties.map((faculty) => (
                    <Picker.Item 
                      key={`faculty-${faculty.id || Math.random().toString()}`}
                      label={faculty.name || 'Unknown Faculty'} 
                      value={faculty.id || ""}
                      color="#000" 
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    );
  }

  // Android picker
  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedFacultyId}
          onValueChange={handleValueChange}
          style={styles.picker}
          enabled={!loading && faculties.length > 0}
          dropdownIconColor="#000"
          mode="dropdown"
        >
          <Picker.Item label="Select a faculty" value="" color="#666" />
          {faculties.map((faculty) => (
            <Picker.Item 
              key={`faculty-${faculty.id || Math.random().toString()}`}
              label={faculty.name || 'Unknown Faculty'} 
              value={faculty.id || ""} 
              color="#000"
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    width: width - 32, // Full width minus padding
    marginHorizontal: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    height: 50,
    justifyContent: 'center',
  },
  pickerTouchable: {
    padding: 12,
    height: 50,
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#000',
  },
  picker: {
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    padding: 15,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalButton: {
    color: '#e300f3',
    fontSize: 16,
    fontWeight: '600',
  },
  iosPicker: {
    height: 200,
  },
});

export default FacultySpinner; 