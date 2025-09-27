# Staff Dashboard Rebuild Plan

## Goal
Build a standalone, modular staff operations dashboard that can be deployed independently (Vercel or VPS/Docker) and communicates with the guest-facing web app exclusively through Supabase (Postgres + Realtime).

## Existing Assets to Evaluate
- **Supabase schema & client**: Located under `src/staff-dashboard/services/supabaseClient.ts`. Provides typed models (`GuestProfile`, `GuestRequest`, `Room`, etc.), realtime subscription helpers, and mock data fallbacks.
- **Data service layer**: `src/staff-dashboard/services/dataService.ts` wraps Supabase CRUD and mock data. Reusable patterns:
  - Feature-based fetch/update functions (`getGuestProfiles`, `getGuestRequests`, `updateRoom`, etc.).
  - Realtime setup methods (`setupRequestWebhook`, `setupRoomUpdates`, `setupNotificationUpdates`).
- **Agent integrations**: `src/staff-dashboard/services/agents/` contains placeholder agent handlers (guest insight, request handling). These can be refactored into modular hooks if AI features remain in scope.
- **Feature directories under `src/staff-dashboard/components/`**: Provide baseline UX structure.
  - `Dashboard/` (overview cards, charts)
  - `Requests/`, `RoomControl/`, `GuestProfiles/`, `Staff/`, `MenuManagement/`, `KnowledgeBase/`, `Settings/`
  - Current TS/JSX is monolithic; use as UX reference only.
- **Styling**: `src/staff-dashboard/styles.css` includes bespoke tailwind-esque utility classes.

## New Architecture Overview
- **Project structure**: Create a fresh Next.js 15 App Router app under `apps/staff-dashboard/` (or separate repo). Keep main marketing site untouched.
- **Component architecture**:
  - Use shadcn/ui primitives for consistent, accessible UI components.
  - Organize by domain: `src/features/<domain>/` containing `components/`, `hooks/`, `services/`, `types/`.
  - Pages under `app/(dashboard)/<domain>/page.tsx` consume feature modules.
  - Shared layout (sidebar + top bar) under `app/(dashboard)/layout.tsx` with slots for feature navigation.
- **Data layer**:
  - Create `src/lib/supabase/client.ts` exporting typed Supabase browser client.
  - Domain-specific hooks (e.g., `useGuestRequests()`) that:
    - Fetch initial data via RPC/REST.
    - Subscribe to realtime updates and merge changes into state.
  - Define DTOs/interfaces in `src/lib/types/` and share between hooks/components.
- **State management**: Prefer React Query or Zustand per domain for caching + optimistic updates. Ensure realtime subscriptions update caches directly.
- **Theming**: Use Tailwind with design tokens matching brand. Provide dark/light modes.
- **Testing & quality**:
  - Enable strict TypeScript settings.
  - ESLint (Next.js config) and Prettier.
  - Placeholder unit tests per hook/component.

## Current Implementation Status (2025-09-27)
- **App scaffold**: Next.js 15 App Router app lives at `apps/staff-dashboard/` with Turbopack dev/build commands and Tailwind/shadcn UI configured.
- **Layout shell**: `app/(dashboard)/layout.tsx` delivers sidebar navigation (`SidebarNavigation`), breadcrumb trail, and theme toggle. Root providers (`QueryProvider`, `ThemeProvider`) wired in `app/layout.tsx`.
- **Fixtures & types**: Supabase DTOs consolidated under `src/lib/types/`, with typed mock fixtures per domain in `src/lib/fixtures/`. Supabase client + realtime helpers located in `src/lib/supabase/`.
- **Feature placeholders**: All core routes (`/dashboard`, `/requests`, `/room-control`, `/guest-profiles`, `/staff`, `/menu-management`, `/knowledge-base`, `/settings`) render domain-specific mock data and TODO markers for realtime/AI enhancements.

## Realtime Hooks Strategy
- **Data hooks**: Implement domain hooks inside `src/features/<domain>/hooks/` that use React Query (`QueryProvider`) for caching and state consistency.
  - Fetch initial data from Supabase REST endpoints (fallback to fixtures when credentials missing).
  - Use `onSuccess` to seed derived state (e.g., KPI aggregates, table filters).
- **Subscriptions**: Leverage helpers in `src/lib/supabase/realtime.ts` to subscribe to table events (`guest_requests`, `rooms`, `notifications`).
  - Each hook registers a subscription in `useEffect` and performs React Query cache updates (`setQueryData`) for optimistic merging.
  - Provide graceful teardown via returned unsubscribe function; when Supabase credentials are absent, skip subscription setup.
- **Offline/mocked mode**: If `isSupabaseConfigured()` returns false, hooks resolve data from fixtures and expose a flag so UI can indicate “Mock data” status.

## Feature Checklist & Placeholders
- **Dashboard home**: KPI summary cards, realtime request feed, occupancy overview placeholders.
- **Requests management**:
  - Requests table, detail drawer, status update actions (button placeholders).
  - Realtime updates when new requests arrive.
- **Room control**:
  - Room list, occupancy filter, detail panel with controls (toggle placeholders).
- **Guest profiles**:
  - Profile list, detail view with AI insights placeholder cards.
- **Staff management**:
  - Staff roster, profile detail, skill metrics placeholders.
- **Menu management**:
  - Menu item cards, detail editor placeholder.
- **Knowledge base**:
  - Article list, detail view with markdown placeholder.
- **Settings**:
  - Supabase credential status, notification preferences, integration toggles (placeholder switches).

Each feature should render meaningful mock data via typed `fixtures.ts` files until Supabase endpoints are wired. Use TODO comments to mark missing interactions.

## Deployment Strategy
- **Option 1: Vercel**
  - Create new project pointing at `apps/staff-dashboard/`.
  - Configure `npm run build --workspace staff-dashboard` (or `npm run build --filter staff-dashboard` if using npm workspaces filters).
  - Set framework preset to **Next.js App Router**; output directory defaults to `.next`.
  - Environment variables:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Optional secrets for AI features (when enabled): `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`.
  - Add `npm run lint` and `npm run test` (future) as required checks in project settings.
- **Option 2: VPS/Docker**
  - Add Dockerfile in `apps/staff-dashboard/` (FROM node:20-alpine, install deps, build, run `next start`).
  - Reuse existing VPS reverse proxy or provision new subdomain (e.g., `staff.yourdomain.com`).

## Verification Checklist
- **Lint**: `cd apps/staff-dashboard && npm run lint`
- **Type safety**: rely on Next.js/TypeScript incremental build (`npm run dev`) for rapid feedback.
- **Preview**: `npm run dev --workspace staff-dashboard` for interactive QA; confirm Supabase credentials presence toggles realtime subscriptions.
- **Future tests**: add Vitest/React Testing Library suites under `src/features/**/tests/` before enabling `npm run test` in CI.

## Immediate Tasks
1. Scaffold new Next.js app with shadcn/ui, Tailwind, ESLint/TS configured.
2. Extract reusable Supabase types/services from current codebase into shared package or copy with cleanup.
3. Implement layout + navigation shell, placeholder pages per feature.
4. Wire realtime-capable hooks with mock data, then integrate Supabase.
5. Remove legacy `/staff-dashboard` route from main app once new dashboard is ready.

## Open Questions
- Do we retain AI agent features at launch, or stub them for later?
- Should we mirror current dashboard information architecture exactly or simplify?
- Preferred deployment target first (Vercel vs VPS) to tailor build scripts?

---
Use this document as the living brief/scope for the rebuild. Update sections as decisions are finalized or new requirements surface.
