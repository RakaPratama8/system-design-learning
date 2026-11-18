import { describe, expect, it } from 'vitest';
import { buildNumbersFrame } from '../src/engine/frames/numbers';
import type { NumbersScene } from '../src/engine/types';

const scene: NumbersScene = {
  type: 'numbers',
  items: [
    { id: 'a', label: 'A', unit: 'ms', max: 100 },
    { id: 'b', label: 'B', unit: 'rps', max: 50 },
  ],
  steps: [
    { caption: 'first', values: { a: 10, b: 5 } },
    { caption: 'second', values: { a: 30 } },
  ],
};
const bar = (f: ReturnType<typeof buildNumbersFrame>, id: string) => f.bars.find((b) => b.id === id)!;

describe('buildNumbersFrame', () => {
  it('grows from zero on the first step', () => {
    expect(bar(buildNumbersFrame(scene, 0, 0.4, false), 'a').value).toBe(10);
    expect(bar(buildNumbersFrame(scene, 0, 0.2, false), 'a').value).toBe(5);
  });

  it('interpolates from the previous step value', () => {
    expect(bar(buildNumbersFrame(scene, 1, 0.2, false), 'a').value).toBe(20);
    expect(bar(buildNumbersFrame(scene, 1, 0.4, false), 'a').value).toBe(30);
  });

  it('jumps to the final value under reduced motion', () => {
    expect(bar(buildNumbersFrame(scene, 1, 0, true), 'a').value).toBe(30);
  });

  it('keeps the previous value for an item a step omits', () => {
    expect(bar(buildNumbersFrame(scene, 1, 1, false), 'b').value).toBe(5);
  });

  it('exposes label, unit, max and the step caption', () => {
    const f = buildNumbersFrame(scene, 1, 1, false);
    expect(bar(f, 'b')).toMatchObject({ label: 'B', unit: 'rps', max: 50 });
    expect(f.caption).toBe('second');
  });
});
