import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

export function usePlan(user) {
  const [plan, setPlan] = useState('free');
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const fetchPlan = async () => {
    if (!supabase || !user) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('plan_type')
        .eq('id', user.id)
        .single();
      if (data?.plan_type) {
        setPlan(data.plan_type);
      } else {
        setPlan('free');
      }
    } catch {}
  };

  useEffect(() => {
    if (!supabase || !user) {
      setPlan('free');
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchPlan().finally(() => setLoading(false));
    pollRef.current = setInterval(fetchPlan, 5 * 60 * 1000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [user]);

  return { plan, loading, refreshPlan: fetchPlan };
}
