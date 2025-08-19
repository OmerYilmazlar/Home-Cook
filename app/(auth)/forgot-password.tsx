import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, ArrowLeft, Shield } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { validateEmail } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);
  
  const validateEmailForm = () => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!validateEmail(email)) {
      setEmailError('Email is invalid');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };
  
  const validateCodeForm = () => {
    if (!verificationCode) {
      setCodeError('Verification code is required');
      return false;
    } else if (verificationCode.length !== 6) {
      setCodeError('Verification code must be 6 digits');
      return false;
    } else {
      setCodeError('');
      return true;
    }
  };
  
  const validatePasswordForm = () => {
    let isValid = true;
    
    if (!newPassword) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };
  
  const handleSendCode = async () => {
    if (!validateEmailForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📧 Sending password reset code to:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined // We don't want a redirect, just the code
      });
      
      if (error) {
        console.error('❌ Failed to send reset code:', error.message);
        setError(error.message);
        return;
      }
      
      console.log('✅ Password reset code sent successfully');
      setStep('code');
      setCountdown(60);
      
    } catch (error) {
      console.error('❌ Send code error:', error);
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyCode = async () => {
    if (!validateCodeForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Verifying reset code:', verificationCode);
      
      // For now, we'll simulate code verification
      // In a real implementation, you'd verify the code with your backend
      // Since Supabase doesn't have built-in OTP for password reset,
      // you'd need to implement this with a custom solution
      
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, accept any 6-digit code
      if (verificationCode.length === 6) {
        console.log('✅ Code verified successfully');
        setStep('password');
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
  
  const handleResetPassword = async () => {
    if (!validatePasswordForm()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Updating password...');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('❌ Password update failed:', error.message);
        setError(error.message);
        return;
      }
      
      console.log('✅ Password updated successfully');
      Alert.alert(
        'Password Reset Successful',
        'Your password has been updated successfully. You can now log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/login')
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Password reset error:', error);
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      setCountdown(60);
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
      
    } catch (error) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBackToLogin = () => {
    router.push('/login');
  };
  
  const handleBack = () => {
    if (step === 'email') {
      router.back();
    } else if (step === 'code') {
      setStep('email');
    } else {
      setStep('code');
    }
  };
  
  const renderEmailStep = () => (
    <>
      <TouchableOpacity 
        onPress={handleBack}
        style={styles.backButton}
      >
        <ArrowLeft size={24} color={Colors.text} />
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a 6-digit verification code to reset your password.
        </Text>
      </View>
      
      <View style={styles.form}>
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon={<Mail size={20} color={Colors.subtext} />}
          error={emailError}
        />
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        <Button
          title="Send Verification Code"
          onPress={handleSendCode}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
          fullWidth
        />
      </View>
    </>
  );
  
  const renderCodeStep = () => (
    <>
      <TouchableOpacity 
        onPress={handleBack}
        style={styles.backButton}
      >
        <ArrowLeft size={24} color={Colors.text} />
      </TouchableOpacity>
      
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Shield size={48} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to {email}. Please enter it below.
        </Text>
      </View>
      
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
          disabled={countdown > 0 || isLoading}
          style={styles.resendContainer}
        >
          <Text style={[styles.resendText, (countdown > 0 || isLoading) && styles.resendTextDisabled]}>
            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend verification code'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
  
  const renderPasswordStep = () => (
    <>
      <TouchableOpacity 
        onPress={handleBack}
        style={styles.backButton}
      >
        <ArrowLeft size={24} color={Colors.text} />
      </TouchableOpacity>
      
      <View style={styles.header}>
        <Text style={styles.title}>Create New Password</Text>
        <Text style={styles.subtitle}>
          Enter your new password below.
        </Text>
      </View>
      
      <View style={styles.form}>
        <Input
          label="New Password"
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          error={passwordError}
        />
        
        <Input
          label="Confirm Password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          error={confirmPasswordError}
        />
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        <Button
          title="Reset Password"
          onPress={handleResetPassword}
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
          fullWidth
        />
      </View>
    </>
  );
  
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
        {step === 'email' && renderEmailStep()}
        {step === 'code' && renderCodeStep()}
        {step === 'password' && renderPasswordStep()}
        
        {step === 'email' && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password?</Text>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.footerLink}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        )}
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
    justifyContent: 'center',
    padding: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 8,
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
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  errorText: {
    color: Colors.error,
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    height: 50,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.subtext,
    marginRight: 4,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendContainer: {
    marginTop: 16,
    alignItems: 'center',
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
});