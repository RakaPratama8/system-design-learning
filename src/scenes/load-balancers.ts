import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'client', label: 'Clients', x: 50, y: 100 },
    { id: 'lb', label: 'Balancer', x: 150, y: 100 },
    { id: 's1', label: 'Server 1', x: 310, y: 40 },
    { id: 's2', label: 'Server 2', x: 310, y: 100 },
    { id: 's3', label: 'Server 3', x: 310, y: 160 },
  ],
  edges: [
    { from: 'client', to: 'lb' },
    { from: 'lb', to: 's1' },
    { from: 'lb', to: 's2' },
    { from: 'lb', to: 's3' },
  ],
  steps: [
    { caption: 'A request arrives at the load balancer, not at a server.', marker: ['client', 'lb'] },
    {
      caption: 'The load balancer picks Server 1 and forwards the request.',
      marker: ['client', 'lb', 's1'],
      states: { s1: { status: 'ok', fill: 0.33 } },
    },
    {
      caption: 'The next request goes to Server 2, then Server 3: round robin shares the work.',
      marker: ['lb', 's2', 'lb', 's3'],
      states: { s2: { status: 'ok', fill: 0.33 }, s3: { status: 'ok', fill: 0.33 } },
    },
    {
      caption: 'Server 3 stops answering health checks. The load balancer skips it, and the others pick up its share.',
      marker: ['lb', 's3'],
      states: {
        s1: { status: 'ok', fill: 0.5 },
        s2: { status: 'ok', fill: 0.5 },
        s3: { status: 'down', label: 'off' },
      },
    },
    {
      caption: 'When Server 3 is repaired it rejoins and the load evens out again.',
      marker: ['lb', 's3'],
      states: {
        s1: { status: 'ok', fill: 0.33 },
        s2: { status: 'ok', fill: 0.33 },
        s3: { status: 'ok', fill: 0.33 },
      },
    },
  ],
};

export default scene;
