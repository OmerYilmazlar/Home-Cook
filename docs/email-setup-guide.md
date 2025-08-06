# Email Verification Setup Guide

## 🎯 Current Status

Your email verification system is now **WORKING** with the following features:

✅ **Direct redirection** to verification screen (no "Later" option)  
✅ **Testing mode** with auto-fill verification codes  
✅ **6-digit code generation** and database storage  
✅ **Development-friendly** verification flow  

## 🧪 Testing Mode (Currently Active)

For development/testing, the system:

1. **Generates real verification codes** and stores them in database
2. **Shows codes in console logs** for testing
3. **Displays codes in the verification screen** with "Auto-fill" button
4. **Simulates email sending** with console output

### Testing Flow:
1. Update profile → Automatic redirect to verification
2. Tap "Send Code" → Code appears in testing panel
3. Tap "Auto-fill Code" → Code enters automatically
4. Tap "Verify Email" → Verification complete!

## 📧 Production Email Setup

For **real email sending**, choose one of these services:

### Option 1: EmailJS (Easiest - No backend needed)
```bash
# Already installed!
npm install @emailjs/react-native
```

**Setup Steps:**
1. Go to [EmailJS.com](https://www.emailjs.com/) and create free account
2. Create an email service (Gmail, Outlook, etc.)
3. Create an email template
4. Get your Public Key, Service ID, and Template ID
5. Replace simulation in `lib/verification.ts`

### Option 2: SendGrid (Professional)
```bash
npm install @sendgrid/mail
```

**Setup Steps:**
1. Create [SendGrid account](https://sendgrid.com/) (free tier: 100 emails/day)
2. Get API key from SendGrid dashboard
3. Add to environment variables
4. Replace simulation in `lib/verification.ts`

### Option 3: AWS SES (Enterprise)
```bash
npm install aws-sdk
```

**Setup Steps:**
1. Setup AWS account and SES service
2. Verify sending domain/email
3. Get AWS credentials
4. Replace simulation in `lib/verification.ts`

## 🔧 Implementation Example (EmailJS)

Replace the simulation in `lib/verification.ts`:

```typescript
import emailjs from '@emailjs/react-native';

// Replace simulateEmailSending function
async function sendEmailVerification(email: string, code: string): Promise<void> {
  const templateParams = {
    to_email: email,
    verification_code: code,
    app_name: 'HomeCook'
  };

  await emailjs.send(
    'YOUR_SERVICE_ID',
    'YOUR_TEMPLATE_ID', 
    templateParams,
    'YOUR_PUBLIC_KEY'
  );
}
```

## 🔐 Environment Variables

Add to your `.env` file:

```bash
# EmailJS
EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key
EXPO_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id

# Or SendGrid
EXPO_PUBLIC_SENDGRID_API_KEY=your_api_key

# Or AWS SES
EXPO_PUBLIC_AWS_ACCESS_KEY_ID=your_access_key
EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY=your_secret_key
EXPO_PUBLIC_AWS_REGION=us-east-1
```

## 📱 Current Testing Instructions

**For immediate testing:**

1. **Save profile changes** in Edit Profile
2. **Automatically redirected** to verification screen
3. **Tap "Send Code"** button
4. **Look for orange testing panel** with your verification code
5. **Tap "Auto-fill Code"** to enter code automatically
6. **Tap "Verify Email"** to complete verification

**Console logs to watch for:**
```
📧 Email verification code for email@example.com: 123456
🧪 TESTING MODE: Verification code 123456 stored globally
```

## 🚀 Production Checklist

Before going live:

- [ ] Choose and setup email service (EmailJS/SendGrid/AWS SES)
- [ ] Replace simulation functions with real email sending
- [ ] Add environment variables for email service
- [ ] Test with real email addresses
- [ ] Remove development testing panels (`__DEV__` checks)
- [ ] Setup email templates with your branding

## 📞 SMS Verification (Optional)

For phone verification, you can use:
- **Twilio** (easiest)
- **AWS SNS** 
- **Firebase Auth**

Similar setup process - replace SMS simulation in `lib/verification.ts`.

---

**Your verification system is ready for testing! 🎉**

The app will now automatically direct users to email verification after profile updates, and in development mode, you can see the codes and auto-fill them for easy testing.
