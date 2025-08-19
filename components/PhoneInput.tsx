import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { CountryPicker } from './CountryPicker';
import { countries, Country, formatPhoneWithCountry, detectCountryFromPhone } from '@/constants/countries';

interface PhoneInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  onCountryChange?: (country: Country) => void;
  error?: string;
  placeholder?: string;
  style?: any;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value,
  onChangeText,
  onCountryChange,
  error,
  placeholder = "Enter phone number",
  style
}) => {
  // Default to UK since user mentioned UK number
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === 'GB') || countries[0]
  );

  // Auto-detect country from phone number
  useEffect(() => {
    if (value) {
      const detectedCountry = detectCountryFromPhone(value);
      if (detectedCountry && detectedCountry.code !== selectedCountry.code) {
        setSelectedCountry(detectedCountry);
        onCountryChange?.(detectedCountry);
      }
    }
  }, [value]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    onCountryChange?.(country);
    
    // If there's already a phone number, reformat it for the new country
    if (value) {
      const cleanedNumber = value.replace(/\D/g, '');
      if (cleanedNumber.length > 0) {
        const formatted = formatPhoneWithCountry(cleanedNumber, country);
        onChangeText(formatted);
      }
    } else {
      // If no number, just set the country code
      onChangeText(country.dialCode + ' ');
    }
  };

  const handleTextChange = (text: string) => {
    // Allow only digits, spaces, hyphens, parentheses, and plus sign
    const cleaned = text.replace(/[^\d\s\-\(\)\+]/g, '');
    
    // Auto-format based on selected country
    if (cleaned.length > 0) {
      const formatted = formatPhoneWithCountry(cleaned, selectedCountry);
      onChangeText(formatted);
    } else {
      onChangeText('');
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <View style={styles.countryPickerWrapper}>
          <CountryPicker
            selectedCountry={selectedCountry}
            onSelectCountry={handleCountrySelect}
            style={styles.countryPicker}
          />
        </View>
        
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.subtext}
          keyboardType="phone-pad"
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {selectedCountry && value && (
        <Text style={styles.helpText}>
          Format example: {selectedCountry.dialCode} {selectedCountry.format?.replace(/#/g, '0') || '123 456 7890'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.white,
    minHeight: 48,
    overflow: 'hidden',
  },
  inputError: {
    borderColor: Colors.error,
  },
  countryPickerWrapper: {
    backgroundColor: Colors.background,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countryPicker: {
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    minHeight: 46,
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.error,
  },
  helpText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.subtext,
    fontStyle: 'italic',
  },
});
