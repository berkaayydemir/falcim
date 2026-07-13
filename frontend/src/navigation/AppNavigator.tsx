import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors, FontFamily } from '../theme';
import { RootStackParamList, TabParamList, AuthStackParamList } from '../types';
import { useAuth } from '../context/AuthContext';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import PremiumScreen from '../screens/PremiumScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ResultScreen from '../screens/ResultScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();

const navTheme = {
  dark: true,
  colors: {
    primary: Colors.gold,
    background: Colors.bg,
    card: Colors.bg,
    text: Colors.cream,
    border: Colors.card,
    notification: Colors.gold,
  },
};

type TabIcon = { icon: string; label: string };

const TAB_META: Record<keyof TabParamList, TabIcon> = {
  Home: { icon: '☕', label: 'Fal' },
  History: { icon: '📜', label: 'Geçmiş' },
  Premium: { icon: '✦', label: 'Premium' },
  Profile: { icon: '👤', label: 'Profil' },
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.gold,
        tabBarInactiveTintColor: Colors.mist,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color }) => (
          <Text style={[styles.tabIcon, { color }]}>{TAB_META[route.name].icon}</Text>
        ),
        tabBarLabel: TAB_META[route.name].label,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Premium" component={PremiumScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen
        name="Loading"
        component={LoadingScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="Result" component={ResultScreen} />
    </Stack.Navigator>
  );
}

function AuthFlow() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function Splash() {
  return (
    <View style={styles.splash}>
      <ActivityIndicator color={Colors.gold} size="large" />
    </View>
  );
}

export default function AppNavigator() {
  const { status } = useAuth();

  return (
    <NavigationContainer theme={navTheme}>
      {status === 'loading' ? (
        <Splash />
      ) : status === 'authed' ? (
        <MainStack />
      ) : (
        <AuthFlow />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.bg,
    borderTopColor: Colors.card,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: FontFamily.sansMed,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  tabIcon: {
    fontSize: 18,
  },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
});
