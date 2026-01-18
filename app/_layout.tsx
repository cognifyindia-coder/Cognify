import { Tabs, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase/utils/supabase';
import { Text, View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';

function TabIconWithOverlay({ focused, size, color, children }: any) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = focused ? withSpring(1, { damping: 10, mass: 1 }) : 0;
  }, [focused]);

  return (
    <Animated.View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          width: size + 28,
          height: size + 28,
          borderRadius: (size + 28) / 2,
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          transform: [{ scale }],
        }}
      />
      {children}
    </Animated.View>
  );
}

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
    
    const subscription = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await checkOnboardingStatus(session.user.id);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        setHasOnboarded(null);
      }
    });

    return () => {
      subscription.data.subscription?.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await checkOnboardingStatus(session.user.id);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoggedIn(false);
    }
  };

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('has_onboarded')
        .eq('id', userId)
        .single();

      if (error) {
        setHasOnboarded(false);
      } else {
        setHasOnboarded(!!profile?.has_onboarded);
      }
    } catch (error) {
      console.error('Onboarding check error:', error);
      setHasOnboarded(false);
    }
  };

  if (isLoggedIn === null || (isLoggedIn && hasOnboarded === null)) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#0A0E27' }} />
      </SafeAreaProvider>
    );
  }

  if (!isLoggedIn) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="login" />
      </Stack>
    );
  }

  if (!hasOnboarded) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="onboarding-username" />
        <Stack.Screen name="onboarding-bio" />
        <Stack.Screen name="onboarding-team" />
        <Stack.Screen name="onboarding-interests" />
        <Stack.Screen name="onboarding-goals" />
        <Stack.Screen name="onboarding-profile-picture" />
        <Stack.Screen name="onboarding-success" />
      </Stack>
    );
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
  marginHorizontal: '15%',
  width: '70%',
  alignSelf: 'center',
  backgroundColor: 'rgba(20, 20, 30, 0.9)',
  borderColor: 'rgba(100, 100, 120, 0.3)',
  borderWidth: 1,
  borderRadius: 36,
  height: 70,
  paddingTop: 16,
  paddingBottom: 12,
  paddingHorizontal: 4,
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
           tabBarIcon: ({ color, size, focused }) => (
             <TabIconWithOverlay focused={focused} size={size} color={color}>
               <FontAwesome5 name="home" size={size} color={color} />
             </TabIconWithOverlay>
           ),
         }}
       />
       <Tabs.Screen
         name="search"
         options={{
           title: 'Community',
           tabBarIcon: ({ color, size, focused }) => (
             <TabIconWithOverlay focused={focused} size={size} color={color}>
               <FontAwesome5 name="users" size={size} color={color} />
             </TabIconWithOverlay>
           ),
         }}
       />
       <Tabs.Screen
         name="create"
         options={{
           title: 'Create',
           tabBarIcon: ({ color, size, focused }) => (
             <TabIconWithOverlay focused={focused} size={size} color={color}>
               <FontAwesome5 name="plus-circle" size={size} color={color} />
             </TabIconWithOverlay>
           ),
         }}
       />
       <Tabs.Screen
         name="profile"
         options={{
           title: 'Profile',
           tabBarIcon: ({ color, size, focused }) => (
             <TabIconWithOverlay focused={focused} size={size} color={color}>
               <FontAwesome5 name="user" size={size} color={color} />
             </TabIconWithOverlay>
           ),
         }}
       />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="onboarding"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="onboarding-username"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="onboarding-bio"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="onboarding-team"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="onboarding-interests"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="onboarding-goals"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="onboarding-profile-picture"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="onboarding-success"
        options={{
          href: null,
          tabBarStyle: { display: 'none' },
        }}
      />
    </Tabs>
    </SafeAreaProvider>
  );
}
