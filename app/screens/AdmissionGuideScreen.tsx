import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AdmissionGuideScreenProps {
  onBack: () => void;
}

const AdmissionGuideScreen: React.FC<AdmissionGuideScreenProps> = ({ onBack }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null); // Collapse if already expanded
    } else {
      setExpandedSection(section); // Expand this section
    }
  };

  // Simple Accordion component
  const AccordionItem = ({ title, id, children }: { title: string, id: string, children: React.ReactNode }) => (
    <View style={styles.accordionContainer}>
      <TouchableOpacity 
        style={styles.accordionHeader} 
        onPress={() => toggleSection(id)}
        activeOpacity={0.7}
      >
        <Text style={styles.accordionTitle}>{title}</Text>
        <Ionicons 
          name={expandedSection === id ? 'chevron-up' : 'chevron-down'} 
          size={24} 
          color="black" 
        />
      </TouchableOpacity>
      {expandedSection === id && (
        <View style={styles.accordionContent}>
          {children}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>University Admission Guide</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <AccordionItem title="Admission Points Score (APS)" id="aps">
          <Text style={styles.sectionDescription}>
            Standard point calculation system used by most universities, applies to top 6 subjects excluding Life Orientation. Maximum: 42
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableHeader, styles.tableCell]}>Percentage</Text>
              <Text style={[styles.tableHeader, styles.tableCell]}>Symbol</Text>
              <Text style={[styles.tableHeader, styles.tableCell]}>APS Points</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>80-100%</Text>
              <Text style={styles.tableCell}>A</Text>
              <Text style={styles.tableCell}>7</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>70-79%</Text>
              <Text style={styles.tableCell}>B</Text>
              <Text style={styles.tableCell}>6</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>60-69%</Text>
              <Text style={styles.tableCell}>C</Text>
              <Text style={styles.tableCell}>5</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>50-59%</Text>
              <Text style={styles.tableCell}>D</Text>
              <Text style={styles.tableCell}>4</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>40-49%</Text>
              <Text style={styles.tableCell}>E</Text>
              <Text style={styles.tableCell}>3</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>30-39%</Text>
              <Text style={styles.tableCell}>F</Text>
              <Text style={styles.tableCell}>2</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>0-29%</Text>
              <Text style={styles.tableCell}>G</Text>
              <Text style={styles.tableCell}>1</Text>
            </View>
          </View>
        </AccordionItem>

        <AccordionItem title="North-West University Points" id="nwu">
          <Text style={styles.sectionDescription}>
            North-West University points applies to top 6 subjects excluding Life Orientation. Maximum: 48
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableHeader, styles.tableCell]}>Percentage</Text>
              <Text style={[styles.tableHeader, styles.tableCell]}>Symbol</Text>
              <Text style={[styles.tableHeader, styles.tableCell]}>APS Points</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>90-100%</Text>
              <Text style={styles.tableCell}>A+</Text>
              <Text style={styles.tableCell}>8</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>80-100%</Text>
              <Text style={styles.tableCell}>A</Text>
              <Text style={styles.tableCell}>7</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>70-79%</Text>
              <Text style={styles.tableCell}>B</Text>
              <Text style={styles.tableCell}>6</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>60-69%</Text>
              <Text style={styles.tableCell}>C</Text>
              <Text style={styles.tableCell}>5</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>50-59%</Text>
              <Text style={styles.tableCell}>D</Text>
              <Text style={styles.tableCell}>4</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>40-49%</Text>
              <Text style={styles.tableCell}>E</Text>
              <Text style={styles.tableCell}>3</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>30-39%</Text>
              <Text style={styles.tableCell}>F</Text>
              <Text style={styles.tableCell}>2</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>0-29%</Text>
              <Text style={styles.tableCell}>G</Text>
              <Text style={styles.tableCell}>1</Text>
            </View>
          </View>
        </AccordionItem>

        <AccordionItem title="University of Witwatersrand (Wits) Points" id="wits">
          <View style={styles.witsTable}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableHeader, styles.witsCell]}>Level</Text>
              <Text style={[styles.tableHeader, styles.witsCell]}>Percentage</Text>
              <Text style={[styles.tableHeader, styles.witsCell]}>English/Maths</Text>
              <Text style={[styles.tableHeader, styles.witsCell]}>Life Orientation</Text>
              <Text style={[styles.tableHeader, styles.witsCell]}>Other Subjects</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.witsCell}>8</Text>
              <Text style={styles.witsCell}>90-100%</Text>
              <Text style={styles.witsCell}>10</Text>
              <Text style={styles.witsCell}>4</Text>
              <Text style={styles.witsCell}>8</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.witsCell}>7</Text>
              <Text style={styles.witsCell}>80-89%</Text>
              <Text style={styles.witsCell}>9</Text>
              <Text style={styles.witsCell}>3</Text>
              <Text style={styles.witsCell}>7</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.witsCell}>6</Text>
              <Text style={styles.witsCell}>70-79%</Text>
              <Text style={styles.witsCell}>8</Text>
              <Text style={styles.witsCell}>2</Text>
              <Text style={styles.witsCell}>6</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.witsCell}>5</Text>
              <Text style={styles.witsCell}>60-69%</Text>
              <Text style={styles.witsCell}>7</Text>
              <Text style={styles.witsCell}>1</Text>
              <Text style={styles.witsCell}>5</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.witsCell}>4</Text>
              <Text style={styles.witsCell}>50-59%</Text>
              <Text style={styles.witsCell}>4</Text>
              <Text style={styles.witsCell}>0</Text>
              <Text style={styles.witsCell}>4</Text>
            </View>
          </View>
        </AccordionItem>

        <AccordionItem title="CPUT Method 1: Best of six subjects" id="cput1">
          <Text style={styles.sectionDescription}>
            The APS is calculated using the percentage score for the 6 highest scoring subjects including three required subjects such as Mathematics, Physical Science, and English, but excluding Life Orientation and adding up all the raw scores, and dividing by 10.
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableHeader, styles.tableCell]}>Subject</Text>
              <Text style={[styles.tableHeader, styles.tableCell]}>Percentage</Text>
              <Text style={[styles.tableHeader, styles.tableCell]}>Calculation</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>English</Text>
              <Text style={styles.tableCell}>57%</Text>
              <Text style={styles.tableCell}>57</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Mathematics</Text>
              <Text style={styles.tableCell}>55%</Text>
              <Text style={styles.tableCell}>55</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Subject 3</Text>
              <Text style={styles.tableCell}>50%</Text>
              <Text style={styles.tableCell}>50</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Subject 4</Text>
              <Text style={styles.tableCell}>54%</Text>
              <Text style={styles.tableCell}>54</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Subject 5</Text>
              <Text style={styles.tableCell}>43%</Text>
              <Text style={styles.tableCell}>43</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Subject 6</Text>
              <Text style={styles.tableCell}>45%</Text>
              <Text style={styles.tableCell}>45</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalCell}>APS score (min)</Text>
              <Text style={styles.totalValueCell}>304 ÷ 10 = 30.4</Text>
            </View>
          </View>
        </AccordionItem>

        <AccordionItem title="CPUT Method 2: Double Maths and Science" id="cput2">
          <Text style={styles.sectionDescription}>
            The APS is calculated using the percentage score for the required subjects such as Mathematics, Physical Sciences, English and a 4th highest subject, but excluding Life Orientation. Multiply the marks for Mathematics and Physical Sciences by 2 and add up all the raw scores, then divide by 10.
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableHeader, styles.tableCell]}>Subject</Text>
              <Text style={[styles.tableHeader, styles.tableCell]}>Percentage</Text>
              <Text style={[styles.tableHeader, styles.tableCell]}>Calculation</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>English</Text>
              <Text style={styles.tableCell}>57%</Text>
              <Text style={styles.tableCell}>57</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Mathematics</Text>
              <Text style={styles.tableCell}>55%</Text>
              <Text style={styles.tableCell}>55 x 2 = 110</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Physical Science</Text>
              <Text style={styles.tableCell}>50%</Text>
              <Text style={styles.tableCell}>50 x 2 = 100</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Subject 4</Text>
              <Text style={styles.tableCell}>54%</Text>
              <Text style={styles.tableCell}>54</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalCell}>APS score (min)</Text>
              <Text style={styles.totalValueCell}>321 ÷ 10 = 32.1</Text>
            </View>
          </View>
        </AccordionItem>

        <AccordionItem title="CPUT Method 3: Double Maths and Accounting" id="cput3">
          <Text style={styles.sectionDescription}>
            The APS is calculated using the doubling the mathematics score and Accounting score and then adding the 4 next best subjects (excluding Life Orientation), then dividing by 10.
          </Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableHeader, styles.tableCell]}>Subject</Text>
              <Text style={[styles.tableHeader, styles.tableCell]}>Percentage</Text>
              <Text style={[styles.tableHeader, styles.tableCell]}>Calculation</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>English</Text>
              <Text style={styles.tableCell}>57%</Text>
              <Text style={styles.tableCell}>57</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Mathematics</Text>
              <Text style={styles.tableCell}>55% x 2</Text>
              <Text style={styles.tableCell}>110</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Accounting</Text>
              <Text style={styles.tableCell}>62% x 2</Text>
              <Text style={styles.tableCell}>124</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Subject 4</Text>
              <Text style={styles.tableCell}>54%</Text>
              <Text style={styles.tableCell}>54</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Subject 5</Text>
              <Text style={styles.tableCell}>48%</Text>
              <Text style={styles.tableCell}>48</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>Subject 6</Text>
              <Text style={styles.tableCell}>65%</Text>
              <Text style={styles.tableCell}>65</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalCell}>APS score (min)</Text>
              <Text style={styles.totalValueCell}>458 ÷ 10 = 45.8</Text>
            </View>
          </View>
        </AccordionItem>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
  accordionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  accordionContent: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
    color: '#333',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  witsTable: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f2f2f2',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
  },
  witsCell: {
    width: '20%',
    padding: 10,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  totalCell: {
    flex: 1,
    padding: 10,
    fontWeight: 'bold',
  },
  totalValueCell: {
    flex: 2,
    padding: 10,
    textAlign: 'right',
  }
});

export default AdmissionGuideScreen; 