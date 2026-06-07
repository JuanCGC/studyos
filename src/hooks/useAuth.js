import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [reconnecting, setReconnecting] = useState(false);
  const userRef = useRef(null);
  const retryRef = useRef(null);

  const clearReconnect = useCallback(() => {
    setReconnecting(false);
    if (retryRef.current) { clearInterval(retryRef.current); retryRef.current = null; }
  }, []);

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
      const u = session?.user ?? null;
      userRef.current = u;
      setUser(u);
      setLoading(false);
      if (window.location.hash?.includes('access_token') || window.location.hash?.includes('code')) {
        window.location.hash = '';
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && userRef.current && !session) {
        // Network failure during token refresh — keep user in memory, enter reconnect mode
        setReconnecting(true);
        if (!retryRef.current) {
          retryRef.current = setInterval(async () => {
            try {
              const { data: { session: s } } = await supabase.auth.getSession();
              if (s?.user) {
                userRef.current = s.user;
                setUser(s.user);
                clearReconnect();
              }
            } catch { /* keep retrying */ }
          }, 5000);
        }
        return;
      }
      const u = session?.user ?? null;
      userRef.current = u;
      setUser(u);
      if (u) clearReconnect();
    });
    return () => {
      subscription?.unsubscribe();
      if (retryRef.current) clearInterval(retryRef.current);
    };
  }, [clearReconnect]);

  const logout = async () => {
    clearReconnect();
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('sb-') || k.startsWith('studit_')) localStorage.removeItem(k);
    });
    if (supabase) supabase.auth.signOut({ scope: 'global' }).catch(() => {});
    window.location.href = '/login.html';
  };

  return { user, loading, reconnecting, logout };
}
