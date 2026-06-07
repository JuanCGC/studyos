import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = resolve(__dirname, '../../.env');
  const raw = readFileSync(envPath, 'utf-8');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
  return env;
}

const env = loadEnv();

export const SUPABASE_URL = env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;
export const SUPABASE_SERVICE_KEY = env.VITE_SUPABASE_SERVICE_ROLE_KEY;
export const API_BASE = process.env.API_BASE || 'http://localhost:4000';
export const APP_BASE = process.env.APP_BASE || 'http://localhost:5173';

let cachedSession = null;

/** Login with a test user via Supabase and return { token, user } */
export async function getAuthSession(email, password) {
  if (cachedSession) return cachedSession;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY)
    throw new Error('Missing Supabase credentials in .env');
  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`Auth failed: ${error.message}`);
  cachedSession = {
    token: data.session.access_token,
    user: data.user,
  };
  return cachedSession;
}

/** Convenience: get just the access token */
export async function getAuthToken(email, password) {
  const s = await getAuthSession(email, password);
  return s.token;
}

/** Create a Supabase admin client (service_role). For test setup/teardown. */
export function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)
    throw new Error('Missing SERVICE_ROLE key in .env');
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
}

/** Make an authenticated fetch request */
export async function apiFetch(path, options = {}) {
  const token = options.token;
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  return res;
}
