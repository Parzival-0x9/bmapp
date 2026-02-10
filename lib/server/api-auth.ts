import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';

export const ensureApiUser = async () => {
  const user = await requireUser();
  if (!user) {
    return {
      user: null,
      unauthorized: NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 })
    };
  }

  return { user, unauthorized: null };
};
