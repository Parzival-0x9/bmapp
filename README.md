# Billiards Management App (Functional Clone)

A Next.js + TypeScript clone of a billiards hall management dashboard, preserving authentication gating, table timing lifecycles, billing, store persistence, responsive UI, notifications, and theme support.

## Architecture Summary

- **App Router** entry points in `app/`.
- **Central store** in `lib/store.ts` using Zustand with localStorage persistence.
- **Domain utilities** in `lib/billing.ts`, `lib/time.ts`, and `lib/tableState.ts`.
- **Reusable UI** components under `components/`.
- **Hooks** for live clock and theme behavior under `hooks/`.
- **Validation tests** in `__tests__/` for auth gating, session timing, billing, and table transitions.

## Setup / Run

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Feature Checklist (Original capability ➜ Duplicate implementation)

- [x] Sign in / sign out flow ➜ `AuthGate` + `useAppStore` auth actions.
- [x] Auth-protected content ➜ Dashboard rendered only after sign-in.
- [x] Session persistence ➜ Zustand `persist` middleware storing auth/tables/sessions/rates.
- [x] Multiple billiards tables ➜ Default 8 table entities in store.
- [x] Table lifecycle states ➜ `available`, `occupied`, `paused`, `closed` domain status model.
- [x] Start / end timing sessions ➜ Store actions with edge case guards.
- [x] Pause / resume flow ➜ Pause timestamp + paused duration accumulation.
- [x] Running elapsed timer and final duration ➜ `useNow` hook + time utility formatting.
- [x] Billing from session duration ➜ `totalForSession` and `costForElapsed` with hourly rate.
- [x] Configurable rates ➜ Toolbar rate input updating central store config.
- [x] Running and final totals ➜ Table card live totals and stop-session toast total.
- [x] Predictable centralized actions ➜ Typed actions in a single Zustand store.
- [x] Time utility determinism ➜ Domain functions accept explicit `now` for testability.
- [x] Dashboard UX parity ➜ grid layout, controls, statuses, toast feedback.
- [x] Responsive desktop/mobile behavior ➜ CSS grid/flex with media query handling.
- [x] Theme support (light/dark) ➜ `useTheme` hook and CSS variable themes.

## Tests

```bash
npm run test
```

Covers:
- auth gating,
- session start/stop edge cases,
- pause/resume lifecycle,
- billing math and elapsed time calculations.
