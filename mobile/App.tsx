import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './src/supabase';
import { colors } from './src/theme';
import Auth from './src/screens/Auth';
import Dashboard from './src/screens/Dashboard';
import Projects from './src/screens/Projects';
import Profile from './src/screens/Profile';

const Tab = createBottomTabNavigator();
const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Accueil: 'home', Projets: 'briefcase', Profil: 'person',
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={colors.accent} /></View>;

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      {session ? (
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerStyle: { backgroundColor: colors.primary },
              headerTintColor: '#fff',
              tabBarActiveTintColor: colors.accent,
              tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} color={color} size={size} />,
            })}
          >
            <Tab.Screen name="Accueil" component={Dashboard} />
            <Tab.Screen name="Projets" component={Projects} />
            <Tab.Screen name="Profil" component={Profile} />
          </Tab.Navigator>
        </NavigationContainer>
      ) : (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}><Auth /></SafeAreaView>
      )}
    </SafeAreaProvider>
  );
}
