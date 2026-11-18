export interface BlockRect { top: number; height: number }

export function computeScroll(blocks: BlockRect[], anchorY: number): { step: number; progress: number } {
  let step = -1;
  blocks.forEach((b, i) => {
    if (b.top <= anchorY) step = i;
  });
  if (step < 0) return { step: 0, progress: 0 };
  const { top, height } = blocks[step];
  const progress = height <= 0 ? 1 : Math.min(1, Math.max(0, (anchorY - top) / height));
  return { step, progress };
}

export function clampStep(current: number, delta: number, count: number): number {
  return Math.min(count - 1, Math.max(0, current + delta));
}
