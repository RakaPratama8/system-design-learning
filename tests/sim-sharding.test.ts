import { describe, expect, it } from 'vitest';
import sim from '../src/sims/sharding';
import type { ControlValues } from '../src/engine/types';

const defaults = (): ControlValues => Object.fromEntries(sim.controls.map((c) => [c.id, c.default]));
const run = (over: ControlValues = {}) => sim.run({ ...defaults(), ...over });
const readout = (r: ReturnType<typeof run>, label: string) => r.readouts.find((x) => x.label === label)?.value;

describe('sharding sim', () => {
  it('spreads default traffic evenly across four shards', () => {
    const r = run();
    for (const id of ['shard1', 'shard2', 'shard3', 'shard4']) expect(r.states[id]).toEqual({ status: 'ok', fill: 0.5 });
    expect(readout(r, 'Total capacity')).toBe('400 req/s');
  });

  it('overloads one shard with a hot key', () => {
    const r = run({ hotKey: true });
    expect(r.states.shard1).toEqual({ status: 'hot', fill: 1 });
    expect(r.states.shard2.fill).toBe(0.25);
    expect(readout(r, 'Busiest shard')).toBe('125%');
    const shard1 = r.routes.filter((x) => x.path.includes('shard1'));
    expect(shard1.find((x) => x.outcome === 'ok')!.weight).toBeCloseTo(100);
    expect(shard1.find((x) => x.outcome === 'fail')!.weight).toBeCloseTo(25);
  });

  it('marks shards beyond the chosen count as unused', () => {
    const r = run({ shards: 2 });
    expect(r.states.shard3).toEqual({ status: 'ok', fill: 0, label: 'unused' });
    expect(r.routes.every((x) => !x.path.includes('shard3'))).toBe(true);
    expect(readout(r, 'Total capacity')).toBe('200 req/s');
  });

  it('handles zero traffic', () => {
    const r = run({ traffic: 0, hotKey: true });
    expect(readout(r, 'Busiest shard')).toBe('0%');
    expect(JSON.stringify(r)).not.toMatch(/NaN|Infinity|null/);
  });
});
