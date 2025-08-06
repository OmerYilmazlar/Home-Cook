// EmailJS Real Email Implementation for HomeCook
// Replace simulation functions in lib/verification.ts with this code

import emailjs from '@emailjs/react-native';

// Initialize EmailJS (call this once when app starts)
export const initializeEmailJS = () => {
  emailjs.init({
    publicKey: process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY,
    // Optional: configure default service and template
    blockHeadless: true,
    limitRate: {
      throttle: 10000, // 10 seconds between emails
    },
  });
};

// Real email sending function
async function sendRealEmail(email: string, code: string): Promise<void> {
  const templateParams = {
    to_email: email,
    verification_code: code,
    from_name: 'HomeCook Team',
    app_name: 'HomeCook',
    // Add current year for footer
    current_year: new Date().getFullYear().toString(),
  };

  try {
    console.log('📧 Sending verification email to:', email);
    
    const result = await emailjs.send(
      process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID!, 
      templateParams,
      {
        publicKey: process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY!,
      }
    );
    
    console.log('✅ Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw new Error(`Email sending failed: ${error}`);
  }
}

// Updated sendEmailVerification function
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

    // Check if we're in development mode
    const isDevelopment = __DEV__;
    
    if (isDevelopment) {
      // In development: Still show testing info but also send real email
      console.log(`🧪 TESTING MODE: Verification code ${code}`);
      (global as any).lastVerificationCode = code;
    }

    // Send real email (works in both dev and production)
    await sendRealEmail(email, code);

    return {
      success: true,
      message: `Verification code sent to ${email}. ${isDevelopment ? `For testing: ${code}` : 'Please check your inbox.'}`
    };
  } catch (error) {
    console.error('Email verification error:', error);
    
    // In development, still allow testing even if email fails
    if (__DEV__) {
      const code = generateVerificationCode();
      (global as any).lastVerificationCode = code;
      console.log(`🧪 TESTING FALLBACK: Using code ${code}`);
      
      return {
        success: true,
        message: `Email sending failed, but testing mode active. Code: ${code}`
      };
    }
    
    return {
      success: false,
      message: 'Failed to send verification email. Please try again.'
    };
  }
},

// Environment variables validation
export const validateEmailJSConfig = (): boolean => {
  const requiredVars = [
    'EXPO_PUBLIC_EMAILJS_PUBLIC_KEY',
    'EXPO_PUBLIC_EMAILJS_SERVICE_ID', 
    'EXPO_PUBLIC_EMAILJS_TEMPLATE_ID'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing EmailJS environment variables:', missing);
    return false;
  }
  
  console.log('✅ EmailJS configuration validated');
  return true;
};

// Usage in App.tsx or your main entry point:
/*
import { initializeEmailJS, validateEmailJSConfig } from './lib/verification';

export default function App() {
  useEffect(() => {
    // Validate configuration
    if (validateEmailJSConfig()) {
      // Initialize EmailJS
      initializeEmailJS();
      console.log('📧 EmailJS initialized successfully');
    } else {
      console.warn('⚠️ EmailJS not configured, using testing mode');
    }
  }, []);
  
  // ... rest of your app
}
*/
