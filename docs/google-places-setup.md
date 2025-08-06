# Google Places API Setup Guide

## 🚀 Quick Setup for Real Address Validation

### Step 1: Get Your Google Places API Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select an existing one
3. **Enable APIs**:
   - Go to "APIs & Services" > "Library"
   - Search for and enable "Places API"
   - Search for and enable "Geocoding API"
4. **Create API Key**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### Step 2: Configure Your Environment

1. Create a `.env` file in your project root (copy from `.env.example`)
2. Replace `YOUR_GOOGLE_PLACES_API_KEY_HERE` with your actual API key:
   ```
   EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
   ```

### Step 3: Secure Your API Key (Important!)

1. **Restrict your API key** in Google Cloud Console:
   - Go to "APIs & Services" > "Credentials"
   - Click on your API key
   - Under "Application restrictions", select "Android apps" or "iOS apps"
   - Add your app's bundle identifier

### Step 4: Use in Your App

```tsx
import { GooglePlacesInput } from '@/components/GooglePlacesInput';

// In your component
<GooglePlacesInput
  label="Address"
  value={address}
  onChangeText={setAddress}
  onSelectAddress={(address, coordinates) => {
    console.log('Selected:', address);
    console.log('Coordinates:', coordinates);
  }}
  placeholder="Enter your address"
/>
```

## 🔧 Features

✅ **Real-time autocomplete** - Powered by Google Places API  
✅ **Address validation** - Verifies addresses actually exist  
✅ **Geocoding** - Gets exact coordinates for addresses  
✅ **Fallback support** - Works with mock data if API fails  
✅ **Debounced search** - Efficient API usage  
✅ **Error handling** - Graceful degradation  

## 💰 Pricing

Google Places API has a free tier with generous limits:
- **Autocomplete**: $2.83 per 1,000 requests (first 1,000/month free)
- **Geocoding**: $5.00 per 1,000 requests (first 1,000/month free)

For a typical home cooking app, you'll likely stay within free limits during development.

## 🛡️ Security Best Practices

1. **Always restrict your API key** to your specific app
2. **Never commit API keys** to version control
3. **Use environment variables** for sensitive data
4. **Monitor usage** in Google Cloud Console
5. **Set usage quotas** to prevent unexpected charges

## 🔄 Migration from Mock Data

If you're currently using mock address suggestions, simply:

1. Add your API key to `.env`
2. Replace `getAddressSuggestions()` calls with the enhanced version
3. The component automatically falls back to mock data if the API fails

## 📱 Testing

- **Development**: Use mock data or development API key
- **Production**: Use restricted production API key
- **Testing**: Mock the API responses for unit tests

## 🚨 Troubleshooting

**No suggestions appearing?**
- Check your API key is correct
- Verify Places API is enabled
- Check console for error messages

**API not working?**
- App falls back to mock suggestions automatically
- Check network connectivity
- Verify API quotas haven't been exceeded

**Geocoding not working?**
- Ensure Geocoding API is enabled
- Check API key restrictions
- Some addresses may not have exact coordinates
