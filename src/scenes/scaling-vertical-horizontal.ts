import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'compare',
  leftTitle: 'Scale up',
  rightTitle: 'Scale out',
  left: {
    nodes: [
      { id: 'users', label: 'Users', x: 50, y: 100 },
      { id: 'server', label: 'Big server', x: 230, y: 100 },
    ],
    edges: [{ from: 'users', to: 'server' }],
  },
  right: {
    nodes: [
      { id: 'users', label: 'Users', x: 40, y: 100 },
      { id: 'lb', label: 'Balancer', x: 150, y: 100 },
      { id: 's1', label: 'Server 1', x: 310, y: 50 },
      { id: 's2', label: 'Server 2', x: 310, y: 100 },
      { id: 's3', label: 'Server 3', x: 310, y: 150 },
    ],
    edges: [
      { from: 'users', to: 'lb' },
      { from: 'lb', to: 's1' },
      { from: 'lb', to: 's2' },
      { from: 'lb', to: 's3' },
    ],
  },
  steps: [
    {
      caption: 'Traffic grows and the only server is nearly full.',
      left: { highlight: ['server'], states: { server: { status: 'hot', fill: 0.9, label: 'nearly full' } } },
      right: {
        highlight: ['s1'],
        states: {
          s1: { status: 'hot', fill: 0.9, label: 'nearly full' },
          s2: { status: 'ok', fill: 0, label: 'spare' },
          s3: { status: 'ok', fill: 0, label: 'spare' },
        },
      },
    },
    {
      caption: 'Scaling up (vertical): replace it with a bigger machine with more CPU and memory.',
      left: { states: { server: { status: 'ok', fill: 0.45, label: 'bigger' } } },
    },
    {
      caption: 'Scaling out (horizontal): add more machines and share the traffic with a load balancer.',
      right: {
        marker: ['users', 'lb', 's2'],
        states: { s1: { status: 'ok', fill: 0.3 }, s2: { status: 'ok', fill: 0.3 }, s3: { status: 'ok', fill: 0.3 } },
      },
    },
    {
      caption: 'Traffic doubles again. The big server is full, and there may be no larger machine to buy.',
      left: { highlight: ['server'], states: { server: { status: 'hot', fill: 1, label: 'ceiling' } } },
      right: { states: { s1: { status: 'ok', fill: 0.6 }, s2: { status: 'ok', fill: 0.6 }, s3: { status: 'ok', fill: 0.6 } } },
    },
    {
      caption: 'A failure hurts differently: one server down takes everything offline, while the other group carries on.',
      left: { states: { server: { status: 'down', label: 'failed' } } },
      right: {
        highlight: ['s3'],
        states: { s1: { status: 'ok', fill: 0.9 }, s2: { status: 'ok', fill: 0.9 }, s3: { status: 'down', label: 'failed' } },
      },
    },
  ],
};

export default scene;
