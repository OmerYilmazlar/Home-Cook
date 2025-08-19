import React, { useEffect, useRef } from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, ActivityIndicator, Text, StyleSheet, AppState } from 'react-native';
import { Home, Search, MessageCircle, ShoppingBag, User } from 'lucide-react-native';
// Import removed as we're using the theme context
import { useAuthStore } from '@/store/auth-store';
import { useMessagingStore } from '@/store/messaging-store';
import { useTheme } from '@/store/theme-store';

export default function TabLayout() {
  const { user, isAuthenticated, isInitialized, initialize } = useAuthStore();
  const { conversations, initializeMessages, fetchConversations } = useMessagingStore();
  const { colors } = useTheme();
  const isCook = user?.userType === 'cook';
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Calculate total unread messages
  const totalUnreadMessages = conversations.reduce((total, conversation) => {
    return total + (conversation.unreadCount || 0);
  }, 0);
  
  // Custom Messages tab icon with badge
  const MessagesTabIcon = ({ color }: { color: string }) => (
    <View style={styles.tabIconContainer}>
      <MessageCircle size={24} color={color} />
      {totalUnreadMessages > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.white }]}>
          <Text style={[styles.badgeText, { color: colors.white }]}>
            {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages.toString()}
          </Text>
        </View>
      )}
    </View>
  );
  
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);
  
  useEffect(() => {
    // Initialize messaging store
    initializeMessages();
  }, []);
  
  // Fetch conversations periodically and on app state changes
  useEffect(() => {
    if (!user || !isAuthenticated) return;
    
    // Initial fetch
    fetchConversations(user.id);
    
    // Set up periodic refresh every 30 seconds
    intervalRef.current = setInterval(() => {
      fetchConversations(user.id);
    }, 30000) as ReturnType<typeof setInterval>;
    
    // Handle app state changes
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        fetchConversations(user.id);
      }
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      subscription?.remove();
    };
  }, [user, isAuthenticated, fetchConversations]);
  
  // Show loading while initializing
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  // Redirect to auth if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore-map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: MessagesTabIcon,
        }}
      />
      
      <Tabs.Screen
        name="orders"
        options={{
          title: isCook ? 'Orders' : 'My Orders',
          tabBarIcon: ({ color }) => <ShoppingBag size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

// Create static styles
const styles = StyleSheet.create({
  tabIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});