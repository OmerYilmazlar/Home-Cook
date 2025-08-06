import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import { VerificationComponent } from '@/components/VerificationComponent';
import Colors from '@/constants/colors';
import { VerificationStatus } from '@/lib/verification';

export default function VerificationScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();
  const params = useLocalSearchParams();
  
  // Get parameters passed from edit-profile
  const userId = params.userId as string || user?.id;
  const email = params.email as string || user?.email;
  const phone = params.phone as string || user?.phone || undefined;
  const returnTo = params.returnTo as string || '/(tabs)';

  const handleVerificationComplete = async (status: VerificationStatus) => {
    console.log('🔄 Verification: Verification completed with status:', status);
    
    if (!userId) {
      console.error('❌ Verification: No user ID available');
      return;
    }

    try {
      // Update the user's verification status in the auth store
      await updateProfile({
        isEmailVerified: status.isEmailVerified,
        isPhoneVerified: status.isPhoneVerified,
        emailVerifiedAt: status.emailVerifiedAt,
        phoneVerifiedAt: status.phoneVerifiedAt,
      });

      console.log('✅ Verification: User verification status updated');

      // Navigate to the specified return destination
      if (returnTo === '/(tabs)' || returnTo.startsWith('/(tabs)')) {
        router.replace('/(tabs)');
      } else {
        router.back();
      }
    } catch (error) {
      console.error('❌ Verification: Failed to update verification status:', error);
    }
  };

  if (!userId || !email) {
    console.error('❌ Verification: Missing required user data');
    router.back();
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <VerificationComponent
          userId={userId}
          email={email}
          phone={phone}
          onVerificationComplete={handleVerificationComplete}
          showBoth={true} // Always show the email section
          requirePhoneVerification={false} // Phone is optional
          hidePhoneVerification={true} // Completely hide phone verification
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
});
