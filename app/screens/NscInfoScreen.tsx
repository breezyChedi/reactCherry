import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Image } from 'react-native';
import { Card, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';

interface NscInfoScreenProps {
  onBack?: () => void;
}

export default function NscInfoScreen({ onBack }: NscInfoScreenProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={28} color="black" />
        </TouchableOpacity>

        {/* Department of Education Logo and Intro */}
        <Card style={styles.card}>
          <Card.Content style={styles.headerContent}>
            <Image 
              source={require('../../assets/edu-logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.deptContainer}>
              <Text style={styles.deptTitle}>basic education</Text>
              <Text style={styles.deptSubtitle}>Department of Basic Education</Text>
              <Text style={styles.deptSubtitle}>REPUBLIC OF SOUTH AFRICA</Text>
            </View>
          </Card.Content>
          
          <Card.Content>
            <Text style={styles.introText}>
              The National Senior Certificate (NSC) examinations commonly referred to as "matric" has become an annual event of major public significance. It is not only signifies the culmination of twelve years of formal schooling but the NSC examinations is a barometer of the health of the education system.
            </Text>
            
            <Button 
              mode="contained" 
              style={styles.greenButton}
              labelStyle={styles.buttonLabel}
            >
              NQF - Level 4
            </Button>
          </Card.Content>
        </Card>

        {/* National Senior Certificate Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>National Senior Certificate</Text>
            <Text style={styles.normalText}>
              The University of Pretoria is a multi-campus public research university in Pretoria, the administrative and de facto capital of South Africa. The university was established in 1908 as the Pretoria campus of the Johannesburg-based Transvaal University College and is the fourth South African institution in continuous operation to be established.
            </Text>
            <Text style={[styles.normalText, {marginTop: 8}]}>
              The University of Pretoria is a multi-campus public research university in Pretoria, the administrative and de facto capital of South Africa. The university was established in 1908 as the Pretoria campus of the Johannesburg-based Transvaal University College and is the fourth South African institution in continuous operation to be established. It is rated the second-best university in the country by most rankings, after the University of Cape Town.
            </Text>
          </Card.Content>
        </Card>

        {/* Senior Certificate Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Senior Certificate</Text>
            <Text style={styles.normalText}>
              The University of Pretoria is a multi-campus public research university in Pretoria, the administrative and de facto capital of South Africa. The university was established in 1908 as the Pretoria campus of the Johannesburg-based Transvaal University College and is the fourth South African institution in continuous operation to be established. The university has grown from the original 32 students in a single late Victorian house to approximately 39,000 in 2010.
            </Text>
          </Card.Content>
        </Card>

        {/* Upgrade Matric Section */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Upgrade Matric</Text>
            <Text style={styles.normalText}>
              The University of Pretoria is a multi-campus public research university in Pretoria, the administrative and de facto capital of South Africa. The university was established in 1908 as the Pretoria campus of the Johannesburg-based Transvaal University College and is the fourth South African institution in continuous operation to be established. The university has grown from the original 32 students in a single late Victorian house to approximately 39,000 in 2010.
            </Text>
          </Card.Content>
        </Card>

        {/* Achievement Levels Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.certificateImageContainer}>
              <Image 
                source={require('../../assets/NBT-logo.png')} 
                style={styles.certificateImage}
                resizeMode="cover"
              />
            </View>
            
            {/* Achievement Levels Table */}
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, {flex: 1}]}>Achievement Level</Text>
                <Text style={[styles.tableHeaderText, {flex: 2}]}>Description of Competence</Text>
                <Text style={[styles.tableHeaderText, {flex: 1}]}>MARKS %</Text>
              </View>
              
              {[
                { level: '7', desc: 'Outstanding', marks: '100-80' },
                { level: '6', desc: 'Meritorious', marks: '79-70' },
                { level: '5', desc: 'Substantial', marks: '69-60' },
                { level: '4', desc: 'Adequate', marks: '59-50' },
                { level: '3', desc: 'Moderate', marks: '49-40' },
                { level: '2', desc: 'Elementary', marks: '30-39' },
                { level: '1', desc: 'Not Achieved', marks: '0-29' }
              ].map((item, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={[styles.tableCell, {flex: 1}]}>
                    <Text style={styles.levelText}>{item.level}</Text>
                  </View>
                  <View style={[styles.tableCell, {flex: 2}]}>
                    <Text style={styles.descText}>{item.desc}</Text>
                  </View>
                  <View style={[styles.tableCell, {flex: 1}]}>
                    <Text style={styles.marksText}>{item.marks}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
        
        {/* Promotion Requirements Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.promotionHeader}>
              <Text style={styles.promotionHeaderText}>Promotion Requirements</Text>
            </View>
            
            {/* NSC Pass */}
            <View style={styles.promotionContainer}>
              <Text style={styles.promotionTitle}>National Senior Certificate Pass</Text>
              <View style={styles.requirementsList}>
                <Text style={styles.requirementItem}>–English 40%</Text>
                <Text style={styles.requirementItem}>–2 Other Subjects 40%</Text>
                <Text style={styles.requirementItem}>–3 Other Subjects 30%</Text>
              </View>
              <Text style={styles.promotionDescription}>
                Student has achieved a NSC Pass in which they meet the minimum requirements for admission to High certificate study to higher education.
              </Text>
            </View>
            
            {/* Diploma Pass */}
            <View style={styles.promotionContainer}>
              <Text style={styles.promotionTitle}>Pass Entry to Diploma Study</Text>
              <View style={styles.requirementsList}>
                <Text style={styles.requirementItem}>–English 40%</Text>
                <Text style={styles.requirementItem}>–3 Other Subjects 40%</Text>
                <Text style={styles.requirementItem}>–2 Other Subjects 30%</Text>
              </View>
              <Text style={styles.promotionDescription}>
                Student has achieved a NSC Pass in which they meet the minimum requirements for admission to Diploma or High Certificate study to higher education.
              </Text>
              <Button 
                mode="contained" 
                style={styles.greenButton}
                labelStyle={styles.buttonLabel}
              >
                Apply for a Course
              </Button>
            </View>
            
            {/* Bachelor's Pass */}
            <View style={styles.promotionContainer}>
              <Text style={styles.promotionTitle}>Pass Entry to Bachelor's Study</Text>
              <View style={styles.requirementsList}>
                <Text style={styles.requirementItem}>–English 40%</Text>
                <Text style={styles.requirementItem}>–4 Other Subjects 50% (Excluding LO)</Text>
                <Text style={styles.requirementItem}>–2 Other Subjects 30%</Text>
              </View>
              <Text style={styles.promotionDescription}>
                Student has achieved a NSC Pass in which they meet the minimum requirements for admission to Bachelor Degree, Diploma or High Certificate study to higher education.
              </Text>
              <Button 
                mode="contained" 
                style={styles.greenButton}
                labelStyle={styles.buttonLabel}
              >
                Apply for a Course
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
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
  },
  backButton: {
    padding: 10,
    paddingTop: 5,
    zIndex: 10,
    marginBottom: 0,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 10,
  },
  deptContainer: {
    flex: 1,
  },
  deptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    textTransform: 'lowercase',
  },
  deptSubtitle: {
    fontSize: 10,
    color: '#000',
    marginTop: 2,
  },
  introText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#000',
    marginBottom: 16,
    textAlign: 'justify',
  },
  greenButton: {
    backgroundColor: '#007E33',
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  normalText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#000',
    textAlign: 'justify',
  },
  certificateImageContainer: {
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  certificateImage: {
    width: '100%',
    height: 180,
    borderRadius: 4,
  },
  tableContainer: {
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9A826',
    padding: 12,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tableCell: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  descText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  marksText: {
    fontSize: 14,
    color: '#000',
  },
  promotionHeader: {
    backgroundColor: '#F9A826',
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 4,
  },
  promotionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  promotionContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#027db4',
    paddingLeft: 8,
  },
  requirementsList: {
    marginBottom: 8,
    marginLeft: 10,
  },
  requirementItem: {
    fontSize: 14,
    color: '#027db4',
    marginBottom: 4,
    fontWeight: '500',
  },
  promotionDescription: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 6,
  },
}); 