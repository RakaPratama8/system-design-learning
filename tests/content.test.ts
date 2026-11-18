import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateScene } from '../src/engine/validate';
import { scenes } from '../src/scenes';
import { sims } from '../src/sims';

const dir = 'src/content/lessons';
const files = readdirSync(dir).filter((f) => f.endsWith('.mdx'));
const slugOf = (f: string) => f.replace(/\.mdx$/, '');

describe('lessons', () => {
  it('exist', () => expect(files.length).toBeGreaterThan(0));

  for (const f of files) {
    describe(slugOf(f), () => {
      const text = readFileSync(join(dir, f), 'utf8');
      it('has complete frontmatter', () => {
        const fm = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? '';
        for (const key of ['title', 'level', 'order', 'summary']) expect(fm, key).toMatch(new RegExp(`^${key}:`, 'm'));
      });
      it('has a valid scene', () => {
        const scene = scenes[slugOf(f)];
        expect(scene, 'missing scene').toBeDefined();
        expect(validateScene(scene)).toEqual([]);
      });
      it('has <TryIt> after the last step if and only if it is a poke lesson', () => {
        const isPoke = /^poke:\s*true/m.test(text);
        const tryIt = text.indexOf('<TryIt');
        expect(tryIt >= 0, 'TryIt present').toBe(isPoke);
        if (isPoke) expect(tryIt).toBeGreaterThan(text.lastIndexOf('<Step'));
      });
      it('has one <Step> per scene step', () => {
        const count = (text.match(/<Step\b/g) ?? []).length;
        expect(count).toBe(scenes[slugOf(f)].steps.length);
      });
    });
  }

  it('has a lesson for every scene', () => {
    const slugs = new Set(files.map(slugOf));
    for (const key of Object.keys(scenes)) expect(slugs.has(key), `orphan scene ${key}`).toBe(true);
  });

  describe('poke lessons', () => {
    const poke = files.filter((f) => /^poke:\s*true/m.test(readFileSync(join(dir, f), 'utf8'))).map(slugOf);
    it('each has a sim, and every sim has a poke lesson', () => {
      for (const slug of poke) expect(sims[slug], `missing sim for ${slug}`).toBeDefined();
      for (const slug of Object.keys(sims)) expect(poke, `sim without poke lesson ${slug}`).toContain(slug);
    });
    const settings = (sim: (typeof sims)[string]) => {
      const options = sim.controls.map((c) =>
        c.kind === 'toggle' ? [true, false] : [...new Set([c.min ?? 0, c.default as number, c.max ?? 0])],
      );
      return options.reduce<(number | boolean)[][]>((acc, opts) => acc.flatMap((a) => opts.map((o) => [...a, o])), [[]]);
    };
    for (const slug of Object.keys(sims)) {
      it(`${slug}: every control combination gives sane output`, () => {
        const sim = sims[slug];
        const scene = scenes[slug];
        if (scene.type !== 'graph') return;
        const ids = new Set(scene.nodes.map((n) => n.id));
        for (const combo of settings(sim)) {
          const values = Object.fromEntries(sim.controls.map((c, i) => [c.id, combo[i]]));
          const r = sim.run(values);
          const where = JSON.stringify(values);
          expect(JSON.stringify(r), where).not.toMatch(/NaN|Infinity|null/);
          for (const [id, st] of Object.entries(r.states)) {
            expect(ids.has(id), `${where} state ${id}`).toBe(true);
            if (st.fill !== undefined) expect(st.fill >= 0 && st.fill <= 1, `${where} fill ${id}`).toBe(true);
          }
          for (const route of r.routes) {
            expect(route.weight >= 0, `${where} weight`).toBe(true);
            for (const id of route.path) expect(ids.has(id), `${where} route node ${id}`).toBe(true);
          }
          expect(r.trafficRate >= 0, `${where} trafficRate`).toBe(true);
        }
      });
    }
    for (const slug of poke) {
      it(`${slug}: sim output only references nodes in its graph scene`, () => {
        const scene = scenes[slug];
        expect(scene.type).toBe('graph');
        if (scene.type !== 'graph') return;
        const ids = new Set(scene.nodes.map((n) => n.id));
        const result = sims[slug].run(Object.fromEntries(sims[slug].controls.map((c) => [c.id, c.default])));
        for (const id of Object.keys(result.states)) expect(ids.has(id), `state for ${id}`).toBe(true);
        for (const r of result.routes) for (const id of r.path) expect(ids.has(id), `route node ${id}`).toBe(true);
      });
    }
  });
});

// Scenes migrated to icons so far (Tasks 6-8 grow this list; Task 9 checks every scene).
const ICONIZED = [
  'client-server', 'dns', 'http-request-lifecycle', 'apis-rest', 'sql-vs-nosql',
  'scaling-vertical-horizontal', 'load-balancers',
];

describe('icons', () => {
  const components = (s: (typeof scenes)[string]) =>
    s.type === 'graph' ? s.nodes : s.type === 'compare' ? [...s.left.nodes, ...s.right.nodes] : s.type === 'sequence' ? s.lanes : [];
  for (const slug of ICONIZED) {
    it(`every node and lane in ${slug} has an icon`, () => {
      for (const c of components(scenes[slug])) expect(c.icon, `${slug}: ${c.id}`).toBeDefined();
    });
  }
});

describe('curriculum', () => {
  const lessons = files.map((f) => {
    const text = readFileSync(join(dir, f), 'utf8');
    return {
      slug: slugOf(f),
      level: Number(/^level:\s*(\d)/m.exec(text)?.[1]),
      order: Number(/^order:\s*(\d+)/m.exec(text)?.[1]),
      poke: /^poke:\s*true/m.test(text),
    };
  });

  it('has 29 lessons: 9 foundations, 10 intermediate, 10 advanced', () => {
    expect(lessons).toHaveLength(29);
    expect([1, 2, 3].map((l) => lessons.filter((x) => x.level === l).length)).toEqual([9, 10, 10]);
  });

  it('numbers lessons 1..9, 10..19 and 20..29 without gaps or repeats', () => {
    const orders = lessons.map((x) => x.order).sort((a, b) => a - b);
    expect(orders).toEqual(Array.from({ length: 29 }, (_, i) => i + 1));
    for (const x of lessons) expect(x.level, x.slug).toBe(x.order <= 9 ? 1 : x.order <= 19 ? 2 : 3);
  });

  it('has live Try it exactly on the five trade-off topics', () => {
    expect(lessons.filter((x) => x.poke).map((x) => x.slug).sort()).toEqual(
      ['caching', 'load-balancers', 'rate-limiting', 'replication', 'sharding'],
    );
  });

  it('uses every scene type at least once', () => {
    expect(new Set(Object.values(scenes).map((s) => s.type))).toEqual(
      new Set(['graph', 'sequence', 'compare', 'numbers']),
    );
  });
});

