import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validateScene } from '../src/engine/validate';
import { scenes } from '../src/scenes';

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
});
