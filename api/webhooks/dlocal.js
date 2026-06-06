import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const payload = req.body || {};
    const status = (payload.status || payload.event || '').toUpperCase();
    const userId = payload.metadata?.supabase_user_id;
    const tier = (payload.metadata?.tier || '').toLowerCase();

    if ((status === 'PAID' || status === 'SUCCESS') && userId && tier === 'pro') {
      const { error } = await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan_type: 'pro',
        subject_limit: 20,
        status: 'active',
        payment_id: payload.id || payload.order_id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (error) console.error('Supabase upsert error:', error);
    }

    res.status(200).end();
  } catch (err) {
    console.error('dLocal webhook error:', err);
    res.status(200).end();
  }
}
