import { redirect } from 'next/navigation';
import { DashboardClient } from '@/components/dashboard-client';
import { requireUser } from '@/lib/server/auth';
import { readState } from '@/lib/server/state';

export default async function DashboardPage() {
  const user = await requireUser();
  if (!user) redirect('/');

  const state = await readState();
  return <DashboardClient initialState={state} username={user.username} />;
}
