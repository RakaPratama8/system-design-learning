import type { CompareScene, GraphBody } from '../types';
import { buildGraphFrame, type GraphFrame } from './graph';

export interface CompareFrame {
  leftTitle: string;
  rightTitle: string;
  left: GraphFrame;
  right: GraphFrame;
  caption: string;
}

export function buildCompareFrame(scene: CompareScene, step: number, progress: number, reduced: boolean): CompareFrame {
  const side = (body: GraphBody, key: 'left' | 'right') =>
    buildGraphFrame({ ...body, steps: scene.steps.map((s) => ({ caption: s.caption, ...s[key] })) }, step, progress, reduced);
  const s = Math.min(scene.steps.length - 1, Math.max(0, step));
  return {
    leftTitle: scene.leftTitle,
    rightTitle: scene.rightTitle,
    left: side(scene.left, 'left'),
    right: side(scene.right, 'right'),
    caption: scene.steps[s].caption,
  };
}
