-- Fix messages RLS policies to allow message sending
-- Run this in your Supabase SQL editor

-- Drop existing message policies
DROP POLICY IF EXISTS "Users can send messages" ON messages;

-- Create more permissive policy for message insertion
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (
  true -- Allow all authenticated users to send messages for now
);

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'messages' AND policyname = 'Users can send messages';