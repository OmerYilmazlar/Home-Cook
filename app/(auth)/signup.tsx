import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, ScrollView, Platform, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Mail, Lock, User, AlertCircle, X } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { validateEmail } from '@/utils/validation';
import { userService } from '@/lib/database';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading, error, clearError } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Clear error when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      clearError();
    }, [clearError])
  );
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<{title: string, message: string} | null>(null);
  
  const validateForm = () => {
    let isValid = true;
    
    // Validate name
    if (!name) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };
  
  const handleSignup = async () => {
    if (!validateForm()) return;
    
    setIsValidating(true);
    
    try {
      // Check if email already exists
      const emailExists = await userService.checkEmailExists(email.toLowerCase().trim());
      if (emailExists) {
        setValidationError({
          title: 'Email Already Registered',
          message: 'An account with this email address already exists. Please use a different email or try logging in instead.'
        });
        setIsValidating(false);
        return;
      }
      
      // Check if username already exists
      const usernameExists = await userService.checkUsernameExists(name.trim());
      if (usernameExists) {
        setValidationError({
          title: 'Username Already Taken',
          message: 'This username is already taken. Please choose a different name for your account.'
        });
        setIsValidating(false);
        return;
      }
      
      // If validation passes, proceed to user type selection
      router.push({
        pathname: '/user-type',
        params: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
        },
      });
      
    } catch (error) {
      console.error('Validation error:', error);
      setValidationError({
        title: 'Validation Error',
        message: 'Unable to validate your information. Please check your connection and try again.'
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  const closeValidationError = () => {
    setValidationError(null);
  };
  
  const handleLogin = () => {
    router.push('/login');
  };
  
  const handleTestSignupAlex = async () => {
    console.log('🧪 Testing customer signup with Alex...');
    
    try {
      // Navigate to user-type with Alex's data
      router.push({
        pathname: '/user-type',
        params: {
          name: 'Alex Customer',
          email: 'alex@test.com',
          password: 'password123',
          testUserType: 'customer'
        },
      });
      
    } catch (error) {
      console.error('❌ Alex signup failed:', error);
      Alert.alert('Test Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleTestSignupMaria = async () => {
    console.log('🧪 Testing cook signup with Maria...');
    
    try {
      // Navigate to user-type with Maria's data
      router.push({
        pathname: '/user-type',
        params: {
          name: 'Maria Cook',
          email: 'maria@test.com',
          password: 'password123',
          testUserType: 'cook'
        },
      });
      
    } catch (error) {
      console.error('❌ Maria signup failed:', error);
      Alert.alert('Test Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };
  
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
        <View style={styles.innerContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to start using HomeCook</Text>
      </View>
      
      <View style={styles.form}>
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          leftIcon={<User size={20} color={Colors.subtext} />}
          error={nameError}
        />
        
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
        
        <Input
          label="Password"
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon={<Lock size={20} color={Colors.subtext} />}
          error={passwordError}
        />
        
        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          leftIcon={<Lock size={20} color={Colors.subtext} />}
          error={confirmPasswordError}
        />
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        <Button
          title="Continue"
          onPress={handleSignup}
          loading={isLoading || isValidating}
          disabled={isLoading || isValidating}
          style={styles.button}
          fullWidth
        />
        
        <Button
          title="🧪 Test Alex (Customer)"
          onPress={handleTestSignupAlex}
          variant="secondary"
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
          fullWidth
        />
        
        <Button
          title="🧪 Test Maria (Cook)"
          onPress={handleTestSignupMaria}
          variant="secondary"
          loading={isLoading}
          disabled={isLoading}
          style={styles.button}
          fullWidth
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={handleLogin}>
          <Text style={styles.footerLink}>Log In</Text>
        </TouchableOpacity>
      </View>
      </View>
      </ScrollView>
      
      {/* Error Modal */}
      <Modal
        visible={!!validationError}
        transparent
        animationType="fade"
        onRequestClose={closeValidationError}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.errorIconContainer}>
                <AlertCircle size={24} color={Colors.error} />
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeValidationError}
              >
                <X size={20} color={Colors.subtext} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalTitle}>{validationError?.title}</Text>
            <Text style={styles.modalMessage}>{validationError?.message}</Text>
            
            <View style={styles.modalActions}>
              <Button
                title="Got it"
                onPress={closeValidationError}
                style={styles.modalButton}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
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
  innerContainer: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
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
  testButton: {
    marginTop: 8,
    backgroundColor: Colors.secondary,
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