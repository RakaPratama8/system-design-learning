import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'client', label: 'Clients', x: 50, y: 100 },
    { id: 'gw', label: 'Gateway', x: 180, y: 100 },
    { id: 'users', label: 'Users svc', x: 330, y: 44 },
    { id: 'orders', label: 'Orders svc', x: 330, y: 100 },
    { id: 'pay', label: 'Payments', x: 330, y: 156 },
  ],
  edges: [
    { from: 'client', to: 'gw' },
    { from: 'gw', to: 'users' },
    { from: 'gw', to: 'orders' },
    { from: 'gw', to: 'pay' },
  ],
  steps: [
    { caption: 'Instead of knowing every service, clients talk to one entry point: the API gateway.', marker: ['client', 'gw'] },
    {
      caption: 'First the gateway checks who is calling: is this a valid user or API key?',
      highlight: ['gw'],
      states: { gw: { status: 'ok', label: 'auth ok' } },
    },
    {
      caption: 'It applies rate limits and other policies before anything reaches a service.',
      highlight: ['gw'],
      states: { gw: { status: 'ok', label: 'limit ok' } },
    },
    {
      caption: 'Then it routes the request by path: /orders goes to the Orders service.',
      marker: ['gw', 'orders'],
      states: { gw: { status: 'ok', label: 'routing' }, orders: { status: 'ok', fill: 0.3 } },
    },
    {
      caption: 'It can also combine several services into one response, so the client makes fewer calls.',
      highlight: ['gw>users', 'gw>orders', 'gw>pay'],
      states: { users: { status: 'ok', fill: 0.2 }, orders: { status: 'ok', fill: 0.3 }, pay: { status: 'ok', fill: 0.2 } },
    },
    {
      caption: 'The cost: every request takes one more hop, and the gateway must stay available or everything stops.',
      highlight: ['gw'],
      states: { gw: { status: 'ok', label: 'one front door' } },
    },
  ],
};

export default scene;
