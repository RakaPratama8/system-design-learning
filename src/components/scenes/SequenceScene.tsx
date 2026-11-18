import type { SequenceFrame } from '../../engine/frames/sequence';
import { TILE } from '../../engine/layout';
import { Icon } from '../icons/Icon';

export function SequenceSceneView({ frame }: { frame: SequenceFrame }) {
  const x = (id: string) => frame.lanes.find((l) => l.id === id)!.x;
  return (
    <svg className="scene seq" viewBox="0 0 400 200" role="img" aria-label={frame.caption}>
      {frame.lanes.map((l) =>
        l.icon ? (
          <g key={l.id} data-node={l.id} data-status={l.state.status} className="node">
            <line className="lane" x1={l.x} y1={66} x2={l.x} y2={195} />
            <rect className="tile" x={l.x - TILE / 2} y={4} width={TILE} height={TILE} rx={8} />
            <Icon name={l.icon} x={l.x} y={4 + TILE / 2} size={26} />
            <text className="lbl" x={l.x} y={52} textAnchor="middle">{l.label}</text>
            {l.state.label && <text className="sub" x={l.x} y={62} textAnchor="middle">{l.state.label}</text>}
          </g>
        ) : (
        <g key={l.id} data-node={l.id} data-status={l.state.status} className="node">
          <line className="lane" x1={l.x} y1={36} x2={l.x} y2={195} />
          <rect x={l.x - 32} y={6} width={64} height={28} rx={6} />
          <text x={l.x} y={24} textAnchor="middle">{l.label}</text>
          {l.state.label && <text className="sub" x={l.x} y={46} textAnchor="middle">{l.state.label}</text>}
        </g>
        ),
      )}
      {frame.messages.map((m, i) => {
        const x1 = x(m.from);
        const x2 = x(m.to);
        const end = x1 + (x2 - x1) * m.progress;
        const dir = Math.sign(x2 - x1) || 1;
        return (
          <g key={i} className={m.current ? 'msg on' : 'msg'} data-message={m.label}>
            <line x1={x1} y1={m.y} x2={end} y2={m.y} />
            {m.progress >= 1 && (
              <polygon points={`${end},${m.y} ${end - 7 * dir},${m.y - 4} ${end - 7 * dir},${m.y + 4}`} />
            )}
            {m.current && m.progress < 1 && <circle data-marker="" className="marker" cx={end} cy={m.y} r={4} />}
            <text x={(x1 + x2) / 2} y={m.y - 5} textAnchor="middle">{m.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
