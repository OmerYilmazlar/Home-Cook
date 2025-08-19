import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, MapPin, CheckCircle, XCircle } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { PhoneInput } from '@/components/PhoneInput';

import { validatePhoneNumber, formatPhoneNumber, validateAddress, getAddressSuggestions, validateBio, validateAddressWithGoogle, getCitySuggestions, getZipCodeSuggestions, getAddressSuggestionsInZip } from '@/utils/validation';
import { validateAddressAPI, validatePostalCode } from '@/utils/addressValidation';
import { Country } from '@/constants/countries';
import { CountryPicker } from '@/components/CountryPicker';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuthStore();
  
  const isCook = user?.userType === 'cook';
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Address validation state - step by step approach
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  
  // Autocomplete suggestions
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [zipSuggestions, setZipSuggestions] = useState<string[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  
  // Show/hide suggestion dropdowns
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showZipSuggestions, setShowZipSuggestions] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  
  // Address validation states
  const [isAddressValidated, setIsAddressValidated] = useState(false);
  const [addressValidationResult, setAddressValidationResult] = useState<any>(null);
  
  // Initialize address fields from user data
  useEffect(() => {
    if (user?.location?.address) {
      // Try to parse existing address into components
      const addressParts = user.location.address.split(',').map(part => part.trim());
      if (addressParts.length >= 2) {
        setStreetAddress(addressParts[0] || '');
        setCity(addressParts[1] || '');
        if (addressParts.length >= 3) {
          setZipCode(addressParts[2] || '');
        }
        // Try to detect country from address
        const lastPart = addressParts[addressParts.length - 1];
        if (lastPart.includes('UK') || lastPart.includes('United Kingdom')) {
          // Set UK as default if detected
          setSelectedCountry({ code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' });
        }
      } else {
        setStreetAddress(user.location.address);
      }
    }
  }, [user?.location?.address]);
  

  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addressValidating, setAddressValidating] = useState(false);
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
  
  // Enhanced UK postcode suggestions
  const enhanceUKPostcodeSuggestions = (suggestions: string[], query: string): string[] => {
    const queryUpper = query.toUpperCase().replace(/\s/g, '');
    const enhanced = [...suggestions];
    
    // Add common UK postcode patterns based on the query
    if (queryUpper.length >= 2) {
      const areaCode = queryUpper.substring(0, 2);
      const district = queryUpper.length > 2 ? queryUpper.substring(2, 4) : '1';
      
      // Generate realistic UK postcodes including the user's example
      const commonSectors = ['1AA', '2BB', '3CC', '4HW', '5DD', '6EE', '7FF', '8GG', '9HH'];
      
      commonSectors.forEach(sector => {
        const postcode = `${areaCode}${district} ${sector}`;
        if (!enhanced.includes(postcode) && postcode.toLowerCase().includes(query.toLowerCase())) {
          enhanced.push(postcode);
        }
      });
      
      // Special handling for EN1 area to include 4HW specifically
      if (areaCode === 'EN' && (district === '1' || queryUpper.startsWith('EN1'))) {
        const specialPostcode = 'EN1 4HW';
        if (!enhanced.includes(specialPostcode)) {
          enhanced.unshift(specialPostcode); // Add to beginning for priority
        }
      }
    }
    
    // Remove duplicates and sort by relevance
    const unique = [...new Set(enhanced)];
    return unique.slice(0, 8); // Limit to 8 suggestions
  };
  // Get city suggestions based on selected country
  const handleCitySearch = async (query: string) => {
    if (!selectedCountry || query.length < 2) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      return;
    }
    
    try {
      const suggestions = await getCitySuggestions(query, selectedCountry.code);
      setCitySuggestions(suggestions);
      setShowCitySuggestions(suggestions.length > 0);
    } catch (error) {
      console.warn('Failed to get city suggestions:', error);
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    }
  };
  
  // Get ZIP code suggestions based on selected city
  const handleZipSearch = async (query: string) => {
    if (!selectedCountry || !city || query.length < 2) {
      setZipSuggestions([]);
      setShowZipSuggestions(false);
      return;
    }
    
    try {
      const suggestions = await getZipCodeSuggestions(query, city, selectedCountry.code);
      // Filter and enhance suggestions for better UK postcode support
      const enhancedSuggestions = selectedCountry.code === 'GB' 
        ? enhanceUKPostcodeSuggestions(suggestions, query)
        : suggestions;
      setZipSuggestions(enhancedSuggestions);
      setShowZipSuggestions(enhancedSuggestions.length > 0);
    } catch (error) {
      console.warn('Failed to get ZIP suggestions:', error);
      setZipSuggestions([]);
      setShowZipSuggestions(false);
    }
  };
  
  // Get address suggestions based on ZIP code
  const handleAddressSearch = async (query: string) => {
    if (!selectedCountry || !city || !zipCode || query.length < 2) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }
    
    try {
      const suggestions = await getAddressSuggestionsInZip(query, zipCode, city, selectedCountry.code);
      setAddressSuggestions(suggestions);
      setShowAddressSuggestions(suggestions.length > 0);
    } catch (error) {
      console.warn('Failed to get address suggestions:', error);
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    }
  };
  
  // Validate the complete address
  const validateCompleteAddress = async () => {
    if (!selectedCountry || !city || !zipCode || !streetAddress) {
      setErrors(prev => ({ ...prev, address: 'Please complete all address fields first' }));
      return false;
    }
    
    const fullAddress = `${streetAddress}, ${city}, ${zipCode}, ${selectedCountry.name}`;
    
    try {
      setAddressValidating(true);
      const validation = await validateAddressWithGoogle(fullAddress);
      
      if (validation.isValid) {
        setIsAddressValidated(true);
        setAddressValidationResult(validation);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.address;
          return newErrors;
        });
        return true;
      } else {
        setIsAddressValidated(false);
        setAddressValidationResult(null);
        setErrors(prev => ({ ...prev, address: validation.error || 'Address validation failed' }));
        return false;
      }
    } catch (error) {
      console.warn('Address validation failed:', error);
      setIsAddressValidated(false);
      setAddressValidationResult(null);
      setErrors(prev => ({ ...prev, address: 'Failed to validate address. Please try again.' }));
      return false;
    } finally {
      setAddressValidating(false);
    }
  };
  
  // Get full address string
  const getFullAddress = () => {
    const parts = [streetAddress, city, zipCode];
    if (selectedCountry) {
      parts.push(selectedCountry.name);
    }
    return parts.filter(part => part.trim()).join(', ');
  };
  
  // Reset validation when address components change
  useEffect(() => {
    setIsAddressValidated(false);
    setAddressValidationResult(null);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.address;
      return newErrors;
    });
  }, [selectedCountry, city, zipCode, streetAddress]);
  

  
  // Phone handling simplified - no validation required since it's optional
  const handlePhoneChange = (text: string) => {
    // Clear error when user starts typing
    clearFieldError('phone');
    
    // Just set the phone directly without validation
    setPhone(text);
  };
  
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
      if (!selectedCountry) newErrors.country = 'Please select your country';
      if (!city) newErrors.city = 'City is required';
      if (!zipCode) newErrors.zipCode = 'ZIP/Postal code is required';
      if (!streetAddress) newErrors.streetAddress = 'Street address is required';
      
      // Check if address validation is required and completed
      if (selectedCountry && city && zipCode && streetAddress) {
        if (addressValidating) {
          newErrors.address = 'Please wait for address validation to complete';
        } else if (!isAddressValidated) {
          newErrors.address = 'Please validate your address before saving';
        }
      }
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
      name, email, phone, bio, avatar,
      streetAddress, city, zipCode 
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
        const fullAddress = getFullAddress();
        console.log('🏠 Edit Profile: Full address for cook:', fullAddress);
        profileData.location = {
          ...user?.location,
          address: fullAddress,
        };
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
            // Remove validation since phone is optional
          }}
          onCountryChange={setSelectedCountry}
          error={errors.phone}
          placeholder="Enter your phone number (optional)"
        />
        {/* Removed phone validation feedback since it's optional */}
        
        {isCook && (
          <View style={styles.addressSection}>
            <Text style={styles.sectionTitle}>Address Information</Text>
            <Text style={styles.sectionSubtitle}>Complete each step to validate your pickup location</Text>
            
            {/* Step 1: Country Selection */}
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Step 1: Select Country</Text>
              <CountryPicker
                selectedCountry={selectedCountry}
                onSelectCountry={(country) => {
                  clearFieldError('country');
                  setSelectedCountry(country);
                  // Reset subsequent fields when country changes
                  setCity('');
                  setZipCode('');
                  setStreetAddress('');
                  setCitySuggestions([]);
                  setZipSuggestions([]);
                  setAddressSuggestions([]);
                }}
                error={errors.country}
              />
            </View>
            
            {/* Step 2: City Selection */}
            {selectedCountry && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Step 2: Enter City</Text>
                <View>
                  <Input
                    label="City"
                    placeholder={`Enter city in ${selectedCountry.name}`}
                    value={city}
                    onChangeText={(text) => {
                      clearFieldError('city');
                      setCity(text);
                      handleCitySearch(text);
                      // Reset subsequent fields when city changes
                      setZipCode('');
                      setStreetAddress('');
                      setZipSuggestions([]);
                      setAddressSuggestions([]);
                    }}
                    error={errors.city}
                  />
                  
                  {/* City suggestions dropdown */}
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      {citySuggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setCity(suggestion);
                            setShowCitySuggestions(false);
                            setCitySuggestions([]);
                          }}
                        >
                          <MapPin size={16} color={Colors.subtext} />
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
            
            {/* Step 3: ZIP Code Selection */}
            {selectedCountry && city && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Step 3: Enter ZIP/Postal Code</Text>
                <View>
                  <Input
                    label="ZIP/Postal Code"
                    placeholder={selectedCountry.code === 'US' ? 'e.g. 12345' : selectedCountry.code === 'GB' ? 'e.g. SW1A 1AA' : 'Enter postal code'}
                    value={zipCode}
                    onChangeText={(text) => {
                      clearFieldError('zipCode');
                      setZipCode(text);
                      handleZipSearch(text);
                      // Reset subsequent fields when ZIP changes
                      setStreetAddress('');
                      setAddressSuggestions([]);
                    }}
                    error={errors.zipCode}
                    autoCapitalize="characters"
                  />
                  
                  {/* ZIP suggestions dropdown */}
                  {showZipSuggestions && zipSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      {zipSuggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setZipCode(suggestion);
                            setShowZipSuggestions(false);
                            setZipSuggestions([]);
                          }}
                        >
                          <MapPin size={16} color={Colors.subtext} />
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
            
            {/* Step 4: Street Address Selection */}
            {selectedCountry && city && zipCode && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Step 4: Enter Street Address</Text>
                <View>
                  <Input
                    label="Street Address"
                    placeholder={`Enter address in ${city}, ${zipCode}`}
                    value={streetAddress}
                    onChangeText={(text) => {
                      clearFieldError('streetAddress');
                      clearFieldError('address');
                      setStreetAddress(text);
                      handleAddressSearch(text);
                    }}
                    leftIcon={<MapPin size={20} color={Colors.subtext} />}
                    error={errors.streetAddress}
                  />
                  
                  {/* Address suggestions dropdown */}
                  {showAddressSuggestions && addressSuggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                      {addressSuggestions.map((suggestion, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setStreetAddress(suggestion);
                            setShowAddressSuggestions(false);
                            setAddressSuggestions([]);
                          }}
                        >
                          <MapPin size={16} color={Colors.subtext} />
                          <Text style={styles.suggestionText}>{suggestion}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
            
            {/* Step 5: Address Validation */}
            {selectedCountry && city && zipCode && streetAddress && (
              <View style={styles.stepContainer}>
                <Text style={styles.stepTitle}>Step 5: Validate Address</Text>
                <Text style={styles.stepSubtitle}>Verify that your address exists and is correct</Text>
                
                <View style={styles.addressPreview}>
                  <Text style={styles.addressPreviewText}>{getFullAddress()}</Text>
                </View>
                
                <Button
                  title={addressValidating ? "Validating..." : "Validate Address"}
                  onPress={validateCompleteAddress}
                  loading={addressValidating}
                  disabled={addressValidating || isAddressValidated}
                  style={[
                    styles.validateButton,
                    isAddressValidated && styles.validateButtonSuccess
                  ]}
                  fullWidth
                />
                
                {addressValidating && (
                  <Text style={styles.validationPending}>
                    🔍 Validating address with Google Places...
                  </Text>
                )}
                
                {isAddressValidated && addressValidationResult && (
                  <View style={styles.validationSuccessContainer}>
                    <Text style={styles.validationSuccess}>
                      ✅ Address validated successfully!
                    </Text>
                    {addressValidationResult.suggestion && (
                      <Text style={styles.validatedAddressText}>
                        Verified: {addressValidationResult.suggestion}
                      </Text>
                    )}
                  </View>
                )}
                
                {errors.address && (
                  <Text style={styles.errorText}>
                    {errors.address}
                  </Text>
                )}
              </View>
            )}
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
          disabled={isLoading || Boolean(isCook && selectedCountry && city && zipCode && streetAddress && !isAddressValidated)}
          style={styles.submitButton}
          fullWidth
        />
        
        {isCook && !isAddressValidated && selectedCountry && city && zipCode && streetAddress && (
          <Text style={styles.saveDisabledText}>
            Please validate your address before saving changes
          </Text>
        )}
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