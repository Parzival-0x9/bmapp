'use client';

import { AuthGate } from '@/components/auth-gate';
import { Dashboard } from '@/components/dashboard';
import { Toast } from '@/components/toast';
import { useAppStore } from '@/lib/store';

export default function HomePage() {
  const toast = useAppStore((s) => s.toast);
  const clearToast = useAppStore((s) => s.clearToast);

  return (
    <AuthGate>
      <Dashboard />
      {toast && <Toast message={toast} onClose={clearToast} />}
    </AuthGate>
  );
}
