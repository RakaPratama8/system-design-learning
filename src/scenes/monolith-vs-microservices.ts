import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'compare',
  leftTitle: 'Monolith',
  rightTitle: 'Microservices',
  left: {
    nodes: [
      { id: 'users', label: 'Users', x: 40, y: 100, icon: 'people' },
      { id: 'app', label: 'One app', x: 170, y: 100, icon: 'app' },
      { id: 'orders', label: 'Orders', x: 320, y: 42, icon: 'order' },
      { id: 'payments', label: 'Payments', x: 320, y: 100, icon: 'payment' },
      { id: 'search', label: 'Search', x: 320, y: 158, icon: 'search' },
    ],
    edges: [
      { from: 'users', to: 'app' },
      { from: 'app', to: 'orders' },
      { from: 'app', to: 'payments' },
      { from: 'app', to: 'search' },
    ],
  },
  right: {
    nodes: [
      { id: 'users', label: 'Users', x: 40, y: 100, icon: 'people' },
      { id: 'gw', label: 'Gateway', x: 170, y: 100, icon: 'gateway' },
      { id: 'orders', label: 'Orders', x: 320, y: 42, icon: 'order' },
      { id: 'payments', label: 'Payments', x: 320, y: 100, icon: 'payment' },
      { id: 'search', label: 'Search', x: 320, y: 158, icon: 'search' },
    ],
    edges: [
      { from: 'users', to: 'gw' },
      { from: 'gw', to: 'orders' },
      { from: 'gw', to: 'payments' },
      { from: 'gw', to: 'search' },
    ],
  },
  steps: [
    {
      caption: 'A monolith ships all features as one program. Microservices split them into separate programs that talk over the network.',
      left: { highlight: ['app'] },
      right: { highlight: ['gw'] },
    },
    {
      caption: 'In a monolith, a request moves between modules as an ordinary function call: fast and simple.',
      left: { marker: ['users', 'app', 'orders'] },
    },
    {
      caption: 'With microservices the same request crosses the network, which is slower and can fail at every hop.',
      right: { marker: ['users', 'gw', 'orders'] },
    },
    {
      caption: 'When Payments gets slow, the monolith can be dragged down with it. Microservices contain the problem to one service.',
      left: { states: { payments: { status: 'hot', fill: 1, label: 'slow' }, app: { status: 'hot', fill: 0.9, label: 'stalling' } } },
      right: { states: { payments: { status: 'hot', fill: 1, label: 'slow' } } },
    },
    {
      caption: 'To ship a change to Search, the monolith redeploys everything; microservices redeploy only Search, but need more tooling.',
      left: { highlight: ['app'], states: { app: { status: 'ok', label: 'redeploy all' } } },
      right: { highlight: ['search'], states: { search: { status: 'ok', label: 'redeploy' } } },
    },
  ],
};

export default scene;
