import type { CompareFrame } from '../../engine/frames/compare';
import { GraphSceneView } from './GraphScene';

export function CompareSceneView({ frame }: { frame: CompareFrame }) {
  return (
    <div className="compare">
      <div className="side">
        <h3>{frame.leftTitle}</h3>
        <GraphSceneView frame={frame.left} />
      </div>
      <div className="side">
        <h3>{frame.rightTitle}</h3>
        <GraphSceneView frame={frame.right} />
      </div>
    </div>
  );
}
