import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { getAddressSuggestions } from '@/utils/validation';
import colors from '@/constants/colors';

interface GooglePlacesInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectAddress?: (address: string) => void;
  placeholder?: string;
  style?: any;
  error?: string;
  label?: string;
}

export const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  value,
  onChangeText,
  onSelectAddress,
  placeholder = "Enter your address",
  style,
  error,
  label
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  useEffect(() => {
    if ((value ?? '').length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await getAddressSuggestions(value);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.warn('Error getting suggestions:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  const handleSelectSuggestion = (suggestion: string) => {
    onChangeText(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    onSelectAddress?.(suggestion);
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            error && styles.inputError
          ]}
          value={value}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.subtext}
          autoCapitalize="words"
          autoComplete="street-address"
          textContentType="fullStreetAddress"
        />

        {isLoading && (
          <View style={styles.loadingIndicator}>
            <Text style={styles.loadingText}>...</Text>
          </View>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={`${item}-${index}`}
              style={styles.suggestionItem}
              onPress={() => handleSelectSuggestion(item)}
            >
              <Text style={styles.suggestionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
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
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.text,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error || '#FF6B6B',
  },
  inputValid: {
    borderColor: colors.success || '#51CF66',
  },
  loadingIndicator: {
    position: 'absolute',
    right: 16,
    top: 12,
  },
  loadingText: {
    color: colors.subtext,
    fontSize: 16,
  },
  suggestionsContainer: {
    position: 'relative',
    zIndex: 1000,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.text,
  },
  errorText: {
    color: colors.error || '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
});
