import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import React from 'react';
import { useFonts } from 'expo-font';
import { supabase } from '../supabase/utils/supabase';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ParticlesBackground from '../components/particles-background';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 120,
    paddingBottom: 120,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    width: '100%',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'InterBold',
    marginBottom: 30,
    textAlign: 'center',
    width: '100%',
  },
  interestsContainer: {
    marginBottom: 50,
    width: '100%',
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  interestButton: {
    width: '48%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 15, 35, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  interestButtonActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderColor: 'rgba(168, 85, 247, 0.6)',
  },
  interestButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    fontWeight: '600',
  },

  nextButton: {
    backgroundColor: '#1D9BF0',
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 80,
    left: '50%',
    marginLeft: -30,
  },
  nextButtonText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  nextButtonIcon: {
    width: 28,
    height: 28,
    tintColor: '#FFFFFF',
  },
});

const INTERESTS = [
  'Technology',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'HR',
  'Operations',
  'Product',
  'Engineering',
  'Data Science',
  'AI/ML',
  'Other',
];

export default function OnboardingInterestsScreen() {
  const router = useRouter();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    'InterBold': require('../assets/fonts/Inter-Bold.otf'),
  });

  const handleBack = () => {
    router.back();
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Update user profile with interests
        const { error } = await supabase
          .from('profiles')
          .update({
            interests: selectedInterests,
          })
          .eq('id', user.id);

        if (error) {
          console.log('Error updating profile:', error);
        } else {
          router.push('/onboarding-goals');
        }
      }
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e1b4b', '#312e81', '#1e1b4b']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        <ParticlesBackground />

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          style={styles.content}
        >
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}
            contentInsetAdjustmentBehavior="automatic"
          >
            <Text style={styles.title}>What interests you?</Text>
            <Text style={styles.subtitle}>Select topics you'd like to see more of</Text>

            <View style={styles.interestsContainer}>
              <View style={styles.interestGrid}>
                {INTERESTS.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.interestButton,
                      selectedInterests.includes(interest) && styles.interestButtonActive,
                    ]}
                    onPress={() => toggleInterest(interest)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.interestButtonText}>{interest}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : (
            <Image
              source={require('../assets/arrow.png')}
              style={styles.nextButtonIcon}
            />
          )}
        </TouchableOpacity>
      </LinearGradient>

      <StatusBar style="light" />
    </View>
  );
}
