import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, AlertCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

export default function VerifyEmailConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    token?: string;
    type?: string;
  }>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    verifyEmail();
  }, []);
  
  const verifyEmail = async () => {
    try {
      console.log('🔍 Verifying email with params:', params);
      
      // Check if user is already authenticated (email was verified)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session check failed:', sessionError.message);
        setError('Failed to verify email. Please try again.');
        return;
      }
      
      if (session?.user?.email_confirmed_at) {
        console.log('✅ Email already verified');
        setIsVerified(true);
      } else {
        console.log('❌ Email not verified yet');
        setError('Email verification failed. Please try clicking the link again or request a new verification email.');
      }
      
    } catch (error) {
      console.error('❌ Email verification error:', error);
      setError('An error occurred during email verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleContinue = () => {
    // Navigate to login screen so user can complete the signup process
    router.replace('/login');
  };
  
  const handleBackToSignup = () => {
    router.replace('/signup');
  };
  
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.title}>Verifying Email...</Text>
        <Text style={styles.subtitle}>Please wait while we verify your email address.</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, styles.errorIconContainer]}>
            <AlertCircle size={64} color={Colors.error} />
          </View>
          
          <Text style={styles.title}>Verification Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          
          <View style={styles.actions}>
            <Button
              title="Try Again"
              onPress={handleBackToSignup}
              style={styles.button}
              fullWidth
            />
          </View>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, styles.successIconContainer]}>
          <CheckCircle size={64} color={Colors.success} />
        </View>
        
        <Text style={styles.title}>Email Verified!</Text>
        <Text style={styles.subtitle}>
          Your email has been successfully verified. You can now log in to complete your account setup.
        </Text>
        
        <View style={styles.actions}>
          <Button
            title="Continue to Login"
            onPress={handleContinue}
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
    padding: 24,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successIconContainer: {
    backgroundColor: '#F0FDF4',
  },
  errorIconContainer: {
    backgroundColor: '#FEF2F2',
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
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  actions: {
    width: '100%',
  },
  button: {
    height: 50,
  },
});