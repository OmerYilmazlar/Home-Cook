-- NUCLEAR OPTION: Completely remove RLS and all constraints
-- Run this in your Supabase SQL editor

-- 1. Disable RLS completely
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON users';
    END LOOP;
END $$;

-- 3. Grant full permissions to authenticated users
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO anon;

-- 4. Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Should return: rowsecurity = false
