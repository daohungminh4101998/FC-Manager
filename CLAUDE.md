# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

FC-Manager (`app_diem_danh`) is a football club management SPA: players, matches (with result/venue-link/highlight-video), attendance, match performance stats (goals/assists, goalkeeper stats, defender participation), member contributions (fees), an AI chat assistant, and role-based accounts. React 19 + TypeScript + Vite, styled with Tailwind CSS v4, backed directly by Supabase (Postgres) from the client for all domain data — there is no custom backend/API server for CRUD. The one exception is `/chat` (see the Chat paragraph below), which streams from a separate external AI backend instead of Supabase.

## Commands

```bash
npm run dev       # start Vite dev server
npm run build      # tsc -b (project references type-check) then vite build
npm run preview    # preview the production build
npm run lint        # oxlint
```

There is no test suite/runner configured in this repo.

Environment variables (see `.env.example`, loaded via Vite's `import.meta.env`):

- `VITE_BASE_URL` — Supabase project URL
- `VITE_PRIVATE_KEY` — Supabase anon/public key

## Architecture

**Data flow:** Page component → service module (`src/services/*.ts`) → `supabaseClient` (`src/apis/common.ts`) → Supabase table. There is no global state manager (no Redux/Zustand/React Query) — pages own their data via local `useState`/`useEffect` and call service functions directly, e.g. `playerService.getAll()`. The one exception is auth state, which lives in `AuthContext` (see below) since it's needed app-wide for route guarding.

**Services** (`src/services/`) are the only layer that talks to Supabase. Each is a plain object of async methods per resource (`playerService`, `matchService`, `attendanceService`, `performanceService`, `contributionService`, `authService`). Notice the DB uses `snake_case` columns (e.g. `created_at`, `amount_due`, `contribution_id`, `match_id`) while the app's TypeScript types (`src/types/index.ts`) use `camelCase` — services are responsible for mapping between the two on read, and for building `snake_case` payloads on write. When adding a new service method, follow this same manual mapping pattern rather than assuming the DB row shape matches the app type. `matchService.ts` exports a reusable `mapMatchRow(row)` helper for this mapping — reuse it (rather than re-deriving the mapping) anywhere a query embeds a joined `matches` row, as `performanceService`'s stats-aggregation methods do (`.select('*, matches(*)')`).

**Routing** (`src/App.tsx`): `react-router-dom` v7, declarative routes. `/login` and `/register` are standalone (no `AppLayout`). Every other route is nested under `AppLayout` (`src/components/layout/AppLayout.tsx` — Sidebar + Header + `<Outlet/>` + `ToastContainer`) and wrapped in `ProtectedRoute` (`src/components/auth/ProtectedRoute.tsx`). `ProtectedRoute` takes two independent, optional props — `allowedRoles?: Role[]` (redirects authenticated-but-wrong-role users to `/`) and `requireAuth?: boolean` (require any logged-in user) — and only forces the `/login` redirect when at least one of them is passed (`mustAuthenticate = requireAuth || !!allowedRoles`). **Gotcha:** the outer `ProtectedRoute` wrapping `AppLayout` in `App.tsx` passes neither prop, so by itself it does not gate unauthenticated access; only routes that additionally nest a second `ProtectedRoute` with `allowedRoles` or `requireAuth` actually require login. Today that's `/performance` (nested `ProtectedRoute allowedRoles={['Admin']}`) and `/chat` (nested `ProtectedRoute requireAuth`) — every other route under `AppLayout` (`/`, `/players`, `/matches`, `/attendance`, `/statistics`, `/contributions`, `/contributions/:id`) currently renders for anonymous visitors too. Confirm with the user whether this is intended before relying on it; when adding a new route that should require login, nest an explicit `ProtectedRoute requireAuth` (or `allowedRoles`) rather than assuming the outer wrapper covers it. Routes: `/`, `/players`, `/matches`, `/attendance`, `/statistics`, `/performance` (Admin only), `/chat` (any authenticated role, not linked from `Sidebar` — URL-only), `/contributions`, `/contributions/:id`.

**Auth & roles:** `authService.ts` handles `login` (plaintext comparison against the `login.password_hash` column — intentionally unhashed, not a bug) and `register` (creates `User` or `Player` accounts only; `Admin` cannot be self-registered — the pre-existing `admin`/`123456` row is the only admin). `AuthContext` (`src/contexts/AuthContext.tsx`, same provider/hook pattern as `ToastContext`) holds the current `AuthUser` (`id`, `username`, `role`, `playerId`), hydrated synchronously from `localStorage` (key `fc_manager_auth`) via a lazy `useState` initializer so there's no logged-out flash on refresh. Three roles: **Admin** (full CRUD everywhere), **User** (read-only everywhere), **Player** (read-only everywhere, plus can self-check-in on `/attendance` for their own row only — see the Attendance section below). Pages read `useAuth().user?.role` to conditionally show/hide create/edit/delete/payment buttons (grep for `isAdmin` across `src/pages/*.tsx`); this is UI-level gating only — there is no Supabase RLS, so it does not stand in for real authorization.

**Toasts:** global `ToastProvider`/`useToast()` context (`src/contexts/ToastContext.tsx`) wraps the whole app; call `addToast(message, type)` from any page for success/error/warning/info notifications, auto-dismissed after 3.5s.

**Forms:** built with `react-hook-form`; typed against the `*FormData`/`*Input`/`RegisterPayload` types in `src/types/index.ts`.

**UI components** (`src/components/ui/`) are shared, generic building blocks (`Modal`, `Button`, `Badge`, `FormControls`, `SearchInput`, `ConfirmDialog`, `VenueLink`, `PlayerDetailModal`, `MatchStatModal`, `ToastContainer`) reused across pages — check here before adding a new low-level UI primitive. `MatchStatModal` is a generic per-match detail popup (`{match, columns: {label, value}[]}[]` rows) used by the goalkeeper and defender ranking tables on `/statistics`; `PlayerDetailModal` is the older goals/assists-specific equivalent, reused as-is for the top-scorer/top-assist tables.

**Matches beyond the basics:** `Match` (`src/types/index.ts`) carries three optional fields alongside opponent/date/venue/note: `result` (`'Win' | 'Draw' | 'Loss'`, DB column `result`), `locationUrl` (DB `location_url`, a Google Maps link) and `highlightUrl` (DB `highlight_url`, typically a YouTube link) — `matchService.mapMatchRow` maps all three. `VenueLink` (`src/components/ui/VenueLink.tsx`) renders a match's venue as a clickable link when `locationUrl` is set, otherwise plain text; it's reused across `MatchesPage`, `AttendancePage`, `PerformancePage`, `MatchStatModal`, and `PlayerDetailModal` — render venues through it rather than inlining the conditional again. `src/utils/youtube.ts` exports `getYouTubeEmbedUrl`, used by `MatchesPage`'s highlight-viewer modal to turn a `youtube.com`/`youtu.be` URL into an embeddable `/embed/...` URL (falls back to a plain external link if the URL doesn't match a known pattern). `MatchesPage` deep-links into `/attendance?match=<id>` and `/performance?match=<id>`; both pages read the `match` query param via `useSearchParams` to preselect that match.

**Chat (`/chat`):** `ChatPage.tsx` + `chatService.ts` are the one feature that doesn't go through Supabase — `chatService.sendMessage` streams a Claude response as SSE from an external backend, currently hardcoded in `chatService.ts` to `https://fc-manager-be.onrender.com/v1/messages` with a hardcoded bearer key (not wired through `.env`/`import.meta.env` the way the Supabase credentials are — update both directly in `chatService.ts` if that backend or key changes). It incrementally appends decoded `content_block_delta` text chunks to the last assistant message in `ChatPage`'s local state; `stopGenerate` aborts the in-flight stream via `AbortController`. The route requires login (`ProtectedRoute requireAuth`, any role) but isn't linked from `Sidebar`, so it's reachable only by navigating to `/chat` directly.

**Performance domain:** three normalized Supabase tables — `match_performances` (goals/assists, one row per player per match), `goalkeeper_stats` (goals conceded + fractional `matches_played` in `(0, 1]`, supports multiple keepers per match for substitutions), `match_defenders` (which players played as defenders that match). `performanceService.ts` is the single service for all three: `getByMatch`/`getGoalkeeperStats`/`getDefenders` read a single match's rows; `upsertPerformances`/`upsertGoalkeeperStats`/`setDefenders` write a match's rows via **delete-then-insert** (matching `attendanceService.save`'s pattern — not a true SQL upsert, to avoid stale rows when a previously-present player is later marked absent); `getAllPerformances`/`getAllGoalkeeperStats`/`getAllDefenders` fetch everything joined with `matches` for stats aggregation, with an optional client-side `year` filter. `/performance` (Admin-only) is the only page that writes to these tables; `/statistics` and `/` (Dashboard) only read via the `getAllX` methods.

**Contributions domain** is the most relational feature: `Contribution` (a fee/collection event) → `ContributionPlayer` (per-player amount due/paid/status, created for all active players via `contributionService.initializePlayers` when a contribution is created) → `ContributionTransaction` (individual payment records against a `ContributionPlayer`). Payment status (`unpaid`/`partial`/`paid`/`exempt`) is recomputed in `updatePlayerPayment` by comparing cumulative `amount_paid` to `amount_due`.

**Deployment:** Vercel, with `vercel.json` doing a catch-all rewrite to `index.html` (required for client-side routing on refresh/deep links).

**Path aliases:** none configured — imports use relative paths (`../services/...`, `../types`, etc.).

**TypeScript note:** `verbatimModuleSyntax` is enabled in both `tsconfig.app.json`/`tsconfig.node.json` — every type-only import must use `import type { ... }` (or an inline `type` specifier), or `tsc -b` fails the build.
