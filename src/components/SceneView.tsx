import { buildCompareFrame } from '../engine/frames/compare';
import { buildNumbersFrame } from '../engine/frames/numbers';
import { buildGraphFrame } from '../engine/frames/graph';
import { buildSequenceFrame } from '../engine/frames/sequence';
import type { Scene } from '../engine/types';
import { CompareSceneView } from './scenes/CompareScene';
import { GraphSceneView } from './scenes/GraphScene';
import { NumbersSceneView } from './scenes/NumbersScene';
import { SequenceSceneView } from './scenes/SequenceScene';

interface Props { scene: Scene; step: number; progress: number; reduced: boolean }

export function SceneView({ scene, step, progress, reduced }: Props) {
  switch (scene.type) {
    case 'graph': {
      const frame = buildGraphFrame(scene, step, progress, reduced);
      return (
        <>
          <GraphSceneView frame={frame} />
          <p data-caption className="caption">{frame.caption}</p>
        </>
      );
    }
    case 'sequence': {
      const frame = buildSequenceFrame(scene, step, progress, reduced);
      return (
        <>
          <SequenceSceneView frame={frame} />
          <p data-caption className="caption">{frame.caption}</p>
        </>
      );
    }
    case 'compare': {
      const frame = buildCompareFrame(scene, step, progress, reduced);
      return (
        <>
          <CompareSceneView frame={frame} />
          <p data-caption className="caption">{frame.caption}</p>
        </>
      );
    }
    case 'numbers': {
      const frame = buildNumbersFrame(scene, step, progress, reduced);
      return (
        <>
          <NumbersSceneView frame={frame} />
          <p data-caption className="caption">{frame.caption}</p>
        </>
      );
    }
    default:
      throw new Error(`unsupported scene type: ${(scene as { type: string }).type}`);
  }
}
