// Per-shard load. A hot key sends half of all traffic to shard 0; the rest is spread evenly over every shard.
export function shardLoads(shards: number, traffic: number, hotKey: boolean): number[] {
  const n = Math.max(1, Math.floor(shards));
  const even = (hotKey ? traffic * 0.5 : traffic) / n;
  return Array.from({ length: n }, (_, i) => (hotKey && i === 0 ? traffic * 0.5 + even : even));
}
