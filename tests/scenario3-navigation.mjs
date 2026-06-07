import { chromium } from 'playwright';
import { getAuthSession } from './helpers/auth.mjs';

const APP_URL = (process.env.APP_BASE || 'http://localhost:5173') + '/app';
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
  process.exit(1);
}

const page = await browser.newPage();

// ── Phase 1: Login + land on dashboard ────────────────────────
console.log('\n▶  Navigating to app and logging in...');

const { user, session } = await getAuthSession(TEST_EMAIL, TEST_PASS);
const sbKey = 'sb-jyasohtnqlracghsxdla-auth-token';

// Inject session and onboarded flags, then load SPA
await page.goto(APP_URL, { waitUntil: 'networkidle' });
await page.evaluate(({ key, s }) => {
  localStorage.setItem(key, JSON.stringify(s));
  localStorage.setItem('studit_onboarding_done', 'true');
  localStorage.setItem('studit_onboarding_uid', s.user.id);
}, { key: sbKey, s: session });

await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);

// ── Phase 2: Navigate to Settings ─────────────────────────────
console.log('\n▶  Changing view to settings...');
const settingsLink = page.locator('a[href="#settings"], i.ph-gear, .sidebar a:has-text("Settings"), [data-view="settings"]');
if (await settingsLink.count() > 0) {
  await settingsLink.first().click();
} else {
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
  console.log(`  popstate handler did NOT update localStorage from event state.`);
  process.exit(1);
} else {
  console.log(`✓ view synced to "${viewAfterBack}" after popstate.`);
}

await browser.close();
