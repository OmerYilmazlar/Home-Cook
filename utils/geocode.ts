import { Platform } from 'react-native';
import * as Location from 'expo-location';

export interface ReverseGeocodeResult {
  street: string;
  city: string;
  state: string;
  zip: string;
  countryName: string;
  countryCode: string;
  formatted: string;
}

export async function getCurrentPosition(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    if (Platform.OS === 'web') {
      const coords = await new Promise<GeolocationCoordinates | null>((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
        );
      });
      if (!coords) return null;
      return { latitude: coords.latitude, longitude: coords.longitude };
    }
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  } catch (e) {
    console.log('getCurrentPosition error', e);
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  try {
    if (Platform.OS === 'web') {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      const address = data?.address ?? ({} as any);
      const street = [address.house_number, address.road].filter(Boolean).join(' ').trim();
      const city = address.city || address.town || address.village || '';
      const state = address.state || '';
      const zip = address.postcode || '';
      const countryName = address.country || '';
      const countryCode = (address.country_code || '').toUpperCase();
      const formatted = data.display_name || [street, city, zip, countryName].filter(Boolean).join(', ');
      return { street, city, state, zip, countryName, countryCode, formatted };
    }

    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    const item = results?.[0];
    if (!item) return null;
    const street = [item.name, item.street].filter(Boolean).join(' ').trim();
    const city = item.city || item.subregion || '';
    const state = item.region || '';
    const zip = item.postalCode || '';
    const countryName = item.country || '';
    const countryCode = item.isoCountryCode || '';
    const formatted = [street, city, zip, countryName].filter(Boolean).join(', ');
    return { street, city, state, zip, countryName, countryCode, formatted };
  } catch (e) {
    console.log('reverseGeocode error', e);
    return null;
  }
}

export async function geocodeAddress(address: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const query = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    const json = await res.json();
    const first = Array.isArray(json) ? json[0] : null;
    if (!first) return null;
    const lat = parseFloat(first.lat);
    const lon = parseFloat(first.lon);
    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      return { latitude: lat, longitude: lon };
    }
    return null;
  } catch (e) {
    console.log('geocodeAddress error', e);
    return null;
  }
}
