-- EMERGENCY FIX: Completely disable RLS for users table
-- Run this in your Supabase SQL editor if the profile updates still don't work

-- This will completely disable Row Level Security for the users table
-- allowing all operations to work without restrictions
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';
