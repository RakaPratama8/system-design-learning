import { describe, expect, it } from 'vitest';
import { shardLoads } from '../src/engine/sim/shardLoads';

describe('shardLoads', () => {
  it('splits uniform traffic evenly', () => expect(shardLoads(4, 400, false)).toEqual([100, 100, 100, 100]));
  it('sends half the traffic to shard 0 for a hot key', () => expect(shardLoads(4, 400, true)).toEqual([250, 50, 50, 50]));
  it('puts everything on the only shard', () => expect(shardLoads(1, 100, true)).toEqual([100]));
  it('handles zero traffic', () => expect(shardLoads(4, 0, true)).toEqual([0, 0, 0, 0]));
  it('keeps the total equal to the traffic', () => {
    const sum = shardLoads(3, 300, true).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(300);
  });
});
