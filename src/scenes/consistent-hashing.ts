import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'sa', label: 'Server A', x: 200, y: 44, icon: 'server' },
    { id: 'sb', label: 'Server B', x: 345, y: 100, icon: 'server' },
    { id: 'sc', label: 'Server C', x: 200, y: 156, icon: 'server' },
    { id: 'sd', label: 'Server D', x: 50, y: 100, icon: 'server' },
    { id: 'k1', label: 'Key 1', x: 280, y: 48, icon: 'key' },
    { id: 'k2', label: 'Key 2', x: 110, y: 152, icon: 'key' },
  ],
  edges: [
    { from: 'sa', to: 'sb' },
    { from: 'sb', to: 'sc' },
    { from: 'sc', to: 'sd' },
    { from: 'sd', to: 'sa' },
    { from: 'k1', to: 'sb' },
    { from: 'k2', to: 'sa' },
    { from: 'k2', to: 'sd' },
  ],
  steps: [
    {
      caption: 'Place servers and keys on the same ring. Each key belongs to the first server clockwise from it. (Server D is greyed; it joins later.)',
      highlight: ['sa>sb', 'sb>sc'],
      states: { sd: { status: 'ok', label: 'not added yet' } },
    },
    {
      caption: 'Key 1 sits between A and B, so Server B stores it.',
      marker: ['k1', 'sb'],
      states: { sb: { status: 'ok', fill: 0.3 }, sd: { status: 'ok', label: 'not added yet' } },
    },
    {
      caption: 'The first server clockwise from Key 2 is Server A, so A stores it.',
      marker: ['k2', 'sa'],
      states: {
        sa: { status: 'ok', fill: 0.3 },
        sb: { status: 'ok', fill: 0.3 },
        sd: { status: 'ok', label: 'not added yet' },
      },
    },
    {
      caption: 'A new server, D, joins the ring between C and A.',
      highlight: ['sd'],
      states: { sa: { status: 'ok', fill: 0.3 }, sb: { status: 'ok', fill: 0.3 }, sd: { status: 'ok', label: 'joined' } },
    },
    {
      caption: 'Only the keys that now sit just before D move to it, such as Key 2. Key 1 and everything else stay put.',
      marker: ['k2', 'sd'],
      states: { sa: { status: 'ok', fill: 0 }, sb: { status: 'ok', fill: 0.3 }, sd: { status: 'ok', fill: 0.3 } },
    },
    {
      caption: 'With "hash mod N", nearly every key would have moved. Real systems also give each server many points on the ring so load stays even.',
      highlight: ['sa', 'sb', 'sc', 'sd'],
    },
  ],
};

export default scene;
