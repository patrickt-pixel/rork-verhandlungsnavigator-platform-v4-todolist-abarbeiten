-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS auth.users CASCADE;
DROP TABLE IF EXISTS auth.identities CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create auth.users table
CREATE TABLE auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  encrypted_password TEXT NOT NULL,
  email_confirmed_at TIMESTAMPTZ,
  confirmation_token TEXT,
  confirmation_sent_at TIMESTAMPTZ,
  recovery_token TEXT,
  recovery_sent_at TIMESTAMPTZ,
  email_change_token_new TEXT,
  email_change TEXT,
  email_change_sent_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  raw_app_meta_data JSONB,
  raw_user_meta_data JSONB,
  is_super_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  phone TEXT UNIQUE,
  phone_confirmed_at TIMESTAMPTZ,
  phone_change TEXT,
  phone_change_token TEXT,
  phone_change_sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  email_change_token_current TEXT,
  email_change_confirm_status SMALLINT DEFAULT 0 CHECK (email_change_confirm_status >= 0 AND email_change_confirm_status <= 3),
  banned_until TIMESTAMPTZ,
  reauthentication_token TEXT,
  reauthentication_sent_at TIMESTAMPTZ,
  is_sso_user BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- Create auth.identities table
CREATE TABLE auth.identities (
  id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  identity_data JSONB NOT NULL,
  provider TEXT NOT NULL,
  last_sign_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT,
  PRIMARY KEY (provider, id)
);

-- Create indexes for better performance
CREATE INDEX idx_auth_users_email ON auth.users(email);
CREATE INDEX idx_auth_users_confirmation_token ON auth.users(confirmation_token) WHERE confirmation_token IS NOT NULL;
CREATE INDEX idx_auth_users_recovery_token ON auth.users(recovery_token) WHERE recovery_token IS NOT NULL;
CREATE INDEX idx_auth_users_email_change_token_new ON auth.users(email_change_token_new) WHERE email_change_token_new IS NOT NULL;
CREATE INDEX idx_auth_users_email_change_token_current ON auth.users(email_change_token_current) WHERE email_change_token_current IS NOT NULL;
CREATE INDEX idx_auth_users_reauthentication_token ON auth.users(reauthentication_token) WHERE reauthentication_token IS NOT NULL;
CREATE INDEX idx_auth_identities_user_id ON auth.identities(user_id);
CREATE INDEX idx_auth_identities_email ON auth.identities(email);

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

-- Create policies for auth.users
CREATE POLICY "Allow authenticated users to view their own data" ON auth.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Allow system to manage users" ON auth.users FOR ALL USING (true);

-- Create policies for auth.identities
CREATE POLICY "Allow authenticated users to view their own identities" ON auth.identities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow system to manage identities" ON auth.identities FOR ALL USING (true);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION auth.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at on auth.users
CREATE TRIGGER update_auth_users_updated_at BEFORE UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

-- Trigger for updated_at on auth.identities
CREATE TRIGGER update_auth_identities_updated_at BEFORE UPDATE ON auth.identities
  FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at_column();

-- Notify on user creation
CREATE OR REPLACE FUNCTION auth.notify_user_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify('auth:user_created', json_build_object('user_id', NEW.id, 'email', NEW.email)::text);
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auth.notify_user_created();

-- Notify on user sign in
CREATE OR REPLACE FUNCTION auth.notify_user_sign_in()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_sign_in_at IS NOT NULL AND (OLD.last_sign_in_at IS NULL OR NEW.last_sign_in_at > OLD.last_sign_in_at) THEN
    PERFORM pg_notify('auth:user_sign_in', json_build_object('user_id', NEW.id, 'email', NEW.email, 'sign_in_at', NEW.last_sign_in_at)::text);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auth_user_sign_in
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION auth.notify_user_sign_in();
