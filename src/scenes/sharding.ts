import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'client', label: 'Clients', x: 50, y: 100 },
    { id: 'router', label: 'Router', x: 170, y: 100 },
    { id: 'shard1', label: 'Shard 1', x: 320, y: 44 },
    { id: 'shard2', label: 'Shard 2', x: 320, y: 84 },
    { id: 'shard3', label: 'Shard 3', x: 320, y: 124 },
    { id: 'shard4', label: 'Shard 4', x: 320, y: 164 },
  ],
  edges: [
    { from: 'client', to: 'router' },
    { from: 'router', to: 'shard1' },
    { from: 'router', to: 'shard2' },
    { from: 'router', to: 'shard3' },
    { from: 'router', to: 'shard4' },
  ],
  steps: [
    {
      caption: 'One database holds all the data and takes all the traffic. It is full.',
      highlight: ['shard1'],
      states: {
        shard1: { status: 'hot', fill: 1 },
        shard2: { status: 'ok', fill: 0, label: 'unused' },
        shard3: { status: 'ok', fill: 0, label: 'unused' },
        shard4: { status: 'ok', fill: 0, label: 'unused' },
      },
    },
    {
      caption: 'Sharding splits the data across several databases, called shards.',
      states: {
        shard1: { status: 'ok', fill: 0.25 },
        shard2: { status: 'ok', fill: 0.25 },
        shard3: { status: 'ok', fill: 0.25 },
        shard4: { status: 'ok', fill: 0.25 },
      },
    },
    {
      caption: 'A router picks the shard for each request using a shard key, such as the user id.',
      marker: ['client', 'router', 'shard3'],
    },
    {
      caption: 'With a good key the load is spread evenly, so every shard has room to spare.',
      highlight: ['shard1', 'shard2', 'shard3', 'shard4'],
    },
    {
      caption: 'A hot key breaks this: one very popular user or item sends most traffic to one shard.',
      marker: ['router', 'shard1'],
      states: {
        shard1: { status: 'hot', fill: 1 },
        shard2: { status: 'ok', fill: 0.15 },
        shard3: { status: 'ok', fill: 0.15 },
        shard4: { status: 'ok', fill: 0.15 },
      },
    },
    {
      caption: 'That is why the shard key matters: it has to spread both the data and the traffic.',
      highlight: ['router'],
    },
  ],
};

export default scene;
