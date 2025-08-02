import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import { Reservation } from '@/types';

interface NotificationSettings {
  pushNotifications: boolean;
  orderUpdates: boolean;
  messageNotifications: boolean;
}

interface LocalNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  type: 'reserved' | 'confirmed' | 'ready';
  reservationId: string;
}

interface NotificationState {
  notifications: LocalNotification[];
  settings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
  
  initializeNotifications: () => Promise<void>;
  sendOrderNotification: (type: 'reserved' | 'confirmed' | 'ready', reservation: Reservation, recipientType: 'cook' | 'customer') => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  markAsRead: (notificationId: string) => void;
  clearNotifications: () => void;
  getUnreadCount: () => number;
}

export const useNotificationsStore = create<NotificationState>((set, get) => ({
  notifications: [],
  settings: {
    pushNotifications: true,
    orderUpdates: true,
    messageNotifications: true,
  },
  isLoading: false,
  error: null,
  
  initializeNotifications: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Load saved notification settings
      try {
        const savedSettings = await AsyncStorage.getItem('notificationSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          set({ settings });
          console.log('Loaded notification settings:', settings);
        }
      } catch (error) {
        console.log('Failed to load notification settings:', error);
      }
      
      // Load saved notifications
      try {
        const savedNotifications = await AsyncStorage.getItem('localNotifications');
        if (savedNotifications) {
          const notifications = JSON.parse(savedNotifications);
          set({ notifications });
          console.log('Loaded local notifications:', notifications.length);
        }
      } catch (error) {
        console.log('Failed to load notifications:', error);
      }
      
      // Request web notification permission if on web
      if (Platform.OS === 'web' && 'Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      
      set({ isLoading: false });
      console.log('Notifications initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize notifications',
        isLoading: false 
      });
    }
  },
  
  sendOrderNotification: async (type: 'reserved' | 'confirmed' | 'ready', reservation: Reservation, recipientType: 'cook' | 'customer') => {
    try {
      const { settings, notifications } = get();
      
      // Check if notifications are enabled
      if (!settings.pushNotifications || !settings.orderUpdates) {
        console.log('Order notifications are disabled');
        return;
      }
      
      let title = '';
      let body = '';
      
      if (type === 'reserved' && recipientType === 'cook') {
        title = '🍽️ New Order Received!';
        body = `You have a new order for ${reservation.quantity} meal(s). Please confirm or decline.`;
      } else if (type === 'confirmed' && recipientType === 'customer') {
        title = '✅ Order Confirmed!';
        body = `Your order has been confirmed! The cook is preparing your meal(s).`;
      } else if (type === 'ready' && recipientType === 'customer') {
        title = '🎉 Order Ready for Pickup!';
        body = `Your meal(s) are ready! Please pick them up at the scheduled time.`;
      }
      
      // Create local notification
      const notification: LocalNotification = {
        id: `${Date.now()}-${Math.random()}`,
        title,
        body,
        timestamp: Date.now(),
        read: false,
        type,
        reservationId: reservation.id
      };
      
      const updatedNotifications = [notification, ...notifications];
      set({ notifications: updatedNotifications });
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('localNotifications', JSON.stringify(updatedNotifications));
      
      // Show system notification/alert
      if (Platform.OS === 'web') {
        // For web, show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/favicon.png',
            badge: '/favicon.png'
          });
        } else {
          // Fallback to alert
          Alert.alert(title, body);
        }
      } else {
        // For mobile, show alert (since expo-notifications has limitations in Expo Go)
        Alert.alert(title, body, [
          { text: 'OK', style: 'default' }
        ]);
      }
      
      console.log('Notification sent:', { type, recipientType, title, body });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  },
  
  updateNotificationSettings: async (newSettings: Partial<NotificationSettings>) => {
    try {
      const { settings } = get();
      const updatedSettings = { ...settings, ...newSettings };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(updatedSettings));
      
      set({ settings: updatedSettings });
      console.log('Notification settings updated:', updatedSettings);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  },
  
  markAsRead: (notificationId: string) => {
    const { notifications } = get();
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    set({ notifications: updatedNotifications });
    
    // Save to AsyncStorage
    AsyncStorage.setItem('localNotifications', JSON.stringify(updatedNotifications))
      .catch(error => console.error('Failed to save notifications:', error));
  },
  
  clearNotifications: async () => {
    set({ notifications: [] });
    try {
      await AsyncStorage.removeItem('localNotifications');
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  },
  
  getUnreadCount: () => {
    const { notifications } = get();
    return notifications.filter(n => !n.read).length;
  },
}));

// Initialize notifications when the store is created
useNotificationsStore.getState().initializeNotifications();