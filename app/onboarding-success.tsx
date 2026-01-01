import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { supabase } from '../supabase/utils/supabase';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ParticlesBackground from '../components/particles-background';
import LottieView from 'lottie-react-native';

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
    paddingVertical: 40,
    paddingTop: 40,
  },
  checkmarkContainer: {
    width: 200,
    height: 200,
    marginBottom: -40,
  },
  title: {
    fontSize: 32,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'Inter',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 20,
  },
  userCard: {
    width: '100%',
    paddingVertical: 28,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(20, 15, 35, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#A855F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'rgba(168, 85, 247, 0.5)',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
  },
  avatarText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  userName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    fontWeight: '700',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'Inter',
    marginBottom: 20,
  },
  infoSection: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: 'rgba(168, 85, 247, 0.2)',
    paddingTop: 24,
    marginTop: 8,
  },
  infoRow: {
    marginBottom: 18,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'Inter',
    marginBottom: 6,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    fontWeight: '600',
  },
  infoRowHorizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 18,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  startButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
    overflow: 'hidden',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
  },
  startButtonText: {
    fontSize: 17,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default function OnboardingSuccessScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    'InterBold': require('../assets/fonts/Inter-Bold.otf'),
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          let interestCount = 0;
          try {
            const interests = JSON.parse(profile?.interests || '[]');
            interestCount = Array.isArray(interests) ? interests.length : 0;
          } catch {
            interestCount = 0;
          }

          setUserInfo({
            email: profile?.email || user.email || 'N/A',
            username: profile?.display_name || profile?.username || 'User',
            handle: profile?.username || 'user',
            role: profile?.role || 'Not specified',
            company: profile?.company || 'Not specified',
            interestCount: interestCount,
            avatar: profile?.avatar_url || null,
            plan: profile?.plan || 'free',
            credits: profile?.credits || 120,
          });
        }
      } catch (error) {
        console.log('Error fetching user info:', error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleGetStarted = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            has_onboarded: true,
          })
          .eq('id', user.id);

        if (error) {
          console.log('Error updating onboarding status:', error);
        } else {
          router.replace('/');
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

  const userName = userInfo?.username || 'Cognify';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e1b4b', '#312e81', '#1e1b4b']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        <ParticlesBackground />

        <View style={styles.content}>
          <View style={styles.checkmarkContainer}>
            <LottieView
              source={require('../assets/lightbulb.json')}
              autoPlay
              loop={true}
              style={{ width: '100%', height: '100%' }}
            />
          </View>

          <Text style={styles.title}>You're all set!</Text>
          <Text style={styles.subtitle}>
            Welcome to the platform, Cognify! Your account has been configured based on your preferences.
          </Text>

          <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
              {userInfo?.avatar ? (
                <Image
                  source={{ uri: userInfo.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>{userInitial}</Text>
              )}
            </View>

            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userHandle}>@{userInfo?.handle || 'user'}</Text>

            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userInfo?.email}</Text>
              </View>

              <View style={styles.infoRowHorizontal}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Role</Text>
                  <Text style={styles.infoValue}>{userInfo?.role}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Company</Text>
                  <Text style={styles.infoValue}>{userInfo?.company}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Interests</Text>
                <Text style={styles.infoValue}>{userInfo?.interestCount} selected</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#A855F7', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Image
                  source={require('../assets/arrow.png')}
                  style={{ width: 24, height: 24, marginRight: 8, tintColor: '#FFFFFF' }}
                />
                <Text style={styles.startButtonText}>Get Started</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <StatusBar style="light" />
    </View>
  );
}
