import { lerp, stateEase } from '../motion';
import type { NumbersScene } from '../types';

export interface NumbersFrame {
  bars: { id: string; label: string; unit: string; value: number; max: number }[];
  caption: string;
}

function valuesAt(scene: NumbersScene, step: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (let i = 0; i <= step; i++) Object.assign(out, scene.steps[i]?.values);
  return out;
}

export function buildNumbersFrame(scene: NumbersScene, step: number, progress: number, reduced: boolean): NumbersFrame {
  const s = Math.min(scene.steps.length - 1, Math.max(0, step));
  const now = valuesAt(scene, s);
  const before = s === 0 ? {} : valuesAt(scene, s - 1);
  const t = stateEase(progress, reduced);
  return {
    bars: scene.items.map((it) => ({
      id: it.id,
      label: it.label,
      unit: it.unit,
      max: it.max,
      value: lerp(before[it.id] ?? 0, now[it.id] ?? 0, t),
    })),
    caption: scene.steps[s].caption,
  };
}
