import { isIconName } from './icons';
import { ICON_NODE_H, ICON_NODE_W, ICON_Y_MAX, ICON_Y_MIN } from './layout';
import type { GraphBody, GraphStepBody, NodeState, Scene } from './types';

export const LABEL_MAX = 12;

function checkStates(prefix: string, i: number, states: Record<string, NodeState> | undefined, known: Set<string>, errors: string[]) {
  for (const [id, st] of Object.entries(states ?? {})) {
    if (!known.has(id)) errors.push(`${prefix}step ${i}: state for unknown id ${id}`);
    if (st.fill !== undefined && (st.fill < 0 || st.fill > 1)) errors.push(`${prefix}step ${i}: fill of ${id} must be 0..1`);
  }
}

function checkGraph(prefix: string, body: GraphBody, steps: GraphStepBody[], errors: string[]) {
  const ids = new Set<string>();
  for (const n of body.nodes) {
    if (ids.has(n.id)) errors.push(`${prefix}duplicate node id ${n.id}`);
    ids.add(n.id);
    if (n.label.length > LABEL_MAX) errors.push(`${prefix}label of ${n.id} is longer than ${LABEL_MAX} characters`);
    if (!n.icon) errors.push(`${prefix}node ${n.id} is missing an icon`);
    else if (!isIconName(n.icon)) errors.push(`${prefix}node ${n.id} has unknown icon ${n.icon}`);
    if (n.x < ICON_NODE_W / 2 || n.x > 400 - ICON_NODE_W / 2 || n.y < ICON_Y_MIN || n.y > ICON_Y_MAX) {
      errors.push(`${prefix}node ${n.id} is out of bounds (x ${ICON_NODE_W / 2}..${400 - ICON_NODE_W / 2}, y ${ICON_Y_MIN}..${ICON_Y_MAX})`);
    }
  }
  body.nodes.forEach((a, i) => {
    for (const b of body.nodes.slice(i + 1)) {
      if (Math.abs(a.x - b.x) < ICON_NODE_W && Math.abs(a.y - b.y) < ICON_NODE_H) errors.push(`${prefix}nodes ${a.id} and ${b.id} overlap`);
    }
  });
  const edgeIds = new Set<string>();
  for (const e of body.edges) {
    for (const end of [e.from, e.to]) if (!ids.has(end)) errors.push(`${prefix}edge ${e.from}>${e.to} references unknown node ${end}`);
    edgeIds.add(`${e.from}>${e.to}`);
  }
  steps.forEach((s, i) => {
    for (const h of s.highlight ?? []) if (!ids.has(h) && !edgeIds.has(h)) errors.push(`${prefix}step ${i}: unknown highlight id ${h}`);
    const m = s.marker ?? [];
    for (const id of m) if (!ids.has(id)) errors.push(`${prefix}step ${i}: marker references unknown node ${id}`);
    for (let k = 0; k + 1 < m.length; k++) {
      if (!edgeIds.has(`${m[k]}>${m[k + 1]}`) && !edgeIds.has(`${m[k + 1]}>${m[k]}`)) {
        errors.push(`${prefix}step ${i}: no edge between ${m[k]} and ${m[k + 1]} (${m[k]}>${m[k + 1]})`);
      }
    }
    checkStates(prefix, i, s.states, ids, errors);
  });
}

export function validateScene(scene: Scene): string[] {
  const errors: string[] = [];
  if (scene.steps.length === 0) errors.push('scene has no steps');
  switch (scene.type) {
    case 'graph':
      checkGraph('', scene, scene.steps, errors);
      break;
    case 'compare':
      checkGraph('left: ', scene.left, scene.steps.map((s) => s.left ?? {}), errors);
      checkGraph('right: ', scene.right, scene.steps.map((s) => s.right ?? {}), errors);
      break;
    case 'sequence': {
      const lanes = new Set(scene.lanes.map((l) => l.id));
      for (const l of scene.lanes) {
        if (l.label.length > LABEL_MAX) errors.push(`label of lane ${l.id} is longer than ${LABEL_MAX} characters`);
        if (!l.icon) errors.push(`lane ${l.id} is missing an icon`);
        else if (!isIconName(l.icon)) errors.push(`lane ${l.id} has unknown icon ${l.icon}`);
      }
      scene.steps.forEach((s, i) => {
        for (const end of s.message ? [s.message.from, s.message.to] : []) {
          if (!lanes.has(end)) errors.push(`step ${i}: message references unknown lane ${end}`);
        }
        checkStates('', i, s.states, lanes, errors);
      });
      break;
    }
    case 'numbers': {
      const max = new Map(scene.items.map((it) => [it.id, it.max]));
      scene.steps.forEach((s, i) => {
        for (const [id, v] of Object.entries(s.values)) {
          if (!max.has(id)) errors.push(`step ${i}: value for unknown item ${id}`);
          else if (v < 0 || v > max.get(id)!) errors.push(`step ${i}: value of ${id} is outside 0..max (${max.get(id)})`);
        }
      });
      break;
    }
  }
  return errors;
}
