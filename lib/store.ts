'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { totalForSession } from './billing';
import { systemClock } from './time';
import { AppRateConfig, AuthUser, BilliardsTable, SessionRecord } from './types';

export interface AppState {
  authUser: AuthUser | null;
  tables: BilliardsTable[];
  sessions: Record<string, SessionRecord>;
  rates: AppRateConfig;
  toast: string | null;
  signIn: (name: string) => void;
  signOut: () => void;
  setRate: (hourlyRate: number) => void;
  startTable: (tableId: string, now?: number) => { ok: boolean; message: string };
  stopTable: (tableId: string, now?: number) => { ok: boolean; message: string; total?: number };
  pauseTable: (tableId: string, now?: number) => { ok: boolean; message: string };
  resumeTable: (tableId: string, now?: number) => { ok: boolean; message: string };
  clearToast: () => void;
}

const defaultTables: BilliardsTable[] = Array.from({ length: 8 }, (_, idx) => ({
  id: `table-${idx + 1}`,
  name: `Table ${idx + 1}`,
  status: 'available'
}));

const pushToast = <T extends AppState>(state: T, message: string): T => ({ ...state, toast: message });

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      authUser: null,
      tables: defaultTables,
      sessions: {},
      rates: { defaultHourlyRate: 15 },
      toast: null,
      signIn: (name) =>
        set((state) => ({
          ...pushToast(state, `Welcome, ${name}!`),
          authUser: { id: `user-${name.toLowerCase()}`, name, role: 'manager' }
        })),
      signOut: () =>
        set((state) => ({
          ...state,
          authUser: null,
          toast: 'Signed out successfully.'
        })),
      setRate: (hourlyRate) =>
        set((state) => ({
          ...state,
          rates: { defaultHourlyRate: hourlyRate },
          toast: `Updated default hourly rate to $${hourlyRate.toFixed(2)}`
        })),
      startTable: (tableId, now = systemClock.now()) => {
        const state = get();
        const table = state.tables.find((t) => t.id === tableId);
        if (!table) return { ok: false, message: 'Table not found.' };
        if (table.status !== 'available') return { ok: false, message: 'Table is not available.' };

        const sessionId = `session-${tableId}-${now}`;
        const session: SessionRecord = {
          id: sessionId,
          tableId,
          startedAt: now,
          pausedDurationMs: 0,
          hourlyRate: state.rates.defaultHourlyRate
        };

        set((s) => ({
          ...s,
          sessions: { ...s.sessions, [sessionId]: session },
          tables: s.tables.map((t) =>
            t.id === tableId ? { ...t, status: 'occupied', activeSessionId: sessionId } : t
          ),
          toast: `${table.name} session started.`
        }));
        return { ok: true, message: 'Session started.' };
      },
      stopTable: (tableId, now = systemClock.now()) => {
        const state = get();
        const table = state.tables.find((t) => t.id === tableId);
        if (!table) return { ok: false, message: 'Table not found.' };
        if (!table.activeSessionId) return { ok: false, message: 'No active session.' };

        const current = state.sessions[table.activeSessionId];
        if (!current || current.endedAt) return { ok: false, message: 'Session already ended.' };
        const ended = { ...current, endedAt: now };
        const total = totalForSession(ended, now);

        set((s) => ({
          ...s,
          sessions: { ...s.sessions, [ended.id]: ended },
          tables: s.tables.map((t) =>
            t.id === tableId ? { ...t, status: 'available', activeSessionId: undefined } : t
          ),
          toast: `${table.name} ended. Total: $${total.toFixed(2)}`
        }));

        return { ok: true, message: 'Session stopped.', total };
      },
      pauseTable: (tableId, now = systemClock.now()) => {
        const state = get();
        const table = state.tables.find((t) => t.id === tableId);
        if (!table?.activeSessionId) return { ok: false, message: 'No active session.' };
        if (table.status !== 'occupied') return { ok: false, message: 'Table is not running.' };
        const session = state.sessions[table.activeSessionId];
        if (!session) return { ok: false, message: 'Session not found.' };

        set((s) => ({
          ...s,
          sessions: { ...s.sessions, [session.id]: { ...session, pausedAt: now } },
          tables: s.tables.map((t) => (t.id === tableId ? { ...t, status: 'paused' } : t)),
          toast: `${table.name} paused.`
        }));

        return { ok: true, message: 'Paused.' };
      },
      resumeTable: (tableId, now = systemClock.now()) => {
        const state = get();
        const table = state.tables.find((t) => t.id === tableId);
        if (!table?.activeSessionId) return { ok: false, message: 'No active session.' };
        if (table.status !== 'paused') return { ok: false, message: 'Table is not paused.' };
        const session = state.sessions[table.activeSessionId];
        if (!session) return { ok: false, message: 'Session not found.' };

        const pausedAt = session.pausedAt ?? now;
        const additionalPaused = Math.max(0, now - pausedAt);

        set((s) => ({
          ...s,
          sessions: {
            ...s.sessions,
            [session.id]: {
              ...session,
              pausedAt: undefined,
              pausedDurationMs: session.pausedDurationMs + additionalPaused
            }
          },
          tables: s.tables.map((t) => (t.id === tableId ? { ...t, status: 'occupied' } : t)),
          toast: `${table.name} resumed.`
        }));

        return { ok: true, message: 'Resumed.' };
      },
      clearToast: () => set((state) => ({ ...state, toast: null }))
    }),
    {
      name: 'bmapp-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        authUser: state.authUser,
        tables: state.tables,
        sessions: state.sessions,
        rates: state.rates
      })
    }
  )
);
