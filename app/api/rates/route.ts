import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { setRate } from '@/lib/server/state';

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => null);
  const hourlyRate = Number(body?.hourlyRate);
  const result = await setRate(hourlyRate);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
