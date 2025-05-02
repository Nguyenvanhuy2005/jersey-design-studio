
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qovekbaewxxdzjzbcimc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdmVrYmFld3h4ZHpqemJjaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDc2NzQsImV4cCI6MjA2MDAyMzY3NH0.TWhvy8bGzhgoCZEoQw-33_Jvu0X2yhvc99Sz34-d4tM";

// Create Supabase client with explicit session configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: globalThis.localStorage,
  }
});

// Helper function to explicitly clear the session from localStorage
export const clearLocalSession = () => {
  try {
    // Clear all Supabase auth-related data from localStorage
    const keys = Object.keys(localStorage);
    const supabaseKeys = keys.filter(key => 
      key.startsWith('supabase.auth.') || 
      key.includes('supabase') && key.includes('session') ||
      key.includes('sb-')
    );

    // Log which keys are being removed for debugging
    console.log('Clearing Supabase session keys:', supabaseKeys);
    
    // Remove all Supabase-related keys
    supabaseKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Ensure specific known keys are always cleared
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.expires_at');
    localStorage.removeItem('supabase.auth.refresh_token');
    localStorage.removeItem('sb-qovekbaewxxdzjzbcimc-auth-token');
    
    return true;
  } catch (error) {
    console.error('Error clearing local session:', error);
    return false;
  }
};
