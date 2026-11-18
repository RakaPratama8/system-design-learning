import type { ControlValues, Sim, SimResult } from '../engine/types';

interface Props {
  sim: Sim;
  values: ControlValues;
  result: SimResult;
  onChange: (id: string, value: number | boolean) => void;
}

export function TryItPanel({ sim, values, result, onChange }: Props) {
  return (
    <div className="panel" data-controls>
      {sim.controls.map((c) =>
        c.kind === 'toggle' ? (
          <label key={c.id} className="ctl">
            <input
              type="checkbox"
              name={c.id}
              checked={Boolean(values[c.id])}
              onChange={(e) => onChange(c.id, e.target.checked)}
            />{' '}
            {c.label}
          </label>
        ) : (
          <label key={c.id} className="ctl">
            {c.label}: <output>{String(values[c.id])}</output>
            <input
              type="range"
              name={c.id}
              min={c.min}
              max={c.max}
              step={c.step}
              value={Number(values[c.id])}
              onChange={(e) => onChange(c.id, Number(e.target.value))}
            />
          </label>
        ),
      )}
      <dl className="readouts" aria-live="polite">
        {result.readouts.map((r) => (
          <div key={r.label}>
            <dt>{r.label}</dt>
            <dd data-readout={r.label}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
