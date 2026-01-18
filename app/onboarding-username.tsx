import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated, Image, ActivityIndicator } from 'react-native';
import { useEffect, useState, useRef } from 'react';
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(168, 85, 247, 0.3)',
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  title: {
    fontSize: 48,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    textAlign: 'center',
    marginBottom: 60,
    fontWeight: '700',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 12,
    minHeight: 90,
    flexShrink: 0,
    position: 'relative',
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
  previewText: {
    fontSize: 18,
    color: '#C084FC',
    fontFamily: 'InterBold',
    textAlign: 'center',
    marginTop: -35,
    marginBottom: 0,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontFamily: 'InterBold',
    textAlign: 'center',
    position: 'absolute',
    bottom: -25,
    left: 0,
    right: 0,
  },
  nextButton: {
    backgroundColor: '#1D9BF0',
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 50,
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

export default function OnboardingUsernameScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const previewOpacity = useRef(new Animated.Value(0)).current;
  const previewScale = useRef(new Animated.Value(0.8)).current;

  const [fontsLoaded] = useFonts({
    'InterBold': require('../assets/fonts/Inter-Bold.otf'),
  });

  useEffect(() => {
    if (username) {
      Animated.parallel([
        Animated.timing(previewOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(previewScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(previewOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(previewScale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [username]);

  const handleBack = () => {
    router.back();
  };

  const handleNext = async () => {
    if (!username.trim()) {
      setUsernameError('Please enter a username');
      return;
    }

    setUsernameError('');
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if username is already taken by someone else
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .single();

        if (existingUser) {
          setUsernameError('Username is not available');
          setIsLoading(false);
          return;
        }

        const { error } = await supabase
          .from('profiles')
          .update({
            username: username,
          })
          .eq('id', user.id);

        if (error) {
          console.log('Error updating username:', error);
        } else {
          router.push('/onboarding-bio');
        }
      }
    } catch (error) {
      console.log('Error:', error);
      setUsernameError('An error occurred. Please try again.');
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

        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
          style={styles.content}
        >
          <View style={styles.content}>
            <Text 
              style={styles.title}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              Pick a unique username!
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="username"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setUsernameError('');
                }}
                editable={!isLoading}
                autoCapitalize="none"
                selectionColor="#A855F7"
              />
              {usernameError && (
                <Text style={styles.errorText}>{usernameError}</Text>
              )}
            </View>

            <Animated.View
              style={{
                opacity: previewOpacity,
                transform: [{ scale: previewScale }],
              }}
            >
              {username && !usernameError && (
                <Text style={styles.previewText}>
                  @{username}
                </Text>
              )}
            </Animated.View>

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
