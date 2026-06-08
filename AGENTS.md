# StudIt — Agent Guide

## Stack
- **React 19** (JSX only, no TS, no router lib). `index.html` → `src/main.jsx` → `src/App.jsx`
- **Vite 6** dev on `:5173`, proxies `/api/*` → Express on `:4000`
- **Express 5** in `api/index.js` (runs standalone or as Vercel serverless lambda)
- **Supabase** project `jyasohtnqlracghsxdla`. Anon key in `VITE_SUPABASE_ANON_KEY`, service role in `VITE_SUPABASE_SERVICE_ROLE_KEY`
- **Tailwind** (`src/index.css`) + custom design system (`style.css` — CSS vars, layout grid, component styles)
- **Phosphor icons**: CDN `<script>` in `index.html` (`unpkg.com/@phosphor-icons/web`) AND npm `@phosphor-icons/react` (2.1.10)

## Commands
```sh
npm run dev     # concurrently runs api + vite
npm run build   # vite build + copies login.html, landing.html to dist/ (postbuild script)
npm run preview # vite preview of dist/
```

No test/lint/typecheck commands in package.json. Tests in `tests/` are gitignored, require Playwright + test user env vars.

## Key architecture — App.jsx (~1033 lines)
Central component with a single `view` state string persisted to `localStorage('studit_view')`. `navigate(v)` updates view + localStorage + `history.pushState`. No router library — views are rendered via `switch(view)`.

All views receive their props directly from App.jsx. Adding a view means: add import, add case to switch, thread props.

## Auth & routing
| URL | Serves | Notes |
|---|---|---|
| `/` | `landing.html` | Public. Hash handler redirects `/app` for auth tokens |
| `/login.html` | `login.html` | Standalone auth (Supabase JS CDN, no React) |
| `/app` | `index.html` (SPA) | Dashboard + all app views |
| `/api/*` | `api/index.js` | Express routes (Vercel serverless or local :4000) |

Auth: `useAuth()` hook in `src/hooks/useAuth.js`. Reads Supabase session, handles URL hash `access_token`/`code` via `setSession()` fallback. Unauthenticated → redirect to `/login.html`. Stores user in ref + state; on SIGNED_OUT without session → reconnect mode (polls every 5s).

Logout (`useAuth.js:106-116`): clears all `sb-*` and `studit_*` localStorage keys, then `signOut({ scope: 'global' })`.

Onboarding: new users see `OnboardingWizard` before `Layout`. Flag stored in localStorage `studit_onboarding_uid` + `studit_onboarding_done`. Also persisted to `profiles.preferences.onboarding_completed`.

## Progress & data flow
- `useProgress(user)` in `src/hooks/useProgress.js`: manages `subjects` + `tasks` state, debounced save (1.5s) to both localStorage and Supabase `progress` table (JSONB columns).
- **Cross-tab sync**: `window.addEventListener('storage')` handles concurrent tab writes (`useProgress.js:189-200`).
- **Stale closure prevention**: refs (`subjectsRef`, `tasksRef`) keep current values for debounced save.
- Load priority: remote Supabase data wins over localStorage. Local-only data syncs up.
- Plan polling: `usePlan.js` polls `profiles` table every 5 min via `setInterval`.

## API endpoints
All use `getUser(req)` (extracts Bearer token from `Authorization` header, validates via Supabase). Return 401 if missing.

| Endpoint | Auth | Notes |
|---|---|---|
| `GET /api/config` | No | Public anon key |
| `POST /api/checkout` | Yes | dLocal Go payment redirect |
| `POST /api/generate-guide` | Yes | Gemini proxy (guide content) |
| `POST /api/quiz` | Yes | Gemini proxy (quiz questions) |
| `POST /api/analyze-cv` | Yes | Gemini multi-modal (PDF → base64) |
| `POST /api/suggest` | Yes | Gemini proxy (topic suggestions) |
| `POST /api/interview` | Yes | Gemini proxy (chat) |
| `GET /api/analytics-hours` | Yes | Aggregates `pomodoro_sessions` by subject |
| `POST /api/pomodoro-log` | Yes | TimerContext auto-logs sessions |
| `DELETE /api/tasks` | Yes | Removes task from progress JSONB |
| `DELETE /api/subjects` | Yes | Cascade deletes pomodoro + flashcard data |
| `GET /api/analytics/flashcards-summary` | Yes | Counts from `interview_flashcards` |
| `POST /api/save-progress` | Yes | Bulk upsert subjects + tasks |
| `POST /api/webhooks/dlocal` | HMAC | Payment webhook, responds 200 immediately, processes async |

All Gemini endpoints use `geminiFetch()` helper (model `gemini-2.5-flash`, 30s timeout, `responseMimeType: 'application/json'`). Require `GEMINI_API_KEY` env var. Response parsing uses `api/_parse.js` with 5 fallback strategies (direct parse → strip fences → extract balanced block → sanitize control chars → fix unquoted keys + close brackets).

## Subjects data
Static embedded data in `src/data/subjects.js` (919 lines). Exports `SUBJECTS` array (default subjects) and `CHAP_MAP` (chapter name → section ID mapping for sidebar navigation). Progress is stored separately in Supabase `progress.subjects` JSONB — subjects are copied by value, not reference.

Each subject has: `id, name, defaultLang, icon, color, priority, chapList[{name, done, notes}]`.

Embedded study guides in `EMBEDDED_GUIDES` object keyed by `subjectId_chapterIndex`, with `kc` (key concept), `le` (lab express), `pe` (project evolution).

## Plan enforcement
Free plan = max 3 subjects (hard-coded in App.jsx:80-81 as `i >= 3` check). Pro = 20, Enterprise = unlimited. `PlanGate` modal shown on upgrade triggers. Plan info from `profiles.plan_type` column.

## Settings
Single `studit_settings` localStorage JSON key containing: `settings` (alarmOn, focusMode), `pomoSettings` (work, short, long), `weekGoal`, `pomosGoal`, `currentWeek`.
AI language in `studit_ai_language` localStorage. Deep dive comments toggle in `studit_deepDiveComments` localStorage (synced to `profiles.preferences.showDeepDiveComments`).

## Known bug history (preserve)
| # | Issue | Fix location |
|---|---|---|
| Timer drift | `setInterval(1000)` loses time | `usePomodoro.js:53-55` — use `Date.now() - startRef` delta |
| Stale localStorage on logout | `studit_*` keys persist | `useAuth.js:66-68` clears all before signOut |
| Stale closures in debounceSave | Refs capture stale subjects/tasks | `useProgress.js:36-38` — use refs |
| Webhook blocking | dLocal waits >2s | Respond 200, process via `setImmediate` |
| Tab throttled timer | Browser pauses setInterval when hidden | `usePomodoro.js:104-138` — `visibilitychange` handler recalculates |
| Cross-tab progress overwrite | Two tabs overwrite each other | `useProgress.js:108-119` — `storage` event listener |
| Duplicate React keys | AI suggestions return existing topics | Dedup via `existing = new Set(prev.map(p => p.id))` in App.jsx |
| Token expiration before API | Expired access token → silent failure | `TimerContext.jsx:19-23` — `refreshSession()` before API call |

## Other gotchas
- `main.js` at repo root is a **legacy file** from a previous app version — NOT the entry point. The real entry is `src/main.jsx`.
- CSP headers set in `vercel.json` (not meta tags). Allowlist: `*.supabase.co`, CDN scripts, Google Fonts.
- AI progress is cached in `guide_` / `quiz_` localStorage keys + `guide_cache` Supabase table. Corrupted cache auto-cleaned on app load (`App.jsx:164-171`).
- XSS-safe rendering: `MarkdownRenderer.jsx` escapes all text with `escapeHtml()` before `dangerouslySetInnerHTML`, plus DOMPurify pass.
- CV PDF analysis: max 4 MB file size. Enforced both client-side (`App.jsx:401-406`) and server-side (`api/index.js:18-24`).
- Sidebar collapse at 1024px: pure CSS media query, no JS listeners.
