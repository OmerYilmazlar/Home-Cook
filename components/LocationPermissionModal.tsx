import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { MapPin, Settings, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as IntentLauncher from 'expo-intent-launcher';
import Colors from '@/constants/colors';
import Button from './Button';
import { useAuthStore } from '@/store/auth-store';
import { useLocationStore } from '@/store/location-store';

interface LocationPermissionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LocationPermissionModal({
  visible,
  onClose,
}: LocationPermissionModalProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { requestLocationPermission, checkLocationPermission } = useLocationStore();

  const handleOpenSettings = async () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Enable Location',
        'Please enable location services in your browser settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      if (Platform.OS === 'ios') {
        await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS);
      } else {
        await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS);
      }
      
      // Check permission again after user returns from settings
      setTimeout(() => {
        checkLocationPermission();
      }, 1000);
    } catch (error) {
      console.error('Error opening settings:', error);
      Alert.alert(
        'Settings Error',
        'Unable to open settings. Please manually enable location services for HomeCook.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleTryAgain = async () => {
    const granted = await requestLocationPermission();
    if (granted) {
      onClose();
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to enable location access to use HomeCook.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)');
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <MapPin size={48} color={Colors.primary} />
          </View>
          
          <Text style={styles.title}>Location Access Required</Text>
          <Text style={styles.message}>
            HomeCook needs access to your location to show nearby cooks and meals. 
            Please enable location services to continue using the app.
          </Text>
          
          <View style={styles.buttons}>
            <Button
              title="Try Again"
              onPress={handleTryAgain}
              style={styles.button}
              fullWidth
            />
            
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={handleOpenSettings}
            >
              <Settings size={20} color={Colors.primary} />
              <Text style={styles.settingsButtonText}>Open Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <LogOut size={20} color={Colors.error} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.subtext,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    gap: 8,
  },
  settingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
});