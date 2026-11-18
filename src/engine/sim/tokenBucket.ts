// One tick is one second. The bucket starts full; each tick spends tokens on arrivals, then refills.
export function tokenBucket(opts: { rate: number; burst: number; arrivals: number[] }): {
  allowed: number[];
  rejected: number[];
} {
  const { rate, burst } = opts;
  let tokens = burst;
  const allowed: number[] = [];
  const rejected: number[] = [];
  for (const arrival of opts.arrivals) {
    const ok = Math.min(arrival, Math.floor(tokens));
    allowed.push(ok);
    rejected.push(arrival - ok);
    tokens = Math.min(burst, tokens - ok + rate);
  }
  return { allowed, rejected };
}
