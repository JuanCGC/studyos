import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const hash = window.location.hash;
      if (hash?.includes('error=')) {
        const params = new URLSearchParams(hash.replace('#', ''));
        const desc = params.get('error_description') || params.get('error') || 'Unknown error';
        window.location.href = '/login.html?error=' + encodeURIComponent(desc);
        return;
      }
      setUser(session?.user ?? null);
      setLoading(false);
      if (hash?.includes('access_token')) {
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
