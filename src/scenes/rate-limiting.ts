import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'client', label: 'Clients', x: 50, y: 100, icon: 'people' },
    { id: 'limiter', label: 'Limiter', x: 190, y: 100, icon: 'limiter' },
    { id: 'api', label: 'API', x: 330, y: 100, icon: 'service' },
  ],
  edges: [
    { from: 'client', to: 'limiter' },
    { from: 'limiter', to: 'api' },
  ],
  steps: [
    {
      caption: 'The limiter keeps a bucket of tokens. At first the bucket is full.',
      highlight: ['limiter'],
      states: { limiter: { status: 'ok', fill: 1, label: 'full' } },
    },
    {
      caption: 'Each request spends one token and is passed on to the API.',
      marker: ['client', 'limiter', 'api'],
      states: { limiter: { status: 'ok', fill: 0.7 } },
    },
    {
      caption: 'Tokens drip back in at a steady rate, so the bucket slowly refills.',
      highlight: ['limiter'],
      states: { limiter: { status: 'ok', fill: 0.9 } },
    },
    {
      caption: 'A sudden burst spends tokens faster than they refill and empties the bucket.',
      marker: ['client', 'limiter'],
      states: { limiter: { status: 'hot', fill: 0, label: 'empty' } },
    },
    {
      caption: 'With no tokens left, extra requests are rejected with HTTP 429.',
      marker: ['limiter', 'client'],
      states: { client: { status: 'ok', label: '429' } },
    },
  ],
};

export default scene;
