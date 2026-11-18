import type { NodeState, Point } from './types';

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function interpolateNodeState(from: NodeState, to: NodeState, t: number): NodeState {
  const late = t >= 0.5;
  const fill =
    from.fill !== undefined && to.fill !== undefined ? lerp(from.fill, to.fill, t) : (to.fill ?? from.fill);
  const src = late ? to : from;
  const out: NodeState = { status: src.status };
  if (fill !== undefined) out.fill = fill;
  if (src.label !== undefined) out.label = src.label;
  return out;
}

export function pointAlong(points: Point[], t: number): Point {
  if (points.length === 1) return points[0];
  const lengths: number[] = [];
  let total = 0;
  for (let i = 0; i + 1 < points.length; i++) {
    const d = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    lengths.push(d);
    total += d;
  }
  let remaining = Math.min(1, Math.max(0, t)) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] || i === lengths.length - 1) {
      const f = lengths[i] === 0 ? 1 : Math.min(1, remaining / lengths[i]);
      return { x: lerp(points[i].x, points[i + 1].x, f), y: lerp(points[i].y, points[i + 1].y, f) };
    }
    remaining -= lengths[i];
  }
  return points[points.length - 1];
}

export function stateEase(progress: number, reduced: boolean): number {
  return reduced ? 1 : Math.min(1, progress / 0.4);
}

export function markerT(progress: number, reduced: boolean): number {
  return reduced ? 1 : progress;
}
