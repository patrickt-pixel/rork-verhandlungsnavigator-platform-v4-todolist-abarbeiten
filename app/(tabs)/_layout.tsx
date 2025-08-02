import { Tabs } from 'expo-router';
import { Home, Search, Calendar, MessageCircle, BarChart3, Clock } from 'lucide-react-native';
import React from 'react';
import { Platform } from 'react-native';
import { useAuth } from '@/hooks/auth-store';
import { COLORS } from '@/constants/colors';

export default function TabLayout() {
  const { user } = useAuth();

  // This component will only render if user is authenticated (handled by root layout)
  if (!user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 0.5,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 32 : 12,
          height: Platform.OS === 'ios' ? 88 : 68,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      {user.role === 'client' ? (
        // Client tabs
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, focused }) => (
                <Home 
                  color={focused ? COLORS.primary : color} 
                  size={22} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: "Suchen",
              tabBarIcon: ({ color, focused }) => (
                <Search 
                  color={focused ? COLORS.primary : color} 
                  size={22} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="bookings"
            options={{
              title: "Termine",
              tabBarIcon: ({ color, focused }) => (
                <Calendar 
                  color={focused ? COLORS.primary : color} 
                  size={22} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="messages"
            options={{
              title: "Chat",
              tabBarIcon: ({ color, focused }) => (
                <MessageCircle 
                  color={focused ? COLORS.primary : color} 
                  size={22} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
            }}
          />
          {/* Hide consultant-only screens for clients */}
          <Tabs.Screen
            name="consultant-dashboard"
            options={{
              href: null, // This hides the tab
            }}
          />
          <Tabs.Screen
            name="consultant-bookings"
            options={{
              href: null, // This hides the tab
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              href: null, // This hides the tab - profile moved to header
            }}
          />
        </>
      ) : (
        // Consultant tabs
        <>
          <Tabs.Screen
            name="consultant-dashboard"
            options={{
              title: "Dashboard",
              tabBarIcon: ({ color, focused }) => (
                <BarChart3 
                  color={focused ? COLORS.primary : color} 
                  size={22} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="consultant-bookings"
            options={{
              title: "Termine",
              tabBarIcon: ({ color, focused }) => (
                <Clock 
                  color={focused ? COLORS.primary : color} 
                  size={22} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
            }}
          />
          <Tabs.Screen
            name="messages"
            options={{
              title: "Chat",
              tabBarIcon: ({ color, focused }) => (
                <MessageCircle 
                  color={focused ? COLORS.primary : color} 
                  size={22} 
                  strokeWidth={focused ? 2.5 : 2}
                />
              ),
            }}
          />
          {/* Hide client-only screens for consultants */}
          <Tabs.Screen
            name="index"
            options={{
              href: null, // This hides the tab
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              href: null, // This hides the tab
            }}
          />
          <Tabs.Screen
            name="bookings"
            options={{
              href: null, // This hides the tab
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              href: null, // This hides the tab - profile moved to header
            }}
          />
        </>
      )}
    </Tabs>
  );
}