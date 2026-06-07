/**
 * SCENARIO 2: JSONB Concurrent Write Race Condition (progress table)
 *
 * Simulates two concurrent operations that both modify the user's progress:
 *   1. A Pomodoro session log (inserts into pomodoro_sessions)
 *   2. A tasks array update (DELETE /api/tasks rewriting the JSONB column)
 *
 * These run through Promise.all to mimic realistic frontend race conditions
 * where debounced saves overlap. The test then checks whether both changes
 * persisted or one overwrote the other.
 *
 * REQUIREMENTS:
 *   - A valid test user email/password passed via TEST_EMAIL / TEST_PASSWORD env vars
 *   - The user must have at least 1 task in their progress JSONB
 */

import { getAuthSession, apiFetch, getAdminClient } from './helpers/auth.mjs';

const TEST_EMAIL  = process.env.TEST_EMAIL;
const TEST_PASS   = process.env.TEST_PASSWORD;

if (!TEST_EMAIL || !TEST_PASS) {
  console.error('ERROR: Set TEST_EMAIL and TEST_PASSWORD env vars.');
  console.error('Example: $env:TEST_EMAIL="test@example.com"; node tests\\scenario2-concurrency.mjs');
  process.exit(1);
}

// ── Phase 1: seed a known task ────────────────────────────────
console.log('\n═══ Phase 1: Seed test data ════════════════════════');

const { user, token } = await getAuthSession(TEST_EMAIL, TEST_PASS);
if (!user) { console.error('Login failed'); process.exit(1); }
const admin = getAdminClient();

const SEED_TASK_ID = `concurrency-test-${Date.now()}`;
const SEED_TASK = { id: SEED_TASK_ID, text: 'Concurrency test task', done: false };

// Load current progress
const { data: progress } = await admin
  .from('progress')
  .select('subjects, tasks')
  .eq('user_id', user.id)
  .single();

const existingTasks = Array.isArray(progress?.tasks) ? progress.tasks : [];
const existingSubjects = progress?.subjects || [];

// Insert test task
const { error: upsertErr } = await admin
  .from('progress')
  .upsert({
    user_id: user.id,
    tasks: [...existingTasks, SEED_TASK],
    subjects: existingSubjects,
    updated_at: new Date().toISOString(),
  });

if (upsertErr) { console.error('Seed failed:', upsertErr.message); process.exit(1); }
console.log('✓  Seeded test task:', SEED_TASK_ID);

// ── Phase 2: Fire concurrent operations ───────────────────────
console.log('\n═══ Phase 2: Fire concurrent operations ════════════');

const op1 = apiFetch(`/api/pomodoro-log`, {
  method: 'POST',
  token,
  body: JSON.stringify({
    subjectId: 'concurrency-test',
    chapterName: 'Race Condition Test',
    durationMinutes: 25,
  }),
});

const op2 = apiFetch(`/api/tasks?id=${SEED_TASK_ID}`, {
  method: 'DELETE',
  token,
});

const [res1, res2] = await Promise.all([op1, op2]);
const body1 = await res1.json().catch(() => ({}));
const body2 = await res2.json().catch(() => ({}));

console.log(`pomodoro-log:  ${res1.status} ${JSON.stringify(body1)}`);
console.log(`DELETE /tasks: ${res2.status} ${JSON.stringify(body2)}`);

// ── Phase 3: Verify data integrity ────────────────────────────
console.log('\n═══ Phase 3: Verify data integrity ═════════════════');

const { data: final } = await admin
  .from('progress')
  .select('tasks')
  .eq('user_id', user.id)
  .single();

const finalTasks = Array.isArray(final?.tasks) ? final.tasks : [];
const deleted = finalTasks.find(t => t.id === SEED_TASK_ID);

console.log(`Task still present in JSONB: ${deleted ? 'YES (BUG: delete lost)' : 'NO (delete persisted)'}`);
console.log(`Total tasks in array: ${finalTasks.length}`);

// Check pomodoro was logged
const { data: pomoLog } = await admin
  .from('pomodoro_sessions')
  .select('*')
  .eq('user_id', user.id)
  .eq('subject_id', 'concurrency-test')
  .limit(1)
  .single();

console.log(`Pomodoro session logged: ${pomoLog ? 'YES' : 'NO (BUG: lost)'}`);

// ── Final verdict ─────────────────────────────────────────────
let failed = false;
if (deleted) {
  console.log(`\n✗ BUG: DELETE lost — the task was not removed from JSONB.`);
  console.log(`  Likely cause: pomodoro-log's upsert wrote a stale subjects/tasks snapshot,`);
  console.log(`  overwriting the DELETE's changes. Classic JSONB race condition.`);
  failed = true;
}
if (!pomoLog) {
  console.log(`\n✗ BUG: Pomodoro session not found — probable cleanup or silent failure.`);
  failed = true;
}
if (!failed) {
  console.log(`\n✓ Both operations persisted. No visible race condition in this run.`);
  console.log(`  NOTE: Race conditions are non-deterministic. Run multiple times to reproduce.`);
}

process.exit(failed ? 1 : 0);
