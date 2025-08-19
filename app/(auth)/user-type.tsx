import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, Alert, Platform, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { AlertCircle, X } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

export default function UserTypeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    name: string; 
    email: string; 
    password: string; 
    testUserType?: 'cook' | 'customer' 
  }>();
  const { signup, isLoading } = useAuthStore();
  const [signupError, setSignupError] = useState<{title: string, message: string} | null>(null);
  
  // Auto-signup for test users
  React.useEffect(() => {
    if (params.testUserType) {
      handleSelectUserType(params.testUserType);
    }
  }, [params.testUserType]);
  
  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return true; // Skip location permission on web
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
              onPress: () => requestLocationPermission(),
            },
          ]
        );
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
  };

  const handleSelectUserType = async (userType: 'cook' | 'customer') => {
    if (!params.name || !params.email || !params.password) {
      Alert.alert('Error', 'Missing required information');
      return;
    }
    
    try {
      console.log('🚀 Starting signup process...', {
        name: params.name,
        email: params.email,
        userType
      });
      
      await signup(
        {
          name: params.name,
          email: params.email,
        },
        params.password,
        userType
      );
      
      console.log('✅ Signup completed successfully');
      
      // Request location permission after successful signup
      const locationGranted = await requestLocationPermission();
      if (locationGranted || Platform.OS === 'web') {
        console.log('🏠 Navigating to edit profile...');
        router.replace('/edit-profile');
      }
    } catch (error) {
      console.error('❌ Signup failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      // Check if it's a duplicate key error and provide a better message
      if (errorMessage.includes('duplicate key value violates unique constraint')) {
        if (errorMessage.includes('users_email_key')) {
          setSignupError({
            title: 'Email Already Registered',
            message: 'An account with this email address already exists. Please use a different email or try logging in instead.'
          });
        } else {
          setSignupError({
            title: 'Account Already Exists',
            message: 'An account with this information already exists. Please try logging in or use different details.'
          });
        }
      } else {
        setSignupError({
          title: 'Signup Failed',
          message: errorMessage
        });
      }
    }
  };
  
  const closeSignupError = () => {
    setSignupError(null);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>I want to...</Text>
        <Text style={styles.subtitle}>Select how you want to use HomeCook</Text>
      </View>
      
      <View style={styles.options}>
        <View style={styles.option}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf' }}
            style={styles.optionImage}
          />
          <Text style={styles.optionTitle}>Become a Cook</Text>
          <Text style={styles.optionDescription}>
            Share your culinary creations with your community and earn money from your kitchen.
          </Text>
          <Button
            title="I'm a Cook"
            onPress={() => handleSelectUserType('cook')}
            loading={isLoading}
            disabled={isLoading}
            style={styles.optionButton}
            fullWidth
          />
        </View>
        
        <View style={styles.optionDivider} />
        
        <View style={styles.option}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1576867757603-05b134ebc379' }}
            style={styles.optionImage}
          />
          <Text style={styles.optionTitle}>Find Local Food</Text>
          <Text style={styles.optionDescription}>
            Discover and enjoy homemade meals from talented cooks in your neighborhood.
          </Text>
          <Button
            title="I'm a Customer"
            onPress={() => handleSelectUserType('customer')}
            variant="secondary"
            loading={isLoading}
            disabled={isLoading}
            style={styles.optionButton}
            fullWidth
          />
        </View>
      </View>
      
      {/* Error Modal */}
      <Modal
        visible={!!signupError}
        transparent
        animationType="fade"
        onRequestClose={closeSignupError}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.errorIconContainer}>
                <AlertCircle size={24} color={Colors.error} />
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeSignupError}
              >
                <X size={20} color={Colors.subtext} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalTitle}>{signupError?.title}</Text>
            <Text style={styles.modalMessage}>{signupError?.message}</Text>
            
            <View style={styles.modalActions}>
              <Button
                title="Try Again"
                onPress={closeSignupError}
                style={styles.modalButton}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.subtext,
  },
  options: {
    flex: 1,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  optionImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  optionButton: {
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: Colors.subtext,
    lineHeight: 24,
    marginBottom: 24,
  },
  modalActions: {
    marginTop: 8,
  },
  modalButton: {
    height: 48,
  },
});