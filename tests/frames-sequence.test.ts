import { describe, expect, it } from 'vitest';
import { buildSequenceFrame } from '../src/engine/frames/sequence';
import type { SequenceScene } from '../src/engine/types';

const scene: SequenceScene = {
  type: 'sequence',
  lanes: [{ id: 'a', label: 'A', icon: 'server' }, { id: 'b', label: 'B', icon: 'server' }, { id: 'c', label: 'C', icon: 'server' }],
  steps: [
    { caption: 'one', message: { from: 'a', to: 'b', label: 'm1' } },
    { caption: 'two', message: { from: 'b', to: 'c', label: 'm2' }, states: { c: { status: 'hot', fill: 1 } } },
    { caption: 'three' },
  ],
};

describe('buildSequenceFrame', () => {
  it('keeps earlier messages fully drawn once the step has passed', () => {
    const f = buildSequenceFrame(scene, 2, 0.5, false);
    expect(f.messages.map((m) => m.label)).toEqual(['m1', 'm2']);
    expect(f.messages.every((m) => m.progress === 1 && !m.current)).toBe(true);
  });

  it('animates only the current step message', () => {
    const f = buildSequenceFrame(scene, 1, 0.5, false);
    expect(f.messages[0]).toMatchObject({ label: 'm1', progress: 1, current: false });
    expect(f.messages[1]).toMatchObject({ label: 'm2', progress: 0.5, current: true });
  });

  it('jumps the current message to the end under reduced motion', () => {
    expect(buildSequenceFrame(scene, 1, 0.1, true).messages[1].progress).toBe(1);
  });

  it('gives each message its own row, in order', () => {
    const ys = buildSequenceFrame(scene, 2, 1, false).messages.map((m) => m.y);
    expect(ys[1]).toBeGreaterThan(ys[0]);
  });

  it('spaces lanes evenly across the width', () => {
    const xs = buildSequenceFrame(scene, 0, 0, false).lanes.map((l) => l.x);
    expect(xs[1] - xs[0]).toBeCloseTo(xs[2] - xs[1]);
    expect(xs[0]).toBeGreaterThan(0);
    expect(xs[2]).toBeLessThan(400);
  });

  it('carries lane state forward and eases it in', () => {
    expect(buildSequenceFrame(scene, 2, 1, false).lanes[2].state).toEqual({ status: 'hot', fill: 1 });
    expect(buildSequenceFrame(scene, 1, 0.1, false).lanes[2].state.status).toBe('ok');
    expect(buildSequenceFrame(scene, 1, 0.2, false).lanes[2].state.status).toBe('hot');
  });

  it('carries the caption of the clamped step', () => {
    expect(buildSequenceFrame(scene, 99, 0, false).caption).toBe('three');
  });

  it('shifts message rows under icon headers and keeps them on screen', () => {
    const iconScene: SequenceScene = {
      ...scene,
      lanes: scene.lanes.map((l) => ({ ...l, icon: 'server' as const })),
      steps: Array.from({ length: 7 }, (_, i) => ({
        caption: String(i),
        message: { from: 'a', to: 'b', label: 'm' + i },
      })),
    };
    const f = buildSequenceFrame(iconScene, 6, 1, false);
    expect(f.lanes[0].icon).toBe('server');
    expect(f.messages[0].y).toBeGreaterThanOrEqual(78);
    expect(f.messages[6].y).toBeLessThanOrEqual(190);
  });
});

