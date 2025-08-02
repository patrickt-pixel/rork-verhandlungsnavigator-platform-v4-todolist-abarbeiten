-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Note: This migration assumes Supabase Auth is already set up
-- The auth.users table and auth.identities table should exist
-- If they don't exist, you need to set up Supabase Auth first

-- Create custom types
CREATE TYPE user_role AS ENUM ('client', 'consultant', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('booking', 'message', 'system', 'reminder');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE theme_preference AS ENUM ('light', 'dark', 'system');

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  avatar_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create consultants table (extended profile for consultants)
CREATE TABLE consultants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  bio TEXT NOT NULL,
  expertise TEXT[] NOT NULL DEFAULT '{}',
  hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create time_slots table
CREATE TABLE time_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultant_id UUID REFERENCES consultants(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure end_time is after start_time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  consultant_id UUID REFERENCES consultants(id) ON DELETE CASCADE NOT NULL,
  time_slot_id UUID REFERENCES time_slots(id) ON DELETE CASCADE NOT NULL,
  status booking_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  consultant_id UUID REFERENCES consultants(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL,
  is_read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  consultant_id UUID REFERENCES consultants(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  status payment_status DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  theme theme_preference DEFAULT 'system',
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create consultant_schedules table
CREATE TABLE consultant_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  consultant_id UUID REFERENCES consultants(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure end_time is after start_time
  CONSTRAINT valid_schedule_time_range CHECK (end_time > start_time),
  -- Unique constraint to prevent duplicate schedules for same day
  UNIQUE(consultant_id, day_of_week, start_time, end_time)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_consultants_user_id ON consultants(user_id);
CREATE INDEX idx_consultants_expertise ON consultants USING GIN(expertise);
CREATE INDEX idx_time_slots_consultant_id ON time_slots(consultant_id);
CREATE INDEX idx_time_slots_start_time ON time_slots(start_time);
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_consultant_id ON bookings(consultant_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_reviews_consultant_id ON reviews(consultant_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_consultant_id ON payments(consultant_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_consultant_schedules_consultant_id ON consultant_schedules(consultant_id);
CREATE INDEX idx_consultant_schedules_day_of_week ON consultant_schedules(day_of_week);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultants_updated_at BEFORE UPDATE ON consultants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultant_schedules_updated_at BEFORE UPDATE ON consultant_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update consultant rating when a review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_consultant_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the consultant's rating and review count
  UPDATE consultants 
  SET 
    rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews 
      WHERE consultant_id = COALESCE(NEW.consultant_id, OLD.consultant_id)
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM reviews 
      WHERE consultant_id = COALESCE(NEW.consultant_id, OLD.consultant_id)
    )
  WHERE id = COALESCE(NEW.consultant_id, OLD.consultant_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create triggers for rating updates
CREATE TRIGGER update_consultant_rating_on_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_consultant_rating();

CREATE TRIGGER update_consultant_rating_on_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_consultant_rating();

CREATE TRIGGER update_consultant_rating_on_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_consultant_rating();

-- Function to automatically mark time slot as booked when booking is confirmed
CREATE OR REPLACE FUNCTION update_time_slot_booking_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If booking is confirmed, mark time slot as booked
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE time_slots 
    SET is_booked = true 
    WHERE id = NEW.time_slot_id;
  END IF;
  
  -- If booking is cancelled, mark time slot as available
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE time_slots 
    SET is_booked = false 
    WHERE id = NEW.time_slot_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for time slot booking status
CREATE TRIGGER update_time_slot_on_booking_change
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_time_slot_booking_status();

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_schedules ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Consultants policies
CREATE POLICY "Anyone can view consultants" ON consultants FOR SELECT USING (true);
CREATE POLICY "Consultants can update own profile" ON consultants FOR UPDATE USING (
  auth.uid() = user_id
);
CREATE POLICY "Consultants can insert own profile" ON consultants FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Time slots policies
CREATE POLICY "Anyone can view available time slots" ON time_slots FOR SELECT USING (true);
CREATE POLICY "Consultants can manage own time slots" ON time_slots FOR ALL USING (
  consultant_id IN (SELECT id FROM consultants WHERE user_id = auth.uid())
);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (
  auth.uid() = client_id OR 
  auth.uid() IN (SELECT user_id FROM consultants WHERE id = consultant_id)
);
CREATE POLICY "Clients can create bookings" ON bookings FOR INSERT WITH CHECK (
  auth.uid() = client_id
);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (
  auth.uid() = client_id OR 
  auth.uid() IN (SELECT user_id FROM consultants WHERE id = consultant_id)
);

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews for their bookings" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = client_id AND 
  EXISTS (SELECT 1 FROM bookings WHERE id = booking_id AND client_id = auth.uid() AND status = 'completed')
);
CREATE POLICY "Clients can update own reviews" ON reviews FOR UPDATE USING (
  auth.uid() = client_id
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (
  auth.uid() = user_id
);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (
  auth.uid() = user_id
);

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (
  auth.uid() = client_id OR 
  auth.uid() IN (SELECT user_id FROM consultants WHERE id = consultant_id)
);
CREATE POLICY "System can manage payments" ON payments FOR ALL USING (true);

-- User settings policies
CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (
  auth.uid() = user_id
);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (
  auth.uid() = user_id
);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- Consultant schedules policies
CREATE POLICY "Anyone can view consultant schedules" ON consultant_schedules FOR SELECT USING (true);
CREATE POLICY "Consultants can manage own schedules" ON consultant_schedules FOR ALL USING (
  consultant_id IN (SELECT id FROM consultants WHERE user_id = auth.uid())
);

-- Function to handle new user registration
-- KORREKTUR: Einzelne Dollarzeichen ($) wurden durch doppelte ($$) ersetzt.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();