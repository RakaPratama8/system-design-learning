import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'graph',
  nodes: [
    { id: 'browser', label: 'Browser', x: 50, y: 100, icon: 'browser' },
    { id: 'resolver', label: 'Resolver', x: 170, y: 100, icon: 'dns' },
    { id: 'root', label: 'Root', x: 320, y: 42, icon: 'dns' },
    { id: 'tld', label: '.com server', x: 320, y: 100, icon: 'dns' },
    { id: 'auth', label: 'Auth server', x: 320, y: 158, icon: 'dns' },
  ],
  edges: [
    { from: 'browser', to: 'resolver' },
    { from: 'resolver', to: 'root' },
    { from: 'resolver', to: 'tld' },
    { from: 'resolver', to: 'auth' },
  ],
  steps: [
    { caption: 'The browser needs an IP address for www.example.com, so it asks a DNS resolver.', marker: ['browser', 'resolver'] },
    {
      caption: 'The resolver has no cached answer, so it starts at a root server.',
      marker: ['resolver', 'root'],
      states: { resolver: { status: 'ok', label: 'cache miss' } },
    },
    { caption: 'The root server does not know the address, but it knows who handles .com.', marker: ['root', 'resolver'] },
    {
      caption: 'The .com server does not know either, but it points to the server responsible for example.com.',
      marker: ['resolver', 'tld', 'resolver'],
      states: { tld: { status: 'ok', label: 'refers on' } },
    },
    {
      caption: 'The authoritative server for example.com holds the real answer: an IP address.',
      marker: ['resolver', 'auth', 'resolver'],
      states: { auth: { status: 'ok', label: 'IP found' } },
    },
    {
      caption: 'The resolver caches the answer and returns it. Next time it is instant.',
      marker: ['resolver', 'browser'],
      states: { resolver: { status: 'ok', label: 'cached' }, browser: { status: 'ok', label: 'has IP' } },
    },
  ],
};

export default scene;
