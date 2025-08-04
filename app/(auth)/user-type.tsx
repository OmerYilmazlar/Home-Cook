import React from 'react';
import { StyleSheet, View, Text, Image, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

export default function UserTypeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name: string; email: string; password: string }>();
  const { signup, isLoading } = useAuthStore();
  
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
        console.log('🏠 Navigating to main app...');
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('❌ Signup failed:', error);
      Alert.alert('Signup Failed', error instanceof Error ? error.message : 'An error occurred');
    }
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
});