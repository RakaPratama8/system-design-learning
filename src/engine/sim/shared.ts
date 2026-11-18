import type { NodeState, Route } from '../types';

// Overload is "hot" and clamps at a full bar; "down" is reserved for nodes switched off.
export function loadState(load: number, capacity: number): NodeState {
  if (capacity <= 0) return load > 0 ? { status: 'hot', fill: 1 } : { status: 'ok', fill: 0 };
  const fill = Math.min(1, load / capacity);
  return { status: fill >= 0.8 ? 'hot' : 'ok', fill };
}

export function pickRoute(routes: Route[], r: number): Route | undefined {
  const total = routes.reduce((sum, x) => sum + x.weight, 0);
  if (total <= 0) return undefined;
  const target = r * total;
  let acc = 0;
  for (const route of routes) {
    acc += route.weight;
    if (target < acc) return route;
  }
  return routes[routes.length - 1];
}
