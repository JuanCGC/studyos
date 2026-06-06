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

function verifySignature(payload, signature, secret) {
  const parts = signature.split(',');
  let sigV1 = null, ts = null;
  for (const p of parts) {
    const [k, v] = p.split('=');
    if (k === 'v1') sigV1 = v;
    if (k === 't') ts = v;
  }
  if (!ts || !sigV1) return null;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${ts}.${payload}`)
    .digest('hex');
  if (expected === sigV1) return { ts: parseInt(ts, 10) };
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const signature = req.headers['stripe-signature'];
  if (!signature) return res.status(400).json({ error: 'Missing Stripe-Signature header' });

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: 'Webhook secret not configured' });

  let rawBody;
  try {
    rawBody = await readRawBody(req);
  } catch {
    return res.status(400).json({ error: 'Failed to read request body' });
  }

  const bodyStr = rawBody.toString('utf-8');
  const verified = verifySignature(bodyStr, signature, secret);
  if (!verified) return res.status(401).json({ error: 'Invalid signature' });

  let payload;
  try {
    payload = JSON.parse(bodyStr);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  const eventType = payload.type;
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    switch (eventType) {
      case 'checkout.session.completed':
      case 'customer.subscription.updated': {
        const data = payload.data.object;
        const userId = data.metadata?.supabase_user_id || data.metadata?.user_id;
        if (!userId) return res.status(400).json({ error: 'Missing user_id in metadata' });

        const tier = (data.metadata?.tier || '').toLowerCase();
        const config = TIER_CONFIG[tier];
        if (!config) return res.status(400).json({ error: `Unknown tier: ${tier}` });

        const { error } = await supabase.from('subscriptions').upsert({
          user_id: userId,
          plan_type: config.plan_type,
          subject_limit: config.subject_limit,
          status: 'active',
          stripe_subscription_id: data.subscription || data.id,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        if (error) throw error;
        break;
      }

      case 'customer.subscription.deleted': {
        const data = payload.data.object;
        const stripeSubId = data.id;

        const { data: existing, error: lookupError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', stripeSubId)
          .single();

        if (lookupError || !existing) {
          return res.status(404).json({ error: `Subscription not found: ${stripeSubId}` });
        }

        const { error } = await supabase.from('subscriptions').upsert({
          user_id: existing.user_id,
          stripe_subscription_id: stripeSubId,
          ...FREE_BASELINE,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        if (error) throw error;
        break;
      }

      default:
        return res.status(200).json({ received: true });
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
}
