import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// A simple test component to verify the app loads correctly
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cherry App</Text>
      <Text style={styles.text}>Loading screen - This is a test</Text>
    </View>
  );
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#FFF',
  },
}); 