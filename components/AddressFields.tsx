import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import { CountryPicker } from '@/components/CountryPicker';
import { Country, countries } from '@/constants/countries';
import { getCitySuggestions } from '@/utils/validation';

interface AddressFieldsProps {
  country: Country | null;
  city: string;
  stateProvince?: string;
  streetAddress: string;
  onChange: (next: { country: Country | null; city: string; stateProvince?: string; streetAddress: string; fullAddress: string; }) => void;
  error?: string;
  testID?: string;
}

export default function AddressFields({ country, city, stateProvince, streetAddress, onChange, error, testID }: AddressFieldsProps) {
  const selected = useMemo(() => country ?? countries.find(c => c.code === 'GB') ?? null, [country]);
  const [cityQuery, setCityQuery] = useState<string>(city ?? '');
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState<boolean>(false);

  const fullAddress = useMemo(() => {
    const parts = [streetAddress?.trim(), city?.trim(), selected?.name].filter(Boolean) as string[];
    return parts.join(', ');
  }, [streetAddress, city, selected]);

  const setCountry = (c: Country) => {
    const next = { country: c, city, stateProvince, streetAddress, fullAddress };
    onChange(next);
  };

  const setCity = (v: string) => {
    setCityQuery(v);
    const next = { country: selected, city: v, stateProvince, streetAddress, fullAddress: [streetAddress?.trim(), v?.trim(), selected?.name].filter(Boolean).join(', ') };
    onChange(next);
  };

  const setStreet = (v: string) => {
    const next = { country: selected, city, stateProvince, streetAddress: v, fullAddress: [v?.trim(), city?.trim(), selected?.name].filter(Boolean).join(', ') };
    onChange(next);
  };

  useEffect(() => {
    const q = cityQuery ?? '';
    if (!q || q.trim().length < 2) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      return;
    }
    let isCancelled = false;
    const timer = setTimeout(async () => {
      try {
        const cc = selected?.code ?? 'GB';
        const results = await getCitySuggestions(q, cc);
        if (!isCancelled) {
          setCitySuggestions(results);
          setShowCitySuggestions(results.length > 0);
        }
      } catch (e) {
        console.log('City suggestions error', e);
        if (!isCancelled) {
          setCitySuggestions([]);
          setShowCitySuggestions(false);
        }
      }
    }, 250);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [cityQuery, selected?.code]);

  const handleSelectCity = (name: string) => {
    setShowCitySuggestions(false);
    setCity(name);
  };

  return (
    <View style={styles.container} testID={testID ?? 'address-fields'}>
      <View style={styles.step}>
        <Text style={styles.stepLabel}>Country</Text>
        <CountryPicker selectedCountry={selected} onSelectCountry={setCountry} />
      </View>

      <View style={styles.step}>
        <Text style={styles.stepLabel}>City</Text>
        <View>
          <Input value={city} onChangeText={setCity} placeholder="Enter city" testID="city-input" />
          {showCitySuggestions && citySuggestions.length > 0 ? (
            <View style={styles.suggestionsContainer} testID="city-suggestions">
              <FlatList
                data={citySuggestions}
                keyExtractor={(item, idx) => `${item}-${idx}`}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectCity(item)}>
                    <Text style={styles.suggestionText}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.step}>
        <Text style={styles.stepLabel}>Street Address</Text>
        <Input value={streetAddress} onChangeText={setStreet} placeholder="House number and street" />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.preview}>
        <Text style={styles.previewLabel}>Full address</Text>
        <Text style={styles.previewText}>{fullAddress || '—'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  step: {
    marginBottom: 16,
  },
  stepLabel: {
    fontSize: 14,
    color: Colors.subtext,
    marginBottom: 6,
    fontWeight: '500',
  },
  suggestionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 48,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    maxHeight: 200,
    zIndex: 20,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  suggestionText: {
    fontSize: 14,
    color: Colors.text,
  },
  preview: {
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.white,
  },
  previewLabel: {
    fontSize: 12,
    color: Colors.subtext,
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginBottom: 8,
  },
});
