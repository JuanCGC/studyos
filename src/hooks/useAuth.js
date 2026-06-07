import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

function extractUrlError() {
  const raw = window.location.search || window.location.hash;
  if (!raw) return null;
  const params = new URLSearchParams(raw.replace(/^[?#]/, ''));
  return params.get('error_description') || params.get('error') || null;
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const urlError = extractUrlError();
    if (urlError) {
      console.error('[useAuth] Intercepted auth error from URL:', urlError);
      window.location.href = '/login.html?error=' + encodeURIComponent(urlError);
      return;
    }

    const trySetSession = async () => {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const raw = hash || search;

      if (raw.includes('access_token') || raw.includes('code')) {
        const params = new URLSearchParams(raw.replace(/^[?#]/, ''));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        if (accessToken || raw.includes('code')) {
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken || '',
              refresh_token: refreshToken || '',
            });
            if (!error && data?.session) return data.session;
          } catch { /* fall through */ }
        }
      }
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    };

    trySetSession().then(session => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (window.location.hash?.includes('access_token') || window.location.hash?.includes('code')) {
        window.location.hash = '';
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  const logout = async () => {
    if (supabase) await supabase.auth.signOut({ scope: 'global' });
    Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k); });
    window.location.href = '/login.html';
  };

  return { user, loading, logout };
}
