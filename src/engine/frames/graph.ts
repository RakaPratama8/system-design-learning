import { markerT, pointAlong } from '../motion';
import type { GraphScene, NodeState, Point } from '../types';
import { displayedStates } from './shared';

export type GraphBodyWithSteps = Pick<GraphScene, 'nodes' | 'edges' | 'steps'>;

export interface GraphFrame {
  nodes: { id: string; label: string; x: number; y: number; state: NodeState; highlighted: boolean }[];
  edges: { from: string; to: string; id: string; highlighted: boolean }[];
  marker?: Point;
  caption: string;
}

export function buildGraphFrame(scene: GraphBodyWithSteps, step: number, progress: number, reduced: boolean): GraphFrame {
  const s = Math.min(scene.steps.length - 1, Math.max(0, step));
  const cur = scene.steps[s];
  const stateOf = displayedStates(scene.steps, s, progress, reduced);
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
      state: stateOf(n.id),
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
