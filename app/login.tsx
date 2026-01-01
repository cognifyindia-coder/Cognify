import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../supabase/utils/supabase';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ParticlesBackground from '../components/particles-background';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050710',
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
  titleContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 190,
    width: '100%',
    paddingHorizontal: 20,
  },
  titlePurple: {
    fontSize: 48,
    color: '#C084FC',
    fontFamily: 'InterBold',
    textAlign: 'center',
    lineHeight: 48,
    letterSpacing: -0.7,
    width: '100%',
  },
  titleWhite: {
    fontSize: 52,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    textAlign: 'center',
    lineHeight: 60,
    letterSpacing: -0.7,
    width: '100%',
    marginTop: -8,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 110,
    left: 20,
    right: 20,
  },
  getStartedBtn: {
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 40,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginLeft: 12,
  },
  haveAccountBtn: {
    backgroundColor: 'rgba(20, 15, 35, 0.9)',
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
    flexDirection: 'row',
  },
  haveAccountText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginLeft: 12,
  },
  logoImage: {
    width: 24,
    height: 24,
  },
  socialButtonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  socialButton: {
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 40,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 15, 35, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginLeft: 12,
  },
  logoImage: {
    width: 24,
    height: 24,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Inter',
    lineHeight: 18,
  },
  footerLink: {
    color: '#C084FC',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 999,
  },
});

export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    'InterBold': require('../assets/fonts/Inter-Bold.otf'),
  });

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.configure({
        webClientId: '954533363910-ig67fb829qqm4tvpmcgbu9bd86pc0c2g.apps.googleusercontent.com',
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(JSON.stringify(userInfo, null, 2));

      if ((userInfo as any)?.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: (userInfo as any).data.idToken,
        });

        if (error) {
          console.log('Supabase error:', error);
          setIsLoading(false);
        } else {
          console.log('Signed in:', data);
          // Check if user has onboarded
          const { data: profile } = await supabase
            .from('profiles')
            .select('has_onboarded')
            .eq('id', data.user.id)
            .single();

          if (profile?.has_onboarded) {
            router.replace('/');
          } else {
            router.replace('/onboarding');
          }
        }
      }
    } catch (error: any) {
      setIsLoading(false);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled login');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available');
      } else {
        console.log('Some other error happened', error);
      }
    }
  };

  const handleHaveAccount = () => {
    // Navigate to magic link or email login screen
    console.log('Navigate to email login');
  };

  const handleGitHubLogin = async () => {
    // TODO: Implement GitHub OAuth
    console.log('GitHub login');
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '954533363910-ig67fb829qqm4tvpmcgbu9bd86pc0c2g.apps.googleusercontent.com',
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const handleTermsPress = () => {
    // Navigate to terms page or open link
    console.log('Terms pressed');
  };

  const handlePrivacyPress = () => {
    // Navigate to privacy page or open link
    console.log('Privacy Policy pressed');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0e2e', '#1a1640', '#0f0e2e']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        <ParticlesBackground />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          scrollEnabled={false}
        >
          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <Text 
                style={styles.titlePurple}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                In love with
              </Text>
              <Text 
                style={styles.titleWhite}
                adjustsFontSizeToFit
                minimumFontScale={2.5}
              >
                Prompting
              </Text>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.getStartedBtn}
                onPress={handleGetStarted}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#A855F7', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Image
                  source={require('../assets/google-white.png')}
                  style={styles.logoImage}
                />
                <Text style={styles.getStartedText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.haveAccountBtn}
                onPress={handleGitHubLogin}
                activeOpacity={0.8}
              >
                <Image
                  source={require('../assets/github-white.png')}
                  style={styles.logoImage}
                />
                <Text style={styles.haveAccountText}>Continue with GitHub</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Your privacy is our top concern and we want you to know how we process your personal information. By continuing you confirm that you've read and accepted our{' '}
              <Text style={styles.footerLink} onPress={handleTermsPress}>Terms</Text>
              {' '}and{' '}
              <Text style={styles.footerLink} onPress={handlePrivacyPress}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>

      <StatusBar style="light" />
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      )}
    </View>
  );
}
