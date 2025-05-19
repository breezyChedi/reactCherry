import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  StatusBar,
  ScrollView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { onboardingEvents } from '../../App';

const { width, height } = Dimensions.get('window');

interface SlideItem {
  key: string;
  image: any;
  backgroundColor: string;
  title: string;
  headerText: string;
  descriptionText: string;
}

// Slide data
const slides: SlideItem[] = [
  {
    key: 'slide1',
    image: require('../../assets/slidePhotos/slide1.png'),
    backgroundColor: '#FFD7F7', // Pink
    title: 'PICK',
    headerText: 'NEED TO FIND UNIVERSITIES?',
    descriptionText: 'You can use our explore page to view all the universities of your choice. View their location, history & more.',
  },
  {
    key: 'slide2',
    image: require('../../assets/slidePhotos/slide2.png'),
    backgroundColor: '#D7E4FF', // Light blue
    title: 'SAVE',
    headerText: 'NEED TO FIND UNIVERSITIES?',
    descriptionText: 'You can use our explore page to view all the universities of your choice. View their location, history & more.',
  },
  {
    key: 'slide3',
    image: require('../../assets/slidePhotos/slide3.png'),
    backgroundColor: '#AEFFAA', // Light green
    title: 'CALCULATE\nAND\nAPPLY',
    headerText: '',
    descriptionText: 'You can use our explore page to view all the universities of your choice. View their location, history & more.',
  },
];

const OnboardingScreen = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();

  // Function to mark onboarding as completed
  const completeOnboarding = async () => {
    try {
      // Mark onboarding as completed in AsyncStorage
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      
      // Emit the event to notify App.tsx to switch screens
      onboardingEvents.emit('complete', {});
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  // Function to handle going back to previous slides
  const handleBack = () => {
    if (activeSlide > 0) {
      // Go back to previous slide
      const prevSlide = activeSlide - 1;
      scrollViewRef.current?.scrollTo({ x: prevSlide * width, animated: true });
      setActiveSlide(prevSlide);
    }
  };

  // Function to handle next slide or complete onboarding
  const handleNext = () => {
    if (activeSlide < slides.length - 1) {
      // Go to next slide
      const nextSlide = activeSlide + 1;
      scrollViewRef.current?.scrollTo({ x: nextSlide * width, animated: true });
      setActiveSlide(nextSlide);
    } else {
      // Complete onboarding on last slide
      completeOnboarding();
    }
  };

  // Handle scroll end to update active slide
  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    if (currentIndex !== activeSlide) {
      setActiveSlide(currentIndex);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {slides.map((item, index) => (
          <View 
            key={item.key} 
            style={[styles.slide, { backgroundColor: item.backgroundColor, width }]}
          >
            {/* Full screen background image */}
            <Image 
              source={item.image} 
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
            
            {/* Back button - only shown on slides after the first one */}
            {index !== 0 && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
            )}
            
            {/* Skip button on first slide */}
            {index === 0 && (
              <TouchableOpacity 
                style={styles.skipButton} 
                onPress={completeOnboarding}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
            )}
            
            {/* Text container positioned on top of the image at the bottom area */}
            <View style={styles.textContainer}>
              {/* Special heading for slide 3 */}
              {index === 2 && (
                <Text style={styles.largeHeading}>CALCULATE</Text>
              )}
              
              {/* Bold header text for slides 1 and 2 */}
              {index < 2 && item.headerText && (
                <Text style={styles.boldHeaderText}>{item.headerText}</Text>
              )}
              
              {/* Description text */}
              <Text style={styles.descriptionText}>{item.descriptionText}</Text>
              
              {/* Special footer for slide 3 */}
              {index === 2 && (
                <Text style={styles.largeHeading}>AND APPLY</Text>
              )}
            </View>
            
            {/* Next button positioned on top of the image at the bottom */}
            <TouchableOpacity 
              style={styles.nextButton} 
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {index === slides.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      
      {/* Dots pagination indicator */}
      <View style={styles.paginationContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activeSlide ? styles.paginationActiveDot : styles.paginationInactiveDot
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    width: width,
    height: height,
  },
  fullScreenImage: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  textContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
  },
  boldHeaderText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  descriptionText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#000000',
    lineHeight: 22,
    marginVertical: 15,
  },
  largeHeading: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 40,
    width: '100%',
    zIndex: 100,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  paginationActiveDot: {
    backgroundColor: '#E300F3',
  },
  paginationInactiveDot: {
    backgroundColor: '#BDBDBD',
  },
  nextButton: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    zIndex: 100,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#E300F3',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    left: 20,
    zIndex: 100,
  },
  backButtonText: {
    fontSize: 24,
    color: '#000',
  },
  skipButton: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    right: 20,
    zIndex: 100,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
});

export default OnboardingScreen; 