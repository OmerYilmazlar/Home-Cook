import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { verificationService, VerificationStatus } from '@/lib/verification';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

interface VerificationComponentProps {
  userId: string;
  email: string;
  phone?: string; // Made optional
  onVerificationComplete?: (status: VerificationStatus) => void;
  showBoth?: boolean; // Show both email and phone verification
  requirePhoneVerification?: boolean; // Whether phone verification is required
  hidePhoneVerification?: boolean; // Completely hide phone verification
}

export const VerificationComponent: React.FC<VerificationComponentProps> = ({
  userId,
  email,
  phone,
  onVerificationComplete,
  showBoth = true,
  requirePhoneVerification = false,
  hidePhoneVerification = true // Default to hiding phone verification
}) => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    isEmailVerified: false,
    isPhoneVerified: false
  });

  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState({ email: 0, phone: 0 });

  // Load verification status on mount
  useEffect(() => {
    loadVerificationStatus();
  }, [userId]);

  // Cooldown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setResendCooldown(prev => ({
        email: Math.max(0, prev.email - 1),
        phone: Math.max(0, prev.phone - 1)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadVerificationStatus = async (checkCompletion = false) => {
    try {
      console.log('🔍 VerificationComponent: Loading verification status for user:', userId);
      const status = await verificationService.getVerificationStatus(userId);
      console.log('📋 VerificationComponent: Verification status received:', status);
      setVerificationStatus(status);
      
      // Only check for completion when explicitly requested (after successful verification)
      if (checkCompletion) {
        const isComplete = status.isEmailVerified && 
          (hidePhoneVerification ? true : requirePhoneVerification ? status.isPhoneVerified : true);
        
        console.log('🎯 VerificationComponent: Checking completion:', { 
          isComplete, 
          isEmailVerified: status.isEmailVerified,
          hidePhoneVerification,
          requirePhoneVerification 
        });
        
        if (onVerificationComplete && isComplete) {
          console.log('✅ VerificationComponent: Verification complete, calling completion handler');
          onVerificationComplete(status);
        }
      } else {
        console.log('⏸️ VerificationComponent: Not checking completion (checkCompletion=false)');
      }
    } catch (error) {
      console.error('Error loading verification status:', error);
    }
  };

  const sendEmailVerification = async () => {
    if (resendCooldown.email > 0) return;
    
    setIsLoading(true);
    try {
      const result = await verificationService.sendEmailVerification(userId, email);
      if (result.success) {
        Alert.alert('Success', result.message);
        setResendCooldown(prev => ({ ...prev, email: 60 })); // 60 second cooldown
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification email');
    }
    setIsLoading(false);
  };

  const sendSMSVerification = async () => {
    if (resendCooldown.phone > 0 || !phone) return;
    
    setIsLoading(true);
    try {
      const result = await verificationService.sendSMSVerification(userId, phone);
      if (result.success) {
        Alert.alert('Success', result.message);
        setResendCooldown(prev => ({ ...prev, phone: 60 })); // 60 second cooldown
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification SMS');
    }
    setIsLoading(false);
  };

  const verifyEmailCode = async () => {
    if (!emailCode || emailCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verificationService.verifyCode(userId, 'email', emailCode);
      if (result.success) {
        Alert.alert('Success', result.message);
        setEmailCode('');
        await loadVerificationStatus(true); // Check for completion after successful verification
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed');
    }
    setIsLoading(false);
  };

  const verifyPhoneCode = async () => {
    if (!phoneCode || phoneCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verificationService.verifyCode(userId, 'phone', phoneCode);
      if (result.success) {
        Alert.alert('Success', result.message);
        setPhoneCode('');
        await loadVerificationStatus(true); // Check for completion after successful verification
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Verification failed');
    }
    setIsLoading(false);
  };

  const VerificationBadge = ({ isVerified, type }: { isVerified: boolean; type: string }) => (
    <View style={[styles.badge, isVerified ? styles.badgeVerified : styles.badgeUnverified]}>
      <Text style={[styles.badgeText, isVerified ? styles.badgeTextVerified : styles.badgeTextUnverified]}>
        {isVerified ? '✓ Verified' : '⚠ Unverified'} {type}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Verification</Text>
      <Text style={styles.subtitle}>
        Verify your contact information to build trust with customers
      </Text>

      {/* Email Verification */}
      {(showBoth || !verificationStatus.isEmailVerified) && (
        <View style={styles.verificationSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📧 Email Verification</Text>
            <VerificationBadge isVerified={verificationStatus.isEmailVerified} type="Email" />
          </View>
          
          <Text style={styles.contactText}>{email}</Text>
          
          {!verificationStatus.isEmailVerified && (
            <>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.sendButton, resendCooldown.email > 0 && styles.disabledButton]}
                  onPress={sendEmailVerification}
                  disabled={isLoading || resendCooldown.email > 0}
                >
                  <Text style={styles.sendButtonText}>
                    {resendCooldown.email > 0 ? `Resend in ${resendCooldown.email}s` : 'Send Code'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Development Helper - Show last code */}
              {__DEV__ && (global as any).lastVerificationCode && (
                <View style={styles.devHelper}>
                  <Text style={styles.devHelperTitle}>🧪 Testing Mode</Text>
                  <Text style={styles.devHelperText}>
                    Your verification code: {(global as any).lastVerificationCode}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setEmailCode((global as any).lastVerificationCode)}
                    style={styles.devHelperButton}
                  >
                    <Text style={styles.devHelperButtonText}>Auto-fill Code</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Input
                label="Enter 6-digit code"
                value={emailCode}
                onChangeText={setEmailCode}
                placeholder="123456"
                keyboardType="number-pad"
                maxLength={6}
                style={styles.codeInput}
              />

              <Button
                title="Verify Email"
                onPress={verifyEmailCode}
                disabled={isLoading || emailCode.length !== 6}
                style={styles.verifyButton}
              />
            </>
          )}

          {verificationStatus.isEmailVerified && verificationStatus.emailVerifiedAt && (
            <Text style={styles.verifiedText}>
              ✅ Verified on {verificationStatus.emailVerifiedAt.toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {/* Phone Verification - Hidden by default for simplicity */}
      {!hidePhoneVerification && phone && (showBoth || !verificationStatus.isPhoneVerified) && (
        <View style={styles.verificationSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📱 Phone Verification</Text>
            <VerificationBadge isVerified={verificationStatus.isPhoneVerified} type="Phone" />
          </View>
          
          <Text style={styles.contactText}>{phone}</Text>
          
          {!verificationStatus.isPhoneVerified && (
            <>
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.sendButton, resendCooldown.phone > 0 && styles.disabledButton]}
                  onPress={sendSMSVerification}
                  disabled={isLoading || resendCooldown.phone > 0}
                >
                  <Text style={styles.sendButtonText}>
                    {resendCooldown.phone > 0 ? `Resend in ${resendCooldown.phone}s` : 'Send SMS'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Input
                label="Enter 6-digit code"
                value={phoneCode}
                onChangeText={setPhoneCode}
                placeholder="123456"
                keyboardType="number-pad"
                maxLength={6}
                style={styles.codeInput}
              />

              <Button
                title="Verify Phone"
                onPress={verifyPhoneCode}
                disabled={isLoading || phoneCode.length !== 6}
                style={styles.verifyButton}
              />
            </>
          )}

          {verificationStatus.isPhoneVerified && verificationStatus.phoneVerifiedAt && (
            <Text style={styles.verifiedText}>
              ✅ Verified on {verificationStatus.phoneVerifiedAt.toLocaleDateString()}
            </Text>
          )}
        </View>
      )}

      {/* Message for users without phone number - Hidden when phone verification is disabled */}
      {!hidePhoneVerification && !phone && showBoth && (
        <View style={styles.verificationSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📱 Phone Verification</Text>
            <View style={[styles.badge, styles.badgeOptional]}>
              <Text style={[styles.badgeText, styles.badgeTextOptional]}>
                ⚪ Optional
              </Text>
            </View>
          </View>
          
          <Text style={styles.optionalText}>
            Add a phone number to your profile to enable phone verification and build additional trust with customers.
          </Text>
        </View>
      )}

      {/* Overall Status */}
      {verificationStatus.isEmailVerified && (hidePhoneVerification || requirePhoneVerification ? verificationStatus.isPhoneVerified : true) && (
        <View style={styles.completedContainer}>
          <Text style={styles.completedText}>🎉 Verification complete!</Text>
          <Text style={styles.completedSubtext}>
            {hidePhoneVerification 
              ? 'Your email is verified! Your account is ready to use.'
              : phone && verificationStatus.isPhoneVerified 
                ? 'Your account is now fully verified and trusted by customers.'
                : 'Your email is verified! Consider adding a phone number for additional trust.'
            }
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.subtext,
    textAlign: 'center',
    marginBottom: 24,
  },
  verificationSection: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeVerified: {
    backgroundColor: Colors.success,
  },
  badgeUnverified: {
    backgroundColor: Colors.warning,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextVerified: {
    color: Colors.white,
  },
  badgeTextUnverified: {
    color: Colors.white,
  },
  contactText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: Colors.inactive,
  },
  sendButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  codeInput: {
    marginBottom: 16,
  },
  verifyButton: {
    marginTop: 8,
  },
  verifiedText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  completedContainer: {
    backgroundColor: Colors.success,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  completedText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  completedSubtext: {
    color: Colors.white,
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  badgeOptional: {
    backgroundColor: Colors.inactive,
  },
  badgeTextOptional: {
    color: Colors.text,
  },
  optionalText: {
    fontSize: 14,
    color: Colors.subtext,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  devHelper: {
    backgroundColor: Colors.warning,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  devHelperTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  devHelperText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  devHelperButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'center',
  },
  devHelperButtonText: {
    color: Colors.warning,
    fontSize: 12,
    fontWeight: '600',
  },
});
