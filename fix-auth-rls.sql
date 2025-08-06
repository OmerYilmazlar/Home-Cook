-- Fix RLS policies for proper Supabase Auth integration
-- Run this in your Supabase SQL editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create new policies that work with Supabase Auth
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (
  auth.uid()::text = id
);

CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (
  auth.uid()::text = id
);

-- Also allow upsert operations for user profiles
CREATE POLICY "Users can upsert own profile" ON users FOR ALL USING (
  auth.uid()::text = id
);

-- Ensure verification_requests table has proper RLS
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification requests" ON verification_requests FOR SELECT USING (
  auth.uid()::text = user_id
);

CREATE POLICY "Users can create own verification requests" ON verification_requests FOR INSERT WITH CHECK (
  auth.uid()::text = user_id
);

CREATE POLICY "Users can update own verification requests" ON verification_requests FOR UPDATE USING (
  auth.uid()::text = user_id
);