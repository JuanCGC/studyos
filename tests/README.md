# Test Suite — StudIt API & UI

## Prerequisites

1. API running on `:4000` → `node api/index.js`
2. Vite dev server on `:5173` → `npm run dev`
3. A Supabase test user with email/password
4. Playwright + Chromium (for scenarios 3 & 4):
   ```
   npm install -D playwright
   npx playwright install chromium
   ```

## Environment

```powershell
$env:TEST_EMAIL="your-test-user@example.com"
$env:TEST_PASSWORD="your-test-password"
```

## Run All

```powershell
$env:TEST_EMAIL="test@example.com"
$env:TEST_PASSWORD="secret123"

node tests\scenario1-auth.mjs
node tests\scenario2-concurrency.mjs
node tests\scenario3-navigation.mjs
node tests\scenario4-onboarding.mjs
```

## What Each Scenario Tests

| # | File | Type | Bug |
|---|------|------|-----|
| 1 | `scenario1-auth.mjs` | API (no deps) | Gemini endpoints accept unauthenticated requests |
| 2 | `scenario2-concurrency.mjs` | API (auth) | JSONB writes race — one operation overwrites another's changes |
| 3 | `scenario3-navigation.mjs` | Playwright | Browser Back button desyncs `view` state from URL |
| 4 | `scenario4-onboarding.mjs` | Playwright | localStorage wipe causes infinite onboarding loop |
