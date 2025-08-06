import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet, Text } from 'react-native';
import { VerificationComponent } from '@/components/VerificationComponent';
import { VerificationSummary } from '@/components/VerificationBadge';
import { GooglePlacesInput } from '@/components/GooglePlacesInput';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import { userService } from '@/lib/database';
import { verificationService, VerificationStatus } from '@/lib/verification';
import { validatePhoneNumber, formatPhoneNumber, validateEmail } from '@/utils/validation';
import colors from '@/constants/colors';
import type { Cook } from '@/types';

export const CookVerificationSetup: React.FC = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.location?.address || '',
    bio: user?.bio || '',
  });
  
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    isEmailVerified: false,
    isPhoneVerified: false
  });
  
  const [currentStep, setCurrentStep] = useState<'profile' | 'verification' | 'complete'>('profile');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadVerificationStatus();
    }
  }, [user]);

  const loadVerificationStatus = async () => {
    if (!user) return;
    
    try {
      const status = await verificationService.getVerificationStatus(user.id);
      setVerificationStatus(status);
      
      // If already verified, skip to complete
      if (status.isEmailVerified && status.isPhoneVerified) {
        setCurrentStep('complete');
      }
    } catch (error) {
      console.error('Error loading verification status:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone is optional, but if provided, must be valid
    if (formData.phone.trim() && !validatePhoneNumber(formData.phone, false)) {
      newErrors.phone = 'Please enter a valid phone number or leave empty';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm() || !user) return;

    setIsLoading(true);
    try {
      const updatedUser = await userService.updateUser(user.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: { address: formData.address },
        bio: formData.bio,
      } as Partial<Cook>);

      // updateUser(updatedUser); // Update user in auth store if needed
      setCurrentStep('verification');
      Alert.alert('Success', 'Profile updated! Now let\'s verify your contact information.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    }
    setIsLoading(false);
  };

  const handleVerificationComplete = (status: VerificationStatus) => {
    setVerificationStatus(status);
    if (status.isEmailVerified && status.isPhoneVerified) {
      setCurrentStep('complete');
      Alert.alert(
        'Congratulations! 🎉',
        'Your cook account is now fully verified and ready to accept orders!'
      );
    }
  };

  const renderProfileStep = () => (
    <ScrollView style={styles.container}>
      <Input
        label="Full Name"
        value={formData.name}
        onChangeText={(text: string) => setFormData(prev => ({ ...prev, name: text }))}
        error={errors.name}
        placeholder="Enter your full name"
      />

      <Input
        label="Email Address"
        value={formData.email}
        onChangeText={(text: string) => setFormData(prev => ({ ...prev, email: text }))}
        error={errors.email}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Phone Number (Optional)"
        value={formData.phone}
        onChangeText={(text: string) => {
          const formatted = formatPhoneNumber(text, formData.phone);
          setFormData(prev => ({ ...prev, phone: formatted }));
        }}
        error={errors.phone}
        placeholder="Enter your phone number (optional)"
        keyboardType="phone-pad"
      />

      <GooglePlacesInput
        label="Address"
        value={formData.address}
        onChangeText={(text: string) => setFormData(prev => ({ ...prev, address: text }))}
        error={errors.address}
        placeholder="Enter your address"
      />

      <Input
        label="Bio"
        value={formData.bio}
        onChangeText={(text: string) => setFormData(prev => ({ ...prev, bio: text }))}
        error={errors.bio}
        placeholder="Tell customers about yourself and your cooking..."
        multiline
        numberOfLines={4}
      />

      <Button
        title="Continue to Verification"
        onPress={handleSaveProfile}
        disabled={isLoading}
        style={styles.button}
      />
    </ScrollView>
  );

  const renderVerificationStep = () => (
    <ScrollView style={styles.container}>
      <VerificationComponent
        userId={user?.id || ''}
        email={formData.email}
        phone={formData.phone || undefined}
        onVerificationComplete={handleVerificationComplete}
        showBoth={true}
        requirePhoneVerification={false}
      />
    </ScrollView>
  );

  const renderCompleteStep = () => (
    <ScrollView style={styles.container}>
      <VerificationSummary
        isEmailVerified={verificationStatus.isEmailVerified}
        isPhoneVerified={verificationStatus.isPhoneVerified}
        hasPhone={!!formData.phone}
        emailVerifiedAt={verificationStatus.emailVerifiedAt}
        phoneVerifiedAt={verificationStatus.phoneVerifiedAt}
      />

      <View style={styles.successContainer}>
        <Text style={styles.successTitle}>🎉 Welcome to HomeCook!</Text>
        <Text style={styles.successText}>
          Your cook account is now fully set up and verified. You can start:
        </Text>
        
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Adding meals to your menu</Text>
          <Text style={styles.featureItem}>• Accepting customer orders</Text>
          <Text style={styles.featureItem}>• Building your reputation</Text>
          <Text style={styles.featureItem}>• Earning money from your cooking</Text>
        </View>
      </View>

      <Button
        title="Start Cooking!"
        onPress={() => {
          // Navigate to cook dashboard or home
          Alert.alert('Success', 'Ready to start your cooking journey!');
        }}
        style={styles.button}
      />
    </ScrollView>
  );

  return (
    <View style={styles.wrapper}>
      {currentStep === 'profile' && renderProfileStep()}
      {currentStep === 'verification' && renderVerificationStep()}
      {currentStep === 'complete' && renderCompleteStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  button: {
    marginVertical: 20,
  },
  successContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.success,
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  featureList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    paddingLeft: 8,
  },
});
