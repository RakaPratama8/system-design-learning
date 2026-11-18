import { loadState, splitRoute } from '../engine/sim/shared';
import { shardLoads } from '../engine/sim/shardLoads';
import type { ControlValues, NodeState, Route, Sim, SimResult } from '../engine/types';

const CAPACITY = 100;
const MAX_SHARDS = 4;

const sim: Sim = {
  controls: [
    { id: 'shards', label: 'Number of shards', kind: 'slider', min: 1, max: MAX_SHARDS, step: 1, default: 4 },
    { id: 'hotKey', label: 'One hot key', kind: 'toggle', default: false },
    { id: 'traffic', label: 'Traffic (req/s)', kind: 'slider', min: 0, max: 400, step: 10, default: 200 },
  ],
  run(values: ControlValues): SimResult {
    const shards = Math.min(MAX_SHARDS, Math.max(1, Math.round(Number(values.shards) || 1)));
    const traffic = Math.max(0, Number(values.traffic) || 0);
    const loads = shardLoads(shards, traffic, Boolean(values.hotKey));
    const states: Record<string, NodeState> = { client: { status: 'ok' }, router: { status: 'ok' } };
    const routes: Route[] = [];
    for (let i = 0; i < MAX_SHARDS; i++) {
      const id = `shard${i + 1}`;
      if (i < shards) {
        states[id] = loadState(loads[i], CAPACITY);
        routes.push(...splitRoute(['client', 'router', id], loads[i], loads[i], CAPACITY));
      } else {
        states[id] = { status: 'ok', fill: 0, label: 'unused' };
      }
    }
    return {
      states,
      readouts: [
        { label: 'Busiest shard', value: `${Math.round((Math.max(...loads) / CAPACITY) * 100)}%` },
        { label: 'Total capacity', value: `${shards * CAPACITY} req/s` },
      ],
      routes,
      trafficRate: traffic,
    };
  },
};

export default sim;
