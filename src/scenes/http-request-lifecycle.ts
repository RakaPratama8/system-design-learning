import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'client', label: 'Browser', x: 60, y: 120, icon: 'browser' },
    { id: 'dns', label: 'DNS', x: 60, y: 40, icon: 'dns' },
    { id: 'server', label: 'Server', x: 220, y: 120, icon: 'server' },
    { id: 'db', label: 'Database', x: 340, y: 120, icon: 'database' },
  ],
  edges: [
    { from: 'client', to: 'dns' },
    { from: 'client', to: 'server' },
    { from: 'server', to: 'db' },
  ],
  steps: [
    { caption: 'You type a URL and press Enter.', highlight: ['client'] },
    { caption: 'The browser asks DNS which IP address the name points to.', marker: ['client', 'dns', 'client'] },
    { caption: 'It connects to that address and sends the request.', marker: ['client', 'server'] },
    {
      caption: 'The server needs data, so it queries the database.',
      marker: ['server', 'db'],
      states: { db: { status: 'ok', fill: 0.6, label: 'busy' } },
    },
    {
      caption: 'The database sends the rows back.',
      marker: ['db', 'server'],
      states: { db: { status: 'ok', fill: 0.2, label: 'idle' } },
    },
    {
      caption: 'The server sends the response and the page appears.',
      marker: ['server', 'client'],
      states: { client: { status: 'ok', label: 'page loaded' } },
    },
  ],
};

export default scene;
