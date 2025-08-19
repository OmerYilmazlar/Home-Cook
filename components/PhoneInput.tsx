import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform } from 'react-native';
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
  testID?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value,
  onChangeText,
  onCountryChange,
  error,
  placeholder = "Enter phone number",
  style,
  testID
}) => {
  // Default to UK
  const defaultCountry = useMemo<Country>(() => countries.find(c => c.code === 'GB') || countries[0], []);
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry);

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
    <View style={[styles.container, style]} testID={testID ?? 'phone-input-container'}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[styles.inputContainer, error ? styles.inputError : null]} testID="phone-input-wrapper">
        <CountryPicker
          selectedCountry={selectedCountry}
          onSelectCountry={handleCountrySelect}
          style={styles.countryPicker}
          compact
        />
        <View style={styles.divider} />
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.subtext}
          keyboardType={Platform.select({ android: 'phone-pad', ios: 'number-pad', default: 'tel' }) as any}
          autoCorrect={false}
          autoCapitalize="none"
          textAlignVertical="center"
          underlineColorAndroid="transparent"
          selectionColor={Colors.primary}
          testID="phone-text-input"
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
    minHeight: 56,
    overflow: 'hidden',
  },
  inputError: {
    borderColor: Colors.error,
  },
  countryPicker: {
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: Platform.select({ ios: 10, android: 10, default: 10 }),
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 12, android: 12, default: 12 }),
    height: 56,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.error,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
});
