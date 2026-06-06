import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const PLANS = {
  pro:  { amount: 19, currency: 'USD', description: 'StudIt Pro Plan — Monthly', subject_limit: 20, plan_type: 'pro' },
  enterprise: { amount: 99, currency: 'USD', description: 'StudIt Enterprise Plan — Monthly', subject_limit: 9999, plan_type: 'enterprise' },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { tier } = req.body || {};
  const plan = PLANS[tier];
  if (!plan) return res.status(400).json({ error: `Invalid or missing tier. Supported: ${Object.keys(PLANS).join(', ')}` });

  const dlocalLogin = process.env.DLOCAL_LOGIN;
  const dlocalTransKey = process.env.DLOCAL_TRANS_KEY;
  const dlocalSecretKey = process.env.DLOCAL_SECRET_KEY;
  if (!dlocalLogin || !dlocalTransKey || !dlocalSecretKey) {
    return res.status(500).json({ error: 'dLocal Go not configured' });
  }

  const origin = req.headers.origin || 'https://studit.vercel.app';
  const orderId = `studit_${user.id}_${Date.now()}`;

  try {
    const body = JSON.stringify({
      amount: plan.amount,
      currency: plan.currency,
      description: plan.description,
      order_id: orderId,
      country: 'CO',
      payer: {
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email,
        document: '',
        user_ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || '',
      },
      payment_method_id: 'CARD',
      notification_url: `${origin}/api/subscription-webhook`,
      callback_url: `${origin}/dashboard?checkout=success`,
      metadata: {
        supabase_user_id: user.id,
        tier,
        subject_limit: plan.subject_limit,
        plan_type: plan.plan_type,
        order_id: orderId,
      },
    });

    const timestamp = Date.now().toString();
    const authHash = crypto
      .createHmac('sha256', dlocalSecretKey)
      .update(timestamp + dlocalLogin + body)
      .digest('hex');

    const response = await fetch('https://api.dlocal.com/go/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Login': dlocalLogin,
        'X-Trans-Key': dlocalTransKey,
        'X-Version': '2.1',
        'X-Date': timestamp,
        'X-Auth': authHash,
      },
      body,
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('dLocal error:', data);
      return res.status(response.status).json({ error: data.message || 'dLocal payment creation failed' });
    }

    res.status(200).json({ url: data.redirect_url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message });
  }
}
