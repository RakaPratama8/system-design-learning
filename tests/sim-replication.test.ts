import { describe, expect, it } from 'vitest';
import sim from '../src/sims/replication';
import type { ControlValues } from '../src/engine/types';

const defaults = (): ControlValues => Object.fromEntries(sim.controls.map((c) => [c.id, c.default]));
const run = (over: ControlValues = {}) => sim.run({ ...defaults(), ...over });
const readout = (r: ReturnType<typeof run>, label: string) => r.readouts.find((x) => x.label === label)?.value;

describe('replication sim', () => {
  it('has a healthy primary and replicas sharing reads by default', () => {
    const r = run();
    expect(readout(r, 'Writes')).toBe('available');
    expect(r.states.primary.status).toBe('ok');
    expect(r.states.r1).toEqual({ status: 'ok', fill: 0.5 });
    expect(r.states.r2).toEqual({ status: 'ok', fill: 0.5 });
    expect(readout(r, 'Stale read window')).toBe('50 ms');
    expect(readout(r, 'Reads served')).toBe('100%');
  });

  it('loses writes when the primary dies without failover', () => {
    const r = run({ primaryUp: false, failover: false });
    expect(r.states.primary.status).toBe('down');
    expect(readout(r, 'Writes')).toBe('unavailable');
    expect(r.routes.some((x) => x.path.join() === 'app' && x.outcome === 'fail')).toBe(true);
  });

  it('promotes a replica when failover is on', () => {
    const r = run({ primaryUp: false, failover: true });
    expect(r.states.r1.label).toBe('new primary');
    expect(readout(r, 'Writes')).toBe('available');
    expect(r.states.r2.fill).toBe(1);
    expect(r.routes.some((x) => x.path.join() === 'app,r1')).toBe(true);
  });

  it('serves nothing when every node is down, without NaN', () => {
    const r = run({ primaryUp: false, r1Up: false, r2Up: false });
    expect(readout(r, 'Reads served')).toBe('0%');
    expect(JSON.stringify(r)).not.toMatch(/NaN|Infinity|null/);
  });

  it('reports partial service when replicas are overloaded', () => {
    expect(readout(run({ readTraffic: 300 }), 'Reads served')).toBe('67%');
  });

  it('handles zero read traffic', () => {
    const r = run({ readTraffic: 0 });
    expect(r.states.r1.fill).toBe(0);
    expect(readout(r, 'Reads served')).toBe('100%');
  });

  it('shows the configured replication lag', () => {
    expect(readout(run({ lag: 300 }), 'Stale read window')).toBe('300 ms');
  });
});
