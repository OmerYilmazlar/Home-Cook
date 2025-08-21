import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { PhoneInput } from '@/components/PhoneInput';
import AddressFields from '@/components/AddressFields';
import { validateBio } from '@/utils/validation';


export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuthStore();
  
  const isCook = user?.userType === 'cook';
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Step-by-step address without zip/full validation
  const [addressCountry, setAddressCountry] = useState<any>(null);
  const [addressCity, setAddressCity] = useState<string>((user?.location as any)?.city ?? '');
  const [addressState, setAddressState] = useState<string>((user?.location as any)?.state ?? '');
  const [addressZip, setAddressZip] = useState<string>((user?.location as any)?.zip ?? '');
  const [addressStreet, setAddressStreet] = useState<string>((user?.location as any)?.address ?? '');
  const [addressFull, setAddressFull] = useState<string>((user?.location as any)?.address ?? '');
  const [addressLat, setAddressLat] = useState<number | undefined>(user?.location?.latitude);
  const [addressLng, setAddressLng] = useState<number | undefined>(user?.location?.longitude);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Removed phoneValid state - phone is now optional without validation
  
  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const timer = setTimeout(() => {
        setErrors({});
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [errors]);
  
  // Clear errors when user starts typing in any field
  const clearFieldError = (fieldName: string) => {
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Bio validation with character count
  const [bioCharCount, setBioCharCount] = useState(0);
  
  useEffect(() => {
    if (bio) {
      const { charCount } = validateBio(bio);
      setBioCharCount(charCount);
    } else {
      setBioCharCount(0);
    }
  }, [bio]);

  // Clear errors when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setErrors({});
    }, [])
  );
  

  

  

  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Name is required';
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Phone is now optional - no validation required
    
    if (isCook) {
      if (!addressStreet || !addressCity) newErrors.address = 'Address is required for cooks';
    }
    
    // Enhanced bio validation with word limit
    if (isCook) {
      const bioValidation = validateBio(bio);
      if (!bioValidation.isValid) {
        newErrors.bio = bioValidation.error || 'Bio is required for cooks';
      }
    }

    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatar(result.assets[0].uri);
    }
  };
  

  
  const handleSubmit = async () => {
    console.log('🔍 Edit Profile: Starting form submission...');
    console.log('🔍 Edit Profile: Current form data:', { 
      name, email, phone, bio, avatar, addressCountry, addressCity, addressState, addressStreet, addressFull 
    });
    
    if (!validateForm()) {
      console.log('❌ Edit Profile: Form validation failed');
      return;
    }

    try {
      const profileData: any = {
        name,
        email,
        phone,
        avatar,
        bio, // Allow bio for all users
      };
      
      // Only include address for cooks
      if (isCook) {
        const composed = addressFull || [addressStreet?.trim(), addressCity?.trim(), addressZip?.trim(), addressCountry?.name].filter(Boolean).join(', ');
        console.log('🏠 Edit Profile: Address for cook:', composed);
        profileData.location = {
          ...user?.location,
          address: composed,
          city: addressCity,
          state: addressState,
          country: addressCountry?.code,
          latitude: typeof addressLat === 'number' ? addressLat : user?.location?.latitude,
          longitude: typeof addressLng === 'number' ? addressLng : user?.location?.longitude,
        } as any;
      }
      
      console.log('📤 Edit Profile: Sending profile data:', profileData);
      await updateProfile(profileData);
      console.log('✅ Edit Profile: Profile updated successfully');
      
      // Check if this is a cook and if email verification is needed
      // This triggers when:
      // 1. Cook is not email verified yet
      // 2. Cook changed their email address (needs re-verification)
      const emailChanged = user && user.email !== email;
      const needsEmailVerification = isCook && user && (!user.isEmailVerified || emailChanged);
      
      if (needsEmailVerification) {
        if (emailChanged) {
          console.log('🔄 Edit Profile: Email changed, requiring re-verification...');
        } else {
          console.log('🔄 Edit Profile: Cook needs email verification, redirecting directly...');
        }
        
        // Direct to verification without asking - required for cooks
        router.push({
          pathname: '/verify-account',
          params: {
            userId: user.id,
            email: email,
            phone: phone || '',
            returnTo: '/(tabs)'
          }
        });
        return;
      }
      
      Alert.alert(
        'Success',
        'Your profile has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              // Check if this is a new user (no location set yet)
              const isNewUser = !user?.location?.address && !user?.bio;
              if (isNewUser) {
                router.replace('/(tabs)');
              } else {
                router.back();
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Edit Profile: Profile update failed:', error);
      
      // Show specific error message for duplicate email
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      
      if (errorMessage.includes('already in use')) {
        Alert.alert(
          'Email Already Taken',
          'This email address is already in use by another account. Please choose a different email address.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    }
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      <Text style={styles.title}>
        {!user?.location?.address && !user?.bio ? 'Complete Your Profile' : 'Edit Profile'}
      </Text>
      
      {!user?.location?.address && !user?.bio && (
        <Text style={styles.subtitle}>
          Welcome! Please complete your profile to get started.
        </Text>
      )}
      
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          <Image
            source={avatar ? { uri: avatar } : require('@/assets/images/icon.png')}
            style={styles.avatar}
            contentFit="cover"
          />
          <TouchableOpacity style={styles.editAvatarButton} onPress={handlePickImage}>
            <Camera size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.formContainer}>
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={(text) => {
            clearFieldError('name');
            setName(text);
          }}
          error={errors.name}
        />
        
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={(text) => {
            clearFieldError('email');
            setEmail(text);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        
        <PhoneInput
          label="Phone Number (Optional)"
          value={phone}
          onChangeText={(text) => {
            clearFieldError('phone');
            setPhone(text);
          }}
          error={errors.phone}
          placeholder="phone number"
        />
        
        {isCook && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 8 }}>Business Address</Text>
            <AddressFields
              country={addressCountry}
              city={addressCity}
              stateProvince={addressState}
              zipCode={addressZip}
              streetAddress={addressStreet}
              onChange={(next) => {
                clearFieldError('address');
                setAddressCountry(next.country as any);
                setAddressCity(next.city);
                setAddressState(next.stateProvince ?? '');
                setAddressZip(next.zipCode ?? '');
                setAddressStreet(next.streetAddress);
                setAddressFull(next.fullAddress);
                if (typeof next.lat === 'number') setAddressLat(next.lat);
                if (typeof next.lng === 'number') setAddressLng(next.lng);
              }}
              error={errors.address}
              testID="address-fields"
            />
          </View>
        )}
        
        <View style={styles.bioInputContainer}>
          <Input
            label="Bio"
            placeholder={isCook ? "Tell customers about yourself and your cooking (max 600 characters)" : "Tell others about yourself (max 600 characters)"}
            value={bio}
            onChangeText={(text) => {
              clearFieldError('bio');
              setBio(text);
            }}
            multiline
            numberOfLines={4}
            style={styles.textArea}
            error={errors.bio}
          />
          <View style={styles.wordCountContainer}>
            <Text style={[
              styles.wordCount, 
              bioCharCount > 600 && styles.wordCountError
            ]}>
              {bioCharCount}/600 characters
            </Text>
          </View>
        </View>
        

        
        <Button
          title="Save Changes"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
          style={styles.submitButton}
          fullWidth
        />

      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.subtext,
    marginBottom: 24,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    width: '100%',
  },


  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 24,
    height: 50,
  },
  inputWithValidation: {
    marginBottom: 16,
  },
  inputWithSuccessValidation: {
    marginBottom: 4,
  },
  validationSuccess: {
    fontSize: 12,
    color: Colors.success,
    marginTop: 2,
    marginLeft: 0,
    marginBottom: 8,
  },
  validationPending: {
    fontSize: 12,
    color: Colors.subtext,
    marginTop: 2,
    marginLeft: 0,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  helpText: {
    fontSize: 12,
    color: Colors.subtext,
    marginTop: 2,
    marginLeft: 0,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  bioInputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  suggestionsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginTop: 4,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  addressSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cityInput: {
    flex: 2,
  },
  stateInput: {
    flex: 1,
  },
  wordCountContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  wordCount: {
    fontSize: 12,
    color: Colors.subtext,
  },
  wordCountError: {
    color: Colors.error,
  },
  stepContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 12,
  },
  addressPreview: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  addressPreviewText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  validateButton: {
    backgroundColor: Colors.primary,
    marginBottom: 12,
  },
  validateButtonSuccess: {
    backgroundColor: Colors.success,
  },
  validationSuccessContainer: {
    backgroundColor: '#f0f9f0',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  validatedAddressText: {
    fontSize: 12,
    color: Colors.success,
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveDisabledText: {
    fontSize: 12,
    color: Colors.subtext,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});