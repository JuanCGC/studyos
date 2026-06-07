import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jyasohtnqlracghsxdla.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5YXNvaHRucWxyYWNnaHN4ZGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3ODkxNjMsImV4cCI6MjA5NjM2NTE2M30.lE99l7i3Pxrl6F9EjJSBXvc0oxivRKTzulmvRmkejKY';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5YXNvaHRucWxyYWNnaHN4ZGxhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc4OTE2MywiZXhwIjoyMDk2MzY1MTYzfQ.iLOG38c5BQrx6Ns9FQgWfL29p24X_0SrI-m7UnYTvOE';

export async function getAuthSession(email, password) {
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Login failed: ' + error.message);
  return { user: data.session.user, token: data.session.access_token, session: data.session };
}

export async function getAuthToken(email, password) {
  const { token } = await getAuthSession(email, password);
  return token;
}

export function getAdminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}

export function getSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const API_BASE = 'http://localhost:4000';

export async function apiFetch(path, { method = 'GET', token = null, body = null } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method, headers, body });
  return res;
}
