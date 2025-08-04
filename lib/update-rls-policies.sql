-- Update RLS policies to fix signup issue
-- Run this SQL in your Supabase SQL editor

-- Drop the existing restrictive user insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create a new policy that allows user creation during signup
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (true);

-- Verify the policy was updated
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'users' AND policyname = 'Users can insert own profile';