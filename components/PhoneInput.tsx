import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { CountryPicker } from './CountryPicker';
import { countries, Country } from '@/constants/countries';

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
  // Default to UK
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === 'GB') || countries[0]
  );

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    onCountryChange?.(country);
  };

  const handleTextChange = (text: string) => {
    // Simple phone number input - just allow digits, spaces, and common phone characters
    const cleaned = text.replace(/[^\d\s\-\(\)\+]/g, '');
    onChangeText(cleaned);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <CountryPicker
          selectedCountry={selectedCountry}
          onSelectCountry={handleCountrySelect}
          style={styles.countryPicker}
        />
        
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
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.white,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.error,
  },
  countryPicker: {
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 12,
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
});
