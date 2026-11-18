import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'client', label: 'Client', x: 45, y: 100, icon: 'laptop' },
    { id: 'app', label: 'App', x: 160, y: 100, icon: 'app' },
    { id: 'keys', label: 'Key service', x: 310, y: 42, icon: 'key' },
    { id: 'cache', label: 'Cache', x: 310, y: 100, icon: 'cache' },
    { id: 'db', label: 'Database', x: 310, y: 158, icon: 'database' },
  ],
  edges: [
    { from: 'client', to: 'app' },
    { from: 'app', to: 'keys' },
    { from: 'app', to: 'cache' },
    { from: 'app', to: 'db' },
  ],
  steps: [
    {
      caption: 'The job: turn a long URL into a short one, and redirect quickly when the short link is opened. Reads far outnumber writes.',
      highlight: ['client', 'app'],
    },
    {
      caption: 'Write path: the app asks a key service for a unique short key, such as aZ3k9Qx.',
      marker: ['client', 'app', 'keys'],
      states: { keys: { status: 'ok', fill: 0.2, label: 'new key' } },
    },
    {
      caption: 'The app stores the mapping from short key to long URL in the database.',
      marker: ['app', 'db'],
      states: { db: { status: 'ok', fill: 0.3 } },
    },
    {
      caption: 'Read path: opening short.example/aZ3k9Qx reaches the app, which checks the cache first.',
      marker: ['client', 'app', 'cache'],
      states: { cache: { status: 'ok', fill: 0.4 } },
    },
    {
      caption: 'On a cache miss the app reads the database, fills the cache, and answers with an HTTP redirect.',
      marker: ['app', 'db'],
      states: { cache: { status: 'ok', fill: 0.5 }, db: { status: 'ok', fill: 0.3 } },
    },
    {
      caption: 'To scale: cache popular links, replicate or shard the database by key, and hand each app server its own range of keys.',
      highlight: ['cache', 'db'],
      states: { db: { status: 'ok', fill: 0.15, label: 'sharded' } },
    },
  ],
};

export default scene;
