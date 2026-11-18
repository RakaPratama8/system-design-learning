import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'numbers',
  items: [
    { id: 'latency', label: 'Latency', unit: 'ms', max: 500 },
    { id: 'throughput', label: 'Throughput', unit: 'req/s', max: 400 },
  ],
  steps: [
    { caption: 'Latency is how long one request takes from start to finish. Here, 100 ms.', values: { latency: 100 } },
    { caption: 'Throughput is how many requests finish each second. One worker handling 100 ms jobs one by one completes 10 per second.', values: { throughput: 10 } },
    { caption: 'Add nine more workers in parallel. Each request still takes 100 ms, but throughput is now 100 per second.', values: { throughput: 100 } },
    { caption: 'Push in more traffic than the workers can handle. Requests wait in a queue, so latency climbs while throughput stays capped.', values: { latency: 400, throughput: 100 } },
    { caption: 'Make each request twice as fast: latency halves and throughput doubles.', values: { latency: 50, throughput: 200 } },
    { caption: 'Batching trades one for the other: work in bigger groups raises throughput but each request waits longer.', values: { latency: 300, throughput: 400 } },
  ],
};

export default scene;
