import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'sequence',
  lanes: [
    { id: 'client', label: 'Client' },
    { id: 'n1', label: 'Node 1' },
    { id: 'n2', label: 'Node 2' },
  ],
  steps: [
    {
      caption: 'Two nodes each hold a copy of the data. A client writes x = 2 to Node 1.',
      message: { from: 'client', to: 'n1', label: 'write x=2' },
      states: { n1: { status: 'ok', label: 'x = 2' }, n2: { status: 'ok', label: 'x = 1' } },
    },
    {
      caption: 'Normally Node 1 copies the change to Node 2, and both agree.',
      message: { from: 'n1', to: 'n2', label: 'replicate' },
      states: { n1: { status: 'ok', label: 'x = 2' }, n2: { status: 'ok', label: 'x = 2' } },
    },
    {
      caption: 'Now a network partition cuts the link between the two nodes. Both are still running.',
      states: { n1: { status: 'hot', label: 'cut off' }, n2: { status: 'hot', label: 'cut off' } },
    },
    {
      caption: 'During the partition a client writes x = 3 to Node 1. Node 2 cannot hear about it.',
      message: { from: 'client', to: 'n1', label: 'write x=3' },
      states: { n1: { status: 'hot', label: 'x = 3' }, n2: { status: 'hot', label: 'x = 2' } },
    },
    {
      caption: 'Another client reads x from Node 2. It must now choose between two bad options.',
      message: { from: 'client', to: 'n2', label: 'read x' },
    },
    {
      caption: 'Choose availability: Node 2 answers with what it has, x = 2, which is stale.',
      message: { from: 'n2', to: 'client', label: 'x = 2 (stale)' },
    },
    {
      caption: 'Choose consistency: Node 2 refuses to answer until it can reach Node 1. The answer is never wrong, but the system is unavailable.',
      states: { n2: { status: 'down', label: 'refuses' } },
    },
  ],
};

export default scene;
