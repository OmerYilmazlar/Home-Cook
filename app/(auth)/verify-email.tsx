import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Mail, CheckCircle, RefreshCw, Shield, ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import Input from '@/components/Input';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ 
    name: string; 
    email: string; 
    password: string; 
  }>();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Send initial verification code when component mounts
    if (params.email && !emailSent) {
      sendVerificationCode();
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
  
  const sendVerificationCode = async () => {
    if (!params.email || !params.password) {
      Alert.alert('Error', 'Missing email or password information');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📧 Sending verification code to:', params.email);
      
      // Generate a random 6-digit code for demo
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Create dummy HTML email template
      const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - HomeCook</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #FF6B35; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .code { background: #fff; border: 2px solid #FF6B35; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .code-number { font-size: 32px; font-weight: bold; color: #FF6B35; letter-spacing: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🍳 HomeCook</h1>
            <h2>Email Verification</h2>
          </div>
          <div class="content">
            <h3>Welcome to HomeCook!</h3>
            <p>Thank you for signing up. To complete your registration, please enter the verification code below in the app:</p>
            
            <div class="code">
              <div class="code-number">${verificationCode}</div>
              <p><strong>This code expires in 10 minutes</strong></p>
            </div>
            
            <p>If you didn't request this verification, please ignore this email.</p>
            
            <p>Happy cooking!<br>The HomeCook Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `;
      
      // Log the email template for demo purposes
      console.log('📧 Email Template Generated:');
      console.log('To:', params.email);
      console.log('Subject: Verify Your Email - HomeCook');
      console.log('Verification Code:', verificationCode);
      console.log('HTML Template:', emailTemplate);
      
      // Simulate sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Verification code sent successfully');
      setEmailSent(true);
      setCountdown(60); // 60 second cooldown
      
    } catch (error) {
      console.error('❌ Verification code error:', error);
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setCodeError('Verification code is required');
      return;
    }
    
    if (verificationCode.length !== 6) {
      setCodeError('Verification code must be 6 digits');
      return;
    }
    
    setCodeError('');
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Verifying code:', verificationCode);
      
      // For demo purposes, accept any 6-digit code
      // In a real implementation, you'd verify the code with your backend
      
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (verificationCode.length === 6) {
        console.log('✅ Code verified successfully');
        
        // Navigate to user type selection
        router.push({
          pathname: '/user-type',
          params: {
            name: params.name,
            email: params.email,
            password: params.password,
            emailVerified: 'true'
          },
        });
      } else {
        setCodeError('Invalid verification code');
      }
      
    } catch (error) {
      console.error('❌ Code verification error:', error);
      setError('Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    setError(null);
    
    try {
      // Simulate resending code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ Verification code resent successfully');
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
      setCountdown(60);
      
    } catch (error) {
      console.error('❌ Resend error:', error);
      setError('Failed to resend verification code. Please try again.');
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
  
  if (!emailSent) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Mail size={64} color={Colors.primary} />
          </View>
          
          <Text style={styles.title}>Sending Verification Code</Text>
          <Text style={styles.subtitle}>
            Please wait while we send a verification code to {params.email}
          </Text>
        </View>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity 
          onPress={handleBackToSignup}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Shield size={64} color={Colors.primary} />
          </View>
          
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to:
          </Text>
          <Text style={styles.email}>{params.email}</Text>
          
          <Text style={styles.description}>
            Please enter the 6-digit code from the email we sent you.
          </Text>
          
          <Text style={styles.demoNote}>
            📧 Demo: Check the console logs for the verification code
          </Text>
          
          <View style={styles.form}>
            <Input
              label="Verification Code"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
              leftIcon={<Shield size={20} color={Colors.subtext} />}
              error={codeError}
            />
            
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
            
            <Button
              title="Verify Code"
              onPress={handleVerifyCode}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              fullWidth
            />
            
            <TouchableOpacity 
              onPress={handleResendCode}
              disabled={countdown > 0 || isResending}
              style={styles.resendContainer}
            >
              <Text style={[styles.resendText, (countdown > 0 || isResending) && styles.resendTextDisabled]}>
                {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend verification code'}
              </Text>
            </TouchableOpacity>
            
            <Button
              title="Continue Without Verification"
              onPress={handleContinueAnyway}
              variant="outline"
              style={styles.skipButton}
              fullWidth
            />
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Didn't receive the code? Check your spam folder or try resending.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
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
  form: {
    width: '100%',
    maxWidth: 400,
  },
  errorText: {
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    height: 50,
    marginBottom: 16,
  },
  skipButton: {
    height: 50,
    marginTop: 8,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendText: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  resendTextDisabled: {
    color: Colors.subtext,
    textDecorationLine: 'none',
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
  demoNote: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
    backgroundColor: '#FFF7ED',
    padding: 8,
    borderRadius: 6,
  },
});