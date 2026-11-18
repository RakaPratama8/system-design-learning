import { loadState, splitRoute } from '../engine/sim/shared';
import type { ControlValues, Route, Sim, SimResult } from '../engine/types';

const DB_CAPACITY = 100;
const MAX_HIT_RATE = 0.95;

// Illustrative model: hit rate grows with cache size with diminishing returns, capped below 100%.
const sim: Sim = {
  controls: [
    { id: 'cacheOn', label: 'Cache on', kind: 'toggle', default: true },
    { id: 'cacheSize', label: 'Cache size (% of data)', kind: 'slider', min: 0, max: 100, step: 5, default: 50 },
    { id: 'traffic', label: 'Traffic (req/s)', kind: 'slider', min: 0, max: 400, step: 10, default: 200 },
  ],
  run(values: ControlValues): SimResult {
    const on = Boolean(values.cacheOn);
    const size = Math.min(100, Math.max(0, Number(values.cacheSize) || 0));
    const traffic = Math.max(0, Number(values.traffic) || 0);
    const hitRate = on ? MAX_HIT_RATE * Math.sqrt(size / 100) : 0;
    const dbLoad = traffic * (1 - hitRate);
    const routes: Route[] = [];
    if (on) routes.push({ path: ['client', 'app', 'cache'], weight: hitRate, outcome: 'ok' });
    routes.push(...splitRoute(on ? ['client', 'app', 'cache', 'app', 'db'] : ['client', 'app', 'db'], 1 - hitRate, dbLoad, DB_CAPACITY));
    return {
      states: {
        client: { status: 'ok' },
        app: { status: 'ok' },
        cache: on ? { status: 'ok', fill: size / 100 } : { status: 'down', label: 'off' },
        db: loadState(dbLoad, DB_CAPACITY),
      },
      readouts: [
        { label: 'Hit rate', value: `${Math.round(hitRate * 100)}%` },
        { label: 'DB load', value: `${Math.round(dbLoad)} req/s` },
      ],
      routes,
      trafficRate: traffic,
    };
  },
};

export default sim;
