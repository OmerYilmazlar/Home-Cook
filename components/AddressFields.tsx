import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import Input from '@/components/Input';
import { CountryPicker } from '@/components/CountryPicker';
import { Country, countries } from '@/constants/countries';
import { getCitySuggestions } from '@/utils/validation';
import Button from '@/components/Button';
import { getCurrentPosition, reverseGeocode } from '@/utils/geocode';

interface AddressFieldsProps {
  country: Country | null;
  city: string;
  stateProvince?: string;
  zipCode?: string;
  streetAddress: string;
  onChange: (next: { country: Country | null; city: string; stateProvince?: string; zipCode?: string; streetAddress: string; fullAddress: string; lat?: number; lng?: number; }) => void;
  error?: string;
  testID?: string;
}

export default function AddressFields({ country, city, stateProvince, zipCode, streetAddress, onChange, error, testID }: AddressFieldsProps) {
  const selected = useMemo(() => country ?? countries.find(c => c.code === 'GB') ?? null, [country]);
  const [cityQuery, setCityQuery] = useState<string>(city ?? '');
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState<boolean>(false);
  const [cityValid, setCityValid] = useState<boolean>(true);

  const [zipQuery, setZipQuery] = useState<string>(zipCode ?? '');

  const fullAddress = useMemo(() => {
    const parts = [streetAddress?.trim(), cityQuery?.trim(), zipQuery?.trim(), selected?.name].filter(Boolean) as string[];
    return parts.join(', ');
  }, [streetAddress, cityQuery, zipQuery, selected]);

  const setCountry = (c: Country) => {
    const next = { country: c, city: cityQuery, stateProvince, zipCode: zipQuery, streetAddress, fullAddress };
    onChange(next);
  };

  const setCity = (v: string) => {
    setCityQuery(v);
    const next = { country: selected, city: v, stateProvince, zipCode: zipQuery, streetAddress, fullAddress: [streetAddress?.trim(), v?.trim(), zipQuery?.trim(), selected?.name].filter(Boolean).join(', ') };
    onChange(next);
  };

  const setZip = (v: string) => {
    setZipQuery(v);
    const next = { country: selected, city: cityQuery, stateProvince, zipCode: v, streetAddress, fullAddress: [streetAddress?.trim(), cityQuery?.trim(), v?.trim(), selected?.name].filter(Boolean).join(', ') };
    onChange(next);
  };

  const setStreet = (v: string) => {
    const next = { country: selected, city: cityQuery, stateProvince, zipCode: zipQuery, streetAddress: v, fullAddress: [v?.trim(), cityQuery?.trim(), zipQuery?.trim(), selected?.name].filter(Boolean).join(', ') };
    onChange(next);
  };

  useEffect(() => {
    const q = cityQuery ?? '';
    if (!q || q.trim().length < 2) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      setCityValid(true);
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
          const foundExact = results.some(r => r.toLowerCase() === q.toLowerCase());
          setCityValid(foundExact || results.length > 0);
        }
      } catch (e) {
        console.log('City suggestions error', e);
        if (!isCancelled) {
          setCitySuggestions([]);
          setShowCitySuggestions(false);
          setCityValid(true);
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
    setCityValid(true);
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
          <Input value={cityQuery} onChangeText={setCity} placeholder="Enter city" testID="city-input" error={!cityValid ? 'Please select a valid city' : undefined} />
          {showCitySuggestions && citySuggestions.length > 0 ? (
            <View style={styles.suggestionsContainer} testID="city-suggestions">
              {citySuggestions.map((item, idx) => (
                <TouchableOpacity key={`${item}-${idx}`} style={styles.suggestionItem} onPress={() => handleSelectCity(item)}>
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.step}>
        <Text style={styles.stepLabel}>ZIP / Postcode</Text>
        <View>
          <Input value={zipQuery} onChangeText={setZip} placeholder="e.g. EN1 4HW" testID="zip-input" autoCapitalize="characters" />
        </View>
      </View>

      <View style={styles.step}>
        <Text style={styles.stepLabel}>Street Address</Text>
        <Input value={streetAddress} onChangeText={setStreet} placeholder="House number and street" />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.detectRow}>
        <Button
          title="Detect my location"
          onPress={async () => {
            try {
              const coords = await getCurrentPosition();
              if (!coords) {
                console.log('detect location: no coords');
                return;
              }
              const rg = await reverseGeocode(coords.latitude, coords.longitude);
              if (!rg) return;
              const nextCity = rg.city ?? '';
              const nextZip = rg.zip ?? '';
              const nextStreet = rg.street ?? '';
              const full = rg.formatted ?? '';
              const detectedCountry = countries.find(c => c.code === (rg.countryCode || selected?.code)) || selected;
              setCityQuery(nextCity);
              setZipQuery(nextZip);
              const next = { country: detectedCountry ?? null, city: nextCity, stateProvince, zipCode: nextZip, streetAddress: nextStreet, fullAddress: full, lat: coords.latitude, lng: coords.longitude };
              onChange(next);
            } catch (e) {
              console.log('detect location failed', e);
            }
          }}
        />
      </View>

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
  detectRow: {
    marginTop: 4,
    marginBottom: 8,
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