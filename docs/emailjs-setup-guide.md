# EmailJS Setup Guide for HomeCook

## 📧 Complete EmailJS Setup with Custom Template

### Step 1: Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Click "Create Account" 
3. Sign up with your email
4. Verify your email address

### Step 2: Connect Your Email Service

1. **In EmailJS Dashboard**, click "Email Services"
2. Click "Add New Service"
3. Choose your email provider:
   - **Gmail** (recommended for testing)
   - **Outlook** 
   - **Yahoo**
   - Or any SMTP service

#### For Gmail Setup:
1. Select "Gmail"
2. Click "Connect Account" 
3. Sign in with your Gmail account
4. Allow EmailJS permissions
5. Give your service a name (e.g., "HomeCook Verification")

### Step 3: Create Email Template

1. **In EmailJS Dashboard**, click "Email Templates"
2. Click "Create New Template"
3. **Template Settings:**
   - **Template Name**: `homecook_verification`
   - **Template ID**: `template_homecook_verify` (save this!)

4. **Replace the template content** with our custom HTML:
   - Delete all existing content
   - Copy the entire content from `docs/email-template.html`
   - Paste it into the template editor

5. **Template Variables** (EmailJS will auto-detect these):
   - `{{verification_code}}` - The 6-digit code
   - `{{to_email}}` - Recipient email (auto-filled)
   - `{{from_name}}` - Your app name (optional)

6. **Test the template**:
   - Click "Test Template"
   - Enter a test verification code: `123456`
   - Send to your email to see how it looks

7. **Save the template**

### Step 4: Get Your Credentials

In your EmailJS Dashboard, collect these values:

1. **Public Key**: 
   - Go to "Account" > "General"
   - Copy "Public Key" (starts with `user_`)

2. **Service ID**:
   - Go to "Email Services" 
   - Copy the Service ID of your Gmail service

3. **Template ID**: 
   - Go to "Email Templates"
   - Copy your template ID (`template_homecook_verify`)

### Step 5: Configure Environment Variables

Create or update your `.env` file:

```bash
# EmailJS Configuration
EXPO_PUBLIC_EMAILJS_PUBLIC_KEY=user_xxxxxxxxx
EXPO_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxxxx  
EXPO_PUBLIC_EMAILJS_TEMPLATE_ID=template_homecook_verify
```

### Step 6: Update Your Code

Replace the simulation in `lib/verification.ts`:

```typescript
import emailjs from '@emailjs/react-native';

// Replace the simulateEmailSending function
async function sendRealEmail(email: string, code: string): Promise<void> {
  const templateParams = {
    to_email: email,
    verification_code: code,
    from_name: 'HomeCook Team'
  };

  try {
    await emailjs.send(
      process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID!, 
      templateParams,
      process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY!
    );
    
    console.log('✅ Email sent successfully to:', email);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

// Update the sendEmailVerification function
async sendEmailVerification(userId: string, email: string): Promise<{ success: boolean; message: string }> {
  try {
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store verification request in database
    const { error: dbError } = await supabase
      .from('verification_requests')
      .insert({
        id: `email-${userId}-${Date.now()}`,
        user_id: userId,
        type: 'email',
        contact: email,
        code: code,
        expires_at: expiresAt.toISOString(),
        verified: false,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(dbError.message);
    }

    // Send real email instead of simulation
    await sendRealEmail(email, code);

    return {
      success: true,
      message: `Verification code sent to ${email}. Please check your inbox.`
    };
  } catch (error) {
    console.error('Email verification error:', error);
    return {
      success: false,
      message: 'Failed to send verification email. Please try again.'
    };
  }
}
```

### Step 7: Test Real Email Sending

1. **Restart your Expo server**:
   ```bash
   # Stop current server (Ctrl+C)
   npx expo start
   ```

2. **Test the flow**:
   - Update your profile
   - Go to verification screen
   - Tap "Send Code"
   - Check your **actual email inbox**!

### Step 8: Email Customization Options

You can customize the template by editing `docs/email-template.html`:

- **Colors**: Change the gradient colors in CSS
- **Logo**: Replace "🍳 HomeCook" with your actual logo
- **Content**: Update the welcome message
- **Links**: Add real links to your app store, support, etc.

### 📱 Template Preview

The email template includes:
- **Professional HomeCook branding**
- **Clear 6-digit verification code**
- **Mobile-responsive design**
- **Step-by-step instructions**
- **Security warning about expiration**
- **Welcome message for new cooks**

### 🎯 Free Tier Limits

EmailJS free tier includes:
- **200 emails per month**
- **No daily sending limit**
- **All features included**
- **Perfect for testing and small apps**

### 🔧 Troubleshooting

**If emails don't send**:
1. Check console logs for error messages
2. Verify environment variables are loaded
3. Test template in EmailJS dashboard
4. Check Gmail "Sent" folder
5. Check recipient's spam folder

**Common issues**:
- Wrong Service ID or Template ID
- Gmail account not properly connected
- Environment variables not loaded (restart Expo)

---

**Your professional email verification is ready! 🎉**

Users will now receive beautiful, branded verification emails that match your HomeCook app experience.
