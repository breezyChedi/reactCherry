import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, ScrollView, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { fetchUniversitiesWithFaculties } from '../services/neo4jService';
import { University } from '../types';
import { db } from "../firebaseConfig";

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

const campusImageMap: { [key: string]: any } = {
  'campusPhotos\\vaal_university_of_technology.jpg': require('../../assets/campusPhotos/vaal_university_of_technology.jpg'),
  'campusPhotos\\sefako_makgatho_health_sciences_university.jpg': require('../../assets/campusPhotos/sefako_makgatho_health_sciences_university.jpg'),
  'campusPhotos\\university_of_zululand.jpg': require('../../assets/campusPhotos/university_of_zululand.jpg'),
  'campusPhotos\\central_university_of_technology_free_state.jpg': require('../../assets/campusPhotos/central_university_of_technology_free_state.jpg'),
  'campusPhotos\\university_of_limpopo.jpg': require('../../assets/campusPhotos/university_of_limpopo.jpg'),
  'campusPhotos\\cape_peninsula_university_of_technology.jpg': require('../../assets/campusPhotos/cape_peninsula_university_of_technology.jpg'),
  'campusPhotos\\nelson_mandela_metropolitan_university.jpg': require('../../assets/campusPhotos/nelson_mandela_metropolitan_university.jpg'),
  'campusPhotos\\walter_sisulu_university.jpg': require('../../assets/campusPhotos/walter_sisulu_university.jpg'),
  'campusPhotos\\university_of_venda.jpg': require('../../assets/campusPhotos/university_of_venda.jpg'),
  'campusPhotos\\durban_university_of_technology.jpg': require('../../assets/campusPhotos/durban_university_of_technology.jpg'),
  'campusPhotos\\rhodes_university.png': require('../../assets/campusPhotos/rhodes_university.png'),
  'campusPhotos\\university_of_fort_hare.jpg': require('../../assets/campusPhotos/university_of_fort_hare.jpg'),
  'campusPhotos\\tshwane_university_of_technology.jpg': require('../../assets/campusPhotos/tshwane_university_of_technology.jpg'),
  'campusPhotos\\university_of_the_free_state.jpg': require('../../assets/campusPhotos/university_of_the_free_state.jpg'),
  'campusPhotos\\university_of_the_western_cape.jpg': require('../../assets/campusPhotos/university_of_the_western_cape.jpg'),
  'campusPhotos\\university_of_south_africa.png': require('../../assets/campusPhotos/university_of_south_africa.png'),
  'campusPhotos\\north-west_university.jpg': require('../../assets/campusPhotos/north-west_university.jpg'),
  'campusPhotos\\university_of_johannesburg.jpg': require('../../assets/campusPhotos/university_of_johannesburg.jpg'),
  'campusPhotos\\university_of_kwazulu-natal.jpg': require('../../assets/campusPhotos/university_of_kwazulu-natal.jpg'),
  'campusPhotos\\university_of_pretoria.jpg': require('../../assets/campusPhotos/university_of_pretoria.jpg'),
  'campusPhotos\\stellenbosch_university.jpg': require('../../assets/campusPhotos/stellenbosch_university.jpg'),
  'campusPhotos\\university_of_cape_town.jpg': require('../../assets/campusPhotos/university_of_cape_town.jpg'),
  'campusPhotos\\eduvos.jpg': require('../../assets/campusPhotos/eduvos.jpg'),
  'campusPhotos\\iie_varsity_college.jpg': require('../../assets/campusPhotos/iie_varsity_college.jpg'),
  'campusPhotos\\university_of_the_witwatersrand.jpg': require('../../assets/campusPhotos/university_of_the_witwatersrand.jpg'),
};

export default function UniversityPage() {
  const route = useRoute<any>();
  const { universityId } = route.params;
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const universities = await fetchUniversitiesWithFaculties();
      const found = universities.find((u) => u.id === universityId);
      setUniversity(found || null);
      setLoading(false);
    };
    fetchData();
  }, [universityId]);

  // Helper to render bold text
  const renderDescription = (desc: string) =>
    desc.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <Text key={i} style={{ fontWeight: 'bold' }}>{part.slice(2, -2)}</Text>
      ) : (
        <Text key={i}>{part}</Text>
      )
    );

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#e300f3" />;
  if (!university) return <Text style={{ margin: 40, color: '#e300f3' }}>University not found.</Text>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Top Card */}
      <View style={styles.topCard}>
        <Image
          source={logoMap[university.logoUrl] || require('../../assets/cherry-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.name}>{university.name}</Text>
      </View>
      {/* Campus Image */}
      {university.campusImageUrl ? (
        <Image
          source={
            campusImageMap[university.campusImageUrl]
              ? campusImageMap[university.campusImageUrl]
              : { uri: university.campusImageUrl }
          }
          style={styles.campusImage}
          resizeMode="cover"
        />
      ) : null}
      {/* Description Card */}
      <View style={styles.descriptionCard}>
        <Text style={styles.descriptionText}>{renderDescription(university.description || '')}</Text>
      </View>
      {/* Apply Button */}
      {university.appUrl ? (
        <View style={{ marginHorizontal: 16, marginBottom: 32 }}>
          <Button
            title="Apply"
            color="#e300f3"
            onPress={() => Linking.openURL(university.appUrl)}
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9e6ff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  campusImage: {
    width: '100%',
    height: 200,
    marginVertical: 16,
    borderRadius: 12,
  },
  descriptionCard: {
    backgroundColor: '#f3e6ff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#333',
  },
}); 