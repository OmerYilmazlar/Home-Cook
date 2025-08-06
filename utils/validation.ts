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
  
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}&types=address`
    );
    
    if (!response.ok) {
      console.warn('Google Places API request failed, falling back to mock data');
      return getMockAddressSuggestions(query);
    }
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.predictions) {
      return data.predictions.map((prediction: any) => prediction.description).slice(0, 5);
    } else {
      console.warn('Google Places API returned no results, falling back to mock data');
      return getMockAddressSuggestions(query);
    }
  } catch (error) {
    console.warn('Error fetching address suggestions:', error);
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
  
  try {
    // First, try to geocode the address to verify it exists
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_PLACES_API_KEY}`
    );
    
    if (!geocodeResponse.ok) {
      console.warn('Google Geocoding API request failed, using basic validation');
      return { isValid: validateAddress(address) };
    }
    
    const geocodeData = await geocodeResponse.json();
    
    if (geocodeData.status === 'OK' && geocodeData.results.length > 0) {
      const result = geocodeData.results[0];
      return {
        isValid: true,
        suggestion: result.formatted_address,
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        }
      };
    } else if (geocodeData.status === 'ZERO_RESULTS') {
      return { 
        isValid: false, 
        error: 'Address not found. Please check the address and try again.' 
      };
    } else {
      console.warn('Google Geocoding API error:', geocodeData.status);
      return { isValid: validateAddress(address) };
    }
  } catch (error) {
    console.warn('Error validating address with Google:', error);
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

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};