import { describe, expect, it } from 'vitest';
import sim from '../src/sims/caching';
import type { ControlValues } from '../src/engine/types';

const defaults = (): ControlValues => Object.fromEntries(sim.controls.map((c) => [c.id, c.default]));
const run = (over: ControlValues = {}) => sim.run({ ...defaults(), ...over });
const readout = (r: ReturnType<typeof run>, label: string) => r.readouts.find((x) => x.label === label)?.value;

describe('caching sim', () => {
  it('sends everything to an overloaded database when the cache is off', () => {
    const r = run({ cacheOn: false, traffic: 200 });
    expect(readout(r, 'Hit rate')).toBe('0%');
    expect(r.states.db).toEqual({ status: 'hot', fill: 1 });
    expect(r.states.cache.status).toBe('down');
    expect(r.routes).toHaveLength(1);
    expect(r.routes[0].path).toEqual(['client', 'app', 'db']);
    expect(r.routes[0].outcome).toBe('fail');
  });

  it('shields the database with a full-size cache', () => {
    const r = run({ cacheOn: true, cacheSize: 100, traffic: 200 });
    expect(readout(r, 'Hit rate')).toBe('95%');
    expect(readout(r, 'DB load')).toBe('10 req/s');
    expect(r.states.db.status).toBe('ok');
    expect(r.states.db.fill).toBeCloseTo(0.1);
    expect(r.states.cache).toEqual({ status: 'ok', fill: 1 });
  });

  it('has no hits with an empty cache', () => {
    const r = run({ cacheSize: 0 });
    expect(readout(r, 'Hit rate')).toBe('0%');
    expect(r.routes.find((x) => x.path.includes('cache') && x.path.includes('db'))!.weight).toBe(1);
  });

  it('handles zero traffic', () => {
    const r = run({ traffic: 0 });
    expect(readout(r, 'DB load')).toBe('0 req/s');
    expect(JSON.stringify(r)).not.toMatch(/NaN|Infinity|null/);
  });

  it('fails misses exactly when the database load exceeds its capacity', () => {
    const miss = (r: ReturnType<typeof run>) => r.routes.find((x) => x.path.includes('db'))!;
    expect(miss(run({ cacheSize: 0, traffic: 100 })).outcome).toBe('ok');
    expect(miss(run({ cacheSize: 0, traffic: 110 })).outcome).toBe('fail');
  });
});
