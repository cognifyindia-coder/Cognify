import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { supabase } from '../supabase/utils/supabase';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import ParticlesBackground from '../components/particles-background';
import * as ImagePicker from 'expo-image-picker';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
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
  laterButton: {
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  laterButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  profilePictureContainer: {
    marginBottom: 50,
    alignItems: 'center',
  },
  profilePicture: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  title: {
    fontSize: 48,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    textAlign: 'center',
    marginBottom: 80,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 80,
  },
  actionButton: {
    backgroundColor: 'rgba(100, 150, 200, 0.4)',
    borderRadius: 50,
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonIcon: {
    fontSize: 40,
    color: '#FFFFFF',
  },
  orText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
  },
  continueButton: {
    backgroundColor: 'rgba(100, 150, 200, 0.5)',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  continueButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    fontWeight: '600',
  },
});

export default function OnboardingProfilePictureScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [googleImage, setGoogleImage] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    'InterBold': require('../assets/fonts/Inter-Bold.otf'),
  });

  useEffect(() => {
    fetchGoogleProfileImage();
  }, []);

  const fetchGoogleProfileImage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.avatar_url) {
        setGoogleImage(user.user_metadata.avatar_url);
        setProfileImage(user.user_metadata.avatar_url);
      }
    } catch (error) {
      console.log('Error fetching Google image:', error);
    }
  };

  const handleCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Camera error:', error);
    }
  };

  const handleGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Gallery error:', error);
    }
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && profileImage && profileImage !== googleImage) {
        // Upload image to storage
        const filename = `${user.id}-${Date.now()}.jpg`;
        const formData = new FormData();
        formData.append('file', {
          uri: profileImage,
          name: filename,
          type: 'image/jpeg',
        } as any);

        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filename, formData as any);

        if (error) {
          console.log('Upload error:', error);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filename);

          await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);
        }
      }

      router.replace('/');
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLater = () => {
    router.replace('/');
  };

  const handleBack = () => {
    router.back();
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
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.laterButton}
            onPress={handleLater}
          >
            <Text style={styles.laterButtonText}>later</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePicture}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <Text style={{ fontSize: 60, color: '#A9A9A9' }}>👤</Text>
              )}
            </View>
          </View>

          <Text style={styles.title}>Set a profile picture</Text>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCamera}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Image
                source={require('../assets/camera.png')}
                style={{ width: 40, height: 40 }}
              />
            </TouchableOpacity>

            <Text style={styles.orText}>Or</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleGallery}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Image
                source={require('../assets/gallery.png')}
                style={{ width: 40, height: 40 }}
              />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color="#A855F7" />
          ) : (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <StatusBar style="light" />
    </View>
  );
}
