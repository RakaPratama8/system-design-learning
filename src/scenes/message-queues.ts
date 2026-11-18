import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'producer', label: 'Producer', x: 55, y: 100 },
    { id: 'queue', label: 'Queue', x: 190, y: 100 },
    { id: 'c1', label: 'Consumer 1', x: 330, y: 56 },
    { id: 'c2', label: 'Consumer 2', x: 330, y: 144 },
  ],
  edges: [
    { from: 'producer', to: 'queue' },
    { from: 'queue', to: 'c1' },
    { from: 'queue', to: 'c2' },
  ],
  steps: [
    {
      caption: 'A producer puts a message on a queue instead of calling the consumer directly.',
      marker: ['producer', 'queue'],
      states: { queue: { status: 'ok', fill: 0.1, label: '1 waiting' } },
    },
    {
      caption: 'The queue holds messages until a consumer is ready, so the two sides do not have to run at the same time.',
      highlight: ['queue'],
      states: { queue: { status: 'ok', fill: 0.3, label: '3 waiting' } },
    },
    {
      caption: 'A consumer takes the next message, processes it, and confirms it is done.',
      marker: ['queue', 'c1'],
      states: { queue: { status: 'ok', fill: 0.2, label: '2 waiting' }, c1: { status: 'ok', fill: 0.5, label: 'working' } },
    },
    {
      caption: 'A burst arrives faster than one consumer can work. The queue absorbs it instead of the system failing.',
      highlight: ['queue'],
      states: { queue: { status: 'hot', fill: 0.9, label: '90 waiting' }, c1: { status: 'hot', fill: 1, label: 'at limit' } },
    },
    {
      caption: 'Add a second consumer. They share the work and the queue drains.',
      marker: ['queue', 'c2'],
      states: { queue: { status: 'ok', fill: 0.4, label: '40 waiting' }, c1: { status: 'ok', fill: 0.6 }, c2: { status: 'ok', fill: 0.6 } },
    },
    {
      caption: 'If a consumer crashes before confirming, the message is delivered again to another consumer.',
      marker: ['queue', 'c2'],
      states: { c1: { status: 'down', label: 'crashed' }, c2: { status: 'ok', fill: 0.9 } },
    },
  ],
};

export default scene;
