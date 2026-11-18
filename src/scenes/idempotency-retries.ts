import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'sequence',
  lanes: [
    { id: 'client', label: 'Client' },
    { id: 'server', label: 'Server' },
  ],
  steps: [
    {
      caption: 'The client sends a payment request.',
      message: { from: 'client', to: 'server', label: 'pay $10' },
    },
    {
      caption: 'The server charges the card, but the response is lost on the way back. The client only sees a timeout.',
      states: { server: { status: 'ok', label: 'charged once' }, client: { status: 'hot', label: 'timeout' } },
    },
    {
      caption: 'The client cannot tell whether it worked, so it retries. Without protection, the card is charged twice.',
      message: { from: 'client', to: 'server', label: 'retry: pay $10' },
      states: { server: { status: 'down', label: 'charged twice' }, client: { status: 'ok', label: 'retrying' } },
    },
    {
      caption: 'The fix: the client attaches a unique idempotency key to the request. The server records the key together with the result of the charge.',
      message: { from: 'client', to: 'server', label: 'pay, key K1' },
      states: { server: { status: 'ok', label: 'stores K1' }, client: { status: 'ok', label: 'key K1' } },
    },
    {
      caption: 'The response is lost again, so the client retries with the same key.',
      message: { from: 'client', to: 'server', label: 'retry, key K1' },
    },
    {
      caption: 'The server recognizes K1, skips the charge, and returns the stored result. The card is charged exactly once.',
      message: { from: 'server', to: 'client', label: 'same result' },
      states: { server: { status: 'ok', label: '1 charge' } },
    },
    {
      caption: 'Retries should also wait longer each time (exponential backoff, plus some random jitter) so a struggling server is not hit by a stampede.',
    },
  ],
};

export default scene;
