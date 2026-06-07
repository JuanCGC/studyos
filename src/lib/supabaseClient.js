import { createClient } from '@supabase/supabase-js';

// Fallbacks match login.html — used when Vite env vars are absent at build time (e.g. Vercel)
const DEFAULT_URL = 'https://jyasohtnqlracghsxdla.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5YXNvaHRucWxyYWNnaHN4ZGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3ODkxNjMsImV4cCI6MjA5NjM2NTE2M30.lE99l7i3Pxrl6F9EjJSBXvc0oxivRKTzulmvRmkejKY';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

if (import.meta.env.DEV && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.warn('[Supabase] Using built-in fallback credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getSession = async () => {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};
