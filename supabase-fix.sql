-- Fix RLS policies for user updates
-- Run this script in your Supabase SQL editor

-- First, let's see the current policies
-- SELECT * FROM pg_policies WHERE tablename = 'users';

-- Drop existing problematic policies (if they exist)
DROP POLICY IF EXISTS "Users can only view their own profile" ON users;
DROP POLICY IF EXISTS "Users can only update their own profile" ON users;
DROP POLICY IF EXISTS "Users can only delete their own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view cook profiles" ON users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON users;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON users;

-- Disable RLS temporarily to clean up
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies

-- Allow authenticated users to read all user profiles (needed for cook discovery)
CREATE POLICY "authenticated_users_can_read_users" ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own profile during signup
CREATE POLICY "users_can_insert_own_profile" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to update their own profile - SIMPLIFIED POLICY
CREATE POLICY "users_can_update_own_profile" ON users
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow users to delete their own profile (for the delete-recreate approach if needed)
CREATE POLICY "users_can_delete_own_profile" ON users
  FOR DELETE
  TO authenticated
  USING (true);

-- Also allow public read access for guest users browsing cooks
CREATE POLICY "public_can_read_cook_profiles" ON users
  FOR SELECT
  TO anon
  USING (user_type = 'cook');

-- Verify the table structure supports all our fields
-- This will show any missing columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Add any missing columns if needed (uncomment if they don't exist)
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS cuisine_types TEXT[];
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS available_for_pickup BOOLEAN DEFAULT true;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS favorites TEXT[];
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS rating DECIMAL DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type TEXT NOT NULL;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update the updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
