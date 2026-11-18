import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'sequence',
  lanes: [
    { id: 'client', label: 'Client' },
    { id: 'server', label: 'Server' },
    { id: 'store', label: 'Session DB' },
  ],
  steps: [
    {
      caption: 'Sessions: the client logs in with a username and password.',
      message: { from: 'client', to: 'server', label: 'login' },
      states: { server: { status: 'ok', label: 'new session' } },
    },
    {
      caption: 'The server saves a session record and returns a random session id, which the browser keeps in a cookie.',
      message: { from: 'server', to: 'client', label: 'cookie: session id' },
      states: { store: { status: 'ok', label: 'has session' } },
    },
    {
      caption: 'Every later request carries the cookie.',
      message: { from: 'client', to: 'server', label: 'request + cookie' },
    },
    {
      caption: 'The server looks the id up to find out who the user is. The state lives on the server side.',
      message: { from: 'server', to: 'store', label: 'look up id' },
    },
    {
      caption: 'Tokens: log in again, but this time the server answers with a signed token instead of a session id.',
      message: { from: 'client', to: 'server', label: 'login' },
      states: { server: { status: 'ok', label: 'signs token' }, store: { status: 'ok' } },
    },
    {
      caption: 'The token itself contains the user id and an expiry time, signed so it cannot be forged.',
      message: { from: 'server', to: 'client', label: 'signed token' },
    },
    {
      caption: 'The client sends the token with each request. The server checks the signature and needs no lookup.',
      message: { from: 'client', to: 'server', label: 'request + token' },
      states: { server: { status: 'ok', label: 'verifies sig' } },
    },
    {
      caption: 'Trade-off: sessions are easy to revoke but need shared storage; tokens scale easily but are hard to revoke before they expire.',
    },
  ],
};

export default scene;
