-- Fix RLS policies for meals table to work with custom authentication
-- Run this SQL in your Supabase SQL editor

-- Inspect existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'meals';

-- Drop existing policies for meals to avoid conflicts
DROP POLICY IF EXISTS "Cooks can manage own meals" ON meals;
DROP POLICY IF EXISTS "Anyone can view meals" ON meals;
DROP POLICY IF EXISTS "Allow meal creation" ON meals;
DROP POLICY IF EXISTS "Allow meal updates" ON meals;
DROP POLICY IF EXISTS "Allow meal deletion" ON meals;

-- Keep read open
CREATE POLICY "Anyone can view meals" ON meals FOR SELECT USING (true);

-- Allow inserts when cook_id references an existing cook user (no auth.uid dependency)
CREATE POLICY "Allow meal creation" ON meals FOR INSERT
  WITH CHECK (
    cook_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = cook_id AND u.user_type = 'cook'
    )
  );

-- Allow updates when the referenced cook exists (and unchanged/valid)
CREATE POLICY "Allow meal updates" ON meals FOR UPDATE
  USING (
    cook_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = cook_id AND u.user_type = 'cook'
    )
  )
  WITH CHECK (
    cook_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = cook_id AND u.user_type = 'cook'
    )
  );

-- Allow deletes when the referenced cook exists
CREATE POLICY "Allow meal deletion" ON meals FOR DELETE
  USING (
    cook_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = cook_id AND u.user_type = 'cook'
    )
  );

-- Optional: temporarily disable RLS for meals while testing
-- ALTER TABLE meals DISABLE ROW LEVEL SECURITY;

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'meals';
