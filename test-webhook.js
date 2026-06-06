/**
 * Test script for dLocal Go IPN/Webhook endpoint.
 *
 * Simulates a "PAID" notification from dLocal Go to verify
 * the webhook handler updates the subscriptions table correctly.
 *
 * Usage:
 *   1. Make sure Vercel dev server is running:  npx vercel dev
 *      (this serves both the frontend and API routes on port 3000)
 *   2. Set your real Supabase userId below.
 *   3. Run:  node test-webhook.js
 */

const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/dlocal';

// ── Config ───────────────────────────────────────────────
// Replace with a real userId from your Supabase auth.users table.
// You can find one by running this in Supabase SQL Editor:
//   SELECT id FROM auth.users LIMIT 1;
const USER_ID = 'b5d285f1-c2bc-4497-ac6e-01df5eec22b4';
// ─────────────────────────────────────────────────────────

const payload = {
  id: 'PAY-' + Date.now(),
  event: 'paid',
  status: 'PAID',
  order_id: `studit_${USER_ID}_${Date.now()}`,
  amount: 19,
  currency: 'USD',
  description: 'StudIt Pro Plan — Monthly',
  metadata: {
    supabase_user_id: USER_ID,
    tier: 'pro',
    subject_limit: 20,
    plan_type: 'pro',
    order_id: `studit_${USER_ID}_${Date.now()}`,
  },
  payer: {
    name: 'Test User',
    email: 'test@example.com',
  },
};

async function main() {
  if (USER_ID === 'CHANGE_ME_TO_A_REAL_USER_ID') {
    console.error('❌ Primero editá USER_ID en test-webhook.js con un userId real de Supabase.');
    process.exit(1);
  }

  console.log('→ Enviando notificación dLocal a', WEBHOOK_URL);
  console.log('  Payload:\n', JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('\n← Respuesta:');
    console.log('  Status:', res.status, res.statusText);
    console.log('  Body:', await res.text());
  } catch (err) {
    console.error('\n✖ Error de conexión. ¿Está corriendo Vercel dev? (npx vercel dev)');
    console.error('  ', err.message);
  }
}

main();
