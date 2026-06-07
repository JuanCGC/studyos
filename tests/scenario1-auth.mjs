/**
 * SCENARIO 1: Auth Validation on Gemini Endpoints
 *
 * Verifies that /api/analyze-cv, /api/quiz, and /api/interview
 * reject requests without a valid Authorization header.
 *
 * EXPECTED: 401 Unauthorized for all three.
 * CURRENT BUG: Endpoints lack auth checks → respond 200 and consume Gemini quota.
 */

import { API_BASE } from './helpers/auth.mjs';

const ENDPOINTS = [
  { path: '/api/analyze-cv', method: 'POST', body: { fileBase64: 'fake', currentSubjects: [] } },
  { path: '/api/quiz',       method: 'POST', body: { subjectName: 'x', chapterName: 'y' } },
  { path: '/api/interview',  method: 'POST', body: { messages: [] } },
];

let passed = 0;
let failed = 0;

for (const ep of ENDPOINTS) {
  const url = `${API_BASE}${ep.path}`;
  console.log(`\n▶  Testing ${ep.path} (no auth header)`);

  try {
    const res = await fetch(url, {
      method: ep.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ep.body),
    });

    const ok = res.status === 401;
    const label = ok ? '✓ PASS' : '✗ FAIL';
    console.log(`   ${label}  |  status: ${res.status}  |  expected: 401`);

    if (ok) {
      passed++;
      let body;
      try { body = await res.json(); } catch { body = null; }
      if (body?.error) console.log(`   error: ${body.error}`);
    } else {
      failed++;
      // Print partial body to help debug
      const text = (await res.text()).slice(0, 200);
      console.log(`   body: ${text}`);
    }
  } catch (err) {
    console.log(`   ✗ FAIL  |  network/parse error: ${err.message}`);
    failed++;
  }
}

console.log(`\n═══════════════════════════════════════`);
console.log(`  Results:  ${passed} passed  |  ${failed} failed  |  ${ENDPOINTS.length} total`);
console.log(`═══════════════════════════════════════`);

if (failed > 0) {
  console.log(`\n⚠  Bug confirmed: ${failed} endpoint(s) missing auth check.`);
  console.log(`   Add getUser(req) guard to each unprotected Gemini route in api/index.js.`);
  process.exit(1);
}
