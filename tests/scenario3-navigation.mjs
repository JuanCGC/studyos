/**
 * SCENARIO 3: Browser History API ↔ View State Desync
 *
 * The app uses a manual `view` state (App.jsx:39-47) persisted to localStorage.
 * It does NOT push history entries on navigate(). When the user clicks browser Back,
 * the URL changes but `view` stays frozen — the UI never syncs.
 *
 * This test uses Playwright to verify the desync.
 *
 * REQUIREMENTS:
 *   - Vite dev server running on http://localhost:5173
 *   - A valid test user (TEST_EMAIL / TEST_PASSWORD env)
 *   - Playwright installed: npx playwright install chromium
 */

import { chromium } from 'playwright';
import { getAuthToken } from './helpers/auth.mjs';

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

// ── Phase 1: Login + land on dashboard ────────────────────────
console.log('\n▶  Navigating to app and logging in...');
await page.goto(APP_URL, { waitUntil: 'networkidle' });

// Inject the auth token into localStorage to skip login page redirect
const token = await getAuthToken(TEST_EMAIL, TEST_PASS);
await page.evaluate((t) => {
  // Set Supabase session in localStorage so the app picks it up on reload
  const sbKey = `sb-${window.location.host}-auth-token`;
  localStorage.setItem(sbKey, JSON.stringify({ access_token: t, refresh_token: t }));
}, token);

// Reload so useAuth reads the stored session
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// ── Phase 2: Navigate to Settings ─────────────────────────────
console.log('\n▶  Changing view to settings...');
const settingsLink = page.locator('a[href="#settings"], i.ph-gear, .sidebar a:has-text("Settings"), [data-view="settings"]');
if (await settingsLink.count() > 0) {
  await settingsLink.first().click();
} else {
  // Fallback: inject navigate directly
  await page.evaluate(() => {
    localStorage.setItem('studit_view', 'settings');
    window.dispatchEvent(new Event('storage'));
  });
}
await page.waitForTimeout(500);

// ── Phase 3: Read current view from React state ───────────────
const viewBeforeBack = await page.evaluate(() => localStorage.getItem('studit_view'));
console.log(`   view after navigate('settings'): ${viewBeforeBack}`);

// ── Phase 4: Simulate browser Back ────────────────────────────
console.log('\n▶  Simulating browser back (popstate)...');
const urlBeforeBack = page.url();
await page.evaluate(() => {
  window.history.pushState({ view: 'dashboard' }, '', '/dashboard');
  window.dispatchEvent(new PopStateEvent('popstate', { state: { view: 'dashboard' } }));
});
await page.waitForTimeout(300);

// ── Phase 5: Check view state after popstate ──────────────────
const viewAfterBack = await page.evaluate(() => localStorage.getItem('studit_view'));
const urlAfterBack = page.url();

console.log(`   URL before back:     ${urlBeforeBack}`);
console.log(`   URL after back:      ${urlAfterBack}`);
console.log(`   view after popstate: ${viewAfterBack}`);

// ── Verdict ───────────────────────────────────────────────────
const desynced = viewAfterBack === viewBeforeBack;
console.log(`\n═══ Result ════════════════════════════════════════`);
if (desynced) {
  console.log(`✗ BUG: view stayed "${viewAfterBack}" after popstate.`);
  console.log(`  App.jsx has no 'popstate' listener. The UI is frozen on the old view`);
  console.log(`  while the URL changed. User sees wrong content after browser Back.`);
  console.log(`\n  FIX: Add a useEffect in App.jsx that listens to popstate:`);
  console.log(`    useEffect(() => {`);
  console.log(`      const handler = () => {`);
  console.log(`        const stored = localStorage.getItem('studit_view');`);
  console.log(`        if (stored) setView(stored);`);
  console.log(`      };`);
  console.log(`      window.addEventListener('popstate', handler);`);
  console.log(`      return () => window.removeEventListener('popstate', handler);`);
  console.log(`    }, []);`);
  process.exit(1);
} else {
  console.log(`✓ view synced to "${viewAfterBack}" after popstate.`);
}

await browser.close();
