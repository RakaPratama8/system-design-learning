import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'client', label: 'Client', x: 50, y: 100 },
    { id: 'api', label: 'API', x: 190, y: 100 },
    { id: 'db', label: 'Database', x: 330, y: 100 },
  ],
  edges: [
    { from: 'client', to: 'api' },
    { from: 'api', to: 'db' },
  ],
  steps: [
    {
      caption: 'An API is a menu of things a client may ask for. REST uses URLs for things and HTTP methods for actions.',
      highlight: ['api'],
      states: { db: { status: 'ok', fill: 0.3, label: '3 orders' } },
    },
    {
      caption: 'GET /orders/42 reads an order and changes nothing.',
      marker: ['client', 'api', 'db', 'api', 'client'],
    },
    {
      caption: 'POST /orders creates a new order.',
      marker: ['client', 'api', 'db'],
      states: { db: { status: 'ok', fill: 0.4, label: '4 orders' } },
    },
    {
      caption: 'PUT or PATCH /orders/42 updates the order.',
      marker: ['client', 'api', 'db'],
      states: { db: { status: 'ok', fill: 0.4, label: 'updated' } },
    },
    {
      caption: 'DELETE /orders/42 removes it.',
      marker: ['client', 'api', 'db'],
      states: { db: { status: 'ok', fill: 0.3, label: '3 orders' } },
    },
    {
      caption: 'Every response has a status code, such as 200 OK, or 404 Not Found if you ask for order 42 again after deleting it.',
      marker: ['api', 'client'],
      states: { client: { status: 'ok', label: '404' } },
    },
  ],
};

export default scene;
