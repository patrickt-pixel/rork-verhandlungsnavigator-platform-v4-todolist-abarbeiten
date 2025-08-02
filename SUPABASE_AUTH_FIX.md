# 🔧 Quick Fix for Auth Schema Issues

## Your Current Error:
```
Error: ERROR: 42703: column "email_confirmed_at" of relation "users" does not exist
```

## What This Means:
Your Supabase project has a different auth schema than expected. This is normal - Supabase manages the auth schema automatically and different versions may have different column names.

## ✅ Solution Steps:

### Step 1: Don't Run the Auth Setup Migration
- **DO NOT** run `supabase/migrations/000_setup_auth.sql`
- This file is now disabled and marked as reference-only
- Supabase creates the auth schema automatically

### Step 2: Enable Authentication First
1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Providers**
3. Make sure **Email** provider is enabled
4. Go to **Authentication** → **Settings**
5. Set **Site URL** to `http://localhost:8081`

### Step 3: Test Your Auth Schema
1. Go to **SQL Editor** in Supabase
2. Run this query to check your auth schema:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users' 
ORDER BY ordinal_position;
```

### Step 4: Run the Test Migration
1. In **SQL Editor**, run the contents of `supabase/migrations/002_test_connection.sql`
2. This will verify your connection works and show you what auth tables exist

### Step 5: Run the Main Migration
1. Only after the test passes, run `supabase/migrations/001_initial_schema.sql`
2. This creates your app's tables and connects them to the existing auth schema

## ⚠️ Important Notes:

- **Never modify the auth schema manually** - Supabase manages it
- **Always enable authentication before running migrations**
- **Use only the main migration file** (`001_initial_schema.sql`)
- **The auth setup file is disabled** and should not be used

## 🧪 Quick Test:

After following the steps above, try creating a test user:
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Email: `test@example.com`
4. Password: `password123`
5. If this works, your auth schema is properly set up

## 🚀 Next Steps:

Once your auth is working:
1. Restart your app: `npx expo start --clear`
2. Check the app logs for successful connection
3. Try logging in with your test user
4. Verify the database status in Profile → Settings

---

**The key is: Let Supabase handle auth, you handle your app tables!**