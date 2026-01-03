import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase/utils/supabase';
import { useRouter } from 'expo-router';
import { Text, View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    
    if (!session) {
      router.replace('/login');
    }
  };

  if (isLoggedIn === null) {
    return null;
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E27" translucent={true} />
      <Tabs
        screenOptions={{
          headerShown: false,
        tabBarStyle: {
  position: 'absolute',
  bottom: 30,
  marginHorizontal: '10%',
  width: '80%',
  alignSelf: 'center',
  backgroundColor: 'rgba(20, 20, 30, 0.9)',
  borderColor: 'rgba(100, 100, 120, 0.3)',
  borderWidth: 1.8,
  borderRadius: 36,
  height: 75,
  paddingTop: 16,
  paddingBottom: 12,
  paddingHorizontal: 6,
  flexDirection: 'row',
  borderTopWidth: 0,
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 20 },
  shadowOpacity: 0.22,
  shadowRadius: 55,
  elevation: 30,
  overflow: 'hidden',
  backdropFilter: 'blur(40px)',
},
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#A8ADB5',
        tabBarLabelStyle: {
          display: 'none',
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="users" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="plus-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="onboarding"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="onboarding-username"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="onboarding-bio"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="onboarding-team"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="onboarding-interests"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="onboarding-goals"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="onboarding-profile-picture"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="onboarding-success"
        options={{
          href: null,
        }}
      />
    </Tabs>
    </SafeAreaProvider>
  );
}
