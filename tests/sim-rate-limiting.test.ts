import { describe, expect, it } from 'vitest';
import sim from '../src/sims/rate-limiting';
import type { ControlValues } from '../src/engine/types';

const defaults = (): ControlValues => Object.fromEntries(sim.controls.map((c) => [c.id, c.default]));
const run = (over: ControlValues = {}) => sim.run({ ...defaults(), ...over });
const readout = (r: ReturnType<typeof run>, label: string) => r.readouts.find((x) => x.label === label)?.value;

describe('rate limiting sim', () => {
  it('counts allowed and rejected requests over the 10 second pattern', () => {
    const r = run();
    expect(readout(r, 'Allowed')).toBe('110');
    expect(readout(r, 'Rejected (429)')).toBe('85');
    expect(r.states.limiter.status).toBe('hot');
  });

  it('rejects nothing when traffic stays below the rate', () => {
    const r = run({ traffic: 2, rate: 10, burst: 20 });
    expect(readout(r, 'Rejected (429)')).toBe('0');
    expect(r.states.limiter.status).toBe('ok');
  });

  it('handles zero traffic', () => {
    const r = run({ traffic: 0 });
    expect(readout(r, 'Allowed')).toBe('0');
    expect(readout(r, 'Rejected (429)')).toBe('0');
    expect(r.states.limiter.fill).toBe(0);
    expect(JSON.stringify(r)).not.toMatch(/NaN|Infinity|null/);
  });

  it('routes rejected requests only as far as the limiter', () => {
    const rejected = run().routes.find((x) => x.outcome === 'fail')!;
    expect(rejected.path).toEqual(['client', 'limiter']);
    const allowed = run().routes.find((x) => x.outcome === 'ok')!;
    expect(allowed.path).toEqual(['client', 'limiter', 'api']);
  });
});
