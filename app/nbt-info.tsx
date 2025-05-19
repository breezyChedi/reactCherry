import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Text } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from './theme';

interface NbtInfoScreenProps {
  onBack?: () => void;
}

export default function NbtInfoScreen({ onBack }: NbtInfoScreenProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/cherry-icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.projectTitle}>National Benchmark Tests Project</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Paragraph style={styles.cardText}>
              The National Benchmark Test is a test used by first year applicants to assess their quantitative literacy and mathematics proficiency at entry level. The Placement (CETAP) on behalf of Universities South Africa (USAf). NBT assesses the relationship between high education entry level professions and school level exit outcomes.
              {'\n\n'}
              There are 2 tests that candidates write:
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Academic Literacy Test (AL)</Title>
            <Paragraph style={styles.cardText}>
              The Academic Literacy Test is a 3 hour exam in which students will be tested on their capacity to engage successfully with the demands of academic study in the medium of instruction provided.
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>The Quantitative Literacy Test (QL)</Title>
            <Paragraph style={styles.cardText}>
              The Quantitative Literacy Test is a 3 hour exam in which students will be tested on their ability to manage situations and solve problems in real contexts relevant to higher education study.
              {'\n\n'}
              The basic quantitative information may be presented verbally graphically, in tabular or symbolic form.
            </Paragraph>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Paragraph style={styles.cardText}>
              For more information on NBT tests, please visit the official NBT website at https://nbt.ac.za
            </Paragraph>
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Book an NBT</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Email NBT</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Text style={styles.buttonText}>Call NBT</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000000',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    color: '#000000',
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.md,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 8,
    color: '#000000',
  },
  cardText: {
    fontSize: 14,
    color: '#000000',
  },
  buttonContainer: {
    padding: 16,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 