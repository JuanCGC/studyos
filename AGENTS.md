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
- Sidebar on left, main content fills rest, collapses at 1024px
- Phosphor icons via CDN (`<i class="ph ph-icon-name">`), not npm package
- 3 fonts loaded from Google: Sora (headings), Inter (body), DM Mono (code)
