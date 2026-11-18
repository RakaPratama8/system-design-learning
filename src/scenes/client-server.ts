import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'phone', label: 'Phone', x: 60, y: 44, icon: 'phone' },
    { id: 'laptop', label: 'Laptop', x: 60, y: 100, icon: 'laptop' },
    { id: 'tablet', label: 'Tablet', x: 60, y: 156, icon: 'tablet' },
    { id: 'server', label: 'Server', x: 280, y: 100, icon: 'server' },
  ],
  edges: [
    { from: 'phone', to: 'server' },
    { from: 'laptop', to: 'server' },
    { from: 'tablet', to: 'server' },
  ],
  steps: [
    { caption: 'A client is any program that asks for something: a browser, a phone app, another service.', highlight: ['phone', 'laptop', 'tablet'] },
    {
      caption: 'A server is a program that waits for requests and answers them.',
      highlight: ['server'],
      states: { server: { status: 'ok', fill: 0, label: 'waiting' } },
    },
    {
      caption: 'The client sends a request over the network.',
      marker: ['phone', 'server'],
      states: { server: { status: 'ok', fill: 0.2, label: 'working' } },
    },
    { caption: 'The server does the work and sends back a response.', marker: ['server', 'phone'] },
    {
      caption: 'One server can handle many clients at once, but only up to its capacity.',
      highlight: ['phone>server', 'laptop>server', 'tablet>server'],
      states: { server: { status: 'hot', fill: 0.9, label: 'busy' } },
    },
  ],
};

export default scene;
