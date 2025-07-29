import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { validateEmail } from '@/utils/validation';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading, error } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
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
    
    router.push({
      pathname: '/user-type',
      params: {
        name,
        email,
        password,
      },
    });
  };
  
  const handleLogin = () => {
    router.push('/login');
  };
  
  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 24,
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
});