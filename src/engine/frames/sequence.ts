import { markerT } from '../motion';
import type { NodeState, SequenceScene } from '../types';
import { displayedStates } from './shared';

export interface SequenceFrame {
  lanes: { id: string; label: string; x: number; state: NodeState }[];
  messages: { from: string; to: string; label: string; y: number; progress: number; current: boolean }[];
  caption: string;
}

const FIRST_ROW = 56;

export function buildSequenceFrame(scene: SequenceScene, step: number, progress: number, reduced: boolean): SequenceFrame {
  const s = Math.min(scene.steps.length - 1, Math.max(0, step));
  const stateOf = displayedStates(scene.steps, s, progress, reduced);
  const total = scene.steps.filter((st) => st.message).length;
  const rowHeight = Math.min(28, 130 / Math.max(1, total));
  const messages: SequenceFrame['messages'] = [];
  scene.steps.slice(0, s + 1).forEach((st, i) => {
    if (!st.message) return;
    const current = i === s;
    messages.push({
      ...st.message,
      y: FIRST_ROW + messages.length * rowHeight,
      progress: current ? markerT(progress, reduced) : 1,
      current,
    });
  });
  const gap = 400 / (scene.lanes.length + 1);
  return {
    lanes: scene.lanes.map((l, i) => ({ id: l.id, label: l.label, x: gap * (i + 1), state: stateOf(l.id) })),
    messages,
    caption: scene.steps[s].caption,
  };
}
