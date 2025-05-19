import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Linking } from 'react-native';
import { Text, Card, Title, Paragraph } from 'react-native-paper';
import { theme } from '../theme';
import React, { useState } from 'react';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import NbtInfoScreen from '../screens/NbtInfoScreen';
import NscInfoScreen from '../screens/NscInfoScreen';
import AdmissionGuideScreen from '../screens/AdmissionGuideScreen';

// Define screens that we'll navigate to
interface InfoScreenProps {
  onBack?: () => void;
}

export default function Info() {
  const [currentScreen, setCurrentScreen] = useState('info');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Handle navigation for different screens
  if (currentScreen === 'nbt-info') {
    return <NbtInfoScreen onBack={() => setCurrentScreen('info')} />;
  }
  
  if (currentScreen === 'nsc-info') {
    return <NscInfoScreen onBack={() => setCurrentScreen('info')} />;
  }
  
  if (currentScreen === 'admission-guide') {
    return <AdmissionGuideScreen onBack={() => setCurrentScreen('info')} />;
  }

  // Handler for University Admission Guide
  const handleAdmissionGuidePress = () => {
    setCurrentScreen('admission-guide');
  };

  const handleNscPress = () => {
    setCurrentScreen('nsc-info');
  };

  const toggleFaq = (id: string) => {
    if (expandedFaq === id) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(id);
    }
  };

  const handleCallUs = async () => {
    const phoneNumber = '+27769022130';
    const phoneUrl = `tel:${phoneNumber}`;
    
    try {
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Unable to open phone app. Please dial +27 68 230 4410 manually.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong when trying to open your phone app.');
    }
  };

  const handleEmailUs = async () => {
    const email = 'info@cherry.org.za';
    const subject = 'Inquiry from Cherry App';
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    
    try {
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      } else {
        Alert.alert('Error', 'Unable to open email app. Please email us at info@cherry.org.za');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong when trying to open your email app.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Main Title */}
      <Text style={styles.sectionTitle}>Student Admissions</Text>
      
      {/* Student Admissions Cards Row */}
      <View style={styles.cardsRow}>
        <TouchableOpacity 
          style={styles.admissionCard}
          onPress={handleAdmissionGuidePress}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="search-outline" size={36} color="black" />
            </View>
            <Text style={styles.cardTitle}>University Admission Guide</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.admissionCard}
          onPress={handleNscPress}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Image 
                source={require('../../assets/coat.png')} 
                style={styles.cardIcon} 
                resizeMode="contain"
              />
            </View>
            <Text style={styles.cardTitle}>National Senior Certificate Requirements</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.admissionCard}
          onPress={() => setCurrentScreen('nbt-info')}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Image 
                source={require('../../assets/NBT-logo.png')} 
                style={styles.cardIcon} 
                resizeMode="contain"
              />
            </View>
            <Text style={styles.cardTitle}>National Benchmark Test</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* FAQ Section */}
      <Text style={styles.sectionTitle}>FAQ</Text>
      <Card style={styles.faqCard}>
        <Card.Content style={styles.faqContent}>
          {/* FAQ Item 1 */}
          <TouchableOpacity 
            style={styles.faqHeader} 
            onPress={() => toggleFaq('application')}
          >
            <Text style={styles.faqTitle}>When should I apply to university?</Text>
            <Ionicons 
              name={expandedFaq === 'application' ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color="black" 
            />
          </TouchableOpacity>
          {expandedFaq === 'application' && (
            <View style={styles.faqAnswer}>
              <Text style={styles.faqAnswerText}>
                Most universities open applications between March and September for the following academic year. Apply early as possible, especially for competitive programs. Late applications may be considered depending on space availability.
              </Text>
            </View>
          )}

          {/* FAQ Item 2 */}
          <TouchableOpacity 
            style={styles.faqHeader} 
            onPress={() => toggleFaq('accommodation')}
          >
            <Text style={styles.faqTitle}>How do I secure student accommodation?</Text>
            <Ionicons 
              name={expandedFaq === 'accommodation' ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color="black" 
            />
          </TouchableOpacity>
          {expandedFaq === 'accommodation' && (
            <View style={styles.faqAnswer}>
              <Text style={styles.faqAnswerText}>
                Apply for on-campus housing as soon as you receive your acceptance letter. Most universities have limited space in residences, so early application is essential. Alternatively, look for accredited off-campus accommodation or private student housing options.
              </Text>
            </View>
          )}

          {/* FAQ Item 3 */}
          <TouchableOpacity 
            style={styles.faqHeader} 
            onPress={() => toggleFaq('funding')}
          >
            <Text style={styles.faqTitle}>What funding options are available?</Text>
            <Ionicons 
              name={expandedFaq === 'funding' ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color="black" 
            />
          </TouchableOpacity>
          {expandedFaq === 'funding' && (
            <View style={styles.faqAnswer}>
              <Text style={styles.faqAnswerText}>
                Options include NSFAS (National Student Financial Aid Scheme), university merit scholarships, bursaries from private companies, and student loans from banks. Apply for NSFAS through the official website, and research bursary opportunities beginning in Grade 11.
              </Text>
            </View>
          )}

          {/* FAQ Item 4 */}
          <TouchableOpacity 
            style={styles.faqHeader} 
            onPress={() => toggleFaq('international')}
          >
            <Text style={styles.faqTitle}>Requirements for international students?</Text>
            <Ionicons 
              name={expandedFaq === 'international' ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color="black" 
            />
          </TouchableOpacity>
          {expandedFaq === 'international' && (
            <View style={styles.faqAnswer}>
              <Text style={styles.faqAnswerText}>
                International students need a valid study visa, proof of medical insurance, and foreign qualification evaluation by SAQA (South African Qualifications Authority). Additional requirements may include English proficiency tests and financial guarantees.
              </Text>
            </View>
          )}

          {/* FAQ Item 5 */}
          <TouchableOpacity 
            style={[styles.faqHeader, styles.lastItem]} 
            onPress={() => toggleFaq('transition')}
          >
            <Text style={styles.faqTitle}>How to prepare for university transition?</Text>
            <Ionicons 
              name={expandedFaq === 'transition' ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color="black" 
            />
          </TouchableOpacity>
          {expandedFaq === 'transition' && (
            <View style={styles.faqAnswer}>
              <Text style={styles.faqAnswerText}>
                Attend university orientation programs, connect with current students, develop independent study habits, learn basic life skills (cooking, budgeting, laundry), and familiarize yourself with campus resources like libraries, tutoring centers, and counseling services before classes begin.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Need more information section */}
      <Text style={styles.sectionTitle}>Need more information?</Text>
      <Card style={styles.contactCard}>
        <Card.Content>
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={handleCallUs}
          >
            <FontAwesome5 name="phone" size={24} color="black" />
            <Text style={styles.contactText}>Call us</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.contactItem, styles.lastItem]}
            onPress={handleEmailUs}
          >
            <FontAwesome5 name="envelope" size={24} color="black" />
            <Text style={styles.contactText}>Send us an Email</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.primary,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
    color: '#000',
    paddingLeft: 5,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 5,
    marginBottom: 10,
  },
  admissionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    width: '30%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 15,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    padding: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    width: 50,
    height: 50,
  },
  cardTitle: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
    color: '#000',
    lineHeight: 14,
  },
  faqCard: {
    marginBottom: 20,
    elevation: 4,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  faqContent: {
    padding: 0,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
    paddingRight: 10,
  },
  faqAnswer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  contactCard: {
    marginBottom: 20,
    elevation: 4,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 20,
  },
  contactText: {
    marginLeft: 20,
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
}); 