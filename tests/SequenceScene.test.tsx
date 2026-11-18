import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { SequenceSceneView } from '../src/components/scenes/SequenceScene';
import { buildSequenceFrame } from '../src/engine/frames/sequence';
import type { SequenceScene } from '../src/engine/types';

afterEach(cleanup);

const scene = (icons: boolean): SequenceScene => ({
  type: 'sequence',
  lanes: [
    { id: 'c', label: 'Client', ...(icons ? { icon: 'laptop' as const } : {}) },
    { id: 's', label: 'Server', ...(icons ? { icon: 'server' as const } : {}) },
    { id: 'd', label: 'Database', ...(icons ? { icon: 'database' as const } : {}) },
  ],
  steps: [
    { caption: 'one', message: { from: 'c', to: 's', label: 'GET' }, states: { s: { status: 'ok', label: 'busy' } } },
    { caption: 'two', message: { from: 's', to: 'd', label: 'query' } },
  ],
});

describe('SequenceSceneView', () => {
  it('draws an icon and label in each lane header', () => {
    const frame = buildSequenceFrame(scene(true), 1, 1, false);
    const { container, getByText } = render(<SequenceSceneView frame={frame} />);
    for (const name of ['laptop', 'server', 'database']) {
      expect(container.querySelector(`g[data-icon="${name}"]`), name).not.toBeNull();
    }
    expect(getByText('Client')).toBeTruthy();
    expect(getByText('busy')).toBeTruthy();
  });

  it('starts every message below the lane headers', () => {
    const frame = buildSequenceFrame(scene(true), 1, 1, false);
    for (const m of frame.messages) expect(m.y).toBeGreaterThan(66);
  });

  it('draws no icon for a lane without one', () => {
    const frame = buildSequenceFrame(scene(false), 1, 1, false);
    const { container } = render(<SequenceSceneView frame={frame} />);
    expect(container.querySelector('g[data-icon]')).toBeNull();
  });
});
