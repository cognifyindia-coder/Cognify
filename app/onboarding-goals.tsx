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
    paddingBottom: 140,
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
    marginBottom: 36,
    textAlign: 'center',
    width: '100%',
  },
  goalsContainer: {
    marginBottom: 50,
    width: '100%',
  },
  goalsGrid: {
    gap: 16,
  },
  goalRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  goalItemTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(20, 15, 35, 0.6)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  goalItemTouchableActive: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.5)',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioButtonActive: {
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#A855F7',
  },
  goalText: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    fontWeight: '600',
    lineHeight: 20,
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

const GOALS = [
  'Create better AI prompts',
  'Test and optimize prompts',
  'Build a prompt library',
  'Share prompts with community',
  'Collaborate with team',
  'Track AI usage and costs',
];

export default function OnboardingGoalsScreen() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    'InterBold': require('../assets/fonts/Inter-Bold.otf'),
  });

  const handleBack = () => {
    router.back();
  };

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Update user profile with goals
        const { error } = await supabase
          .from('profiles')
          .update({
            goals: selectedGoals,
          })
          .eq('id', user.id);

        if (error) {
          console.log('Error updating profile:', error);
        } else {
          router.push('/onboarding-success');
        }
      }
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
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

        <View style={styles.scrollViewContent}>
          <Text style={styles.title}>What are your goals?</Text>
          <Text style={styles.subtitle}>Help us recommend the best features for you</Text>

          <View style={styles.goalsContainer}>
            <View style={styles.goalsGrid}>
              {GOALS.map((goal) => (
                <View key={goal} style={styles.goalRow}>
                  <TouchableOpacity
                    style={[
                      styles.goalItemTouchable,
                      selectedGoals.includes(goal) && styles.goalItemTouchableActive,
                    ]}
                    onPress={() => toggleGoal(goal)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.radioButton,
                        selectedGoals.includes(goal) && styles.radioButtonActive,
                      ]}
                    >
                      {selectedGoals.includes(goal) && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.goalText}>{goal}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>

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
