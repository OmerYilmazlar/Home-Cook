// Address validation using multiple APIs for reliable validation
interface AddressValidationResult {
  isValid: boolean;
  formatted?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  components?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  error?: string;
}

// Using free geocoding APIs for address validation
export const validateAddressAPI = async (address: string): Promise<AddressValidationResult> => {
  try {
    // Try Nominatim (OpenStreetMap) first - free and reliable
    const nominatimResult = await validateWithNominatim(address);
    if (nominatimResult.isValid) {
      return nominatimResult;
    }

    // If Nominatim fails, try a basic validation
    return validateAddressBasic(address);
  } catch (error) {
    console.warn('Address validation failed:', error);
    // Fallback to basic validation
    return validateAddressBasic(address);
  }
};

const validateWithNominatim = async (address: string): Promise<AddressValidationResult> => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&limit=1`,
      {
        headers: {
          'User-Agent': 'HomeCookApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      const addressDetails = result.address || {};
      
      return {
        isValid: true,
        formatted: result.display_name,
        coordinates: {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon)
        },
        components: {
          street: addressDetails.road || addressDetails.house_number 
            ? `${addressDetails.house_number || ''} ${addressDetails.road || ''}`.trim()
            : undefined,
          city: addressDetails.city || addressDetails.town || addressDetails.village,
          state: addressDetails.state || addressDetails.region,
          postalCode: addressDetails.postcode,
          country: addressDetails.country
        }
      };
    }

    return { isValid: false, error: 'Address not found' };
  } catch (error) {
    throw new Error(`Nominatim validation failed: ${error}`);
  }
};

const validateAddressBasic = (address: string): AddressValidationResult => {
  // Basic validation for when API fails
  const trimmed = address.trim();
  
  if (trimmed.length < 10) {
    return { isValid: false, error: 'Address too short' };
  }

  // Check for basic address components
  const hasNumbers = /\d/.test(trimmed);
  const hasStreetWords = /\b(street|st|road|rd|avenue|ave|lane|ln|drive|dr|way|close|crescent|place|pl)\b/i.test(trimmed);
  const hasComma = trimmed.includes(',');
  
  if (!hasNumbers && !hasStreetWords) {
    return { isValid: false, error: 'Address should include street number or street type' };
  }

  // Basic validation passed
  return { 
    isValid: true, 
    formatted: trimmed,
    components: {
      street: trimmed // Basic fallback
    }
  };
};

// Validate UK postcode specifically
export const validateUKPostcode = (postcode: string): boolean => {
  const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
  return ukPostcodeRegex.test(postcode.trim());
};

// Validate US ZIP code
export const validateUSZipCode = (zipCode: string): boolean => {
  const usZipRegex = /^\d{5}(-\d{4})?$/;
  return usZipRegex.test(zipCode.trim());
};

// General postal code validation
export const validatePostalCode = (postalCode: string, countryCode?: string): boolean => {
  if (!postalCode || postalCode.trim().length === 0) return false;
  
  const trimmed = postalCode.trim();
  
  // Country-specific validation
  switch (countryCode?.toUpperCase()) {
    case 'GB':
    case 'UK':
      return validateUKPostcode(trimmed);
    case 'US':
      return validateUSZipCode(trimmed);
    case 'CA':
      // Canadian postal code: A1A 1A1
      return /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i.test(trimmed);
    case 'DE':
      // German postal code: 5 digits
      return /^\d{5}$/.test(trimmed);
    case 'FR':
      // French postal code: 5 digits
      return /^\d{5}$/.test(trimmed);
    default:
      // General validation: 3-10 alphanumeric characters
      return /^[A-Z0-9\s-]{3,10}$/i.test(trimmed);
  }
};
