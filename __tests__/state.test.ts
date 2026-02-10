import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { pauseTable, readState, resumeTable, setRate, startTable, stopTable } from '@/lib/server/state';

describe('persistent hall state', () => {
  const original = process.cwd();
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bmapp-'));
    await fs.mkdir(path.join(tempDir, 'data'), { recursive: true });
    await fs.writeFile(
      path.join(tempDir, 'data', 'state.json'),
      JSON.stringify({
        tables: [{ id: 'table-1', name: 'Table 1', status: 'available' }],
        sessions: {},
        rates: { defaultHourlyRate: 10 },
        updatedAt: 0
      })
    );
    process.chdir(tempDir);
  });

  afterEach(async () => {
    process.chdir(original);
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('handles start pause resume stop lifecycle', async () => {
    expect((await startTable('table-1', 0)).ok).toBe(true);
    expect((await pauseTable('table-1', 10_000)).ok).toBe(true);
    expect((await resumeTable('table-1', 25_000)).ok).toBe(true);
    const stop = await stopTable('table-1', 3_600_000);

    expect(stop.ok).toBe(true);
    expect(stop.total).toBe(9.96);
    const final = await readState();
    expect(final.tables[0].status).toBe('available');
  });

  it('rejects invalid transitions and bad rate', async () => {
    expect((await stopTable('table-1', 0)).ok).toBe(false);
    expect((await setRate(0)).ok).toBe(false);
    expect((await setRate(20)).ok).toBe(true);
  });
});
