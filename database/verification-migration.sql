-- Verification System Migration for HomeCook App
-- Run this in Supabase SQL Editor

-- 1. Add verification columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP WITH TIME ZONE;

-- 2. Create verification_requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'phone')),
  contact TEXT NOT NULL, -- email address or phone number
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure we don't have multiple active requests for same user/type
  UNIQUE(user_id, type, verified) DEFERRABLE INITIALLY DEFERRED
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_type ON verification_requests(type);
CREATE INDEX IF NOT EXISTS idx_verification_requests_expires_at ON verification_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_requests_verified ON verification_requests(verified);

-- 4. Create function to cleanup expired verification requests
CREATE OR REPLACE FUNCTION cleanup_expired_verification_requests()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_requests 
  WHERE expires_at < NOW() AND verified = FALSE;
END;
$$ LANGUAGE plpgsql;

-- 5. Create a function to automatically cleanup on insert
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_verifications()
RETURNS TRIGGER AS $$
BEGIN
  -- Clean up expired requests for this user and type before inserting new one
  DELETE FROM verification_requests 
  WHERE user_id = NEW.user_id 
    AND type = NEW.type 
    AND expires_at < NOW() 
    AND verified = FALSE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to auto-cleanup
DROP TRIGGER IF EXISTS cleanup_verifications_trigger ON verification_requests;
CREATE TRIGGER cleanup_verifications_trigger
  BEFORE INSERT ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_cleanup_expired_verifications();

-- 7. Add some sample verified cooks for testing (optional)
-- Uncomment the lines below if you want some test data

-- UPDATE users 
-- SET email_verified = TRUE, 
--     phone_verified = TRUE,
--     email_verified_at = NOW(),
--     phone_verified_at = NOW()
-- WHERE user_type = 'cook' 
--   AND email IN ('testcook@example.com', 'chef@example.com');

-- 8. Create view for verified cooks (email required, phone optional)
CREATE OR REPLACE VIEW verified_cooks AS
SELECT * FROM users 
WHERE user_type = 'cook' 
  AND email_verified = TRUE;

-- 9. Create view for fully verified cooks (both email and phone)
CREATE OR REPLACE VIEW fully_verified_cooks AS
SELECT * FROM users 
WHERE user_type = 'cook' 
  AND email_verified = TRUE 
  AND phone_verified = TRUE;

-- 9. Grant necessary permissions (if using RLS - but you disabled it)
-- GRANT ALL ON verification_requests TO authenticated;
-- GRANT ALL ON verified_cooks TO authenticated;
-- GRANT ALL ON fully_verified_cooks TO authenticated;

-- 10. Add comment explaining the verification system
COMMENT ON TABLE verification_requests IS 'Stores email and phone verification requests with codes and expiration times';
COMMENT ON COLUMN verification_requests.type IS 'Either email or phone verification';
COMMENT ON COLUMN verification_requests.contact IS 'The email address or phone number being verified';
COMMENT ON COLUMN verification_requests.code IS '6-digit verification code sent to user';
COMMENT ON COLUMN verification_requests.expires_at IS 'When the verification code expires (typically 15 minutes)';
COMMENT ON VIEW verified_cooks IS 'Cooks with verified email (minimum requirement)';
COMMENT ON VIEW fully_verified_cooks IS 'Cooks with both email and phone verified (highest trust level)';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Verification system migration completed successfully!';
  RAISE NOTICE 'Tables created: verification_requests';
  RAISE NOTICE 'Columns added to users: email_verified, phone_verified, email_verified_at, phone_verified_at';
  RAISE NOTICE 'Views created: verified_cooks (email verified), fully_verified_cooks (email + phone verified)';
  RAISE NOTICE 'Functions created: cleanup_expired_verification_requests, trigger_cleanup_expired_verifications';
  RAISE NOTICE '';
  RAISE NOTICE 'VERIFICATION POLICY:';
  RAISE NOTICE '  - Email verification: REQUIRED for all cooks';
  RAISE NOTICE '  - Phone verification: OPTIONAL but recommended for higher trust';
  RAISE NOTICE '  - verified_cooks view: Cooks with email verified (minimum to operate)';
  RAISE NOTICE '  - fully_verified_cooks view: Cooks with both verifications (premium trust level)';
END $$;
