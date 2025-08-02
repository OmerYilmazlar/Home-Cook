import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Reservation } from '@/types';

interface NotificationSettings {
  pushNotifications: boolean;
  orderUpdates: boolean;
  messageNotifications: boolean;
}

interface NotificationState {
  expoPushToken: string | null;
  notifications: Notifications.Notification[];
  settings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
  
  initializeNotifications: () => Promise<void>;
  sendOrderNotification: (type: 'reserved' | 'confirmed' | 'ready', reservation: Reservation, recipientType: 'cook' | 'customer') => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  clearNotifications: () => void;
}

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const useNotificationsStore = create<NotificationState>((set, get) => ({
  expoPushToken: null,
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
      
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        set({ isLoading: false, error: 'Notification permissions not granted' });
        return;
      }
      
      // Get push token (only on mobile)
      let token = null;
      if (Platform.OS !== 'web') {
        try {
          token = (await Notifications.getExpoPushTokenAsync()).data;
          console.log('Expo push token:', token);
        } catch (error) {
          console.log('Failed to get push token:', error);
        }
      }
      
      set({ 
        expoPushToken: token,
        isLoading: false 
      });
      
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
      const { settings } = get();
      
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
      
      if (Platform.OS === 'web') {
        // For web, show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/favicon.png',
            badge: '/favicon.png'
          });
        } else {
          console.log('Web notification:', { title, body });
        }
      } else {
        // For mobile, use Expo notifications
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: {
              reservationId: reservation.id,
              type,
              recipientType
            },
          },
          trigger: null, // Show immediately
        });
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
  
  clearNotifications: () => {
    set({ notifications: [] });
    if (Platform.OS !== 'web') {
      Notifications.dismissAllNotificationsAsync();
    }
  },
}));

// Initialize notifications when the store is created
if (Platform.OS !== 'web') {
  useNotificationsStore.getState().initializeNotifications();
} else {
  // For web, request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      console.log('Web notification permission:', permission);
    });
  }
}