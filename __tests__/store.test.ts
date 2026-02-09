import { useAppStore } from '@/lib/store';

const resetStore = () => {
  useAppStore.setState({
    authUser: null,
    tables: Array.from({ length: 2 }, (_, idx) => ({
      id: `table-${idx + 1}`,
      name: `Table ${idx + 1}`,
      status: 'available' as const
    })),
    sessions: {},
    rates: { defaultHourlyRate: 15 },
    toast: null
  });
};

describe('store workflow', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it('handles auth sign-in/out', () => {
    const { signIn, signOut } = useAppStore.getState();
    signIn('Alex');
    expect(useAppStore.getState().authUser?.name).toBe('Alex');
    signOut();
    expect(useAppStore.getState().authUser).toBeNull();
  });

  it('prevents double starting and supports stop billing', () => {
    const now = 1_000;
    const { startTable, stopTable } = useAppStore.getState();

    expect(startTable('table-1', now).ok).toBe(true);
    expect(startTable('table-1', now + 5_000).ok).toBe(false);

    const result = stopTable('table-1', now + 60 * 60 * 1000);
    expect(result.ok).toBe(true);
    expect(result.total).toBe(15);
  });

  it('supports pause and resume lifecycle', () => {
    const { startTable, pauseTable, resumeTable } = useAppStore.getState();
    startTable('table-1', 0);
    expect(pauseTable('table-1', 10_000).ok).toBe(true);
    expect(resumeTable('table-1', 25_000).ok).toBe(true);

    const table = useAppStore.getState().tables.find((t) => t.id === 'table-1');
    const sessionId = table?.activeSessionId!;
    const session = useAppStore.getState().sessions[sessionId];
    expect(session.pausedDurationMs).toBe(15_000);
  });
});
