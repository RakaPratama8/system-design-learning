import type { GraphFrame } from '../../engine/frames/graph';

const W = 64;
const H = 32;

export function GraphSceneView({ frame }: { frame: GraphFrame }) {
  const at = (id: string) => frame.nodes.find((n) => n.id === id)!;
  return (
    <svg className="scene" viewBox="0 0 400 200" role="img" aria-label={frame.caption}>
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
          <rect x={n.x - W / 2} y={n.y - H / 2} width={W} height={H} rx={6} />
          {n.state.fill !== undefined && (
            <rect
              className="fill"
              x={n.x - W / 2 + 4}
              y={n.y + H / 2 - 8}
              width={(W - 8) * n.state.fill}
              height={4}
              rx={2}
            />
          )}
          <text x={n.x} y={n.y - (n.state.fill !== undefined ? 2 : -4)} textAnchor="middle">
            {n.label}
          </text>
          {n.state.label && (
            <text className="sub" x={n.x} y={n.y - H / 2 - 4} textAnchor="middle">
              {n.state.label}
            </text>
          )}
        </g>
      ))}
      {frame.marker && <circle data-marker="" className="marker" cx={frame.marker.x} cy={frame.marker.y} r={5} />}
    </svg>
  );
}
