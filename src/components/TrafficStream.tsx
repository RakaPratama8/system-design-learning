import { useEffect, useRef, useState } from 'react';
import { pointAlong } from '../engine/motion';
import { pickRoute } from '../engine/sim/shared';
import type { GraphNode, Route } from '../engine/types';

const MAX_DOTS_PER_SECOND = 30;
const TRAVEL_SECONDS = 1.2;

interface Dot { route: Route; t: number }

export function TrafficStream({ nodes, routes, rate }: { nodes: GraphNode[]; routes: Route[]; rate: number }) {
  const live = useRef({ routes, rate });
  live.current = { routes, rate };
  const dots = useRef<Dot[]>([]);
  const [, frame] = useState(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let carry = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      carry += Math.min(live.current.rate, MAX_DOTS_PER_SECOND) * dt;
      while (carry >= 1) {
        carry -= 1;
        const route = pickRoute(live.current.routes, Math.random());
        if (route) dots.current.push({ route, t: 0 });
      }
      dots.current = dots.current.map((d) => ({ ...d, t: d.t + dt / TRAVEL_SECONDS })).filter((d) => d.t < 1);
      frame((n) => n + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const byId = new Map(nodes.map((n) => [n.id, n]));
  return (
    <svg className="scene dots" viewBox="0 0 400 200" aria-hidden="true">
      {dots.current.map((d, i) => {
        const p = pointAlong(d.route.path.map((id) => byId.get(id)!), d.t);
        const failing = d.route.outcome === 'fail' && d.t > 0.85;
        return <circle key={i} data-dot="" className={failing ? 'dot fail' : 'dot'} cx={p.x} cy={p.y} r={3} />;
      })}
    </svg>
  );
}
