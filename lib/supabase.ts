import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// These would normally come from environment variables
// For demo purposes, using placeholder values
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key exists:', !!supabaseAnonKey);
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('Connection test error:', error.message);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Supabase connection successful!');
    return { success: true, data };
  } catch (err) {
    console.log('Connection test failed:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://your-project.supabase.co' && 
         supabaseAnonKey !== 'your-anon-key';
};

// Mock mode flag for development
export const MOCK_MODE = !isSupabaseConfigured();

console.log('Supabase client initialized:', {
  url: supabaseUrl,
  mockMode: MOCK_MODE,
  hasUrl: !!process.env.EXPO_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  urlFromEnv: process.env.EXPO_PUBLIC_SUPABASE_URL,
  keyFromEnv: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'
});