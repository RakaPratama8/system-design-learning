import type { GraphFrame } from '../../engine/frames/graph';
import { TILE } from '../../engine/layout';
import { Icon } from '../icons/Icon';

export function GraphSceneView({ frame }: { frame: GraphFrame }) {
  const at = (id: string) => frame.nodes.find((n) => n.id === id)!;
  const notable = frame.nodes
    .filter((n) => n.state.status !== 'ok' || n.state.label)
    .map((n) => `${n.label}: ${n.state.label ?? n.state.status}`)
    .join('. ');
  return (
    <svg className="scene" viewBox="0 0 400 200" role="img" aria-label={notable ? `${frame.caption} ${notable}.` : frame.caption}>
      {frame.edges.map((e) => (
        <line
          key={e.id}
          className={e.highlighted ? 'edge on' : 'edge'}
          x1={at(e.from).x}
          y1={at(e.from).y}
          x2={at(e.to).x}
          y2={at(e.to).y}
        />
      ))}
      {frame.nodes.map((n) => (
          <g key={n.id} data-node={n.id} data-status={n.state.status} className={n.highlighted ? 'node on' : 'node'}>
            {n.state.label && (
              <text className="sub" x={n.x} y={n.y - TILE / 2 - 3} textAnchor="middle">
                {n.state.label}
              </text>
            )}
            <rect className="tile" x={n.x - TILE / 2} y={n.y - TILE / 2} width={TILE} height={TILE} rx={8} />
            <Icon name={n.icon} x={n.x} y={n.y - 2} size={26} />
            <text className="lbl" x={n.x} y={n.y + TILE / 2 + 11} textAnchor="middle">
              {n.label}
            </text>
            {n.state.fill !== undefined && (
              <rect className="fill" x={n.x - 14} y={n.y + TILE / 2 - 5} width={28 * n.state.fill} height={3} rx={1.5} />
            )}
          </g>
        ))}
      {frame.marker && <circle data-marker="" className="marker" cx={frame.marker.x} cy={frame.marker.y} r={5} />}
    </svg>
  );
}
