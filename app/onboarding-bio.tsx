import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
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
    width: '100%',
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
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 48,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    textAlign: 'left',
    marginBottom: 60,
    fontWeight: '700',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 50,
  },
  bioInput: {
    backgroundColor: 'rgba(20, 15, 35, 0.6)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    textAlignVertical: 'top',
    textAlign: 'left',
    height: 120,
    width: '100%',
  },
  charCountContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    marginRight: 0,
  },
  charCount: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'InterBold',
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

const MAX_BIO_LENGTH = 150;

export default function OnboardingBioScreen() {
  const router = useRouter();
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    'InterBold': require('../assets/fonts/Inter-Bold.otf'),
  });

  const handleBack = () => {
    router.back();
  };

  const handleNext = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            bio: bio.trim() || null,
          })
          .eq('id', user.id);

        if (error) {
          console.log('Error updating bio:', error);
          setIsLoading(false);
        } else {
          router.push('/onboarding-team');
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
              Tell us about yourself
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.bioInput}
                placeholder="Add a bio (optional)"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={bio}
                onChangeText={(text) => {
                  if (text.length <= MAX_BIO_LENGTH) {
                    setBio(text);
                  }
                }}
                multiline
                editable={!isLoading}
                maxLength={MAX_BIO_LENGTH}
                textAlign="left"
              />
              <View style={styles.charCountContainer}>
                <Text style={styles.charCount}>
                  {bio.length}/{MAX_BIO_LENGTH}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Image
                source={require('../assets/arrow.png')}
                style={styles.nextButtonIcon}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>

      <StatusBar style="light" />
    </View>
  );
}
