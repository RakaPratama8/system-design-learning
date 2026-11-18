import { describe, expect, it } from 'vitest';
import { tokenBucket } from '../src/engine/sim/tokenBucket';

describe('tokenBucket', () => {
  it('lets a full bucket absorb a burst, then limits to the refill rate', () => {
    const r = tokenBucket({ rate: 2, burst: 4, arrivals: [10, 10, 10] });
    expect(r.allowed).toEqual([4, 2, 2]);
    expect(r.rejected).toEqual([6, 8, 8]);
  });
  it('does nothing when no requests arrive', () => {
    const r = tokenBucket({ rate: 2, burst: 4, arrivals: [0, 0] });
    expect(r.allowed).toEqual([0, 0]);
    expect(r.rejected).toEqual([0, 0]);
  });
  it('allows everything that fits in the bucket', () => {
    expect(tokenBucket({ rate: 2, burst: 4, arrivals: [1] }).allowed).toEqual([1]);
  });
  it('never refills past the burst size', () => {
    const r = tokenBucket({ rate: 5, burst: 3, arrivals: [0, 0, 0, 10] });
    expect(r.allowed[3]).toBe(3);
  });
});
