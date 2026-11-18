import { describe, expect, it } from 'vitest';
import sim from '../src/sims/load-balancers';
import type { ControlValues } from '../src/engine/types';

const defaults = (): ControlValues => Object.fromEntries(sim.controls.map((c) => [c.id, c.default]));
const run = (over: ControlValues = {}) => sim.run({ ...defaults(), ...over });
const readout = (r: ReturnType<typeof run>, label: string) => r.readouts.find((x) => x.label === label)?.value;

describe('load balancer sim', () => {
  it('spreads default traffic evenly', () => {
    const r = run();
    for (const id of ['s1', 's2', 's3']) expect(r.states[id]).toEqual({ status: 'ok', fill: 0.5 });
    expect(readout(r, 'Dropped')).toBe('0%');
  });

  it('redistributes load and marks a dead server down', () => {
    const r = run({ s3: false });
    expect(r.states.s1.fill).toBe(0.75);
    expect(r.states.s2.fill).toBe(0.75);
    expect(r.states.s3.status).toBe('down');
  });

  it('overloads the last survivor and reports dropped traffic', () => {
    const r = run({ s2: false, s3: false, traffic: 250 });
    expect(r.states.s1).toEqual({ status: 'hot', fill: 1 });
    expect(readout(r, 'Dropped')).toBe('60%');
    const s1 = r.routes.filter((x) => x.path.includes('s1'));
    expect(s1.find((x) => x.outcome === 'ok')!.weight).toBeCloseTo(100);
    expect(s1.find((x) => x.outcome === 'fail')!.weight).toBeCloseTo(150);
  });

  it('handles zero traffic', () => {
    const r = run({ traffic: 0 });
    for (const id of ['s1', 's2', 's3']) expect(r.states[id].fill).toBe(0);
    expect(readout(r, 'Dropped')).toBe('0%');
  });

  it('fails every request when all servers are down', () => {
    const r = run({ s1: false, s2: false, s3: false });
    expect(r.routes).toEqual([{ path: ['client', 'lb'], weight: 1, outcome: 'fail' }]);
    expect(readout(r, 'Dropped')).toBe('100%');
  });

  it('never produces NaN or Infinity', () => {
    for (const s1 of [true, false]) for (const s2 of [true, false]) for (const s3 of [true, false]) {
      for (const traffic of [0, 10, 100, 400]) {
        const r = run({ s1, s2, s3, traffic });
        const text = JSON.stringify(r);
        expect(text).not.toMatch(/NaN|Infinity|null/);
      }
    }
  });
});
