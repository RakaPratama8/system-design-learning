import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'app', label: 'App', x: 50, y: 100, icon: 'app' },
    { id: 'primary', label: 'Primary', x: 200, y: 40, icon: 'database' },
    { id: 'r1', label: 'Replica 1', x: 150, y: 160, icon: 'database' },
    { id: 'r2', label: 'Replica 2', x: 290, y: 160, icon: 'database' },
  ],
  edges: [
    { from: 'app', to: 'primary' },
    { from: 'app', to: 'r1' },
    { from: 'app', to: 'r2' },
    { from: 'primary', to: 'r1' },
    { from: 'primary', to: 'r2' },
  ],
  steps: [
    { caption: 'A write arrives. Writes always go to the primary.', marker: ['app', 'primary'] },
    {
      caption: 'The primary sends the change to every replica.',
      marker: ['primary', 'r1'],
      highlight: ['primary>r2'],
    },
    {
      caption: 'Reads can be answered by any replica, so read traffic is spread out.',
      marker: ['app', 'r1'],
      states: { r1: { status: 'ok', fill: 0.4 }, r2: { status: 'ok', fill: 0.4 } },
    },
    {
      caption: 'Copying takes time. A read from a replica that is behind can return old data.',
      highlight: ['r2'],
      states: { r2: { status: 'ok', fill: 0.4, label: 'behind' } },
    },
    {
      caption: 'If the primary fails, writes stop.',
      highlight: ['primary'],
      states: { primary: { status: 'down', label: 'off' } },
    },
    {
      caption: 'Failover promotes a replica to be the new primary, and writes resume.',
      marker: ['app', 'r1'],
      states: { r1: { status: 'ok', label: 'new primary' }, r2: { status: 'ok', fill: 0.8 } },
    },
  ],
};

export default scene;
