import { useEffect, useMemo, useRef, useState } from 'react';
import { clampStep, computeScroll } from '../engine/scroll';
import type { GraphFrame } from '../engine/frames/graph';
import type { ControlValues } from '../engine/types';
import { scenes } from '../scenes';
import { sims } from '../sims';
import { SceneView } from './SceneView';
import { GraphSceneView } from './scenes/GraphScene';
import { TrafficStream } from './TrafficStream';
import { TryItPanel } from './TryItPanel';


export function Player({ slug }: { slug: string }) {
  const scene = scenes[slug];
  const sim = sims[slug];
  const root = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ step: 0, progress: 0 });
  const [count, setCount] = useState(scene?.steps.length ?? 0);
  const [reduced, setReduced] = useState(false);
  const reducedRef = useRef(false);
  const [live, setLive] = useState(false);
  const [values, setValues] = useState<ControlValues>(() =>
    Object.fromEntries((sim?.controls ?? []).map((c) => [c.id, c.default])),
  );
  const result = useMemo(() => (sim ? sim.run(values) : null), [sim, values]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setReduced(mq.matches);
      reducedRef.current = mq.matches;
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    const blocks = () => Array.from(document.querySelectorAll<HTMLElement>('[data-step]'));
    // The active block is the one whose top has passed the middle of the reading area under the pin.
    const anchor = () => {
      const pin = ((root.current?.closest('.pin') as HTMLElement | null)?.offsetHeight ?? 0);
      return pin + (window.innerHeight - pin) / 2;
    };
    const rects = () => blocks().map((b) => {
      const r = b.getBoundingClientRect();
      return { top: r.top, height: r.height };
    });
    let raf = 0;
    const update = () => {
      raf = 0;
      const next = computeScroll(rects(), anchor());
      setPos((p) => (p.step === next.step && p.progress === next.progress ? p : next));
      const tryit = document.querySelector('[data-tryit]');
      setLive(Boolean(tryit) && tryit!.getBoundingClientRect().top <= anchor());
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) return;
      const delta = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (!delta) return;
      const list = blocks();
      if (list.length === 0) return;
      const r = rects();
      const a = anchor();
      const current = computeScroll(r, a);
      const entered = r[0].top <= a;
      let target: number;
      if (delta > 0) {
        if (!entered) target = 0;
        else if (current.step === list.length - 1) return; // past the last block (e.g. in Try it): leave scrolling to the browser
        else target = clampStep(current.step, 1, list.length);
      } else {
        if (!entered) return; // nothing above the first block
        if (current.progress > 0.05) target = current.step;
        else if (current.step === 0) return;
        else target = clampStep(current.step, -1, list.length);
      }
      e.preventDefault();
      window.scrollBy({ top: r[target].top - a + 1, behavior: reducedRef.current ? 'auto' : 'smooth' });
    };
    setCount(blocks().length || scene?.steps.length || 0);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('keydown', onKey);
    update();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('keydown', onKey);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scene]);

  if (!scene) return null;
  if (live && sim && result && scene.type === 'graph') {
    const frame: GraphFrame = {
      nodes: scene.nodes.map((n) => ({ ...n, state: result.states[n.id] ?? { status: 'ok' }, highlighted: false })),
      edges: scene.edges.map((e) => ({ ...e, id: `${e.from}>${e.to}`, highlighted: false })),
      caption: 'Live simulation',
    };
    return (
      <div ref={root} className="player live" data-live>
        <div className="stage">
          <GraphSceneView frame={frame} />
          {!reduced && <TrafficStream nodes={scene.nodes} routes={result.routes} rate={result.trafficRate} />}
        </div>
        <TryItPanel sim={sim} values={values} result={result} onChange={(id, v) => setValues((s) => ({ ...s, [id]: v }))} />
      </div>
    );
  }
  return (
    <div ref={root} className="player">
      <SceneView scene={scene} step={pos.step} progress={pos.progress} reduced={reduced} />
      <p className="stepcount">step {Math.min(pos.step + 1, count)} / {count}</p>
    </div>
  );
}
