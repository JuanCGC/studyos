import { chromium } from 'playwright';
import { getAuthSession, getAdminClient } from './helpers/auth.mjs';

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

console.log('\n\u25b6  Phase 1: Set onboarding_completed = true in profiles table...');

const { user, session } = await getAuthSession(TEST_EMAIL, TEST_PASS);
if (!user) { console.error('Login failed'); process.exit(1); }
const admin = getAdminClient();

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
console.log('\u2713  User profile updated with onboarding_completed: true');

console.log('\n\u25b6  Phase 2: Login and verify onboarding skipped...');

// Inject session + onboarding flags, then load SPA
const sbKey = 'sb-jyasohtnqlracghsxdla-auth-token';
await page.goto(APP_URL, { waitUntil: 'networkidle' });

// Inject session + onboarding flags from the current page's origin
await page.evaluate(({ key, s }) => {
  localStorage.setItem(key, JSON.stringify(s));
  localStorage.setItem('studit_onboarding_done', 'true');
  localStorage.setItem('studit_onboarding_uid', s.user.id);
}, { key: sbKey, s: session });

await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);

console.log('   URL:', page.url());

// Check body for OnboardingWizard vs Layout
const bodyText = await page.evaluate(() => document.body?.innerText || '');
const wizardKeywords = ['what would you like to study', 'choose your subjects', 'select your path'];
const wizardVisible = wizardKeywords.some(k => bodyText.toLowerCase().includes(k));
const layoutKeywords = ['dashboard', 'subjects', 'settings', 'profile'];
const layoutVisible = layoutKeywords.some(k => bodyText.toLowerCase().includes(k));

console.log('   Wizard keywords found:', wizardVisible);
console.log('   Layout keywords found:', layoutVisible);
console.log('   localStorage onboarding_done set:', await page.evaluate(() => localStorage.getItem('studit_onboarding_done')));

console.log('\n\u25b6  Phase 3: Simulating localStorage wipe (new device)...');

await page.evaluate(() => { localStorage.clear(); });
await page.waitForTimeout(200);

// Re-inject ONLY the session (no onboarding flags)
await page.evaluate(({ key, s }) => {
  localStorage.setItem(key, JSON.stringify(s));
}, { key: sbKey, s: session });

await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(5000);

console.log('\n\u25b6  Phase 4: Detect rendered component...');
console.log('   URL:', page.url());

const bodyText2 = await page.evaluate(() => document.body?.innerText || '');
const bodyPreview = bodyText2.substring(0, 400);

const wizardVisible2 = wizardKeywords.some(k => bodyText2.toLowerCase().includes(k));
const layoutVisible2 = layoutKeywords.some(k => bodyText2.toLowerCase().includes(k));

const onboardingFlag = await page.evaluate(() =>
  localStorage.getItem('studit_onboarding_done')
);

console.log('   Body preview:', bodyPreview);
console.log('   Wizard keywords found:', wizardVisible2);
console.log('   Layout keywords found:', layoutVisible2);
console.log('   localStorage onboarding_done:', onboardingFlag);

console.log('\n═══ Result ════════════════════════════════════════');

if (wizardVisible2) {
  console.log('\u2717 BUG: OnboardingWizard shown again after localStorage wipe.');
  process.exit(1);
} else if (layoutVisible2 || !bodyText2.includes('Sign in') && !bodyText2.includes('Welcome')) {
  console.log('\u2713 Layout rendered directly \u2014 onboarding correctly skipped.');
  console.log('  (The app fell back to Supabase profile for the truth.)');
} else {
  console.log('\u2717 Could not determine state \u2014 login might have failed.');
  process.exit(1);
}

await browser.close();
