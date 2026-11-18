import { loadState } from '../engine/sim/shared';
import type { ControlValues, Route, Sim, SimResult } from '../engine/types';

const CAPACITY = 100;
const SERVERS = ['s1', 's2', 's3'];

const sim: Sim = {
  controls: [
    { id: 's1', label: 'Server 1 up', kind: 'toggle', default: true },
    { id: 's2', label: 'Server 2 up', kind: 'toggle', default: true },
    { id: 's3', label: 'Server 3 up', kind: 'toggle', default: true },
    { id: 'traffic', label: 'Traffic (req/s)', kind: 'slider', min: 0, max: 400, step: 10, default: 150 },
  ],
  run(values: ControlValues): SimResult {
    const traffic = Number(values.traffic) || 0;
    const alive = SERVERS.filter((id) => Boolean(values[id]));
    const share = alive.length > 0 ? traffic / alive.length : 0;
    const states: SimResult['states'] = { client: { status: 'ok' }, lb: { status: 'ok' } };
    for (const id of SERVERS) {
      states[id] = alive.includes(id) ? loadState(share, CAPACITY) : { status: 'down', label: 'off' };
    }
    const dropped = traffic === 0 ? 0 : Math.max(0, traffic - alive.length * CAPACITY) / traffic;
    const routes: Route[] =
      alive.length === 0
        ? [{ path: ['client', 'lb'], weight: 1, outcome: 'fail' }]
        : alive.map((id) => ({
            path: ['client', 'lb', id],
            weight: share,
            outcome: share > CAPACITY ? 'fail' : 'ok',
          }));
    return {
      states,
      readouts: [{ label: 'Dropped', value: `${Math.round(dropped * 100)}%` }],
      routes,
      trafficRate: traffic,
    };
  },
};

export default sim;
