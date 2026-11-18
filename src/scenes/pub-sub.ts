import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'pub', label: 'Publisher', x: 55, y: 100 },
    { id: 'topic', label: 'Topic', x: 190, y: 100 },
    { id: 'email', label: 'Email', x: 330, y: 44 },
    { id: 'analytics', label: 'Analytics', x: 330, y: 100 },
    { id: 'search', label: 'Search', x: 330, y: 156 },
  ],
  edges: [
    { from: 'pub', to: 'topic' },
    { from: 'topic', to: 'email' },
    { from: 'topic', to: 'analytics' },
    { from: 'topic', to: 'search' },
  ],
  steps: [
    {
      caption: 'A publisher announces an event, such as OrderPlaced, to a topic. It does not know who is listening.',
      marker: ['pub', 'topic'],
    },
    {
      caption: 'Each interested service subscribes to the topic.',
      highlight: ['topic>email', 'topic>analytics', 'topic>search'],
      states: { topic: { status: 'ok', label: '3 subscribers' } },
    },
    {
      caption: 'The topic delivers a copy of the event to every subscriber.',
      marker: ['topic', 'email'],
      highlight: ['topic>analytics', 'topic>search'],
      states: {
        topic: { status: 'ok', label: '3 subscribers' },
        email: { status: 'ok', fill: 0.3 },
        analytics: { status: 'ok', fill: 0.3 },
        search: { status: 'ok', fill: 0.3 },
      },
    },
    {
      caption: 'Subscribers work independently: if Analytics is down, Email and Search carry on.',
      highlight: ['analytics'],
      states: {
        topic: { status: 'ok', label: '3 subscribers' },
        email: { status: 'ok', fill: 0.3 },
        analytics: { status: 'down', label: 'down' },
        search: { status: 'ok', fill: 0.3 },
      },
    },
    {
      caption: 'Unlike a queue, where each message goes to one consumer, every subscriber gets its own copy.',
      highlight: ['topic'],
    },
  ],
};

export default scene;
