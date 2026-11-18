import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'sequence',
  lanes: [
    { id: 'order', label: 'Order' },
    { id: 'payment', label: 'Payment' },
    { id: 'inventory', label: 'Inventory' },
  ],
  steps: [
    {
      caption: 'A saga splits one business transaction into steps across services. Step 1: charge the card.',
      message: { from: 'order', to: 'payment', label: 'charge card' },
    },
    {
      caption: 'The payment succeeds and its own database records it.',
      message: { from: 'payment', to: 'order', label: 'paid' },
      states: { payment: { status: 'ok', label: 'charged' } },
    },
    {
      caption: 'Step 2: reserve the items in the inventory service.',
      message: { from: 'order', to: 'inventory', label: 'reserve items' },
    },
    {
      caption: 'Step 2 fails: the item is out of stock.',
      message: { from: 'inventory', to: 'order', label: 'out of stock' },
      states: { inventory: { status: 'hot', label: 'out of stock' } },
    },
    {
      caption: 'There is no global rollback across services, so the saga runs a compensating action: refund the payment.',
      message: { from: 'order', to: 'payment', label: 'refund' },
      states: { payment: { status: 'ok', label: 'refunded' } },
    },
    {
      caption: 'The order ends up cancelled. Every step had an undo, and the system is consistent again, eventually.',
      states: { order: { status: 'ok', label: 'cancelled' } },
    },
  ],
};

export default scene;
