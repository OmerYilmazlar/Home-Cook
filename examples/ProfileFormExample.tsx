import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { GooglePlacesInput } from '@/components/GooglePlacesInput';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { validatePhoneNumber, formatPhoneNumber, validateBio } from '@/utils/validation';
import colors from '@/constants/colors';

interface ProfileFormProps {
  initialData?: {
    name?: string;
    phone?: string;
    address?: string;
    bio?: string;
  };
  onSave: (data: any) => void;
}

export const ProfileFormExample: React.FC<ProfileFormProps> = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    bio: initialData?.bio || '',
    coordinates: null as { lat: number; lng: number } | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text, formData.phone);
    setFormData(prev => ({ ...prev, phone: formatted }));
    
    // Clear phone error when user starts typing
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleAddressSelect = (address: string, coordinates?: { lat: number; lng: number }) => {
    setFormData(prev => ({ 
      ...prev, 
      address,
      coordinates: coordinates || null
    }));
    
    // Clear address error when user selects an address
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: '' }));
    }

    if (coordinates) {
      Alert.alert('Address Verified', `Coordinates: ${coordinates.lat}, ${coordinates.lng}`);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.length < 5) {
      newErrors.address = 'Please enter a complete address';
    }

    // Bio validation
    const bioValidation = validateBio(formData.bio);
    if (!bioValidation.isValid) {
      newErrors.bio = bioValidation.error || 'Bio is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: formData.name.trim(),
        phone: formData.phone,
        location: {
          address: formData.address,
          latitude: formData.coordinates?.lat,
          longitude: formData.coordinates?.lng,
        },
        bio: formData.bio.trim(),
      });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bioValidation = validateBio(formData.bio);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <Input
        label="Full Name"
        value={formData.name}
        onChangeText={(text: string) => setFormData(prev => ({ ...prev, name: text }))}
        error={errors.name}
        placeholder="Enter your full name"
      />

      <Input
        label="Phone Number"
        value={formData.phone}
        onChangeText={handlePhoneChange}
        error={errors.phone}
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
      />

      <GooglePlacesInput
        label="Address"
        value={formData.address}
        onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
        onSelectAddress={handleAddressSelect}
        error={errors.address}
        placeholder="Enter your address"
      />

      <View style={styles.bioContainer}>
        <Input
          label="Bio"
          value={formData.bio}
          onChangeText={(text: string) => setFormData(prev => ({ ...prev, bio: text }))}
          error={errors.bio}
          placeholder="Tell us about yourself..."
          multiline
          numberOfLines={4}
          style={styles.bioInput}
        />
        <Text style={[
          styles.charCount,
          bioValidation.charCount > 600 && styles.charCountError
        ]}>
          {bioValidation.charCount}/600 characters
        </Text>
      </View>

      <Button
        title={isSubmitting ? "Saving..." : "Save Profile"}
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={styles.saveButton}
      />

      {formData.coordinates && (
        <View style={styles.coordinatesInfo}>
          <Text style={styles.coordinatesText}>
            📍 Location verified: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  bioContainer: {
    marginBottom: 16,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: colors.subtext,
    textAlign: 'right',
    marginTop: 4,
  },
  charCountError: {
    color: colors.error,
  },
  saveButton: {
    marginTop: 24,
  },
  coordinatesInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.cardSecondary,
    borderRadius: 8,
  },
  coordinatesText: {
    fontSize: 12,
    color: colors.success,
    textAlign: 'center',
  },
});
