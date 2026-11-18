import { interpolateNodeState, stateEase } from '../motion';
import type { NodeState } from '../types';

const DEFAULT_STATE: NodeState = { status: 'ok' };

type WithStates = { states?: Record<string, NodeState> };

export function statesAt(steps: WithStates[], step: number): Record<string, NodeState> {
  const out: Record<string, NodeState> = {};
  for (let i = 0; i <= step; i++) Object.assign(out, steps[i]?.states);
  return out;
}

// Per-id displayed state: carried forward from earlier steps and eased in from the previous step.
export function displayedStates(steps: WithStates[], step: number, progress: number, reduced: boolean) {
  const now = statesAt(steps, step);
  const before = step === 0 ? {} : statesAt(steps, step - 1);
  const t = stateEase(progress, reduced);
  return (id: string): NodeState => interpolateNodeState(before[id] ?? DEFAULT_STATE, now[id] ?? DEFAULT_STATE, t);
}
