import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions, Modal, TextInput, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase/utils/supabase';
import PromptCard from '../components/prompt-card';
import { parsePromptContent, parseFullContent } from '../utils/contentParser';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F0F',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#0F0F0F',
    paddingTop: 15,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A0A9FF',
  },
  bannerContainer: {
    height: 120,
    marginHorizontal: 16,
    marginVertical: 20,
    marginTop: -10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2A2E3E',
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 30,
    marginHorizontal: 16,
    marginTop: -5,
    paddingVertical: 30,
    borderWidth: 1,
    borderColor: '#3A3F4F',
    borderRadius: 12,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#B596D4',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D60E0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 12,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  displayName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  username: {
    color: '#A8ADB5',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  email: {
    color: '#A8ADB5',
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 12,
  },
  jobTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginVertical: 10,
    marginTop: -15,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1E2E',
    borderColor: '#3A3F4F',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginVertical: 30,
    marginTop: 40,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  statLabel: {
    color: '#A8ADB5',
    fontSize: 12,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1E2E',
    borderRadius: 12,
    marginTop: 5,
    marginHorizontal: 16,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 6,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  tabText: {
    color: '#A8ADB5',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#A8ADB5',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1E2E',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#A8ADB5',
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#0F0F0F',
    borderColor: '#3A3F4F',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 12,
  },
  bioInput: {
    backgroundColor: '#0F0F0F',
    borderColor: '#3A3F4F',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 80,
  },
  avatarUploadArea: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#B596D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A3F4F',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1D60E0',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>({
    username: '',
    avatar_url: null,
    display_name: 'Loading...',
    email: '',
    bio: '',
    is_verified: false,
    total_prompts: 0,
    total_followers: 0,
  });
  const [activeTab, setActiveTab] = useState('My Prompts');
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({
    display_name: '',
    username: '',
    bio: '',
  });
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchPrompts();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        return;
      }

      if (user) {
        setUserId(user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('username, avatar_url, display_name, email, bio, is_verified, total_prompts, total_followers')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Profile fetch error:', error);
        } else if (data) {
          console.log('Profile data fetched:', data);
          setProfile({
            username: data.username || '',
            avatar_url: data.avatar_url || null,
            display_name: data.display_name || '',
            email: data.email || '',
            bio: data.bio || '',
            is_verified: data.is_verified || false,
            total_prompts: data.total_prompts || 0,
            total_followers: data.total_followers || 0,
          });
        }
      } else {
        console.log('No authenticated user');
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareProfile = async () => {
    try {
      const profileUrl = `Check out ${profile.display_name || 'User'}'s profile on Cognify!\n\nUsername: @${profile.username || 'user'}\n\nProfile: https://cognify.app/profile/${profile.username || 'user'}`;
      
      await Share.share({
        message: profileUrl,
        title: `${profile.display_name || 'User'}'s Profile`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handlePreviewProfile = () => {
    console.log('Preview Profile');
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const pickBanner = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setBannerUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string, bucket: string, path: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(`${path}/${fileName}`, blob);

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(`${path}/${fileName}`);

      return data.publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      return null;
    }
  };

  const handleEditProfile = () => {
    setEditData({
      display_name: profile.display_name || '',
      username: profile.username || '',
      bio: profile.bio || '',
    });
    setAvatarUri(null);
    setBannerUri(null);
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (!userId) return;

      setSaving(true);
      let avatarUrl = profile.avatar_url;
      let bannerUrl = profile.banner_url;

      // Upload avatar if selected
      if (avatarUri) {
        avatarUrl = await uploadImage(avatarUri, 'avatars', userId);
      }

      // Upload banner if selected
      if (bannerUri) {
        bannerUrl = await uploadImage(bannerUri, 'banners', userId);
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editData.display_name,
          username: editData.username,
          bio: editData.bio,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
        })
        .eq('id', userId);

      if (error) {
        console.error('Update error:', error);
      } else {
        setProfile(prev => ({
          ...prev,
          display_name: editData.display_name,
          username: editData.username,
          bio: editData.bio,
          avatar_url: avatarUrl,
          banner_url: bannerUrl,
        }));
        setEditModalVisible(false);
        setAvatarUri(null);
        setBannerUri(null);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const fetchPrompts = async () => {
    try {
      if (!userId) return;

      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching prompts:', error);
      } else if (data) {
        console.log('Prompts fetched:', data);
        setPrompts(data);
      }
    } catch (error) {
      console.error('Error in fetchPrompts:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>View and edit your profile information</Text>
        </View>

        {/* Banner */}
        <View style={styles.bannerContainer}>
          <LinearGradient
            colors={['#1A0033', '#330066', '#1A0033']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}
          />
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            {profile?.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImage} />
            )}
          </View>

          {/* Verified Badge */}
          {profile?.is_verified && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-circle" size={14} color="#FFFFFF" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}

          {/* Display Name */}
          <Text style={styles.displayName}>{profile?.display_name || 'User'}</Text>
          <Text style={styles.username}>@{profile?.username || 'username'}</Text>
          <Text style={styles.email}>{profile?.email || 'email@example.com'}</Text>
          {profile?.bio && <Text style={styles.jobTitle}>{profile.bio}</Text>}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShareProfile}>
            <Feather name="share" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handlePreviewProfile}>
            <Feather name="eye" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <MaterialCommunityIcons name="pencil" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.total_prompts || 0}</Text>
            <Text style={styles.statLabel}>Published</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.total_followers || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['My Prompts', 'Saved', 'Activity'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { backgroundColor: '#2A2E3E' }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && { color: '#FFFFFF' }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}>
          {activeTab === 'My Prompts' && (
            <>
              {prompts.length > 0 ? (
                prompts.map((prompt) => {
                  const parsedContent = parseFullContent(prompt.content);
                  return (
                    <PromptCard
                      key={prompt.id}
                      title={prompt.title || 'Untitled'}
                      description={parsedContent.description || ''}
                      category={parsedContent.library || prompt.library ? String(parsedContent.library || prompt.library) : 'Uncategorized'}
                      tag={prompt.tag || ''}
                      likes={prompt.likes || 0}
                      views={prompt.views || 0}
                      creatorName={profile?.display_name || 'Unknown'}
                      creatorAvatar={profile?.avatar_url || ''}
                      thumbnailUrl={prompt.thumbnail_url}
                      onCopyToLibrary={() => console.log('Copy:', prompt.id)}
                      onSave={() => console.log('Save:', prompt.id)}
                      onLike={() => console.log('Like:', prompt.id)}
                      onShare={() => console.log('Share:', prompt.id)}
                    />
                  );
                })
              ) : (
                <View style={styles.emptyContent}>
                  <Text style={styles.emptyText}>No prompts yet</Text>
                </View>
              )}
            </>
          )}
          {activeTab === 'Saved' && (
            <View style={styles.emptyContent}>
              <Text style={styles.emptyText}>No saved prompts yet</Text>
            </View>
          )}
          {activeTab === 'Activity' && (
            <View style={styles.emptyContent}>
              <Text style={styles.emptyText}>No activity yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <Text style={styles.modalSubtitle}>Update your public profile information.</Text>
              </View>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Profile Picture */}
              <View style={[styles.modalSection, { alignItems: 'center' }]}>
                <Text style={styles.sectionLabel}>Profile Picture</Text>
                <TouchableOpacity onPress={pickAvatar} style={styles.avatarUploadArea}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={{ width: 80, height: 80, borderRadius: 40 }} />
                  ) : profile.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} style={{ width: 80, height: 80, borderRadius: 40 }} />
                  ) : (
                    <Text style={styles.avatarText}>{editData.display_name?.charAt(0).toUpperCase() || 'U'}</Text>
                  )}
                </TouchableOpacity>
                <Text style={{ color: '#A8ADB5', fontSize: 12, marginBottom: 8 }}>Tap to upload or drag & drop</Text>
                <TouchableOpacity 
                  style={{ paddingVertical: 8 }}
                  onPress={() => {
                    setAvatarUri(null);
                  }}
                >
                  <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '500' }}>Remove picture</Text>
                </TouchableOpacity>
              </View>

              {/* Display Name */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Display Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter display name"
                  placeholderTextColor="#6B7280"
                  value={editData.display_name}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, display_name: text }))}
                />
              </View>

              {/* Username */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  placeholderTextColor="#6B7280"
                  value={editData.username}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, username: text }))}
                />
              </View>

              {/* Bio */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Bio</Text>
                <TextInput
                  style={styles.bioInput}
                  placeholder="Tell us about yourself"
                  placeholderTextColor="#6B7280"
                  value={editData.bio}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, bio: text }))}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* Banner Image */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Banner Image</Text>
                <TouchableOpacity 
                  onPress={pickBanner}
                  style={{ backgroundColor: '#0F0F0F', borderRadius: 8, height: 100, borderWidth: 1, borderColor: '#3A3F4F', marginBottom: 12, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}
                >
                  {bannerUri ? (
                    <Image source={{ uri: bannerUri }} style={{ width: '100%', height: 100 }} />
                  ) : profile.banner_url ? (
                    <Image source={{ uri: profile.banner_url }} style={{ width: '100%', height: 100 }} />
                  ) : (
                    <MaterialCommunityIcons name="image-plus" size={32} color="#6B7280" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={{ paddingVertical: 8 }}
                  onPress={() => setBannerUri(null)}
                >
                  <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '500' }}>Remove banner</Text>
                </TouchableOpacity>
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setEditModalVisible(false)}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, saving && { opacity: 0.6 }]} 
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
