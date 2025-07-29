import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Camera, MapPin, CheckCircle, XCircle } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import Button from '@/components/Button';

import { validatePhoneNumber, formatPhoneNumber, validateAddress, getAddressSuggestions } from '@/utils/validation';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, isLoading } = useAuthStore();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.location?.address || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [phoneValid, setPhoneValid] = useState(false);
  const [addressValid, setAddressValid] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  
  const isCook = user?.userType === 'cook';
  
  // Validate existing values on component mount
  useEffect(() => {
    if (phone) {
      setPhoneValid(validatePhoneNumber(phone));
    }
    if (address) {
      setAddressValid(validateAddress(address));
    }
  }, []);
  

  
  // Handle phone number change
  const handlePhoneChange = (text: string) => {
    // Only allow digits, spaces, parentheses, hyphens, and plus sign
    const cleanInput = text.replace(/[^\d\s\(\)\-\+]/g, '');
    const formatted = formatPhoneNumber(cleanInput, phone);
    
    // Only update if the formatted result is different and not longer than expected
    if (formatted !== phone) {
      setPhone(formatted);
      setPhoneValid(validatePhoneNumber(formatted));
    }
  };
  
  // Handle address change
  const handleAddressChange = (text: string) => {
    setAddress(text);
    setAddressValid(validateAddress(text));
    
    if (text.length >= 3) {
      const suggestions = getAddressSuggestions(text);
      setAddressSuggestions(suggestions);
      setShowAddressSuggestions(suggestions.length > 0 && !validateAddress(text));
    } else {
      setShowAddressSuggestions(false);
    }
  };
  
  // Select address suggestion
  const selectAddressSuggestion = (selectedAddress: string) => {
    setAddress(selectedAddress);
    setAddressValid(true);
    setShowAddressSuggestions(false);
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Name is required';
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (phone && !phoneValid) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (address && !addressValid) {
      newErrors.address = 'Please enter a complete address (e.g., "123 Main St, City, State")';
    }
    
    if (isCook && !bio) newErrors.bio = 'Bio is required for cooks';

    
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
    if (!validateForm()) return;
    
    try {
      const profileData: any = {
        name,
        email,
        phone,
        avatar,
        location: {
          ...user?.location,
          address,
        },
      };
      
      if (isCook) {
        profileData.bio = bio;
      }
      
      await updateProfile(profileData);
      
      Alert.alert(
        'Success',
        'Your profile has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Edit Profile</Text>
      
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' }}
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
          onChangeText={setName}
          error={errors.name}
        />
        
        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />
        
        <View>
          <Input
            label="Phone Number"
            placeholder="(555) 123-4567"
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            error={errors.phone}
            rightIcon={
              phone ? (
                phoneValid ? (
                  <CheckCircle size={20} color={Colors.success} />
                ) : (
                  <XCircle size={20} color={Colors.error} />
                )
              ) : null
            }
          />
          {phone && phoneValid && (
            <Text style={styles.validationSuccess}>✓ Valid phone number</Text>
          )}
        </View>
        
        <View>
          <Input
            label="Address"
            placeholder="123 Main St, City, State ZIP"
            value={address}
            onChangeText={handleAddressChange}
            leftIcon={<MapPin size={20} color={Colors.subtext} />}
            error={errors.address}
            rightIcon={
              address ? (
                addressValid ? (
                  <CheckCircle size={20} color={Colors.success} />
                ) : (
                  <XCircle size={20} color={Colors.error} />
                )
              ) : null
            }
          />
          {address && addressValid && (
            <Text style={styles.validationSuccess}>✓ Valid address format</Text>
          )}
          
          {showAddressSuggestions && (
            <View style={styles.suggestionsContainer}>
              {addressSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => selectAddressSuggestion(suggestion)}
                >
                  <MapPin size={16} color={Colors.subtext} />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        
        {isCook && (
          <Input
            label="Bio"
            placeholder="Tell customers about yourself and your cooking"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            style={styles.textArea}
            error={errors.bio}
          />
        )}
        
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  validationSuccess: {
    fontSize: 12,
    color: Colors.success,
    marginTop: 4,
    marginLeft: 4,
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
});