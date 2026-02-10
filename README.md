# Billiards Manager (Production-Oriented Next.js App)

A production-oriented billiards hall management application built with **Next.js App Router + TypeScript**.

## What makes this production-ready

- **Server-enforced authentication** using signed, HTTP-only session cookies.
- **Route protection** via `middleware.ts` for dashboard and management APIs.
- **Backend-owned business logic** for table lifecycle operations (start/pause/resume/stop).
- **Persistent backend state** in `data/state.json` managed by server utilities.
- **Deterministic billing/time helpers** with explicit timestamp support for tests.
- **Responsive dashboard UI** with live elapsed timer, running totals, toast feedback, and theme toggle.

## Architecture Summary

- `app/`:
  - `/` login screen,
  - `/dashboard` protected management interface,
  - `/api/*` authenticated operational endpoints.
- `lib/server/auth.ts`: credential validation + cookie token signing/parsing.
- `lib/server/state.ts`: persistent state read/write and lifecycle transitions.
- `lib/billing.ts` + `lib/time.ts`: reusable domain math and formatting utilities.
- `components/dashboard-client.tsx`: live operational UI bound to backend APIs.

## Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Required environment variables for production
   ```bash
   export BMAPP_ADMIN_USER=admin
   export BMAPP_ADMIN_PASSWORD=change-this
   export SESSION_SECRET='a-long-random-secret'
   ```
   > In production, the app now fails fast if these are missing to prevent insecure fallback credentials.

2. Optional environment overrides
   ```bash
   export BMAPP_ADMIN_USER=admin
   export BMAPP_ADMIN_PASSWORD=admin123
   export SESSION_SECRET='change-this-in-production'
   ```

3. Start app
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`

## Feature Checklist (Parity Mapping)

- [x] Authentication / session handling → `/api/auth/login`, `/api/auth/logout`, signed cookie session, middleware-protected pages/APIs.
- [x] Access control gating → `middleware.ts` + server-side redirect checks.
- [x] Multiple table representation → persisted `tables[]` in `data/state.json`.
- [x] Table lifecycle transitions → `startTable`, `pauseTable`, `resumeTable`, `stopTable` in `lib/server/state.ts`.
- [x] Start/stop timing sessions with accurate elapsed tracking → `sessionElapsedMs` with paused time subtraction.
- [x] Configurable pricing and billing → `/api/rates` + `totalForSession`/`costForElapsed`.
- [x] Running and final totals → dashboard card live totals + stop response message.
- [x] Centralized predictable state management → server-owned state transition layer.
- [x] Persistence across reloads → file-backed state (`data/state.json`).
- [x] Deterministic time utilities for testability → functions accept explicit timestamps.
- [x] Dashboard UX parity + responsive + dark/light theme + toasts.

## Validation tests

```bash
npm run test
```

Covers:
- auth credential and token verification,
- billing/time calculation correctness,
- lifecycle transitions and transition guard errors,
- rate validation.


## Production notes

- This repo currently persists hall state to `data/state.json`. On ephemeral/serverless environments, prefer migrating to a managed database for durable multi-instance state.
- `next` dependency has been bumped from `14.2.5` to `14.2.33` to address the security advisory shown in Vercel build output.

