import { describe, expect, it } from 'vitest';
import { validateScene } from '../src/engine/validate';
import type { CompareScene, GraphScene, NumbersScene, SequenceScene } from '../src/engine/types';

const graph = (over: Partial<GraphScene> = {}): GraphScene => ({
  type: 'graph',
  nodes: [
    { id: 'a', label: 'A', x: 50, y: 100 },
    { id: 'b', label: 'B', x: 200, y: 100 },
    { id: 'c', label: 'C', x: 350, y: 100 },
  ],
  edges: [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }],
  steps: [{ caption: 'one', marker: ['a', 'b'], highlight: ['a>b'] }],
  ...over,
});

describe('validateScene graph', () => {
  it('accepts a valid scene', () => expect(validateScene(graph())).toEqual([]));
  it('rejects zero steps', () => {
    expect(validateScene(graph({ steps: [] })).join()).toMatch(/step/);
  });
  it('rejects an edge to a missing node', () => {
    const s = graph({ edges: [{ from: 'a', to: 'z' }] });
    expect(validateScene(s).join()).toMatch(/z/);
  });
  it('rejects a marker path with non-adjacent nodes', () => {
    const s = graph({ steps: [{ caption: 'x', marker: ['a', 'c'] }] });
    expect(validateScene(s).join()).toMatch(/a>c/);
  });
  it('rejects an unknown highlight id', () => {
    const s = graph({ steps: [{ caption: 'x', highlight: ['q'] }] });
    expect(validateScene(s).join()).toMatch(/q/);
  });
  it('rejects fill outside 0..1', () => {
    const s = graph({ steps: [{ caption: 'x', states: { a: { status: 'ok', fill: 1.5 } } }] });
    expect(validateScene(s).join()).toMatch(/fill/);
  });
  it('rejects duplicate node ids', () => {
    const s = graph();
    s.nodes.push({ id: 'a', label: 'dup', x: 0, y: 0 });
    expect(validateScene(s).join()).toMatch(/duplicate/);
  });
  it('rejects a state for an unknown node', () => {
    const s = graph({ steps: [{ caption: 'x', states: { nope: { status: 'ok' } } }] });
    expect(validateScene(s).join()).toMatch(/nope/);
  });
});

describe('validateScene graph layout', () => {
  it('rejects a node outside the drawable area', () => {
    const s = graph();
    s.nodes[0] = { id: 'a', label: 'A', x: 10, y: 100 };
    expect(validateScene(s).join()).toMatch(/bounds/);
    s.nodes[0] = { id: 'a', label: 'A', x: 50, y: 5 };
    expect(validateScene(s).join()).toMatch(/bounds/);
  });
  it('rejects overlapping nodes', () => {
    const s = graph();
    s.nodes[1] = { id: 'b', label: 'B', x: 80, y: 100 };
    expect(validateScene(s).join()).toMatch(/overlap/);
  });
  it('rejects a label too long for its box', () => {
    const s = graph();
    s.nodes[0] = { id: 'a', label: 'Load balancer', x: 50, y: 100 };
    expect(validateScene(s).join()).toMatch(/label/);
  });
  it('rejects a lane label that is too long', () => {
    const s: SequenceScene = {
      type: 'sequence',
      lanes: [{ id: 'c', label: 'A very long lane label' }],
      steps: [{ caption: 'x' }],
    };
    expect(validateScene(s).join()).toMatch(/label/);
  });
});

describe('validateScene sequence', () => {
  const seq = (over: Partial<SequenceScene> = {}): SequenceScene => ({
    type: 'sequence',
    lanes: [{ id: 'c', label: 'Client' }, { id: 's', label: 'Server' }],
    steps: [{ caption: 'hi', message: { from: 'c', to: 's', label: 'GET' } }],
    ...over,
  });
  it('accepts a valid scene', () => expect(validateScene(seq())).toEqual([]));
  it('rejects a message from an unknown lane', () => {
    const s = seq({ steps: [{ caption: 'x', message: { from: 'zz', to: 's', label: 'm' } }] });
    expect(validateScene(s).join()).toMatch(/zz/);
  });
});

describe('validateScene numbers', () => {
  const nums = (value: number): NumbersScene => ({
    type: 'numbers',
    items: [{ id: 'a', label: 'A', unit: 'ms', max: 100 }],
    steps: [{ caption: 'x', values: { a: value } }],
  });
  it('accepts a value within max', () => expect(validateScene(nums(50))).toEqual([]));
  it('rejects a value above max', () => expect(validateScene(nums(500)).join()).toMatch(/max/));
});

describe('validateScene compare', () => {
  const body = { nodes: graph().nodes, edges: graph().edges };
  const cmp = (right = body): CompareScene => ({
    type: 'compare',
    leftTitle: 'L',
    rightTitle: 'R',
    left: body,
    right,
    steps: [{ caption: 'x', left: { marker: ['a', 'b'] } }],
  });
  it('accepts a valid scene', () => expect(validateScene(cmp())).toEqual([]));
  it('reports a bad edge on the right side', () => {
    const bad = { nodes: body.nodes, edges: [{ from: 'a', to: 'nope' }] };
    expect(validateScene(cmp(bad)).join()).toMatch(/right/);
  });
});
