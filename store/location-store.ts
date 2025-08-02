import { create } from 'zustand';
import { Platform, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useAuthStore } from './auth-store';

interface LocationState {
  hasPermission: boolean;
  isLocationEnabled: boolean;
  isMonitoring: boolean;
  showLocationModal: boolean;
  userLocation: Location.LocationObject | null;
  checkLocationPermission: () => Promise<void>;
  requestLocationPermission: () => Promise<boolean>;
  startLocationMonitoring: () => void;
  stopLocationMonitoring: () => void;
  setShowLocationModal: (show: boolean) => void;
  handleLocationDisabled: () => void;
}

let locationSubscription: Location.LocationSubscription | null = null;

export const useLocationStore = create<LocationState>()((set, get) => ({
  hasPermission: false,
  isLocationEnabled: false,
  isMonitoring: false,
  showLocationModal: false,
  userLocation: null,

  checkLocationPermission: async () => {
    if (Platform.OS === 'web') {
      set({ hasPermission: true, isLocationEnabled: true });
      return;
    }

    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      
      if (hasPermission) {
        const isLocationEnabled = await Location.hasServicesEnabledAsync();
        set({ hasPermission, isLocationEnabled });
        
        if (!isLocationEnabled) {
          get().handleLocationDisabled();
        }
      } else {
        set({ hasPermission: false, isLocationEnabled: false });
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      set({ hasPermission: false, isLocationEnabled: false });
    }
  },

  requestLocationPermission: async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return true;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Required',
          'HomeCook needs access to your location to show nearby cooks and meals. Please enable location access to continue.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Try Again',
              onPress: () => get().requestLocationPermission(),
            },
          ]
        );
        return false;
      }
      
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      set({ hasPermission: true, isLocationEnabled });
      
      if (!isLocationEnabled) {
        get().handleLocationDisabled();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      Alert.alert(
        'Permission Error',
        'Unable to request location permission. Please try again.',
        [{ text: 'OK' }]
      );
      return false;
    }
  },

  startLocationMonitoring: () => {
    if (Platform.OS === 'web' || get().isMonitoring) {
      return;
    }

    const startMonitoring = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 30000, // Check every 30 seconds
            distanceInterval: 100, // Or when moved 100 meters
          },
          async (location) => {
            set({ userLocation: location });
            
            // Check if location services are still enabled
            const isLocationEnabled = await Location.hasServicesEnabledAsync();
            if (!isLocationEnabled && get().isLocationEnabled) {
              // Location was just disabled
              set({ isLocationEnabled: false });
              get().handleLocationDisabled();
            } else if (isLocationEnabled && !get().isLocationEnabled) {
              // Location was just enabled
              set({ isLocationEnabled: true, showLocationModal: false });
            }
          }
        );
        
        set({ isMonitoring: true });
      } catch (error) {
        console.error('Error starting location monitoring:', error);
      }
    };

    startMonitoring();
  },

  stopLocationMonitoring: () => {
    if (locationSubscription) {
      locationSubscription.remove();
      locationSubscription = null;
    }
    set({ isMonitoring: false });
  },

  setShowLocationModal: (show: boolean) => {
    set({ showLocationModal: show });
  },

  handleLocationDisabled: () => {
    set({ showLocationModal: true });
  },
}));