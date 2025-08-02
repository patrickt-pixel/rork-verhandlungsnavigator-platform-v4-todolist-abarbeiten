import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/hooks/auth-store";
import { ConsultantProvider } from "@/hooks/consultant-store";
import { BookingProvider } from "@/hooks/booking-store";
import { ChatProvider } from "@/hooks/chat-store";
import { NotificationProvider } from "@/hooks/notification-store";
import { ToastProvider } from "@/hooks/toast-store";
import { GlobalToast } from "@/components/GlobalToast";
import { COLORS } from "@/constants/colors";
import { DatabaseService } from "@/lib/supabase-service";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// This hook manages the authentication routing logic
const useProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';

    if (!isLoading && !isAuthenticated && !inAuthGroup) {
      // Redirect to login if user is not authenticated and not in auth group
      router.replace('/auth/login');
    } else if (!isLoading && isAuthenticated && inAuthGroup) {
      // Redirect to home if user is authenticated but still in auth group
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, router]);
};

function RootLayoutNav() {
  const { isLoading } = useAuth();
  useProtectedRoute();

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Slot renders the appropriate page based on the current route
  return (
    <>
      <Slot />
      <GlobalToast />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    
    // Initialize database connection
    DatabaseService.initialize().then((result) => {
      if (result.success) {
        console.log('✅ Database initialized successfully');
        
        // Get and log database stats
        DatabaseService.getStats().then((stats) => {
          if (stats) {
            console.log('📊 Database Stats:', stats);
          }
        });
      } else {
        console.log('⚠️ Database initialization failed:', result.error);
        console.log('📱 App will run in mock mode');
      }
    }).catch((error) => {
      console.log('❌ Database initialization error:', error);
      console.log('📱 App will run in mock mode');
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <ConsultantProvider>
              <BookingProvider>
                <ChatProvider>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <RootLayoutNav />
                  </GestureHandlerRootView>
                </ChatProvider>
              </BookingProvider>
            </ConsultantProvider>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}