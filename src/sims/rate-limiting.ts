import { tokenBucket } from '../engine/sim/tokenBucket';
import type { ControlValues, Sim, SimResult } from '../engine/types';

const TICKS = 10;
const SPIKE_TICK = 3; // the fourth second carries a burst of four times the usual traffic

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

const sim: Sim = {
  controls: [
    { id: 'rate', label: 'Refill rate (tokens/s)', kind: 'slider', min: 1, max: 50, step: 1, default: 10 },
    { id: 'burst', label: 'Bucket size (burst)', kind: 'slider', min: 1, max: 100, step: 1, default: 20 },
    { id: 'traffic', label: 'Traffic (req/s)', kind: 'slider', min: 0, max: 100, step: 1, default: 15 },
  ],
  run(values: ControlValues): SimResult {
    const rate = Math.max(0, Number(values.rate) || 0);
    // One tick is a second: a bucket smaller than a second of refill would cap steady traffic below the refill rate.
    const burst = Math.max(Math.max(0, Number(values.burst) || 0), rate);
    const traffic = Math.max(0, Number(values.traffic) || 0);
    const arrivals = Array.from({ length: TICKS }, (_, i) => (i === SPIKE_TICK ? traffic * 4 : traffic));
    const { allowed, rejected } = tokenBucket({ rate, burst, arrivals });
    const allowedTotal = sum(allowed);
    const rejectedTotal = sum(rejected);
    const total = allowedTotal + rejectedTotal;
    return {
      states: {
        client: { status: 'ok' },
        limiter: {
          status: rejectedTotal > 0 ? 'hot' : 'ok',
          fill: total === 0 ? 0 : rejectedTotal / total,
          label: `${Math.round((total === 0 ? 0 : rejectedTotal / total) * 100)}% rejected`,
        },
        api: { status: 'ok' },
      },
      readouts: [
        { label: 'Allowed', value: String(allowedTotal) },
        { label: 'Rejected (429)', value: String(rejectedTotal) },
      ],
      routes: [
        { path: ['client', 'limiter', 'api'], weight: allowedTotal, outcome: 'ok' },
        { path: ['client', 'limiter'], weight: rejectedTotal, outcome: 'fail' },
      ],
      trafficRate: traffic,
    };
  },
};

export default sim;
