import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 54,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    textAlign: 'center',
    marginBottom: 80,
    fontWeight: '700',
    numberOfLines: 1,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 60,
  },
  input: {
    backgroundColor: 'rgba(20, 15, 35, 0.6)',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 24,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    textAlign: 'left',
    minHeight: 60,
    width: '100%',
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

export default function OnboardingScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    'InterBold': require('../assets/fonts/Inter-Bold.otf'),
  });

  const handleNext = async () => {
    if (!name.trim()) {
      console.log('Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: name,
          })
          .eq('id', user.id);

        if (error) {
          console.log('Error updating profile:', error);
        } else {
          router.push('/onboarding-username');
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
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          style={styles.content}
        >
          <View style={styles.content}>
          <Text 
            style={styles.title}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            What's your name?
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={name}
              onChangeText={setName}
              editable={!isLoading}
              autoCapitalize="words"
              selectionColor="#A855F7"
            />
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
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>

      <StatusBar style="light" />
    </View>
  );
}
