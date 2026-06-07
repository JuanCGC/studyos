# StudIt — Agent Guide

## App stack
- **React 19** (no TS, no router lib — manual `view` state in `App.jsx`). Entry: `index.html` → `src/main.jsx` → `src/App.jsx`
- **Vite 6** dev server on `:5173`, proxies `/api/*` → Express on `:4000`
- **Express 5** API in `api/index.js` (Vercel serverless or standalone on `:4000`)
- **Supabase** auth + DB (project: `jyasohtnqlracghsxdla`). Anon key in `VITE_SUPABASE_ANON_KEY`, service role in `VITE_SUPABASE_SERVICE_ROLE_KEY`
- **Tailwind** + custom CSS vars (`style.css`). Two CSS files — Tailwind for utility, `style.css` for design system vars and component styles

## Key commands
```sh
npm run dev        # Runs API + Vite concurrently (concurrently package)
npm run build      # Vite build + copies login.html, landing.html to dist/
npm run preview    # Vite preview of dist/
```

No test/lint/typecheck commands exist.

## Auth & routing
- **No router lib**. `App.jsx` has `view` state string (`'dashboard'`, `'subjects'`, `'settings'`, `'ai-guide'`, `'interview'`, etc.) persisted to `localStorage('studit_view')`. `navigate(v)` changes view + updates localStorage.
- **Auth**: `useAuth()` hook reads Supabase session, handles URL hash `access_token`/`code` via `setSession()` fallback. Unauthenticated → redirect to `/login.html`
- **Onboarding**: new users see `OnboardingWizard` before `Layout`. Flag per user: `studit_onboarding_uid` + `studit_onboarding_done`. Managed in `App.jsx:26-31`
- **Plan**: `usePlan(user)` fetches `plan_type` from `profiles` table via `supabaseClient`

## Pages (Vercel routing)
| URL | Serves | Purpose |
|---|---|---|
| `/` | `landing.html` | Public landing page. Hash handler redirects `/app` for auth tokens |
| `/login.html` | `login.html` | Standalone auth page (no React). Uses Supabase JS CDN directly |
| `/app` | `index.html` (SPA) | Dashboard + all app views |
| `/api/*` | `api/index.js` (serverless) | Express routes |

## API endpoints
All use `getUser(req)` for auth (token from `Authorization: Bearer <access_token>`). Return `401` if missing.

| Endpoint | Auth | Notes |
|---|---|---|
| `GET /api/config` | No | Public anon key |
| `POST /api/checkout` | Yes | dLocal Go payment redirect |
| `POST /api/generate-guide` | No | Gemini proxy, no user data needed |
| `POST /api/quiz` | No | Gemini proxy |
| `POST /api/analyze-cv` | No | Gemini proxy (multi-modal) |
| `POST /api/suggest` | No | Gemini proxy |
| `POST /api/interview` | No | Gemini proxy |
| `GET /api/analytics-hours` | Yes | Aggregates pomodoro_sessions |
| `POST /api/pomodoro-log` | Yes | TimerContext auto-logs |
| `DELETE /api/tasks` | Yes | Removes task from progress JSONB |
| `GET /api/analytics/flashcards-summary` | Yes | Counts from interview_flashcards |
| `POST /api/webhooks/dlocal` | HMAC | Payment webhook, updates subscriptions |

All Gemini endpoints use `geminiFetch()` helper with model `gemini-2.5-flash`. Require `GEMINI_API_KEY` env var.

## DB schema
SQL in `supabase-setup.sql` — run in Supabase SQL Editor. Tables: `progress`, `profiles`, `guide_cache`, `pomodoro_sessions`, `interview_flashcards`, `subscriptions`. RLS enabled on all. Trigger `handle_new_user` auto-creates `profiles` + `subscriptions` rows on auth signup.

## Data flow
- Subjects/chapters defined in `src/data/subjects.js` (static embedded data)
- Progress saved to Supabase `progress` table (JSONB columns `subjects`, `tasks`)
- AI guides cached in `guide_cache` (cross-device) + localStorage (fast)
- CSP headers set in `vercel.json` (not meta tag). Allowlist: `*.supabase.co`, CDN scripts, Google Fonts

## Design conventions
- Dark theme: `--bg: #0F172A` (slate-950), `--surface: #1E293B`, purple/gold neon accents
- Layout grid: `.app { display: grid; grid-template-columns: 240px 1fr }`
- Sidebar on left, main content fills rest, collapses at 1024px (pure CSS, no JS listeners)
- Phosphor icons via CDN (`<i class="ph ph-icon-name">`), not npm package
- 3 fonts loaded from Google: Sora (headings), Inter (body), DM Mono (code)

## Anchored audit history

### Round 1 — Critical bugs fixed (prev session)
| # | Issue | Fix |
|---|---|---|
| 1 | **Timer drift** — `setInterval(1000)` loses ~2s/min | `Date.now() - startRef` delta calc in `usePomodoro.js:53-55` |
| 2 | **Stale localStorage on logout** — `studit_*` keys persist across sessions | `useAuth.js:66-68` clears all `sb-*` + `studit_*` keys before `signOut()` |
| 3 | **Plan not re-validated** — plan upgrade not picked up until page refresh | `usePlan.js:33` polls `profiles` every 5 min via `setInterval` |
| 4 | **Stale closures in debounceSave** — `subjects`/`tasks` captured at debounce creation | Refs `subjectsRef` / `tasksRef` in `useProgress.js:36-38`; direct mutations in `App.jsx` (submitAIQuiz, doReset) replaced with `prev.map(...)` |
| 5 | **Webhook blocking response** — dLocal waits > 2s, connection drops | Respond 200 immediately, process async via `setImmediate` |
| 6 | **Null safety** — `overallPct` crashes on empty `subjects` | Guarded: `subjects.length ? ... : 0` in `useProgress.js:51` |

### Round 2 — Architectural hardening (this session)
| # | Category | Finding | Fix / State |
|---|---|---|---|
| 1.1 | **Duplicate keys** | `analyzeCV`/`fetchSuggestions` push subjects without ID dedup → duplicate React keys if AI returns an existing topic | Added dedup: `setSubjects(prev => { const s = new Set(prev.map(p => p.id)); return [...prev, ...new.filter(x => !s.has(x.id))]; })` (`App.jsx:388-393`, `App.jsx:662-667`) |
| 1.2 | **Tab throttling** | Browser throttles `setInterval(1000)` when tab is hidden → delay in phase transition + stale display | Added `visibilitychange` handler in `usePomodoro.js:104-138` — recalculates `timeLeft` via `Date.now() - startRef` and triggers immediate phase transition if expired |
| 1.3 | **Sidebar resize** | Could use `window.innerWidth` listeners causing unnecessary re-renders | **Not needed** — sidebar collapse is pure CSS media queries, no JS |
| 2.1 | **PDF corruption** | Corrupted PDF → silent spinner (Gemini returns error or malformed JSON) | Error path already handles this: Gemini error → `!geminiRes.ok` → 502 with detail (± API.md:411-413); `parseJSON` fallbacks handle truncation. No structural fix needed |
| 2.2 | **XSS in AI content** | `MarkdownRenderer` uses `dangerouslySetInnerHTML` with AI output | **Safe** — every text token passes through `escapeHtml()` before being rendered. Only controlled `<strong>/<code>` tags are injected |
| 2.3 | **Token expiration + JSONB drift** | (a) Expired access token → silent API failures; (b) Two tabs → overwrite each other's progress | (a) `TimerContext.jsx:19-23` added `refreshSession()` before API call; (b) `useProgress.js:108-119` added `window.addEventListener('storage')` for cross-tab sync |
| 2.4 | **Error handling + timezone** | (a) No error boundary → component crash whitescreens the app; (b) `weekHours` uses client `getDay()` which varies by timezone | (a) `src/components/ErrorBoundary.jsx` wraps `<App>` in `main.jsx:9`; (b) Timezone risk acknowledged — `pomodoro_sessions.completed_at` uses UTC ISO strings correctly; `weekHours` index depends on client TZ, acceptable for single-user app |
