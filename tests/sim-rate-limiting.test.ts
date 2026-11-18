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

  it('does not under-serve steady traffic when the bucket is smaller than one second of refill', () => {
    const r = run({ rate: 50, burst: 1, traffic: 10 });
    expect(readout(r, 'Rejected (429)')).toBe('0');
  });

  it('labels the limiter bar with the share of requests rejected', () => {
    expect(run().states.limiter.label).toBe('44% rejected');
    expect(run({ traffic: 0 }).states.limiter.label).toBe('0% rejected');
  });
});
