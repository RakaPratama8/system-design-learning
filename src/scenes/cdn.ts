import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'user', label: 'User', x: 50, y: 100, icon: 'person' },
    { id: 'edge', label: 'Edge server', x: 190, y: 42, icon: 'cdn-edge' },
    { id: 'origin', label: 'Origin', x: 330, y: 100, icon: 'server' },
  ],
  edges: [
    { from: 'user', to: 'origin' },
    { from: 'user', to: 'edge' },
    { from: 'edge', to: 'origin' },
  ],
  steps: [
    {
      caption: 'The origin server is in one region. A user far away must reach it across a long distance.',
      marker: ['user', 'origin'],
      states: { origin: { status: 'ok', fill: 0.3, label: 'far away' } },
    },
    {
      caption: 'A CDN places edge servers close to users in many cities.',
      highlight: ['edge'],
      states: { edge: { status: 'ok', fill: 0, label: 'empty' } },
    },
    {
      caption: 'First request: the edge does not have the file, so it fetches it from the origin.',
      marker: ['user', 'edge', 'origin'],
      states: { origin: { status: 'ok', fill: 0.3, label: 'serves once' } },
    },
    {
      caption: 'The edge keeps a copy and sends the file to the user.',
      marker: ['origin', 'edge', 'user'],
      states: { edge: { status: 'ok', fill: 0.3, label: 'cached' } },
    },
    {
      caption: 'Later requests are answered by the nearby edge. The origin is not touched.',
      marker: ['user', 'edge', 'user'],
      states: { origin: { status: 'ok', fill: 0.05, label: 'idle' } },
    },
    {
      caption: 'Cached copies expire after a time limit or are purged when you publish a new version.',
      highlight: ['edge'],
      states: { edge: { status: 'ok', fill: 0.3, label: 'expires' } },
    },
  ],
};

export default scene;
