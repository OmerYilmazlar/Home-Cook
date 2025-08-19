// Phone number validation utilities
export const validatePhoneNumber = (phoneNumber: string, isRequired: boolean = true): boolean => {
  // If phone is not required and empty, it's valid
  if (!isRequired && (!phoneNumber || phoneNumber.trim().length === 0)) {
    return true;
  }
  
  if (!phoneNumber || phoneNumber.trim().length === 0) return false;
  
  // Remove all non-digit characters to check the core number
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Must have at least 7 digits (minimum for any phone number)
  // and at most 15 digits (international standard)
  if (cleaned.length < 7 || cleaned.length > 15) {
    return false;
  }
  
  // For UK numbers specifically (since user mentioned UK number)
  if (phoneNumber.includes('+44') || phoneNumber.startsWith('07')) {
    // UK mobile numbers: +44 7xxx xxx xxx or 07xxx xxx xxx
    const ukCleaned = cleaned.replace(/^44/, '').replace(/^0/, '');
    if (ukCleaned.startsWith('7') && ukCleaned.length === 10) {
      return true;
    }
    // UK landline numbers are also valid
    if (ukCleaned.length >= 10 && ukCleaned.length <= 11) {
      return true;
    }
  }
  
  // For US/Canada numbers (10-11 digits)
  if (cleaned.length === 10) {
    // US format: area code + 7 digits
    return /^[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(cleaned);
  }
  
  if (cleaned.length === 11) {
    // North America with country code: 1 + area code + 7 digits
    return /^1[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(cleaned);
  }
  
  // For other international numbers (7-15 digits), basic validation
  // Must start with a digit (not 0) and contain only digits
  return /^[1-9]\d{6,14}$/.test(cleaned);
};

// Format phone number as user types
export const formatPhoneNumber = (phoneNumber: string, currentValue: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Strict limit: max 15 digits, don't allow more input
  if (cleaned.length > 15) {
    return currentValue; // Return previous value if too long
  }
  
  // For short numbers, just return as is
  if (cleaned.length <= 3) {
    return cleaned;
  }
  
  // Format US phone numbers (10 digits)
  if (cleaned.length <= 10) {
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      if (!match[2]) return match[1];
      if (!match[3]) return `(${match[1]}) ${match[2]}`;
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
  }
  
  // For international numbers (11+ digits), format with country code
  if (cleaned.length > 10) {
    // Simple international format: +X XXX XXX XXXX
    const countryCode = cleaned.substring(0, cleaned.length - 10);
    const rest = cleaned.substring(cleaned.length - 10);
    
    if (rest.length >= 10) {
      const areaCode = rest.substring(0, 3);
      const firstPart = rest.substring(3, 6);
      const lastPart = rest.substring(6);
      return `+${countryCode} ${areaCode} ${firstPart} ${lastPart}`;
    } else if (rest.length >= 6) {
      const areaCode = rest.substring(0, 3);
      const firstPart = rest.substring(3);
      return `+${countryCode} ${areaCode} ${firstPart}`;
    } else if (rest.length >= 3) {
      const areaCode = rest.substring(0, 3);
      return `+${countryCode} ${areaCode}`;
    } else {
      return `+${countryCode} ${rest}`;
    }
  }
  
  return cleaned;
};

// Bio validation with character limit
export const validateBio = (bio: string): { isValid: boolean; charCount: number; error?: string } => {
  if (!bio || bio.trim().length === 0) {
    return { isValid: false, charCount: 0, error: 'Bio is required' };
  }
  
  const charCount = bio.length;
  
  if (charCount > 600) {
    return { 
      isValid: false, 
      charCount, 
      error: `Bio must be 600 characters or less (currently ${charCount} characters)` 
    };
  }
  
  if (bio.trim().length < 10) {
    return { 
      isValid: false, 
      charCount, 
      error: 'Bio must be at least 10 characters long' 
    };
  }
  
  return { isValid: true, charCount };
};

// Address validation - More user-friendly
export const validateAddress = (address: string): boolean => {
  if (address.length < 5) return false;
  
  // More flexible validation - just need some basic components
  const hasNumber = /\d/.test(address);
  const hasText = /[a-zA-Z]/.test(address);
  const hasMinimumLength = address.trim().length >= 5;
  
  // Split by comma or space to check for multiple parts
  const parts = address.split(/[,\s]+/).filter(part => part.length > 0);
  const hasMultipleParts = parts.length >= 2;
  
  // Accept if it has numbers, text, and looks like an address
  return hasNumber && hasText && hasMinimumLength && hasMultipleParts;
};

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || 'YOUR_API_KEY_HERE';

// Google Places API address suggestions
export const getAddressSuggestions = async (query: string): Promise<string[]> => {
  if (query.length < 2) return [];
  
  console.log('🔍 Google Places API: Fetching suggestions for:', query);
  console.log('🔑 API Key:', GOOGLE_PLACES_API_KEY ? `${GOOGLE_PLACES_API_KEY.substring(0, 10)}...` : 'NOT SET');
  
  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}&types=address`;
    console.log('📡 Request URL:', url.replace(GOOGLE_PLACES_API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    
    console.log('📊 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      console.warn('❌ Google Places API request failed:', response.status, response.statusText);
      console.warn('🔄 Falling back to mock data');
      return getMockAddressSuggestions(query);
    }
    
    const data = await response.json();
    console.log('📋 API Response:', data);
    
    if (data.status === 'OK' && data.predictions) {
      const suggestions = data.predictions.map((prediction: any) => prediction.description).slice(0, 5);
      console.log('✅ Found suggestions:', suggestions);
      return suggestions;
    } else {
      console.warn('⚠️ Google Places API status:', data.status);
      if (data.error_message) {
        console.warn('📝 Error message:', data.error_message);
      }
      console.warn('🔄 Falling back to mock data');
      return getMockAddressSuggestions(query);
    }
  } catch (error) {
    console.error('💥 Error fetching address suggestions:', error);
    console.warn('🔄 Falling back to mock data');
    return getMockAddressSuggestions(query);
  }
};

// Enhanced address validation with Google Places
export const validateAddressWithGoogle = async (address: string): Promise<{
  isValid: boolean;
  suggestion?: string;
  coordinates?: { lat: number; lng: number };
  error?: string;
}> => {
  if (!address || address.trim().length < 5) {
    return { isValid: false, error: 'Address must be at least 5 characters long' };
  }
  
  console.log('🏠 Google Geocoding: Validating address:', address);
  console.log('🔑 API Key:', GOOGLE_PLACES_API_KEY ? `${GOOGLE_PLACES_API_KEY.substring(0, 10)}...` : 'NOT SET');
  
  try {
    // First, try to geocode the address to verify it exists
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_PLACES_API_KEY}`;
    console.log('📡 Geocoding URL:', url.replace(GOOGLE_PLACES_API_KEY, 'API_KEY_HIDDEN'));
    
    const geocodeResponse = await fetch(url);
    
    console.log('📊 Geocoding response status:', geocodeResponse.status, geocodeResponse.statusText);
    
    if (!geocodeResponse.ok) {
      console.warn('❌ Google Geocoding API request failed:', geocodeResponse.status, geocodeResponse.statusText);
      console.warn('🔄 Using basic validation fallback');
      return { isValid: validateAddress(address) };
    }
    
    const geocodeData = await geocodeResponse.json();
    console.log('📋 Geocoding response:', geocodeData);
    
    if (geocodeData.status === 'OK' && geocodeData.results.length > 0) {
      const result = geocodeData.results[0];
      console.log('✅ Address validated successfully:', result.formatted_address);
      return {
        isValid: true,
        suggestion: result.formatted_address,
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        }
      };
    } else if (geocodeData.status === 'ZERO_RESULTS') {
      console.warn('🔍 No results found for address');
      return { 
        isValid: false, 
        error: 'Address not found. Please check the address and try again.' 
      };
    } else {
      console.warn('⚠️ Google Geocoding API status:', geocodeData.status);
      if (geocodeData.error_message) {
        console.warn('📝 Error message:', geocodeData.error_message);
      }
      console.warn('🔄 Using basic validation fallback');
      return { isValid: validateAddress(address) };
    }
  } catch (error) {
    console.error('💥 Error validating address with Google:', error);
    console.warn('🔄 Using basic validation fallback');
    return { isValid: validateAddress(address) };
  }
};

// Fallback mock address suggestions
const getMockAddressSuggestions = (query: string): string[] => {
  const mockAddresses = [
    '123 Main Street, New York, NY',
    '456 Oak Avenue, Los Angeles, CA',
    '789 Pine Road, Chicago, IL',
    '321 Elm Drive, Houston, TX',
    '654 Maple Lane, Phoenix, AZ',
    '987 Cedar Boulevard, Philadelphia, PA',
    '147 Birch Way, San Antonio, TX',
    '258 Willow Court, San Diego, CA',
    '369 Spruce Place, Dallas, TX',
    '741 Ash Street, San Jose, CA',
    '852 Walnut Drive, Austin, TX',
    '963 Cherry Lane, Jacksonville, FL',
    '159 Peach Street, Fort Worth, TX',
    '357 Apple Avenue, Columbus, OH',
    '468 Orange Road, Charlotte, NC',
    '555 Broadway Street, Seattle, WA',
    '777 Market Street, San Francisco, CA',
    '888 State Street, Boston, MA',
    '999 Fifth Avenue, Miami, FL',
    '111 Park Avenue, Denver, CO'
  ];
  
  // More flexible filtering
  const queryLower = query.toLowerCase();
  const filtered = mockAddresses.filter(addr => {
    const addrLower = addr.toLowerCase();
    return addrLower.includes(queryLower) || 
           addrLower.split(/[\s,]+/).some(word => word.startsWith(queryLower));
  }).slice(0, 5);
  
  // If no matches and user has typed something reasonable, suggest a template
  if (filtered.length === 0 && query.length >= 3) {
    return [`${query}, City, State`];
  }
  
  return filtered;
};

// Get city suggestions based on country
export const getCitySuggestions = async (query: string, countryCode: string): Promise<string[]> => {
  if (query.length < 2) return [];
  
  console.log('🏙️ Google Places API: Fetching city suggestions for:', query, 'in', countryCode);
  
  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}&types=(cities)&components=country:${countryCode.toLowerCase()}`;
    console.log('📡 City Request URL:', url.replace(GOOGLE_PLACES_API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('❌ Google Places API city request failed:', response.status);
      return getMockCitySuggestions(query, countryCode);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.predictions) {
      const suggestions = data.predictions.map((prediction: any) => {
        // Extract just the city name (first part before comma)
        const cityName = prediction.description.split(',')[0];
        return cityName;
      }).slice(0, 5);
      console.log('✅ Found city suggestions:', suggestions);
      return suggestions;
    } else {
      console.warn('⚠️ Google Places API city status:', data.status);
      return getMockCitySuggestions(query, countryCode);
    }
  } catch (error) {
    console.error('💥 Error fetching city suggestions:', error);
    return getMockCitySuggestions(query, countryCode);
  }
};

// Get ZIP code suggestions based on city and country
export const getZipCodeSuggestions = async (query: string, city: string, countryCode: string): Promise<string[]> => {
  if (query.length < 2) return [];
  
  console.log('📮 Google Places API: Fetching ZIP suggestions for:', query, 'in', city, countryCode);
  
  try {
    const searchQuery = `${query} ${city} ${countryCode}`;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchQuery)}&key=${GOOGLE_PLACES_API_KEY}&types=postal_code&components=country:${countryCode.toLowerCase()}`;
    console.log('📡 ZIP Request URL:', url.replace(GOOGLE_PLACES_API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('❌ Google Places API ZIP request failed:', response.status);
      return getMockZipSuggestions(query, countryCode);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.predictions) {
      const suggestions = data.predictions.map((prediction: any) => {
        // Extract ZIP code from the description
        const parts = prediction.description.split(',');
        // Look for the part that looks like a ZIP code
        for (const part of parts) {
          const trimmed = part.trim();
          if (countryCode === 'US' && /^\d{5}(-\d{4})?$/.test(trimmed)) {
            return trimmed;
          } else if (countryCode === 'GB' && /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(trimmed)) {
            return trimmed;
          } else if (/^[A-Z0-9\s-]{3,10}$/i.test(trimmed)) {
            return trimmed;
          }
        }
        return prediction.description.split(',')[0]; // Fallback to first part
      }).slice(0, 5);
      console.log('✅ Found ZIP suggestions:', suggestions);
      return suggestions;
    } else {
      console.warn('⚠️ Google Places API ZIP status:', data.status);
      return getMockZipSuggestions(query, countryCode);
    }
  } catch (error) {
    console.error('💥 Error fetching ZIP suggestions:', error);
    return getMockZipSuggestions(query, countryCode);
  }
};

// Get address suggestions within a specific ZIP code
export const getAddressSuggestionsInZip = async (query: string, zipCode: string, city: string, countryCode: string): Promise<string[]> => {
  if (query.length < 2) return [];
  
  console.log('🏠 Google Places API: Fetching address suggestions for:', query, 'in', zipCode, city, countryCode);
  
  try {
    const searchQuery = `${query} ${zipCode} ${city} ${countryCode}`;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchQuery)}&key=${GOOGLE_PLACES_API_KEY}&types=address&components=country:${countryCode.toLowerCase()}`;
    console.log('📡 Address Request URL:', url.replace(GOOGLE_PLACES_API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn('❌ Google Places API address request failed:', response.status);
      return getMockAddressSuggestionsInZip(query, zipCode);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.predictions) {
      const suggestions = data.predictions.map((prediction: any) => {
        // Extract just the street address (first part before comma)
        const streetAddress = prediction.description.split(',')[0];
        return streetAddress;
      }).slice(0, 5);
      console.log('✅ Found address suggestions:', suggestions);
      return suggestions;
    } else {
      console.warn('⚠️ Google Places API address status:', data.status);
      return getMockAddressSuggestionsInZip(query, zipCode);
    }
  } catch (error) {
    console.error('💥 Error fetching address suggestions:', error);
    return getMockAddressSuggestionsInZip(query, zipCode);
  }
};

// Mock city suggestions fallback
const getMockCitySuggestions = (query: string, countryCode: string): string[] => {
  const mockCities: Record<string, string[]> = {
    US: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
    GB: ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff'],
    CA: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'],
    AU: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong']
  };
  
  const cities = mockCities[countryCode] || mockCities.US;
  const queryLower = query.toLowerCase();
  
  return cities.filter(city => 
    city.toLowerCase().includes(queryLower) || 
    city.toLowerCase().startsWith(queryLower)
  ).slice(0, 5);
};

// Mock ZIP suggestions fallback
const getMockZipSuggestions = (query: string, countryCode: string): string[] => {
  if (countryCode === 'US') {
    const baseZip = query.padEnd(5, '0').substring(0, 5);
    return [
      baseZip,
      (parseInt(baseZip) + 1).toString().padStart(5, '0'),
      (parseInt(baseZip) + 2).toString().padStart(5, '0')
    ];
  } else if (countryCode === 'GB') {
    const baseCode = query.toUpperCase();
    return [
      baseCode + ' 1AA',
      baseCode + ' 2BB',
      baseCode + ' 3CC'
    ].filter(code => code.length <= 8);
  } else {
    return [query + '001', query + '002', query + '003'];
  }
};

// Mock address suggestions in ZIP fallback
const getMockAddressSuggestionsInZip = (query: string, zipCode: string): string[] => {
  const streetNumbers = ['123', '456', '789', '321', '654'];
  const streetNames = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm Dr', 'Maple Ln'];
  
  return streetNumbers.map((num, index) => 
    `${num} ${query} ${streetNames[index]}`
  ).slice(0, 3);
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};