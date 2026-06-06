import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const TIER_CONFIG = {
  pro:  { plan_type: 'pro',  subject_limit: 20 },
  enterprise: { plan_type: 'enterprise', subject_limit: 9999 },
};

const FREE_BASELINE = { plan_type: 'free', subject_limit: 3, status: 'canceled' };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    if (typeof req.body === 'string') return resolve(Buffer.from(req.body, 'utf-8'));
    if (Buffer.isBuffer(req.body)) return resolve(req.body);
    if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
      return resolve(Buffer.from(JSON.stringify(req.body), 'utf-8'));
    }
    let chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifyDlocalSignature(bodyStr, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(bodyStr).digest('hex');
  return expected === signature;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Signature');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const secret = process.env.DLOCAL_TRANS_KEY;
  const signature = req.headers['x-signature'];

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch {
    return res.status(400).json({ error: 'Failed to read request body' });
  }

  const bodyStr = rawBody.toString('utf-8');

  if (secret && signature) {
    if (!verifyDlocalSignature(bodyStr, signature, secret)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  let payload;
  try {
    payload = JSON.parse(bodyStr);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const event = payload.event || payload.status;
    const userId = payload.metadata?.supabase_user_id;
    const tier = payload.metadata?.tier;

    if (event === 'paid' && userId && tier) {
      const config = TIER_CONFIG[tier];
      if (!config) return res.status(400).json({ error: `Unknown tier: ${tier}` });

      const { error } = await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan_type: config.plan_type,
        subject_limit: config.subject_limit,
        status: 'active',
        payment_id: payload.id || payload.order_id,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (error) throw error;

    } else if (event === 'cancelled' || event === 'canceled') {
      const orderId = payload.order_id;
      if (!orderId) return res.status(400).json({ error: 'Missing order_id' });

      const { data: existing, error: lookupError } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('payment_id', orderId)
        .single();

      if (!lookupError && existing) {
        const { error } = await supabase.from('subscriptions').upsert({
          user_id: existing.user_id,
          payment_id: orderId,
          ...FREE_BASELINE,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        if (error) throw error;
      }

    } else if (event === 'paid' && !userId) {
      return res.status(400).json({ error: 'Missing user_id in metadata' });
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
