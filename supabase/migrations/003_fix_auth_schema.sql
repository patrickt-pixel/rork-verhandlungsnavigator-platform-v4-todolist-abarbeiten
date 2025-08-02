-- This migration fixes auth schema issues by ensuring proper Supabase auth integration
-- Note: Supabase manages the auth schema automatically, so we don't recreate auth tables
-- Instead, we ensure our public schema works properly with Supabase auth

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure the handle_new_user function works correctly with Supabase auth
-- This function should be triggered when a new user is created in auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $
BEGIN
 -- Insert profile
 INSERT INTO profiles (id, email, name, role)
 VALUES (
 NEW.id,
 NEW.email,
 COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
 COALESCE(NEW.raw_user_meta_data->>'role', 'client')::user_role
 );
 
 -- Insert default user settings
 INSERT INTO user_settings (user_id)
 VALUES (NEW.id);
 
 RETURN NEW;
END;
$ language 'plpgsql' SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
 AFTER INSERT ON auth.users
 FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions to the authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure RLS policies are properly set up for profiles table
-- (These should already exist from the main migration, but let's make sure)
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
