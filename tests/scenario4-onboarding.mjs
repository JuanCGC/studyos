/**
 * SCENARIO 4: Onboarding Persistence Across Devices
 *
 * Current behavior: App.jsx reads `studit_onboarding_done` from localStorage (lines 26-31).
 * If localStorage is cleared (new device, cleared cache), the flag disappears and
 * the onboarding wizard shows again — even if the user already completed it.
 *
 * The app should fall back to Supabase (profiles table) as the source of truth.
 *
 * This test:
 *   1. Sets up a user with `onboarding_completed = true` in their profile
 *   2. Clears all localStorage
 *   3. Reloads the app
 *   4. Asserts the user sees the Layout (not the OnboardingWizard)
 *
 * REQUIREMENTS:
 *   - Vite dev server running on http://localhost:5173
 *   - TEST_EMAIL / TEST_PASSWORD env
 *   - Playwright installed with chromium
 */

import { chromium } from 'playwright';
import { getAuthSession, getAdminClient } from './helpers/auth.mjs';

const APP_URL = process.env.APP_BASE || 'http://localhost:5173/app';
const TEST_EMAIL  = process.env.TEST_EMAIL;
const TEST_PASS   = process.env.TEST_PASSWORD;

if (!TEST_EMAIL || !TEST_PASS) {
  console.error('ERROR: Set TEST_EMAIL and TEST_PASSWORD env vars.');
  process.exit(1);
}

let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch {
  console.error('ERROR: Playwright not found or chromium not installed.');
  console.error('  npm install -D playwright');
  console.error('  npx playwright install chromium');
  process.exit(1);
}

const page = await browser.newPage();

// ── Phase 1: Mark user as onboarding-completed in DB ──────────
console.log('\n▶  Phase 1: Set onboarding_completed = true in profiles table...');

const { user, token } = await getAuthSession(TEST_EMAIL, TEST_PASS);
if (!user) { console.error('Login failed'); process.exit(1); }
const admin = getAdminClient();

// Store a flag in profiles that the app can check
const { error: profileErr } = await admin
  .from('profiles')
  .upsert({
    id: user.id,
    preferences: { onboarding_completed: true },
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });

if (profileErr) {
  console.error('Profile upsert failed:', profileErr.message);
  process.exit(1);
}
console.log('✓  User profile updated with onboarding_completed: true');

// ── Phase 2: Login and verify onboarding flag is respected ────
console.log('\n▶  Phase 2: Login and check onboarding state...');

await page.goto(APP_URL, { waitUntil: 'networkidle' });

// Store session in localStorage (simulates a returning user)
const sbKey = `sb-${new URL(APP_URL).host}-auth-token`;
await page.evaluate(({ key, tok }) => {
  localStorage.setItem(key, JSON.stringify({ access_token: tok, refresh_token: tok }));
  localStorage.setItem('studit_onboarding_done', 'true');
  localStorage.setItem('studit_onboarding_uid', 'will-be-cleared');
}, { key: sbKey, tok: token });

// Reload to pick up session
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// ── Phase 3: Simulate device change — wipe localStorage ───────
console.log('\n▶  Phase 3: Simulating localStorage wipe (new device)...');

await page.evaluate(() => {
  localStorage.clear();
  // Re-inject only the auth token (simulates a new device that was logged in via email link)
  // The onboarding flags are GONE — the app should consult Supabase.
});
await page.waitForTimeout(200);

// Re-inject the session token (simulates coming from email confirmation link)
await page.evaluate(({ key, tok }) => {
  localStorage.setItem(key, JSON.stringify({ access_token: tok, refresh_token: tok }));
}, { key: sbKey, tok: token });

await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

// ── Phase 4: Check what the app rendered ──────────────────────
console.log('\n▶  Phase 4: Detect rendered component...');

const wizardVisible = await page.evaluate(() => {
  // Look for OnboardingWizard-specific text/elements
  const body = document.body.innerText;
  const wizardKeywords = ['welcome', 'onboarding', 'what would you like to study', 'choose your subjects', 'select your path'];
  return wizardKeywords.some(k => body.toLowerCase().includes(k));
});

const sidebarVisible = await page.evaluate(() => {
  return !!document.querySelector('.sidebar, [class*="sidebar"]');
});

const layoutVisible = await page.evaluate(() => {
  return !!document.querySelector('.app, [class*="app"]');
});

const onboardingFlag = await page.evaluate(() =>
  localStorage.getItem('studit_onboarding_done')
);

console.log(`   Wizard keywords found:       ${wizardVisible}`);
console.log(`   Sidebar visible:             ${sidebarVisible}`);
console.log(`   Layout (.app) visible:       ${layoutVisible}`);
console.log(`   localStorage flag present:   ${onboardingFlag}`);
console.log(`   Profile onboarding_completed: true (in Supabase)`);

// ── Verdict ───────────────────────────────────────────────────
console.log(`\n═══ Result ════════════════════════════════════════`);

const wizardShown = wizardVisible || (!sidebarVisible && !layoutVisible);

if (wizardShown) {
  console.log(`✗ BUG: OnboardingWizard shown again after localStorage wipe.`);
  console.log(`  The app relies solely on localStorage('studit_onboarding_done').`);
  console.log(`  When that key is missing (new device / cleared cache), it shows`);
  console.log(`  the wizard even if Supabase already has the completion flag.`);
  console.log(`\n  FIX: In App.jsx, after usePlan resolves, check:`);
  console.log(`    supabase.from('profiles').select('preferences').eq('id', user.id).single()`);
  console.log(`  and fall back to that when localStorage is empty.`);
  process.exit(1);
} else {
  console.log(`✓ Layout rendered directly — onboarding correctly skipped.`);
  console.log(`  (The app fell back to Supabase profile for the truth.)`);
}

await browser.close();
