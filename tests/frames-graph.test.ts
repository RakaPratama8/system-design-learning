import { describe, expect, it } from 'vitest';
import { buildGraphFrame } from '../src/engine/frames/graph';
import type { GraphScene } from '../src/engine/types';

const scene: GraphScene = {
  type: 'graph',
  nodes: [
    { id: 'a', label: 'A', x: 0, y: 0 },
    { id: 'b', label: 'B', x: 100, y: 0 },
    { id: 'c', label: 'C', x: 200, y: 0 },
  ],
  edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }],
  steps: [
    { caption: 'first', states: { b: { status: 'ok', fill: 0.2 } } },
    { caption: 'second', marker: ['a', 'b'] },
    { caption: 'third', states: { b: { status: 'hot', fill: 1 } } },
  ],
};
const node = (f: ReturnType<typeof buildGraphFrame>, id: string) => f.nodes.find((n) => n.id === id)!;

describe('buildGraphFrame', () => {
  it('carries node state forward when a step has none', () => {
    expect(node(buildGraphFrame(scene, 1, 1, false), 'b').state.fill).toBe(0.2);
  });

  it('eases state in over the first 40% of the block', () => {
    expect(node(buildGraphFrame(scene, 2, 0.2, false), 'b').state.fill).toBeCloseTo(0.6);
    expect(node(buildGraphFrame(scene, 2, 0.4, false), 'b').state.fill).toBe(1);
  });

  it('puts the marker along the path and jumps to the end under reduced motion', () => {
    expect(buildGraphFrame(scene, 1, 0.5, false).marker).toEqual({ x: 50, y: 0 });
    expect(buildGraphFrame(scene, 1, 0.5, true).marker).toEqual({ x: 100, y: 0 });
    expect(buildGraphFrame(scene, 0, 0.5, false).marker).toBeUndefined();
  });

  it('highlights nodes and edges on the marker path', () => {
    const f = buildGraphFrame(scene, 1, 0.5, false);
    expect(node(f, 'a').highlighted).toBe(true);
    expect(node(f, 'c').highlighted).toBe(false);
    expect(f.edges.find((e) => e.id === 'a>b')!.highlighted).toBe(true);
    expect(f.edges.find((e) => e.id === 'b>c')!.highlighted).toBe(false);
  });

  it('highlights explicit ids and clamps the step', () => {
    const s: GraphScene = { ...scene, steps: [{ caption: 'x', highlight: ['c', 'b>c'] }, { caption: 'last' }] };
    const f = buildGraphFrame(s, 0, 0, false);
    expect(node(f, 'c').highlighted).toBe(true);
    expect(f.edges.find((e) => e.id === 'b>c')!.highlighted).toBe(true);
    expect(buildGraphFrame(s, 99, 0, false).caption).toBe('last');
  });

  it('passes a node icon through to the frame', () => {
    const s: GraphScene = {
      ...scene,
      nodes: [{ ...scene.nodes[0], icon: 'server' }, ...scene.nodes.slice(1)],
    };
    const f = buildGraphFrame(s, 0, 0, false);
    expect(node(f, 'a').icon).toBe('server');
    expect(node(f, 'b').icon).toBeUndefined();
  });
});

