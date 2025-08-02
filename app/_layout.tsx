import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
// Imports removed as we're using the theme context
import { ThemeProvider, useTheme } from "@/store/theme-store";
import { useNotificationsStore } from "@/store/notifications-store";
import { useLocationStore } from "@/store/location-store";
import { useAuthStore } from "@/store/auth-store";
import NotificationBanner from "@/components/NotificationBanner";
import LocationPermissionModal from "@/components/LocationPermissionModal";
import { Platform } from "react-native";

export const unstable_settings = {
  initialRouteName: "(auth)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Handle MetaMask injection gracefully on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Create a mock ethereum object to prevent MetaMask errors
      const windowWithEthereum = window as any;
      if (!windowWithEthereum.ethereum) {
        Object.defineProperty(windowWithEthereum, 'ethereum', {
          value: {
            isMetaMask: false,
            request: () => Promise.reject(new Error('MetaMask not available in this app')),
            on: () => {},
            removeListener: () => {},
            removeAllListeners: () => {}
          },
          writable: false,
          configurable: false
        });
      }
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ThemedStack />
        </ThemeProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function ThemedStack() {
  const { colors, isDark, isLoaded } = useTheme();
  const { initializeNotifications, notifications } = useNotificationsStore();
  const { isAuthenticated } = useAuthStore();
  const { 
    showLocationModal, 
    setShowLocationModal, 
    checkLocationPermission, 
    startLocationMonitoring, 
    stopLocationMonitoring 
  } = useLocationStore();
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  
  console.log('ThemedStack: isLoaded =', isLoaded);
  
  // Initialize notifications when app starts
  useEffect(() => {
    if (isLoaded) {
      initializeNotifications();
    }
  }, [isLoaded, initializeNotifications]);
  
  // Initialize location monitoring when user is authenticated
  useEffect(() => {
    if (isAuthenticated && isLoaded) {
      checkLocationPermission();
      startLocationMonitoring();
    } else if (!isAuthenticated) {
      stopLocationMonitoring();
    }
    
    return () => {
      if (!isAuthenticated) {
        stopLocationMonitoring();
      }
    };
  }, [isAuthenticated, isLoaded, checkLocationPermission, startLocationMonitoring, stopLocationMonitoring]);
  
  // Show latest unread notification
  useEffect(() => {
    const latestUnreadNotification = notifications.find(n => !n.read);
    if (latestUnreadNotification && latestUnreadNotification !== currentNotification) {
      setCurrentNotification(latestUnreadNotification);
    }
  }, [notifications, currentNotification]);
  
  // Wait for theme to load
  if (!isLoaded) {
    console.log('ThemedStack: Theme not loaded yet, returning null');
    return null;
  }
  
  console.log('ThemedStack: Theme loaded, rendering stack');
  
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <NotificationBanner 
        notification={currentNotification || undefined}
        onDismiss={() => setCurrentNotification(null)}
      />
      <LocationPermissionModal
        visible={showLocationModal && isAuthenticated}
        onClose={() => setShowLocationModal(false)}
      />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="meal/[id]" 
          options={{ 
            title: "Meal Details",
            presentation: "card",
          }} 
        />
        <Stack.Screen 
          name="cook/[id]" 
          options={{ 
            title: "Cook Profile",
            presentation: "card",
          }} 
        />
        <Stack.Screen 
          name="reservation/[id]" 
          options={{ 
            title: "Reservation Details",
            presentation: "card",
          }} 
        />
        <Stack.Screen 
          name="messages/[id]" 
          options={{ 
            title: "Messages",
            presentation: "card",
          }} 
        />
        <Stack.Screen 
          name="add-meal" 
          options={{ 
            title: "Add New Meal",
            presentation: "modal",
          }} 
        />
        <Stack.Screen 
          name="edit-profile" 
          options={{ 
            title: "Edit Profile",
            presentation: "modal",
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: "Settings",
            presentation: "card",
          }} 
        />
        <Stack.Screen 
          name="my-meals" 
          options={{ 
            title: "My Meals",
            presentation: "card",
          }} 
        />
      </Stack>
    </>
  );
}