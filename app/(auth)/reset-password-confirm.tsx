import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { validatePassword } from '@/utils/validation';

export default function ResetPasswordConfirmScreen() {
  const router = useRouter();
  const { isLoading, error, clearError } = useAuthStore();
  const params = useLocalSearchParams();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sessionError, setSessionError] = useState('');
  
  useEffect(() => {
    clearError();
    
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          setSessionError('Invalid or expired reset link. Please request a new password reset.');
        }
      } catch (err) {
        console.error('Session check error:', err);
        setSessionError('Unable to verify reset session. Please try again.');
      }
    };
    
    checkSession();
  }, [clearError]);
  
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
    if (!validateForm()) return;
    
    try {
      setIsUpdating(true);
      
      console.log('🔐 Reset Password: Updating password...');
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.log('❌ Reset Password: Password update failed:', error.message);
        Alert.alert('Update Failed', error.message);
        return;
      }
      
      console.log('✅ Reset Password: Password updated successfully');
      
      Alert.alert(
        'Password Updated',
        'Your password has been successfully updated. You can now log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Sign out to clear the session and redirect to login
              supabase.auth.signOut().then(() => {
                router.replace('/(auth)/login');
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Reset Password: Update error:', error);
      Alert.alert('Update Failed', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Show error if session is invalid
  if (sessionError) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Reset Link Invalid</Text>
            <Text style={styles.subtitle}>
              {sessionError}
            </Text>
          </View>
          
          <View style={styles.form}>
            <Button
              title="Request New Reset Link"
              onPress={() => router.replace('/(auth)/forgot-password')}
              style={styles.button}
              fullWidth
            />
            
            <TouchableOpacity 
              onPress={() => router.replace('/(auth)/login')}
              style={styles.linkContainer}
            >
              <Text style={styles.linkText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
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
            Please enter your new password. Make sure it's strong and secure.
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
            loading={isUpdating}
            disabled={isUpdating}
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
  linkContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});