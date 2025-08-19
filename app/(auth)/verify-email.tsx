import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    name: string; 
    email: string; 
    password: string; 
  }>();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  useEffect(() => {
    // Send initial verification email when component mounts
    if (params.email && !emailSent) {
      sendVerificationEmail();
    }
  }, [params.email]);
  
  useEffect(() => {
    // Countdown timer for resend button
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);
  
  const sendVerificationEmail = async () => {
    if (!params.email || !params.password) {
      Alert.alert('Error', 'Missing email or password information');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('📧 Sending verification email to:', params.email);
      
      // Sign up the user with Supabase Auth (this will send verification email)
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          emailRedirectTo: 'homecook://verify-email-confirm'
        }
      });
      
      if (error) {
        console.error('❌ Verification email failed:', error.message);
        Alert.alert('Error', error.message);
        return;
      }
      
      console.log('✅ Verification email sent successfully');
      setEmailSent(true);
      setCountdown(60); // 60 second cooldown
      
    } catch (error) {
      console.error('❌ Verification email error:', error);
      Alert.alert('Error', 'Failed to send verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: params.email,
        options: {
          emailRedirectTo: 'homecook://verify-email-confirm'
        }
      });
      
      if (error) {
        console.error('❌ Resend failed:', error.message);
        Alert.alert('Error', error.message);
        return;
      }
      
      console.log('✅ Verification email resent successfully');
      Alert.alert('Email Sent', 'A new verification email has been sent to your inbox.');
      setCountdown(60);
      
    } catch (error) {
      console.error('❌ Resend error:', error);
      Alert.alert('Error', 'Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };
  
  const handleBackToSignup = () => {
    router.back();
  };
  
  const handleContinueAnyway = () => {
    // Continue to user type selection without email verification
    router.push({
      pathname: '/user-type',
      params: {
        name: params.name,
        email: params.email,
        password: params.password,
        skipVerification: 'true'
      },
    });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Mail size={64} color={Colors.primary} />
        </View>
        
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          We've sent a verification link to:
        </Text>
        <Text style={styles.email}>{params.email}</Text>
        
        <Text style={styles.description}>
          Please check your email and click the verification link to continue with your account setup.
        </Text>
        
        <View style={styles.actions}>
          <Button
            title={isResending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
            onPress={handleResendEmail}
            loading={isResending}
            disabled={isResending || countdown > 0}
            variant="secondary"
            style={styles.button}
            fullWidth
          />
          
          <Button
            title="Continue Without Verification"
            onPress={handleContinueAnyway}
            variant="outline"
            style={styles.button}
            fullWidth
          />
          
          <TouchableOpacity onPress={handleBackToSignup} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Didn't receive the email? Check your spam folder or try resending.
        </Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.subtext,
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  button: {
    height: 50,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.subtext,
    fontWeight: '500',
  },
  footer: {
    paddingTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: Colors.subtext,
    textAlign: 'center',
    lineHeight: 18,
  },
});