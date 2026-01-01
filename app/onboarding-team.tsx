import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { useEffect, useState } from 'react';
import React from 'react';
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
  content: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 120,
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
  scrollContent: {
    paddingBottom: 120,
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
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  logoPlaceholder: {
    fontSize: 40,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    textAlign: 'center',
    marginBottom: 2,
  },
  logoSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'InterBold',
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    marginBottom: 8,
    textAlign: 'left',
  },
  input: {
    backgroundColor: 'rgba(20, 15, 35, 0.6)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    width: '100%',
  },
  membersSection: {
    marginBottom: 20,
    width: '100%',
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  membersTitle: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    textAlign: 'left',
  },
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  addMemberIcon: {
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 4,
  },
  addMemberText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
  },
  emptyMembersMessage: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'InterBold',
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(20, 15, 35, 0.4)',
    borderRadius: 12,
  },
  memberInputContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  memberInput: {
    flex: 1,
    backgroundColor: 'rgba(20, 15, 35, 0.6)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  addButton: {
    backgroundColor: 'rgba(168, 85, 247, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  membersList: {
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
  },
  memberEmail: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: 'InterBold',
  },
  removeButton: {
    paddingLeft: 10,
  },
  removeButtonText: {
    fontSize: 16,
    color: '#FF6B6B',
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

export default function OnboardingTeamScreen() {
  const router = useRouter();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [memberEmail, setMemberEmail] = useState('');
  const [showMemberInput, setShowMemberInput] = useState(false);

  const [fontsLoaded] = useFonts({
    'InterBold': require('../assets/fonts/Inter-Bold.otf'),
  });

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    router.push('/onboarding-interests');
  };

  const handleAddMember = () => {
    if (!memberEmail.trim()) {
      console.log('Please enter an email');
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(memberEmail.trim())) {
      console.log('Please enter a valid email');
      return;
    }

    if (!teamMembers.includes(memberEmail.trim())) {
      setTeamMembers([...teamMembers, memberEmail.trim()]);
      setMemberEmail('');
      setShowMemberInput(false);
    }
  };

  const handleRemoveMember = (email: string) => {
    setTeamMembers(teamMembers.filter(member => member !== email));
  };

  const handleUploadLogo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setTeamLogo(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
    }
  };

  const handleNext = async () => {
    if (!teamName.trim()) {
      console.log('Please enter a team name');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        let logoUrl = null;

        // Upload team logo if provided
        if (teamLogo) {
          const fileName = `team-${user.id}-${Date.now()}.jpg`;
          const { error: uploadError } = await supabase.storage
            .from('team-logos')
            .upload(fileName, {
              uri: teamLogo,
              type: 'image/jpeg',
              name: fileName,
            } as any);

          if (uploadError) {
            console.log('Error uploading logo:', uploadError);
          } else {
            const { data } = supabase.storage
              .from('team-logos')
              .getPublicUrl(fileName);
            logoUrl = data.publicUrl;
          }
        }

        // Create team
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .insert([
            {
              name: teamName,
              owner_id: user.id,
              logo_url: logoUrl,
              plan: 'free',
            },
          ])
          .select()
          .single();

        if (teamError) {
          console.log('Error creating team:', teamError);
          setIsLoading(false);
          return;
        }

        router.push('/onboarding-interests');
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
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}
            contentInsetAdjustmentBehavior="automatic"
            scrollEnabled={false}
          >
            <View style={styles.scrollContent}>
              <Text style={styles.title}>Create Your Team</Text>
              <Text style={styles.subtitle}>Set up your team workspace to collaborate with others</Text>

              <View style={styles.logoSection}>
                <TouchableOpacity
                  style={styles.logoContainer}
                  onPress={handleUploadLogo}
                  activeOpacity={0.7}
                >
                  {teamLogo ? (
                    <Image
                      source={{ uri: teamLogo }}
                      style={styles.logoImage}
                    />
                  ) : (
                    <Text style={styles.logoPlaceholder}>+</Text>
                  )}
                </TouchableOpacity>
                <Text style={styles.logoText}>Team Logo</Text>
                <Text style={styles.logoSubtext}>Click to upload • JPG, PNG or GIF (max 5MB)</Text>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Team Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your team name"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={teamName}
                  onChangeText={setTeamName}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.membersSection}>
                <View style={styles.membersHeader}>
                  <Text style={styles.membersTitle}>Invite Team Members</Text>
                  <TouchableOpacity
                    style={styles.addMemberButton}
                    onPress={() => {
                      setShowMemberInput(!showMemberInput);
                      if (!showMemberInput) {
                        setTimeout(() => Keyboard.dismiss(), 100);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.addMemberIcon}>+</Text>
                    <Text style={styles.addMemberText}>Add Member</Text>
                  </TouchableOpacity>
                </View>

                {showMemberInput && (
                  <View style={styles.memberInputContainer}>
                    <TextInput
                      style={styles.memberInput}
                      placeholder="Enter member email"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={memberEmail}
                      onChangeText={setMemberEmail}
                      editable={!isLoading}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="done"
                      onSubmitEditing={handleAddMember}
                    />
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={handleAddMember}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.addButtonText}>✓</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {teamMembers.length > 0 ? (
                  <View style={styles.membersList}>
                    {teamMembers.map((email, index) => (
                      <View key={index} style={styles.memberItem}>
                        <Text style={styles.memberEmail}>{email}</Text>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemoveMember(email)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyMembersMessage}>
                    No team members added yet. You can add them later from team settings.
                  </Text>
                )}
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
          <Image
            source={require('../assets/arrow.png')}
            style={styles.nextButtonIcon}
          />
        </TouchableOpacity>
      </LinearGradient>

      <StatusBar style="light" />
    </View>
  );
}
