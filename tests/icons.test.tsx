import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { ICON_FAMILY, ICON_NAMES, isIconName } from '../src/engine/icons';
import { Icon } from '../src/components/icons/Icon';

afterEach(cleanup);

describe('icon vocabulary', () => {
  it('has 32 unique names including the spec examples', () => {
    expect(ICON_NAMES).toHaveLength(32);
    expect(new Set(ICON_NAMES).size).toBe(32);
    expect(ICON_NAMES).toContain('cdn-edge');
    expect(ICON_NAMES).toContain('phone');
  });

  it('gives every icon one of the five hue families', () => {
    const families = ['slate', 'blue', 'violet', 'teal', 'pink'];
    for (const name of ICON_NAMES) expect(families, name).toContain(ICON_FAMILY[name]);
  });

  it('guards names at runtime', () => {
    expect(isIconName('phone')).toBe(true);
    expect(isIconName('toaster')).toBe(false);
  });
});

describe('Icon', () => {
  it('draws every icon with at least two shapes', () => {
    for (const name of ICON_NAMES) {
      const { container } = render(
        <svg>
          <Icon name={name} x={20} y={20} size={40} />
        </svg>,
      );
      const g = container.querySelector(`g[data-icon="${name}"]`);
      expect(g, name).not.toBeNull();
      expect(g!.querySelectorAll('path, rect, circle, ellipse, line, polygon').length, name).toBeGreaterThanOrEqual(2);
      cleanup();
    }
  });

  it('centers and scales the drawing on (x, y)', () => {
    const { container } = render(
      <svg>
        <Icon name="server" x={100} y={50} size={20} />
      </svg>,
    );
    expect(container.querySelector('g[data-icon]')!.getAttribute('transform')).toBe('translate(90 40) scale(0.5)');
  });
});

describe('icon palette', () => {
  it('never reuses the status colors', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    const value = (token: string) => new RegExp(`${token}:\\s*(#[0-9a-fA-F]{6})`).exec(css)?.[1].toLowerCase();
    const status = ['--ok', '--hot', '--down'].map(value);
    const icon = [...css.matchAll(/--ic-[a-z-]+:\s*(#[0-9a-fA-F]{6})/g)].map((m) => m[1].toLowerCase());
    expect(icon.length).toBeGreaterThanOrEqual(10);
    for (const c of icon) expect(status).not.toContain(c);
  });
});
