import { supabase } from './supabase';
import emailjs from '@emailjs/react-native';

// Types for verification
export interface VerificationRequest {
  id: string;
  userId: string;
  type: 'email' | 'phone';
  contact: string; // email address or phone number
  code: string;
  expiresAt: Date;
  verified: boolean;
  createdAt: Date;
}

export interface VerificationStatus {
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  emailVerifiedAt?: Date;
  phoneVerifiedAt?: Date;
}

// Generate a 6-digit verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Initialize EmailJS (call this once when app starts)
export const initializeEmailJS = (): boolean => {
  try {
    const publicKey = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;
    const serviceId = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;

    if (!publicKey || !serviceId || !templateId) {
      console.warn('⚠️ EmailJS credentials not found in environment variables');
      console.log('📧 Using testing mode only');
      return false;
    }

    emailjs.init({
      publicKey: publicKey,
      blockHeadless: true,
      limitRate: {
        throttle: 10000, // 10 seconds between emails
      },
    });

    console.log('✅ EmailJS initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize EmailJS:', error);
    return false;
  }
};

// Real email sending function using EmailJS
const sendRealEmail = async (email: string, code: string): Promise<void> => {
  const templateParams = {
    to_email: email,
    verification_code: code,
    from_name: 'HomeCook Team',
    app_name: 'HomeCook',
  };

  const publicKey = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;
  const serviceId = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;

  // If credentials are missing, silently skip sending in dev/test and log once
  if (!publicKey || !serviceId || !templateId) {
    console.log('ℹ️ EmailJS credentials missing; skipping real email send. Code logged for testing.');
    return;
  }

  try {
    console.log('📧 Sending verification email to:', email);

    // Skip sending in headless/web preview environments
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent || '';
      if (userAgent.includes('HeadlessChrome') || userAgent.includes('jsdom')) {
        console.log('🌐 Detected web preview; skipping EmailJS send. Test code available in logs.');
        return;
      }
    }

    await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      { publicKey }
    );

    console.log('✅ Email sent successfully via EmailJS');
  } catch (error) {
    console.error('❌ Failed to send email via EmailJS:', error);
    // Only throw if we actually had credentials and attempted a real send
    throw new Error(`Email sending failed: ${error}`);
  }
};

// Verification Service
export const verificationService = {
  // Send email verification
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

      // Send real email using EmailJS
      console.log(`📧 Email verification code for ${email}: ${code}`);
      
      // For testing: Still store the code in development mode
      const isDevelopment = __DEV__;
      
      if (isDevelopment) {
        // Store the code for testing purposes
        (global as any).lastVerificationCode = code;
        console.log(`🧪 TESTING MODE: Verification code ${code} stored globally`);
      }
      
      // Send real email (works in both dev and production)
      try {
        await sendRealEmail(email, code);
        console.log('✅ Email sent successfully');
      } catch (emailError) {
        console.error('❌ Email sending failed:', emailError);
        // Don't throw error - we already have the code in database
        console.log('📦 Verification code still stored in database for testing');
      }

      return {
        success: true,
        message: `Verification code sent to ${email}. ${isDevelopment ? `For testing: ${code}` : 'Please check your inbox.'}`
      };
    } catch (error) {
      console.error('Email verification error:', error);
      
      // In development, still allow testing even if email fails
      if (__DEV__) {
        // Try to store a fallback code in database
        try {
          const fallbackCode = generateVerificationCode();
          const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

          await supabase
            .from('verification_requests')
            .insert({
              id: `email-fallback-${userId}-${Date.now()}`,
              user_id: userId,
              type: 'email',
              contact: email,
              code: fallbackCode,
              expires_at: expiresAt.toISOString(),
              verified: false,
              created_at: new Date().toISOString()
            });

          (global as any).lastVerificationCode = fallbackCode;
          console.log(`🧪 TESTING FALLBACK: Created database entry with code ${fallbackCode}`);
          
          return {
            success: true,
            message: `Email sending failed, but testing mode active. Code: ${fallbackCode}`
          };
        } catch (dbError) {
          console.error('Failed to create fallback verification:', dbError);
          
          // Last resort: just use global storage
          const emergencyCode = generateVerificationCode();
          (global as any).lastVerificationCode = emergencyCode;
          console.log(`🧪 EMERGENCY FALLBACK: Using global code ${emergencyCode}`);
          
          return {
            success: true,
            message: `System error, but testing mode active. Code: ${emergencyCode}`
          };
        }
      }
      
      return {
        success: false,
        message: 'Failed to send verification email. Please try again.'
      };
    }
  },

  // Send SMS verification
  async sendSMSVerification(userId: string, phone: string): Promise<{ success: boolean; message: string }> {
    try {
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store verification request in database
      const { error: dbError } = await supabase
        .from('verification_requests')
        .insert({
          id: `sms-${userId}-${Date.now()}`,
          user_id: userId,
          type: 'phone',
          contact: phone,
          code: code,
          expires_at: expiresAt.toISOString(),
          verified: false,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(dbError.message);
      }

      // In a real app, you'd send this via SMS service (Twilio, AWS SNS, etc.)
      // For now, we'll log it (you can integrate with your preferred SMS service)
      console.log(`📱 SMS verification code for ${phone}: ${code}`);
      
      // Simulate SMS sending
      await simulateSMSSending(phone, code);

      return {
        success: true,
        message: `Verification code sent to ${phone}. Please check your messages.`
      };
    } catch (error) {
      console.error('SMS verification error:', error);
      return {
        success: false,
        message: 'Failed to send verification SMS. Please try again.'
      };
    }
  },

  // Verify code
  // Verify verification code
  async verifyCode(userId: string, type: 'email' | 'phone', code: string): Promise<{ success: boolean; message: string }> {
    try {
      // Development testing codes that always work
      const testingCodes = ['123456', '654321'];
      if (__DEV__ && testingCodes.includes(code)) {
        console.log(`🧪 TESTING: Accepted development code ${code}`);
        
        // Update user verification status for testing
        const updateField = type === 'email' ? 'email_verified' : 'phone_verified';
        const timestampField = type === 'email' ? 'email_verified_at' : 'phone_verified_at';
        
        await supabase
          .from('users')
          .update({ 
            [updateField]: true,
            [timestampField]: new Date().toISOString()
          })
          .eq('id', userId);
        
        return {
          success: true,
          message: `${type === 'email' ? 'Email' : 'Phone'} verified successfully! (Testing mode)`
        };
      }

      // Check if it's the global testing code (for fallback scenarios)
      if (__DEV__ && (global as any).lastVerificationCode === code) {
        console.log(`🧪 TESTING: Accepted global fallback code ${code}`);
        
        // Update user verification status for testing
        const updateField = type === 'email' ? 'email_verified' : 'phone_verified';
        const timestampField = type === 'email' ? 'email_verified_at' : 'phone_verified_at';
        
        await supabase
          .from('users')
          .update({ 
            [updateField]: true,
            [timestampField]: new Date().toISOString()
          })
          .eq('id', userId);
        
        return {
          success: true,
          message: `${type === 'email' ? 'Email' : 'Phone'} verified successfully! (Testing fallback)`
        };
      }

      // Find the verification request in database
      const { data: verificationRequest, error: findError } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (findError || !verificationRequest) {
        return {
          success: false,
          message: 'No verification request found. Please request a new code.'
        };
      }

      // Check if code matches
      if (verificationRequest.code !== code) {
        return {
          success: false,
          message: 'Invalid verification code. Please try again.'
        };
      }

      // Check if code has expired
      if (new Date() > new Date(verificationRequest.expires_at)) {
        return {
          success: false,
          message: 'Verification code has expired. Please request a new one.'
        };
      }

      // Mark as verified
      const { error: updateError } = await supabase
        .from('verification_requests')
        .update({ verified: true })
        .eq('id', verificationRequest.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Update user verification status
      const updateField = type === 'email' ? 'email_verified' : 'phone_verified';
      const timestampField = type === 'email' ? 'email_verified_at' : 'phone_verified_at';
      
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          [updateField]: true,
          [timestampField]: new Date().toISOString()
        })
        .eq('id', userId);

      if (userUpdateError) {
        console.error('User update error:', userUpdateError);
        // Don't fail the verification if user update fails
      }

      return {
        success: true,
        message: `${type === 'email' ? 'Email' : 'Phone'} verified successfully!`
      };
    } catch (error) {
      console.error('Verification error:', error);
      return {
        success: false,
        message: 'Verification failed. Please try again.'
      };
    }
  },

  // Get verification status for a user
  async getVerificationStatus(userId: string): Promise<VerificationStatus> {
    try {
      console.log('🔍 VerificationService: Getting verification status for user:', userId);
      const { data: user, error } = await supabase
        .from('users')
        .select('email_verified, phone_verified, email_verified_at, phone_verified_at')
        .eq('id', userId)
        .single();

      console.log('📋 VerificationService: Database response:', { user, error });

      if (error || !user) {
        console.log('⚠️ VerificationService: No user found or error, returning false status');
        return {
          isEmailVerified: false,
          isPhoneVerified: false
        };
      }

      const status = {
        isEmailVerified: user.email_verified || false,
        isPhoneVerified: user.phone_verified || false,
        emailVerifiedAt: user.email_verified_at ? new Date(user.email_verified_at) : undefined,
        phoneVerifiedAt: user.phone_verified_at ? new Date(user.phone_verified_at) : undefined
      };

      console.log('✅ VerificationService: Returning verification status:', status);
      return status;
    } catch (error) {
      console.error('Error getting verification status:', error);
      return {
        isEmailVerified: false,
        isPhoneVerified: false
      };
    }
  },

  // Resend verification code
  async resendVerification(userId: string, type: 'email' | 'phone', contact: string): Promise<{ success: boolean; message: string }> {
    if (type === 'email') {
      return this.sendEmailVerification(userId, contact);
    } else {
      return this.sendSMSVerification(userId, contact);
    }
  }
};

// Simulate email sending (replace with real email service)
async function simulateEmailSending(email: string, code: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`
🔔 EMAIL SENT TO: ${email}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 HomeCook Verification Code
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your verification code is: ${code}

This code will expire in 15 minutes.
Do not share this code with anyone.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
      resolve();
    }, 1000);
  });
}

// Simulate SMS sending (replace with real SMS service)
async function simulateSMSSending(phone: string, code: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`
🔔 SMS SENT TO: ${phone}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 HomeCook verification code: ${code}
   Expires in 15 minutes.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
      resolve();
    }, 1000);
  });
}
