import { NextResponse } from 'next/server';
import { stopTable } from '@/lib/server/state';

export async function POST(_: Request, { params }: { params: { tableId: string } }) {
  const result = await stopTable(params.tableId, Date.now());
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
