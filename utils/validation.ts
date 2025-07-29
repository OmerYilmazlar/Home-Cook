// Phone number validation utilities
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if it's exactly 10 digits for US numbers
  if (cleaned.length === 10) {
    // Must start with area code (not 0 or 1)
    return /^[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(cleaned);
  }
  
  // For international numbers, 11-15 digits
  if (cleaned.length >= 11 && cleaned.length <= 15) {
    return /^[1-9]\d{10,14}$/.test(cleaned);
  }
  
  return false;
};

// Format phone number as user types
export const formatPhoneNumber = (phoneNumber: string, currentValue: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Strict limit: max 15 digits, don't allow more input
  if (cleaned.length > 15) {
    return currentValue; // Return previous value if too long
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
  
  // For international numbers (11-15 digits), format with country code
  if (cleaned.length > 10) {
    const countryCode = cleaned.substring(0, cleaned.length - 10);
    const areaCode = cleaned.substring(cleaned.length - 10, cleaned.length - 7);
    const firstPart = cleaned.substring(cleaned.length - 7, cleaned.length - 4);
    const lastPart = cleaned.substring(cleaned.length - 4);
    
    if (areaCode && firstPart && lastPart) {
      return `+${countryCode} (${areaCode}) ${firstPart}-${lastPart}`;
    } else if (areaCode && firstPart) {
      return `+${countryCode} (${areaCode}) ${firstPart}`;
    } else if (areaCode) {
      return `+${countryCode} (${areaCode}`;
    } else {
      return `+${countryCode}`;
    }
  }
  
  return cleaned;
};

// Address validation
export const validateAddress = (address: string): boolean => {
  if (address.length < 10) return false;
  
  // Must have at least a number, street name, and city
  const hasNumber = /\d/.test(address);
  const hasStreetType = /\b(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|way|place|pl|court|ct|circle|cir)\b/i.test(address);
  const hasComma = address.includes(',');
  
  // Should have at least 2 parts separated by comma (street, city)
  const parts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);
  const hasMultipleParts = parts.length >= 2;
  
  // Check if it looks like a real address format
  const addressPattern = /^\d+\s+[a-zA-Z\s]+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd|way|place|pl|court|ct|circle|cir)/i;
  const startsWithNumber = /^\d+\s/.test(address);
  
  return hasNumber && hasComma && hasMultipleParts && startsWithNumber && (hasStreetType || addressPattern.test(address));
};

// Mock address suggestions (in real app, use Google Places API)
export const getAddressSuggestions = (query: string): string[] => {
  if (query.length < 3) return [];
  
  const mockAddresses = [
    '123 Main Street, New York, NY 10001',
    '456 Oak Avenue, Los Angeles, CA 90210',
    '789 Pine Road, Chicago, IL 60601',
    '321 Elm Drive, Houston, TX 77001',
    '654 Maple Lane, Phoenix, AZ 85001',
    '987 Cedar Boulevard, Philadelphia, PA 19101',
    '147 Birch Way, San Antonio, TX 78201',
    '258 Willow Court, San Diego, CA 92101',
    '369 Spruce Place, Dallas, TX 75201',
    '741 Ash Street, San Jose, CA 95101',
    '852 Walnut Drive, Austin, TX 78701',
    '963 Cherry Lane, Jacksonville, FL 32201',
    '159 Peach Street, Fort Worth, TX 76101',
    '357 Apple Avenue, Columbus, OH 43201',
    '468 Orange Road, Charlotte, NC 28201',
    '555 Broadway Street, Seattle, WA 98101',
    '777 Market Street, San Francisco, CA 94102',
    '888 State Street, Boston, MA 02101',
    '999 Fifth Avenue, Miami, FL 33101',
    '111 Park Avenue, Denver, CO 80201'
  ];
  
  // Better filtering: match beginning of words or full query
  const queryLower = query.toLowerCase();
  return mockAddresses.filter(addr => {
    const addrLower = addr.toLowerCase();
    // Match if query appears at start of address or after a space/comma
    return addrLower.includes(queryLower) || 
           addrLower.split(/[\s,]+/).some(word => word.startsWith(queryLower));
  }).slice(0, 5);
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};