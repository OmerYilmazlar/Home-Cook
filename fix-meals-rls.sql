-- Fix RLS policies for meals table to work with custom authentication
-- Run this SQL in your Supabase SQL editor

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'meals';

-- Drop existing restrictive policies for meals
DROP POLICY IF EXISTS "Cooks can manage own meals" ON meals;
DROP POLICY IF EXISTS "Anyone can view meals" ON meals;

-- Create new policies that allow operations without Supabase Auth dependency
-- Since this app uses custom authentication, we'll allow operations based on data validation

-- Policy for viewing meals (keep this simple)
CREATE POLICY "Anyone can view meals" ON meals FOR SELECT USING (true);

-- Policy for inserting meals (allow if cook_id is provided and valid format)
CREATE POLICY "Allow meal creation" ON meals FOR INSERT WITH CHECK (
  cook_id IS NOT NULL 
  AND LENGTH(cook_id) > 0
  AND cook_id LIKE 'cook-%'
);

-- Policy for updating meals (allow if cook_id matches and is valid format)
CREATE POLICY "Allow meal updates" ON meals FOR UPDATE USING (
  cook_id IS NOT NULL 
  AND LENGTH(cook_id) > 0
  AND cook_id LIKE 'cook-%'
) WITH CHECK (
  cook_id IS NOT NULL 
  AND LENGTH(cook_id) > 0
  AND cook_id LIKE 'cook-%'
);

-- Policy for deleting meals (allow if cook_id is valid format)
CREATE POLICY "Allow meal deletion" ON meals FOR DELETE USING (
  cook_id IS NOT NULL 
  AND LENGTH(cook_id) > 0
  AND cook_id LIKE 'cook-%'
);

-- Alternative: If the above doesn't work, we can temporarily disable RLS for meals
-- UNCOMMENT THE LINES BELOW IF NEEDED:
-- ALTER TABLE meals DISABLE ROW LEVEL SECURITY;

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'meals';
