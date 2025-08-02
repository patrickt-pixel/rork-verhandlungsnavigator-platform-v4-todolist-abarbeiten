# 🚀 Supabase Setup Guide for Consultify

This guide will help you set up Supabase for the Consultify app, including database schema, authentication, and real-time features.

## Prerequisites

- Supabase account (free tier is sufficient for development)
- Node.js and npm/yarn installed
- Basic understanding of PostgreSQL

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `consultify-app` (or your preferred name)
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root (if it doesn't exist) and add:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace the placeholder values with your actual Supabase credentials.

## Step 4: Enable Authentication FIRST

⚠️ **CRITICAL**: You must enable authentication BEFORE running the database migration!

1. Go to **Authentication** → **Settings**
2. Configure the following:
   - **Site URL**: `http://localhost:8081` (for development)
   - **Redirect URLs**: Add your app's URL schemes if needed
3. **Enable Email confirmations** (can be disabled for development)
4. Go to **Authentication** → **Providers** and enable **Email** provider
5. Go to **Authentication** → **Users** to verify the auth schema is created

### Why This Matters:
The database migration references `auth.users` table, which is only created when Supabase Auth is enabled. If you run the migration before enabling auth, you'll get "relation does not exist" errors.

### Test Your Auth Setup:
Before proceeding, run this test migration to verify your auth schema:

1. Go to **SQL Editor**
2. Run the contents of `supabase/migrations/002_test_connection.sql`
3. You should see results showing the auth schema exists

## Step 5: Set Up Database Schema

**Only after authentication is enabled and tested:**

1. **First, test your connection**:
   - Go to **SQL Editor**
   - Run the contents of `supabase/migrations/002_test_connection.sql`
   - Verify you see auth schema information

2. **Then run the main migration**:
   - In **SQL Editor**, click "New query"
   - Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the migration

### What this creates:

- **7 main tables**: profiles, consultants, bookings, time_slots, messages, reviews, notifications
- **3 additional tables**: payments, user_settings, consultant_schedules
- **Row Level Security (RLS)** policies for data protection
- **Database triggers** for automatic updates
- **Indexes** for optimal performance
- **Auth integration**: Automatic profile creation when users register

## Step 6: Verify Auth Schema

After running the migration, verify these tables exist:

1. Go to **Database** → **Tables**
2. Check that you can see:
   - `auth.users` (created by Supabase Auth)
   - `auth.identities` (created by Supabase Auth)
   - `public.profiles` (created by your migration)
   - All other tables from the migration

If `auth.users` or `auth.identities` are missing, you need to:
1. Go back to **Authentication** → **Settings**
2. Make sure authentication is properly enabled
3. Try creating a test user to initialize the auth schema

## Step 7: Test Authentication Integration

1. Go to **Authentication** → **Users**
2. Click "Add user" and create a test user:
   - Email: `test@example.com`
   - Password: `password123`
   - User Metadata: `{"name": "Test User", "role": "client"}`

3. Check that a corresponding profile was created:
   - Go to **Database** → **Table Editor**
   - Select `profiles` table
   - You should see the new user's profile

## Step 8: Configure Authentication

### Authentication Providers (Optional)

You can enable additional providers like Google, GitHub, etc.:
1. Go to **Authentication** → **Providers**
2. Enable desired providers
3. Configure OAuth credentials

## Step 9: Set Up Storage (Optional)

For file uploads (profile pictures, documents, chat attachments):

1. Go to **Storage**
2. The app will automatically create required buckets:
   - `profile-pictures`
   - `documents`
   - `chat-attachments`

## Step 10: Configure Real-time (Optional)

For live chat and notifications:

1. Go to **Database** → **Replication**
2. Enable replication for tables:
   - `messages`
   - `notifications`
   - `bookings`
   - `time_slots`

## Step 11: Test the Connection

1. Restart your Expo development server:
   ```bash
   npx expo start --clear
   ```

2. Open the app and check the console for:
   ```
   ✅ Supabase connection successful!
   ✅ All database tables accessible!
   ✅ Storage buckets initialized successfully
   ```

3. You can also check the connection status in:
   **Profile** → **Settings** → **Database Status**

## Troubleshooting

### Common Issues:

#### 1. "relation 'auth.users' does not exist" Error
- **Cause**: Authentication was not enabled before running the migration
- **Solution**: 
  1. Go to **Authentication** → **Settings** and enable auth
  2. Go to **Authentication** → **Providers** and enable Email provider
  3. Run the test migration (`002_test_connection.sql`) first
  4. If test passes, re-run the main database migration

#### 2. "relation 'auth.identities' does not exist" Error
- **Cause**: Supabase Auth schema is incomplete
- **Solution**: 
  1. Go to **Authentication** → **Providers** and make sure Email is enabled
  2. Try creating a test user manually to initialize the schema
  3. If that doesn't work, you may need to create a new project

#### 3. "column 'email_confirmed_at' does not exist" Error
- **Cause**: Your Supabase project has an older auth schema version
- **Solution**: 
  1. **DO NOT** run the `000_setup_auth.sql` file
  2. Use only the main migration (`001_initial_schema.sql`)
  3. The auth schema is managed by Supabase automatically

#### 4. "Auth session missing" Error
- **Cause**: User is not authenticated or session expired
- **Solution**: Check authentication flow and session management

#### 5. "Table doesn't exist" Error
- **Cause**: Database migration wasn't run successfully
- **Solution**: Re-run the SQL migration in the Supabase dashboard

#### 6. "Row Level Security" Errors
- **Cause**: RLS policies are blocking access
- **Solution**: Check if you're authenticated and the policies are correct

#### 7. Connection Timeout
- **Cause**: Network issues or wrong URL
- **Solution**: Verify your Supabase URL and check internet connection

### Debug Mode

To enable detailed logging, add to your environment:
```env
EXPO_PUBLIC_DEBUG_SUPABASE=true
```

### Manual Auth Schema Check

If you're having auth issues, run this query in SQL Editor:

```sql
-- Check if auth schema exists
SELECT schemaname FROM pg_catalog.pg_namespace WHERE nspname = 'auth';

-- Check auth tables
SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'auth';

-- Check if auth.users has data
SELECT count(*) FROM auth.users;
```

## Production Deployment

### Security Checklist:

1. **Environment Variables**:
   - Use production Supabase project
   - Never commit `.env` files to version control
   - Use secure environment variable management

2. **Database Security**:
   - Review and test all RLS policies
   - Enable database backups
   - Set up monitoring and alerts

3. **Authentication**:
   - Configure proper redirect URLs
   - Enable email verification
   - Set up password policies

4. **Storage Security**:
   - Review bucket policies
   - Set up proper file size limits
   - Enable virus scanning if needed

### Performance Optimization:

1. **Database**:
   - Monitor query performance
   - Add indexes for frequently queried columns
   - Use database connection pooling

2. **Storage**:
   - Enable CDN for file delivery
   - Implement image optimization
   - Set up proper caching headers

3. **Real-time**:
   - Limit real-time subscriptions
   - Use proper channel naming
   - Implement connection management

## Support

If you encounter issues:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the app's database status in Settings
3. Check the browser/app console for error messages
4. Verify your environment variables are correct
5. Ensure authentication was enabled BEFORE running migrations

## Database Schema Overview

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  profiles   │────│ consultants  │────│ time_slots  │
│ (users)     │    │ (extended)   │    │ (schedule)  │
└─────────────┘    └──────────────┘    └─────────────┘
       │                    │                   │
       │                    │                   │
       ▼                    ▼                   ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  bookings   │────│   messages   │    │   reviews   │
│ (sessions)  │    │ (chat)       │    │ (ratings)   │
└─────────────┘    └──────────────┘    └─────────────┘
       │
       ▼
┌─────────────┐
│notifications│
│ (alerts)    │
└─────────────┘
```

---

**🎉 Your Supabase setup is now complete!**

The app will automatically switch from mock mode to live database mode once the connection is established.

## Quick Setup Checklist

- [ ] Create Supabase project
- [ ] Get project credentials (URL + Anon Key)
- [ ] Add environment variables
- [ ] **Enable Authentication FIRST**
- [ ] Run database migration
- [ ] Verify auth schema exists
- [ ] Test connection in app
- [ ] Create test users
- [ ] Verify profile creation works