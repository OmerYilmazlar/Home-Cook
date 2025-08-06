export interface Country {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  format?: string;
  mask?: string;
}

export const countries: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1', format: '(###) ###-####' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1', format: '(###) ###-####' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', format: '#### ### ####' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33', format: '## ## ## ## ##' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49', format: '### ########' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34', format: '### ### ###' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39', format: '### ### ####' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61', format: '### ### ###' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', dialCode: '+64', format: '## ### ####' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81', format: '##-####-####' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82', format: '##-####-####' },
  { code: 'CN', name: 'China', flag: '🇨🇳', dialCode: '+86', format: '### #### ####' },
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91', format: '##### #####' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55', format: '(##) #####-####' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52', format: '### ### ####' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54', format: '### ####-####' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', dialCode: '+7', format: '### ###-##-##' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', dialCode: '+90', format: '### ### ## ##' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27', format: '## ### ####' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', dialCode: '+20', format: '### ### ####' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234', format: '### ### ####' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254', format: '### ######' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66', format: '##-####-####' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60', format: '##-#### ####' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65', format: '#### ####' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63', format: '### ### ####' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62', format: '###-###-####' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '+84', format: '### ### ####' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', dialCode: '+971', format: '## ### ####' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966', format: '## ### ####' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', dialCode: '+972', format: '##-###-####' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', dialCode: '+30', format: '### ### ####' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351', format: '### ### ###' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31', format: '##-########' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', dialCode: '+32', format: '### ## ## ##' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', dialCode: '+41', format: '## ### ## ##' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', dialCode: '+43', format: '### ######' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', dialCode: '+46', format: '##-### ## ##' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', dialCode: '+47', format: '### ## ###' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', dialCode: '+45', format: '## ## ## ##' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', dialCode: '+358', format: '### #######' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', dialCode: '+353', format: '## ### ####' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', dialCode: '+48', format: '### ### ###' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', dialCode: '+420', format: '### ### ###' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', dialCode: '+36', format: '## ### ####' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', dialCode: '+40', format: '### ### ###' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', dialCode: '+385', format: '##-###-####' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', dialCode: '+359', format: '### ### ###' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', dialCode: '+370', format: '### #####' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', dialCode: '+371', format: '## ### ###' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', dialCode: '+372', format: '### ####' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', dialCode: '+354', format: '### ####' }
];

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

export const getCountryByDialCode = (dialCode: string): Country | undefined => {
  return countries.find(country => country.dialCode === dialCode);
};

export const detectCountryFromPhone = (phone: string): Country | undefined => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  if (!cleaned.startsWith('+')) return undefined;
  
  // Try to match dial codes (longest first for accuracy)
  const sortedCountries = countries.sort((a, b) => b.dialCode.length - a.dialCode.length);
  
  for (const country of sortedCountries) {
    if (cleaned.startsWith(country.dialCode)) {
      return country;
    }
  }
  
  return undefined;
};

export const formatPhoneWithCountry = (phone: string, country: Country): string => {
  const cleaned = phone.replace(/\D/g, '');
  const dialCode = country.dialCode.replace('+', '');
  
  // Remove country code if present
  let nationalNumber = cleaned;
  if (cleaned.startsWith(dialCode)) {
    nationalNumber = cleaned.substring(dialCode.length);
  }
  
  // Apply country-specific formatting
  if (country.format) {
    let formatted = country.format;
    let index = 0;
    
    for (let i = 0; i < formatted.length; i++) {
      if (formatted[i] === '#' && index < nationalNumber.length) {
        formatted = formatted.substring(0, i) + nationalNumber[index] + formatted.substring(i + 1);
        index++;
      }
    }
    
    // Remove unused # symbols
    formatted = formatted.replace(/#/g, '');
    
    // Only return if we used some digits
    if (index > 0) {
      return `${country.dialCode} ${formatted}`.trim();
    }
  }
  
  // Fallback formatting
  if (nationalNumber.length > 0) {
    return `${country.dialCode} ${nationalNumber}`;
  }
  
  return country.dialCode;
};
