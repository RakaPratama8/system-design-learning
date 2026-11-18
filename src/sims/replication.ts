import { loadState, splitRoute } from '../engine/sim/shared';
import type { ControlValues, NodeState, Route, Sim, SimResult } from '../engine/types';

const CAPACITY = 100;
const WRITE_SHARE = 0.25; // illustrative: one write for every four reads

const sim: Sim = {
  controls: [
    { id: 'primaryUp', label: 'Primary up', kind: 'toggle', default: true },
    { id: 'failover', label: 'Automatic failover', kind: 'toggle', default: false },
    { id: 'r1Up', label: 'Replica 1 up', kind: 'toggle', default: true },
    { id: 'r2Up', label: 'Replica 2 up', kind: 'toggle', default: true },
    { id: 'lag', label: 'Replication lag (ms)', kind: 'slider', min: 0, max: 500, step: 10, default: 50 },
    { id: 'readTraffic', label: 'Read traffic (req/s)', kind: 'slider', min: 0, max: 300, step: 10, default: 100 },
  ],
  run(values: ControlValues): SimResult {
    const reads = Math.max(0, Number(values.readTraffic) || 0);
    const lag = Math.max(0, Number(values.lag) || 0);
    const upReplicas = ['r1', 'r2'].filter((id) => Boolean(values[`${id}Up`]));
    const primaryUp = Boolean(values.primaryUp);
    const writer = primaryUp ? 'primary' : values.failover ? upReplicas[0] : undefined;
    const readers = upReplicas.filter((id) => id !== writer);
    const servers = readers.length > 0 ? readers : writer ? [writer] : [];
    const load = servers.length > 0 ? reads / servers.length : 0;

    const states: Record<string, NodeState> = { app: { status: 'ok' } };
    states.primary = primaryUp ? { status: 'ok' } : { status: 'down', label: 'off' };
    for (const id of ['r1', 'r2']) {
      if (!upReplicas.includes(id)) states[id] = { status: 'down', label: 'off' };
      else states[id] = servers.includes(id) ? loadState(load, CAPACITY) : { status: 'ok' };
    }
    if (writer && writer !== 'primary') states[writer] = { ...states[writer], label: 'new primary' };

    const routes: Route[] = [
      writer
        ? { path: ['app', writer], weight: reads * WRITE_SHARE, outcome: 'ok' }
        : { path: ['app'], weight: reads * WRITE_SHARE, outcome: 'fail' },
    ];
    if (servers.length === 0) routes.push({ path: ['app'], weight: reads, outcome: 'fail' });
    for (const id of servers) routes.push(...splitRoute(['app', id], load, load, CAPACITY));

    const served = reads === 0 ? 1 : Math.min(1, (servers.length * CAPACITY) / reads);
    return {
      states,
      readouts: [
        { label: 'Writes', value: writer ? 'available' : 'unavailable' },
        { label: 'Stale read window', value: `${lag} ms` },
        { label: 'Reads served', value: `${Math.round(served * 100)}%` },
      ],
      routes,
      trafficRate: reads,
    };
  },
};

export default sim;
