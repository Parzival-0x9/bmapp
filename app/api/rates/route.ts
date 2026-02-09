import { NextResponse } from 'next/server';
import { ensureApiUser } from '@/lib/server/api-auth';
import { setRate } from '@/lib/server/state';

export async function POST(req: Request) {
  const { unauthorized } = await ensureApiUser();
  if (unauthorized) return unauthorized;

  const body = await req.json().catch(() => null);
  const hourlyRate = Number(body?.hourlyRate);
  const result = await setRate(hourlyRate);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
