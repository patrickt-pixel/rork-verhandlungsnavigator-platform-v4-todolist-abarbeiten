-- Test connection and verify auth schema exists
-- Run this to test your Supabase connection

-- Check if auth schema exists
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'auth';

-- Check auth.users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users' 
ORDER BY ordinal_position;

-- Check if we can access current user (should return null if not authenticated)
SELECT auth.uid() as current_user_id;

-- Simple test table to verify permissions
CREATE TABLE IF NOT EXISTS public.connection_test (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message text DEFAULT 'Connection successful!',
  created_at timestamp with time zone DEFAULT now()
);

-- Insert test data
INSERT INTO public.connection_test (message) 
VALUES ('Database connection is working!') 
ON CONFLICT DO NOTHING;

-- Enable RLS on test table
ALTER TABLE public.connection_test ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read test data
CREATE POLICY IF NOT EXISTS "Allow public read access" ON public.connection_test
  FOR SELECT USING (true);

COMMIT;