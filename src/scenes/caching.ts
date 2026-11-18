import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'client', label: 'Users', x: 50, y: 100 },
    { id: 'app', label: 'App', x: 150, y: 100 },
    { id: 'cache', label: 'Cache', x: 270, y: 50 },
    { id: 'db', label: 'Database', x: 270, y: 150 },
  ],
  edges: [
    { from: 'client', to: 'app' },
    { from: 'app', to: 'cache' },
    { from: 'app', to: 'db' },
  ],
  steps: [
    {
      caption: 'The app checks the cache first. It is empty, so this is a cache miss.',
      marker: ['client', 'app', 'cache'],
      states: { cache: { status: 'ok', fill: 0, label: 'empty' } },
    },
    {
      caption: 'On a miss the app asks the database, which does the slow work.',
      marker: ['app', 'db'],
      states: { db: { status: 'ok', fill: 0.5 } },
    },
    {
      caption: 'The answer is saved in the cache before it goes back to the user.',
      marker: ['db', 'app', 'cache'],
      states: { cache: { status: 'ok', fill: 0.2 } },
    },
    {
      caption: 'The next request for the same data is a cache hit: the database is not touched.',
      marker: ['client', 'app', 'cache', 'app', 'client'],
      states: { db: { status: 'ok', fill: 0.1 } },
    },
    {
      caption: 'Memory is limited. A full cache evicts old entries to make room.',
      highlight: ['cache'],
      states: { cache: { status: 'hot', fill: 1, label: 'full' } },
    },
    {
      caption: 'The more requests the cache answers, the less load the database sees.',
      highlight: ['db'],
      states: { cache: { status: 'ok', fill: 0.6 }, db: { status: 'ok', fill: 0.1 } },
    },
  ],
};

export default scene;
