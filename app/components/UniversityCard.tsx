import React, { useEffect } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { University } from '../types';
import { useNavigation } from '@react-navigation/native';

interface UniversityCardProps {
  university: University;
  isSelected: boolean;
  onSelect: (university: University) => void;
}

// Define a fallback logo to use when images are missing
const fallbackLogo = require('../../assets/cherry-icon.png');

// Mapping of logoUrl to require for local images using static paths
const logoMap: { [key: string]: any } = {
  '/logos/eduvos_logo.png': require('../../assets/logos/eduvos_logo.png'),
  '/logos/VC_logo.png': require('../../assets/logos/VC_logo.png'),
  '/logos/ufh_logo.png': require('../../assets/logos/ufh_logo.png'),
  '/logos/uz_logo.png': require('../../assets/logos/uz_logo.png'),
  '/logos/nwu_logo.png': require('../../assets/logos/nwu_logo.png'),
  '/logos/uwc_logo.png': require('../../assets/logos/uwc_logo.png'),
  '/logos/uj_logo.png': require('../../assets/logos/uj_logo.png'),
  '/logos/wits_logo.png': require('../../assets/logos/wits_logo.png'),
  '/logos/nmu_logo.jpg': require('../../assets/logos/nmu_logo.jpg'),
  '/logos/dut_logo.jpg': require('../../assets/logos/dut_logo.png'),
  '/logos/ul_logo.png': require('../../assets/logos/ul_logo.png'),
  '/logos/ufs_logo.png': require('../../assets/logos/ufs_logo.png'),
  '/logos/wsu_logo.png': require('../../assets/logos/wsu_logo.png'),
  '/logos/stellies_logo.png': require('../../assets/logos/stellies_logo.png'),
  '/logos/vaal_logo.png': require('../../assets/logos/vaal_logo.png'),
  '/logos/rhodes_logo.png': require('../../assets/logos/rhodes_logo.png'),
  '/logos/smhs_logo.png': require('../../assets/logos/smhs_logo.png'),
  '/logos/cput_logo.png': require('../../assets/logos/cput_logo.png'),
  '/logos/uv_logo.png': require('../../assets/logos/uv_logo.png'),
  '/logos/tut_logo.png': require('../../assets/logos/tut_logo.png'),
  '/logos/up_logo.png': require('../../assets/logos/up_logo.png'),
  '/logos/uct_logo.png': require('../../assets/logos/uct_logo.png'),
  '/logos/ukzn_logo.png': require('../../assets/logos/ukzn_logo.png'),
  '/logos/unisa_logo.png': require('../../assets/logos/unisa_logo.png'),
};

const UniversityCard: React.FC<UniversityCardProps> = ({ university, isSelected, onSelect }) => {
  const navigation = useNavigation();

  useEffect(() => {
    console.log(
      `UniversityCard ${university.id} (${university.name}) isSelected changed:`,
      isSelected
    );
  }, [isSelected, university.id, university.name]);

  const selectedStyles = isSelected ? {
    width: 220,
    height: 280,
    backgroundColor: '#e6f7ff',
    borderWidth: 2,
    borderColor: '#0070f3',
    transform: [{ scale: 1.05 }]
  } : undefined;

  console.log(
    `UniversityCard ${university.id} render:`,
    `\n  - isSelected: ${isSelected}`,
    `\n  - applying selected styles: ${!!selectedStyles}`,
    `\n  - logoUrl: ${university.logoUrl}`,
    `\n  - name: ${university.name}`
  );

  return (
    <TouchableOpacity
      onPress={() => {
        console.log(`Card ${university.id} pressed`);
        onSelect(university);
      }}
      style={[styles.card, selectedStyles]}
      activeOpacity={1}
    >
      <View style={styles.logoContainer}>
        <Image
          source={logoMap[university.logoUrl] || require('../../assets/cherry-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{university.name}</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666666" style={styles.locationIcon} />
            <Text style={styles.location}>{university.location}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.applyButton}
          onPress={(e) => {
            e.stopPropagation && e.stopPropagation();
            (navigation as any).navigate('UniversityPage', { universityId: university.id });
          }}
        >
          <Text style={styles.applyButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 260,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
  },
  contentContainer: {
    alignItems: 'center',
  },
  textContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Platform.select({
      ios: 'Arial',
      android: 'sans-serif',
    }),
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationIcon: {
    marginRight: 8,
  },
  location: {
    fontSize: 14,
    color: '#666666',
    fontFamily: Platform.select({
      ios: 'Arial',
      android: 'sans-serif',
    }),
  },
  applyButton: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#e300f3',
    borderRadius: 4,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default UniversityCard; 