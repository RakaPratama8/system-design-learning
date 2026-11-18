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
    expect(r.routes.every((x) => x.path.join() === 'client,app,db')).toBe(true);
    expect(r.routes.find((x) => x.outcome === 'ok')!.weight).toBeCloseTo(0.5);
    expect(r.routes.find((x) => x.outcome === 'fail')!.weight).toBeCloseTo(0.5);
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
    const misses = r.routes.filter((x) => x.path.includes('cache') && x.path.includes('db'));
    expect(misses.reduce((sum, x) => sum + x.weight, 0)).toBeCloseTo(1);
  });

  it('handles zero traffic', () => {
    const r = run({ traffic: 0 });
    expect(readout(r, 'DB load')).toBe('0 req/s');
    expect(JSON.stringify(r)).not.toMatch(/NaN|Infinity|null/);
  });

  it('drops only the misses the database cannot absorb', () => {
    const failing = (r: ReturnType<typeof run>) => r.routes.filter((x) => x.outcome === 'fail');
    expect(failing(run({ cacheSize: 0, traffic: 100 }))).toHaveLength(0);
    expect(failing(run({ cacheSize: 0, traffic: 110 }))[0].weight).toBeGreaterThan(0);
  });
});
