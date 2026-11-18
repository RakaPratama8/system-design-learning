import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { GraphSceneView } from '../src/components/scenes/GraphScene';
import type { GraphFrame } from '../src/engine/frames/graph';

afterEach(cleanup);

const frame = (over: Partial<GraphFrame> = {}): GraphFrame => ({
  nodes: [
    { id: 'a', label: 'Client', x: 50, y: 100, icon: 'laptop', state: { status: 'ok' }, highlighted: false },
    { id: 'b', label: 'Server', x: 300, y: 100, icon: 'server', state: { status: 'down' }, highlighted: true },
  ],
  edges: [{ from: 'a', to: 'b', id: 'a>b', highlighted: true }],
  caption: 'cap',
  ...over,
});

describe('GraphSceneView', () => {
  it('renders every node label', () => {
    const { getByText } = render(<GraphSceneView frame={frame()} />);
    expect(getByText('Client')).toBeTruthy();
    expect(getByText('Server')).toBeTruthy();
  });
  it('renders the marker only when the frame has one', () => {
    expect(render(<GraphSceneView frame={frame()} />).container.querySelector('circle[data-marker]')).toBeNull();
    cleanup();
    const { container } = render(<GraphSceneView frame={frame({ marker: { x: 10, y: 20 } })} />);
    expect(container.querySelector('circle[data-marker]')).not.toBeNull();
  });
  it('exposes node status', () => {
    const { container } = render(<GraphSceneView frame={frame()} />);
    expect(container.querySelector('[data-node="b"]')?.getAttribute('data-status')).toBe('down');
  });

  const iconFrame = (over: Partial<GraphFrame['nodes'][number]> = {}): GraphFrame =>
    frame({
      nodes: [{ id: 'a', label: 'Server', x: 100, y: 100, icon: 'server', state: { status: 'ok' }, highlighted: false, ...over }],
      edges: [],
    });

  it('draws an icon tile and the label for a node with an icon', () => {
    const { container, getByText } = render(<GraphSceneView frame={iconFrame()} />);
    const node = container.querySelector('[data-node="a"]')!;
    expect(node.querySelector('g[data-icon="server"]')).not.toBeNull();
    expect(node.querySelector('rect.tile')).not.toBeNull();
    expect(getByText('Server')).toBeTruthy();
  });

  it('draws the load bar and state label for an icon node', () => {
    const { container, getByText } = render(
      <GraphSceneView frame={iconFrame({ state: { status: 'hot', fill: 0.5, label: 'busy' } })} />,
    );
    expect(container.querySelector('[data-node="a"] rect.fill')).not.toBeNull();
    expect(getByText('busy')).toBeTruthy();
  });

  it('marks a down icon node with its status', () => {
    const { container } = render(<GraphSceneView frame={iconFrame({ state: { status: 'down', label: 'off' } })} />);
    expect(container.querySelector('[data-node="a"]')!.getAttribute('data-status')).toBe('down');
  });
});

