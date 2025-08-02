# 🚨 Supabase Auth Schema Fix Guide

## Problem
Your Supabase project is missing the `auth.identities` table and possibly other auth schema components. This is preventing user management from working properly.

## Solution

### Step 1: Run the Auth Setup Migration

1. **Go to your Supabase Dashboard**
2. **Navigate to**: SQL Editor
3. **Copy and paste** the contents of `supabase/migrations/000_setup_auth.sql`
4. **Click "Run"** to execute the migration

### Step 2: Run the Main Schema Migration

1. **In the same SQL Editor**
2. **Copy and paste** the contents of `supabase/migrations/001_initial_schema.sql`
3. **Click "Run"** to execute the migration

### Step 3: Verify the Setup

1. **Go to**: Authentication → Users
2. **You should see**: Two test users created
   - `client@example.com` (password: `password123`)
   - `consultant@example.com` (password: `password123`)

### Step 4: Test the App

1. **Restart your app**
2. **Try logging in** with the test credentials
3. **Check**: Profile → Settings → Database Status should show "Connected"

## Alternative: Reset Your Supabase Project

If the above doesn't work, you may need to:

1. **Create a new Supabase project**
2. **Enable Authentication** in the dashboard
3. **Run both migrations** in order
4. **Update your environment variables**

## What This Fix Does

### Auth Schema Setup (`000_setup_auth.sql`):
- ✅ Creates `auth` schema if missing
- ✅ Creates `auth.users` table with all required columns
- ✅ Creates `auth.identities` table for provider management
- ✅ Sets up proper permissions and indexes
- ✅ Creates auth helper functions (`auth.uid()`, `auth.role()`, etc.)
- ✅ Inserts test users for development

### Main Schema (`001_initial_schema.sql`):
- ✅ Creates all application tables (profiles, consultants, bookings, etc.)
- ✅ Sets up Row Level Security (RLS) policies
- ✅ Creates triggers and functions for automation
- ✅ Establishes proper relationships and constraints

## Test Credentials

After running the migrations, you can test with:

**Client Account:**
- Email: `client@example.com`
- Password: `password123`

**Consultant Account:**
- Email: `consultant@example.com`
- Password: `password123`

## Troubleshooting

### If you still get auth errors:

1. **Check Environment Variables**:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Verify Auth is Enabled**:
   - Go to Authentication → Settings
   - Ensure "Enable email confirmations" is configured
   - Check that providers are enabled

3. **Check RLS Policies**:
   - Go to Database → Tables
   - Verify RLS is enabled on all tables
   - Check that policies exist

### If migrations fail:

1. **Check for existing tables**:
   - Some tables might already exist
   - Use `DROP TABLE IF EXISTS` if needed

2. **Run migrations one by one**:
   - Execute each CREATE statement individually
   - Skip statements that fail due to existing objects

## Production Notes

- **Remove test users** before going to production
- **Update passwords** and use proper authentication flow
- **Configure email templates** in Authentication → Templates
- **Set up proper SMTP** for email confirmations

---

**🎯 After following this guide, your Supabase project should be fully functional with proper auth schema and all application tables.**