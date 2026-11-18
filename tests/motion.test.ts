import { describe, expect, it } from 'vitest';
import { interpolateNodeState, lerp, markerT, pointAlong, stateEase } from '../src/engine/motion';

describe('motion', () => {
  it('lerp interpolates', () => expect(lerp(0, 10, 0.25)).toBe(2.5));

  it('pointAlong follows a polyline by arc length', () => {
    const pts = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }];
    expect(pointAlong(pts, 0.5)).toEqual({ x: 10, y: 0 });
    expect(pointAlong(pts, 0.25)).toEqual({ x: 5, y: 0 });
    expect(pointAlong(pts, 1)).toEqual({ x: 10, y: 10 });
    expect(pointAlong([{ x: 3, y: 4 }], 0.7)).toEqual({ x: 3, y: 4 });
  });

  it('interpolateNodeState lerps fill and switches status at t>=0.5', () => {
    const from = { status: 'ok', fill: 0 } as const;
    const to = { status: 'hot', fill: 1 } as const;
    expect(interpolateNodeState(from, to, 0.25)).toEqual({ status: 'ok', fill: 0.25 });
    expect(interpolateNodeState(from, to, 0.5).status).toBe('hot');
  });

  it('interpolateNodeState uses the only defined fill and switches label at t>=0.5', () => {
    const from = { status: 'ok', label: 'a' } as const;
    const to = { status: 'ok', fill: 0.8, label: 'b' } as const;
    expect(interpolateNodeState(from, to, 0.1).fill).toBe(0.8);
    expect(interpolateNodeState(from, to, 0.1).label).toBe('a');
    expect(interpolateNodeState(from, to, 0.9).label).toBe('b');
  });

  it('stateEase finishes in the first 40% and jumps under reduced motion', () => {
    expect(stateEase(0.2, false)).toBe(0.5);
    expect(stateEase(0.4, false)).toBe(1);
    expect(stateEase(0, true)).toBe(1);
  });

  it('markerT follows progress and jumps to the end under reduced motion', () => {
    expect(markerT(0.3, false)).toBe(0.3);
    expect(markerT(0.3, true)).toBe(1);
  });
});
