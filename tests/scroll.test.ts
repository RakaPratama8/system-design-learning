import { describe, expect, it } from 'vitest';
import { clampStep, computeScroll } from '../src/engine/scroll';

const blocks = [{ top: 0, height: 100 }, { top: 100, height: 100 }];

describe('computeScroll', () => {
  it('finds the step and progress under the anchor', () => {
    expect(computeScroll(blocks, 150)).toEqual({ step: 1, progress: 0.5 });
  });
  it('stays at the start above the first block', () => {
    expect(computeScroll(blocks, -20)).toEqual({ step: 0, progress: 0 });
  });
  it('stays at the end below the last block', () => {
    expect(computeScroll(blocks, 500)).toEqual({ step: 1, progress: 1 });
  });
  it('handles no blocks', () => {
    expect(computeScroll([], 10)).toEqual({ step: 0, progress: 0 });
  });
});

describe('clampStep', () => {
  it('clamps at both ends and steps in between', () => {
    expect(clampStep(0, -1, 5)).toBe(0);
    expect(clampStep(4, 1, 5)).toBe(4);
    expect(clampStep(2, 1, 5)).toBe(3);
  });
});
