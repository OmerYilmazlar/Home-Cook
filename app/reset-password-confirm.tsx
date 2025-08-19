import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { validatePassword } from '@/utils/validation';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordConfirmScreen() {
  const router = useRouter();
  const { updatePassword, isLoading, error, clearError } = useAuthStore();
  const params = useLocalSearchParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sessionError, setSessionError] = useState('');
  
  useEffect(() => {
    clearError();
    
    // Check if we have the necessary tokens from the URL
    console.log('Reset password params:', params);
    
    // Handle the session from URL parameters
    const handleSession = async () => {
      try {
        // Get the current session to see if the user is authenticated for password reset
        const { data: { session }, error: authSessionError } = await supabase.auth.getSession();
        
        if (authSessionError) {
          console.error('Session error:', authSessionError);
          setSessionError('Invalid or expired reset link. Please request a new password reset.');
          return;
        }
        
        if (!session) {
          console.log('No session found, checking URL params...');
          // If no session, check if we have access_token and refresh_token in params
          const { access_token, refresh_token, type } = params;
          
          if (type === 'recovery' && access_token && refresh_token) {
            console.log('Setting session from URL params...');
            const { error: authSetSessionError } = await supabase.auth.setSession({
              access_token: access_token as string,
              refresh_token: refresh_token as string
            });
            
            if (authSetSessionError) {
              console.error('Set session error:', authSetSessionError);
              setSessionError('Invalid or expired reset link. Please request a new password reset.');
            } else {
              console.log('Session set successfully for password reset');
            }
          } else {
            setSessionError('Invalid reset link. Please request a new password reset.');
          }
        } else {
          console.log('Valid session found for password reset');
        }
      } catch (error) {
        console.error('Error handling session:', error);
        setSessionError('An error occurred. Please try again.');
      }
    };
    
    handleSession();
  }, [clearError, params]);
  
  const validateForm = () => {
    let isValid = true;
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.errors.join(', '));
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };
  
  const handleUpdatePassword = async () => {
    if (sessionError) {
      Alert.alert('Session Error', sessionError);
      return;
    }
    
    if (!validateForm()) return;
    
    try {
      await updatePassword(password);
      Alert.alert(
        'Password Updated',
        'Your password has been successfully updated. You can now log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Update Failed', error instanceof Error ? error.message : 'An error occurred');
    }
  };
  
  const handleRequestNewReset = () => {
    router.replace('/(auth)/forgot-password');
  };
  
  if (sessionError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Reset Link Invalid</Text>
          <Text style={styles.errorMessage}>{sessionError}</Text>
          <Button
            title="Request New Reset Link"
            onPress={handleRequestNewReset}
            style={styles.button}
            fullWidth
          />
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Back to Login</Text>
          </TouchableOpacity>
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
        <View style={styles.header}>
          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.subtitle}>
            Please enter your new password. Make sure it&apos;s strong and secure.
          </Text>
        </View>
        
        <View style={styles.form}>
          <Input
            label="New Password"
            placeholder="Enter your new password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon={<Lock size={20} color={Colors.subtext} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={Colors.subtext} />
                ) : (
                  <Eye size={20} color={Colors.subtext} />
                )}
              </TouchableOpacity>
            }
            error={passwordError}
          />
          
          <Input
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            leftIcon={<Lock size={20} color={Colors.subtext} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <EyeOff size={20} color={Colors.subtext} />
                ) : (
                  <Eye size={20} color={Colors.subtext} />
                )}
              </TouchableOpacity>
            }
            error={confirmPasswordError}
          />
          
          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <Text style={styles.requirementText}>• At least 8 characters long</Text>
            <Text style={styles.requirementText}>• Contains at least one uppercase letter</Text>
            <Text style={styles.requirementText}>• Contains at least one lowercase letter</Text>
            <Text style={styles.requirementText}>• Contains at least one number</Text>
            <Text style={styles.requirementText}>• Contains at least one special character</Text>
          </View>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          
          <Button
            title="Update Password"
            onPress={handleUpdatePassword}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
            fullWidth
          />
        </View>
        
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerLink}>Back to Login</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
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
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  passwordRequirements: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 12,
    color: Colors.subtext,
    marginBottom: 4,
  },
  errorText: {
    color: Colors.error,
    marginTop: 16,
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
    height: 50,
  },
  footer: {
    alignItems: 'center',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: Colors.subtext,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    marginTop: 16,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});