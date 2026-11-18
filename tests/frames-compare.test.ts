import { describe, expect, it } from 'vitest';
import { buildCompareFrame } from '../src/engine/frames/compare';
import type { CompareScene } from '../src/engine/types';

const body = {
  nodes: [{ id: 'a', label: 'A', x: 50, y: 100, icon: 'server' as const }, { id: 'b', label: 'B', x: 150, y: 100, icon: 'server' as const }],
  edges: [{ from: 'a', to: 'b' }],
};
const scene: CompareScene = {
  type: 'compare',
  leftTitle: 'Left',
  rightTitle: 'Right',
  left: body,
  right: body,
  steps: [
    { caption: 'first', left: { marker: ['a', 'b'], states: { b: { status: 'hot', fill: 0.9 } } } },
    { caption: 'second', right: { highlight: ['a'] } },
  ],
};

describe('buildCompareFrame', () => {
  it('animates only the side that has a step body', () => {
    const f = buildCompareFrame(scene, 0, 0.5, false);
    expect(f.left.marker).toBeDefined();
    expect(f.right.marker).toBeUndefined();
    expect(f.right.nodes.every((n) => !n.highlighted)).toBe(true);
  });

  it('takes the caption from the compare step and titles from the scene', () => {
    const f = buildCompareFrame(scene, 1, 0, false);
    expect(f.caption).toBe('second');
    expect([f.leftTitle, f.rightTitle]).toEqual(['Left', 'Right']);
  });

  it('keeps each side\'s own carried-forward state', () => {
    const f = buildCompareFrame(scene, 1, 1, false);
    expect(f.left.nodes.find((n) => n.id === 'b')!.state).toEqual({ status: 'hot', fill: 0.9 });
    expect(f.right.nodes.find((n) => n.id === 'a')!.highlighted).toBe(true);
    expect(f.right.nodes.find((n) => n.id === 'b')!.state.status).toBe('ok');
  });
});
