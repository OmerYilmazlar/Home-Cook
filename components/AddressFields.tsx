import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import { CountryPicker } from '@/components/CountryPicker';
import { Country, countries } from '@/constants/countries';

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

  const fullAddress = useMemo(() => {
    const parts = [streetAddress?.trim(), city?.trim(), selected?.name].filter(Boolean) as string[];
    return parts.join(', ');
  }, [streetAddress, city, selected]);

  const setCountry = (c: Country) => {
    const next = { country: c, city, stateProvince, streetAddress, fullAddress };
    onChange(next);
  };

  const setCity = (v: string) => {
    const next = { country: selected, city: v, stateProvince, streetAddress, fullAddress: [streetAddress?.trim(), v?.trim(), selected?.name].filter(Boolean).join(', ') };
    onChange(next);
  };

  const setState = (v: string) => {
    const next = { country: selected, city, stateProvince: v, streetAddress, fullAddress };
    onChange(next);
  };

  const setStreet = (v: string) => {
    const next = { country: selected, city, stateProvince, streetAddress: v, fullAddress: [v?.trim(), city?.trim(), selected?.name].filter(Boolean).join(', ') };
    onChange(next);
  };

  return (
    <View style={styles.container} testID={testID ?? 'address-fields'}>
      <View style={styles.step}>
        <Text style={styles.stepLabel}>Country</Text>
        <CountryPicker selectedCountry={selected} onSelectCountry={setCountry} />
      </View>

      <View style={styles.step}>
        <Text style={styles.stepLabel}>City</Text>
        <Input value={city} onChangeText={setCity} placeholder="Enter city" />
      </View>

      <View style={styles.step}>
        <Text style={styles.stepLabel}>State/County (optional)</Text>
        <Input value={stateProvince ?? ''} onChangeText={setState} placeholder="Enter state or county" />
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
