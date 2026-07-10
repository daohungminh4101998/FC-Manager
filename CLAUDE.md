# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

FC-Manager (`app_diem_danh`) is a football club management SPA: players, matches, attendance, match performance stats (goals/assists, goalkeeper stats, defender participation), member contributions (fees), and role-based accounts. React 19 + TypeScript + Vite, styled with Tailwind CSS v4, backed directly by Supabase (Postgres) from the client — there is no custom backend/API server.

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

**Routing** (`src/App.tsx`): `react-router-dom` v7, declarative routes. `/login` and `/register` are standalone (no `AppLayout`). Every other route is nested under `AppLayout` (`src/components/layout/AppLayout.tsx` — Sidebar + Header + `<Outlet/>` + `ToastContainer`) and wrapped in `ProtectedRoute` (`src/components/auth/ProtectedRoute.tsx`), which redirects unauthenticated users to `/login`. `/performance` additionally nests a second `ProtectedRoute allowedRoles={['Admin']}` since it's Admin-only. Routes: `/`, `/players`, `/matches`, `/attendance`, `/statistics`, `/performance` (Admin only), `/contributions`, `/contributions/:id`.

**Auth & roles:** `authService.ts` handles `login` (plaintext comparison against the `login.password_hash` column — intentionally unhashed, not a bug) and `register` (creates `User` or `Player` accounts only; `Admin` cannot be self-registered — the pre-existing `admin`/`123456` row is the only admin). `AuthContext` (`src/contexts/AuthContext.tsx`, same provider/hook pattern as `ToastContext`) holds the current `AuthUser` (`id`, `username`, `role`, `playerId`), hydrated synchronously from `localStorage` (key `fc_manager_auth`) via a lazy `useState` initializer so there's no logged-out flash on refresh. Three roles: **Admin** (full CRUD everywhere), **User** (read-only everywhere), **Player** (read-only everywhere, plus can self-check-in on `/attendance` for their own row only — see the Attendance section below). Pages read `useAuth().user?.role` to conditionally show/hide create/edit/delete/payment buttons (grep for `isAdmin` across `src/pages/*.tsx`); this is UI-level gating only — there is no Supabase RLS, so it does not stand in for real authorization.

**Toasts:** global `ToastProvider`/`useToast()` context (`src/contexts/ToastContext.tsx`) wraps the whole app; call `addToast(message, type)` from any page for success/error/warning/info notifications, auto-dismissed after 3.5s.

**Forms:** built with `react-hook-form`; typed against the `*FormData`/`*Input`/`RegisterPayload` types in `src/types/index.ts`.

**UI components** (`src/components/ui/`) are shared, generic building blocks (`Modal`, `Button`, `Badge`, `FormControls`, `SearchInput`, `ConfirmDialog`, `PlayerDetailModal`, `MatchStatModal`, `ToastContainer`) reused across pages — check here before adding a new low-level UI primitive. `MatchStatModal` is a generic per-match detail popup (`{match, columns: {label, value}[]}[]` rows) used by the goalkeeper and defender ranking tables on `/statistics`; `PlayerDetailModal` is the older goals/assists-specific equivalent, reused as-is for the top-scorer/top-assist tables.

**Performance domain:** three normalized Supabase tables — `match_performances` (goals/assists, one row per player per match), `goalkeeper_stats` (goals conceded + fractional `matches_played` in `(0, 1]`, supports multiple keepers per match for substitutions), `match_defenders` (which players played as defenders that match). `performanceService.ts` is the single service for all three: `getByMatch`/`getGoalkeeperStats`/`getDefenders` read a single match's rows; `upsertPerformances`/`upsertGoalkeeperStats`/`setDefenders` write a match's rows via **delete-then-insert** (matching `attendanceService.save`'s pattern — not a true SQL upsert, to avoid stale rows when a previously-present player is later marked absent); `getAllPerformances`/`getAllGoalkeeperStats`/`getAllDefenders` fetch everything joined with `matches` for stats aggregation, with an optional client-side `year` filter. `/performance` (Admin-only) is the only page that writes to these tables; `/statistics` and `/` (Dashboard) only read via the `getAllX` methods.

**Contributions domain** is the most relational feature: `Contribution` (a fee/collection event) → `ContributionPlayer` (per-player amount due/paid/status, created for all active players via `contributionService.initializePlayers` when a contribution is created) → `ContributionTransaction` (individual payment records against a `ContributionPlayer`). Payment status (`unpaid`/`partial`/`paid`/`exempt`) is recomputed in `updatePlayerPayment` by comparing cumulative `amount_paid` to `amount_due`.

**Deployment:** Vercel, with `vercel.json` doing a catch-all rewrite to `index.html` (required for client-side routing on refresh/deep links).

**Path aliases:** none configured — imports use relative paths (`../services/...`, `../types`, etc.).

**TypeScript note:** `verbatimModuleSyntax` is enabled in both `tsconfig.app.json`/`tsconfig.node.json` — every type-only import must use `import type { ... }` (or an inline `type` specifier), or `tsc -b` fails the build.
