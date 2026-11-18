import { describe, expect, it } from 'vitest';
import { loadState, pickRoute } from '../src/engine/sim/shared';
import type { Route } from '../src/engine/types';

describe('loadState', () => {
  it('is ok below 80% and hot from 80%', () => {
    expect(loadState(50, 100)).toEqual({ status: 'ok', fill: 0.5 });
    expect(loadState(80, 100)).toEqual({ status: 'hot', fill: 0.8 });
  });
  it('clamps overload to a full, hot node', () => {
    expect(loadState(250, 100)).toEqual({ status: 'hot', fill: 1 });
  });
  it('never divides by zero capacity', () => {
    expect(loadState(0, 0)).toEqual({ status: 'ok', fill: 0 });
    expect(loadState(10, 0)).toEqual({ status: 'hot', fill: 1 });
  });
});

describe('pickRoute', () => {
  const routes: Route[] = [
    { path: ['a'], weight: 1, outcome: 'ok' },
    { path: ['b'], weight: 3, outcome: 'ok' },
  ];
  it('chooses by cumulative weight', () => {
    expect(pickRoute(routes, 0.2)).toBe(routes[0]);
    expect(pickRoute(routes, 0.3)).toBe(routes[1]);
    expect(pickRoute(routes, 0.999)).toBe(routes[1]);
  });
  it('returns undefined with no routes or no weight', () => {
    expect(pickRoute([], 0.5)).toBeUndefined();
    expect(pickRoute([{ path: ['a'], weight: 0, outcome: 'ok' }], 0.5)).toBeUndefined();
  });
});
