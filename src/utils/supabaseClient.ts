import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Using environment variables from .env file
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are properly set
if (
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === 'YOUR_SUPABASE_URL' ||
  supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY'
) {
  console.error('Supabase URL or Anonymous Key is not correctly configured!');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

// Helper function to get session with error handling
export const getSessionWithRetry = async (retries = 2) => {
  let attempt = 0;

  while (attempt <= retries) {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      // If session exists, return it
      if (data?.session) {
        return { session: data.session, error: null };
      }

      // If no session and this is not the last attempt, try to refresh
      if (attempt < retries) {
        console.log(`No active session, attempt ${attempt + 1}/${retries + 1} to refresh...`);
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();

        if (!refreshError && refreshData?.session) {
          return { session: refreshData.session, error: null };
        }
      }

      attempt++;

      // Small delay between retries
      if (attempt <= retries) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.error(`Session retrieval error (attempt ${attempt + 1}/${retries + 1}):`, err);
      attempt++;

      if (attempt <= retries) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        return { session: null, error: err };
      }
    }
  }

  return { session: null, error: new Error('Failed to retrieve a valid session after retries') };
};
