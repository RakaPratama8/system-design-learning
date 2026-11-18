import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'alice', label: 'Alice', x: 45, y: 50 },
    { id: 'bob', label: 'Bob', x: 45, y: 150 },
    { id: 'gw', label: 'Chat gateway', x: 170, y: 100 },
    { id: 'store', label: 'Msg store', x: 310, y: 44 },
    { id: 'push', label: 'Push service', x: 310, y: 156 },
  ],
  edges: [
    { from: 'alice', to: 'gw' },
    { from: 'bob', to: 'gw' },
    { from: 'gw', to: 'store' },
    { from: 'gw', to: 'push' },
  ],
  steps: [
    {
      caption: 'Alice and Bob each keep a persistent connection (a WebSocket) to a chat gateway, so messages can be pushed instantly.',
      highlight: ['alice>gw', 'bob>gw'],
      states: { gw: { status: 'ok', label: '2 online' } },
    },
    {
      caption: 'Alice sends a message over her connection.',
      marker: ['alice', 'gw'],
    },
    {
      caption: 'The gateway saves the message first, so it can never be lost.',
      marker: ['gw', 'store'],
      states: { store: { status: 'ok', fill: 0.3 } },
    },
    {
      caption: 'Bob is online, so the gateway pushes the message to him right away.',
      marker: ['gw', 'bob'],
      states: { bob: { status: 'ok', label: 'received' } },
    },
    {
      caption: 'If Bob is offline, the message waits in the store and a push notification is sent to his phone.',
      marker: ['gw', 'push'],
      states: { bob: { status: 'down', label: 'offline' }, push: { status: 'ok', fill: 0.3 } },
    },
    {
      caption: 'When Bob reconnects, he asks for everything after the last message he saw.',
      marker: ['bob', 'gw', 'store'],
      states: { bob: { status: 'ok', label: 'syncing' } },
    },
  ],
};

export default scene;
