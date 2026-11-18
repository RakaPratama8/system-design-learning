import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'poster', label: 'Poster', x: 45, y: 100, icon: 'person' },
    { id: 'svc', label: 'Post service', x: 165, y: 100, icon: 'service' },
    { id: 'db', label: 'Post store', x: 310, y: 44, icon: 'database' },
    { id: 'f1', label: 'Feed: Ann', x: 310, y: 100, icon: 'feed' },
    { id: 'f2', label: 'Feed: Bob', x: 310, y: 156, icon: 'feed' },
    { id: 'reader', label: 'Reader', x: 45, y: 156, icon: 'person' },
  ],
  edges: [
    { from: 'poster', to: 'svc' },
    { from: 'svc', to: 'db' },
    { from: 'svc', to: 'f1' },
    { from: 'svc', to: 'f2' },
    { from: 'reader', to: 'f2' },
  ],
  steps: [
    {
      caption: 'A feed shows posts from people you follow. Build it when someone posts (fan-out on write) or when you open it (fan-out on read).',
      highlight: ['svc'],
    },
    {
      caption: 'Fan-out on write: a new post is saved in the post store.',
      marker: ['poster', 'svc', 'db'],
      states: { db: { status: 'ok', fill: 0.3 } },
    },
    {
      caption: 'The service then copies the post id into the prepared feed of every follower.',
      marker: ['svc', 'f1'],
      highlight: ['svc>f2'],
      states: { db: { status: 'ok', fill: 0.3 }, f1: { status: 'ok', fill: 0.3 }, f2: { status: 'ok', fill: 0.3 } },
    },
    {
      caption: 'Reading is now one fast lookup of an already-built feed.',
      marker: ['reader', 'f2'],
      states: { db: { status: 'ok', fill: 0.3 }, f1: { status: 'ok', fill: 0.3 }, f2: { status: 'ok', fill: 0.3 } },
    },
    {
      caption: 'The problem: a celebrity with millions of followers turns every post into millions of writes.',
      highlight: ['svc'],
      states: { svc: { status: 'hot', fill: 1, label: 'millions of writes' } },
    },
    {
      caption: 'A common compromise: fan out on write for ordinary users, and merge celebrity posts into the feed at read time.',
      highlight: ['db'],
      states: {
        svc: { status: 'ok', fill: 0.4, label: 'hybrid' },
        f1: { status: 'ok', fill: 0.4 },
        f2: { status: 'ok', fill: 0.4 },
      },
    },
  ],
};

export default scene;
