import { describe, expect, it } from 'vitest';
import { loadState, pickRoute, splitRoute } from '../src/engine/sim/shared';
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

describe('splitRoute', () => {
  it('keeps a route fully ok while the load fits the capacity', () => {
    expect(splitRoute(['a'], 10, 50, 100)).toEqual([{ path: ['a'], weight: 10, outcome: 'ok' }]);
    expect(splitRoute(['a'], 10, 100, 100)).toHaveLength(1);
  });
  it('splits an overloaded route into the share that is served and the share that is dropped', () => {
    const [ok, fail] = splitRoute(['a'], 10, 250, 100);
    expect(ok).toEqual({ path: ['a'], weight: 4, outcome: 'ok' });
    expect(fail.outcome).toBe('fail');
    expect(fail.weight).toBeCloseTo(6);
  });
  it('handles zero load', () => {
    expect(splitRoute(['a'], 0, 0, 100)).toEqual([{ path: ['a'], weight: 0, outcome: 'ok' }]);
  });
});
