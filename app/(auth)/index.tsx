import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isInitialized, initialize } = useAuthStore();
  
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);
  
  // Show loading while initializing
  if (!isInitialized) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.title}>HomeCook</Text>
      </View>
    );
  }
  
  // If user is already authenticated, redirect to main app
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  
  const handleLogin = () => {
    router.push('/login');
  };
  
  const handleSignup = () => {
    router.push('/signup');
  };
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255,126,54,0.1)', 'rgba(255,126,54,0)']}
        style={styles.gradient}
      />
      
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836' }}
          style={styles.logoImage}
        />
        <View style={styles.logoOverlay}>
          <Text style={styles.logoText}>HomeCook</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Homemade Food, Delivered with Love</Text>
        <Text style={styles.subtitle}>
          Connect with local home cooks or share your culinary creations with your community.
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Log In"
            onPress={handleLogin}
            style={styles.button}
            fullWidth
          />
          <Button
            title="Sign Up"
            onPress={handleSignup}
            variant="outline"
            style={styles.button}
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
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  logoContainer: {
    height: '50%',
    width: '100%',
    position: 'relative',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.subtext,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    height: 50,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});