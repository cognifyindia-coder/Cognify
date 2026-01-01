import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase/utils/supabase';
import { useRouter } from 'expo-router';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4F46E5',
    paddingTop: 50,
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
    color: '#E0E7FF',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  userCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  logoutBtn: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default function HomePage() {
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_onboarded')
        .eq('id', session.user.id)
        .single();

      if (!profile?.has_onboarded) {
        router.replace('/onboarding');
        return;
      }

      setEmail(session.user.email);
    } else {
      router.replace('/login');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEmail(null);
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cognify</Text>
        <Text style={styles.headerSubtitle}>Smart Learning Platform</Text>
      </View>

      <View style={styles.content}>
        {email && (
          <View style={styles.section}>
            <View style={styles.userCard}>
              <Text style={styles.userEmail}>👤 {email}</Text>
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welcome to Cognify</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              An AI-powered learning platform designed to help you master new skills and achieve your educational goals.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>📚 Personalized Learning Paths</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardText}>🤖 AI-Powered Assistance</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardText}>📊 Progress Tracking</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardText}>🎯 Adaptive Quizzes</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Started</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              Start your learning journey today and unlock your potential with our comprehensive courses and interactive lessons.
            </Text>
          </View>
        </View>
      </View>

      <StatusBar style="auto" />
    </ScrollView>
  );
}
