import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';


export default function VerifyEmailConfirmRootScreen() {
  const router = useRouter();
  
  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        console.log('🔍 Handling email verification from deep link...');
        
        // Check if user is now authenticated
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session check failed:', error.message);
          router.replace('/(auth)/verify-email-confirm');
          return;
        }
        
        if (session?.user?.email_confirmed_at) {
          console.log('✅ Email verified successfully');
          // Navigate to login screen so user can complete signup
          setTimeout(() => {
            router.replace('/(auth)/login');
          }, 2000);
        } else {
          console.log('❌ Email not verified');
          router.replace('/(auth)/verify-email-confirm');
        }
        
      } catch (error) {
        console.error('❌ Email verification error:', error);
        router.replace('/(auth)/verify-email-confirm');
      }
    };
    
    handleEmailVerification();
  }, [router]);
  

  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle size={64} color={Colors.success} />
        </View>
        
        <Text style={styles.title}>Email Verified!</Text>
        <Text style={styles.subtitle}>
          Your email has been successfully verified. Redirecting you to login...
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
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
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
    paddingHorizontal: 16,
  },
});