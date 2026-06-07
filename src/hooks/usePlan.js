import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function usePlan(user) {
  const [plan, setPlan] = useState('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !user) {
      setPlan('free');
      setLoading(false);
      return;
    }
    supabase
      .from('profiles')
      .select('plan_type')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (!error && data?.plan_type) {
          setPlan(data.plan_type);
        }
        setLoading(false);
      });
  }, [user]);

  return { plan, loading };
}
