
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qovekbaewxxdzjzbcimc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvdmVrYmFld3h4ZHpqemJjaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NDc2NzQsImV4cCI6MjA2MDAyMzY3NH0.TWhvy8bGzhgoCZEoQw-33_Jvu0X2yhvc99Sz34-d4tM";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: globalThis.localStorage,
  }
});
