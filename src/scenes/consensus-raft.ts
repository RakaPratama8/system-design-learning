import type { Scene } from '../engine/types';

const scene: Scene = {
  type: 'sequence',
  lanes: [
    { id: 'a', label: 'Node A' },
    { id: 'b', label: 'Node B' },
    { id: 'c', label: 'Node C' },
  ],
  steps: [
    {
      caption: 'Three nodes start as followers. Each expects heartbeats from a leader, but there is none yet.',
      states: {
        a: { status: 'ok', label: 'follower' },
        b: { status: 'ok', label: 'follower' },
        c: { status: 'ok', label: 'follower' },
      },
    },
    {
      caption: "Node A's timer runs out first. It becomes a candidate for a new term and asks the others for votes.",
      message: { from: 'a', to: 'b', label: 'vote for me' },
      states: { a: { status: 'ok', label: 'candidate' } },
    },
    {
      caption: 'Node B has not voted in this term, so it votes yes.',
      message: { from: 'b', to: 'a', label: 'vote yes' },
    },
    {
      caption: "With its own vote and B's, A holds 2 of 3 votes, a majority, and becomes leader.",
      states: { a: { status: 'ok', label: 'leader' } },
    },
    {
      caption: 'The leader sends regular heartbeats so followers do not start new elections.',
      message: { from: 'a', to: 'c', label: 'heartbeat' },
    },
    {
      caption: 'A write arrives at the leader. It appends the entry to its log and sends it to the followers.',
      message: { from: 'a', to: 'b', label: 'append entry' },
    },
    {
      caption: 'Once a majority has stored the entry, it is committed and the leader can reply to the client.',
      message: { from: 'b', to: 'a', label: 'stored' },
    },
    {
      caption: 'If the leader crashes, the followers time out and elect a new one. Committed entries survive because a majority holds them.',
      states: { a: { status: 'down', label: 'crashed' }, b: { status: 'ok', label: 'new election' } },
    },
  ],
};

export default scene;
