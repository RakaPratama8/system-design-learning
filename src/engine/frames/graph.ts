import { interpolateNodeState, markerT, pointAlong, stateEase } from '../motion';
import type { GraphScene, NodeState, Point } from '../types';

export type GraphBodyWithSteps = Pick<GraphScene, 'nodes' | 'edges' | 'steps'>;

export interface GraphFrame {
  nodes: { id: string; label: string; x: number; y: number; state: NodeState; highlighted: boolean }[];
  edges: { from: string; to: string; id: string; highlighted: boolean }[];
  marker?: Point;
  caption: string;
}

const DEFAULT_STATE: NodeState = { status: 'ok' };

function statesAt(scene: GraphBodyWithSteps, step: number): Record<string, NodeState> {
  const out: Record<string, NodeState> = {};
  for (let i = 0; i <= step; i++) Object.assign(out, scene.steps[i]?.states);
  return out;
}

export function buildGraphFrame(scene: GraphBodyWithSteps, step: number, progress: number, reduced: boolean): GraphFrame {
  const s = Math.min(scene.steps.length - 1, Math.max(0, step));
  const cur = scene.steps[s];
  const now = statesAt(scene, s);
  const before = s === 0 ? {} : statesAt(scene, s - 1);
  const t = stateEase(progress, reduced);
  const path = cur.marker ?? [];
  const onPath = new Set(path);
  const pathEdges = new Set<string>();
  for (let i = 0; i + 1 < path.length; i++) {
    pathEdges.add(`${path[i]}>${path[i + 1]}`);
    pathEdges.add(`${path[i + 1]}>${path[i]}`);
  }
  const highlight = new Set(cur.highlight ?? []);
  const byId = new Map(scene.nodes.map((n) => [n.id, n]));
  const frame: GraphFrame = {
    nodes: scene.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      x: n.x,
      y: n.y,
      state: interpolateNodeState(before[n.id] ?? DEFAULT_STATE, now[n.id] ?? DEFAULT_STATE, t),
      highlighted: highlight.has(n.id) || onPath.has(n.id),
    })),
    edges: scene.edges.map((e) => {
      const id = `${e.from}>${e.to}`;
      return { from: e.from, to: e.to, id, highlighted: highlight.has(id) || pathEdges.has(id) };
    }),
    caption: cur.caption,
  };
  if (path.length > 0) {
    frame.marker = pointAlong(path.map((id) => byId.get(id)!), markerT(progress, reduced));
  }
  return frame;
}
