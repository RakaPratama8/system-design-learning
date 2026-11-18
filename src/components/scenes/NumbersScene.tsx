import type { NumbersFrame } from '../../engine/frames/numbers';

const TRACK = 220;

export function NumbersSceneView({ frame }: { frame: NumbersFrame }) {
  const row = Math.min(40, 180 / Math.max(1, frame.bars.length));
  return (
    <svg className="scene nums" viewBox="0 0 400 200" role="img" aria-label={frame.caption}>
      {frame.bars.map((b, i) => {
        const y = 16 + i * row;
        const w = b.max > 0 ? Math.min(1, Math.max(0, b.value / b.max)) * TRACK : 0;
        return (
          <g key={b.id} data-bar={b.id}>
            <text className="lbl" x={8} y={y + 11}>{b.label}</text>
            <rect className="track" x={120} y={y} width={TRACK} height={14} rx={3} />
            <rect className="val" x={120} y={y} width={w} height={14} rx={3} />
            <text className="num" x={120 + TRACK + 6} y={y + 11}>{Math.round(b.value).toLocaleString('en-US')} {b.unit}</text>
          </g>
        );
      })}
    </svg>
  );
}
