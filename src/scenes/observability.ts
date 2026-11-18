import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'sequence',
  lanes: [
    { id: 'gateway', label: 'Gateway', icon: 'gateway' },
    { id: 'orders', label: 'Orders', icon: 'order' },
    { id: 'db', label: 'Database', icon: 'database' },
  ],
  steps: [
    {
      caption: 'A request enters through the gateway, which attaches a trace id so every service can record it.',
      message: { from: 'gateway', to: 'orders', label: 'GET /orders' },
      states: { gateway: { status: 'ok', label: 'trace 7f3a' } },
    },
    {
      caption: 'The Orders service queries the database.',
      message: { from: 'orders', to: 'db', label: 'query' },
    },
    {
      caption: 'The database answers, but slowly: 800 ms.',
      message: { from: 'db', to: 'orders', label: 'rows' },
      states: { db: { status: 'hot', label: '800 ms' } },
    },
    {
      caption: 'The response goes back. In total the request took about a second.',
      message: { from: 'orders', to: 'gateway', label: 'response' },
      states: { gateway: { status: 'ok', label: '1.0 s total' } },
    },
    {
      caption: 'Metrics are numbers over time. A dashboard shows that 99th percentile latency has jumped, so something is wrong.',
      states: { gateway: { status: 'hot', label: 'p99 up' } },
    },
    {
      caption: 'Logs are the detailed events. Searching by the trace id finds a "slow query" warning from Orders.',
      states: { orders: { status: 'ok', label: 'slow query log' } },
    },
    {
      caption: 'Traces link the steps of one request across services, so the slow database call is found in minutes.',
      states: { db: { status: 'hot', label: 'the culprit' } },
    },
  ],
};

export default scene;
