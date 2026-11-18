import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BANNED_DEPS, findBannedDeps, findRawColors, hasHover, usesMotionUnguarded } from './rules-lib';

describe('rule helpers can fail', () => {
  it('finds raw hex and functional colors', () => {
    expect(findRawColors('fill="#fff"')).toEqual(['#fff']);
    expect(findRawColors('color: rgb(0,0,0)')).toHaveLength(1);
    expect(findRawColors('fill: var(--accent)')).toEqual([]);
  });
  it('ignores html entities and in-page anchors', () => {
    expect(findRawColors('&#8594;')).toEqual([]);
    expect(findRawColors('<a href="#add">x</a>')).toEqual([]);
    expect(findRawColors('<a href="#bed">x</a>')).toEqual([]);
  });
  it('flags motion css without a reduced-motion guard', () => {
    expect(usesMotionUnguarded('a{animation:x 1s}')).toBe(true);
    expect(usesMotionUnguarded('@keyframes x{}')).toBe(true);
    expect(usesMotionUnguarded('@media (prefers-reduced-motion: no-preference){a{animation:x 1s}}')).toBe(false);
    expect(usesMotionUnguarded('a{color:red}')).toBe(false);
  });
  it('flags hover rules', () => {
    expect(hasHover('a:hover{}')).toBe(true);
    expect(hasHover('a{}')).toBe(false);
  });
  it('flags banned dependencies', () => {
    expect(findBannedDeps({ dependencies: { gsap: '3' } })).toEqual(['gsap']);
    expect(findBannedDeps({ devDependencies: { d3: '7' } })).toEqual(['d3']);
    expect(findBannedDeps({ dependencies: { astro: '5' } })).toEqual([]);
    expect(BANNED_DEPS).toContain('framer-motion');
  });
});

function sourceFiles(dir: string): string[] {
  return (readdirSync(dir, { recursive: true }) as string[])
    .map((f) => join(dir, f))
    .filter((f) => statSync(f).isFile() && ['.css', '.astro', '.tsx'].includes(extname(f)));
}

describe('design rules hold across src', () => {
  const files = sourceFiles('src');
  it('has no raw colors outside global.css', () => {
    for (const f of files.filter((f) => !f.endsWith('global.css'))) {
      expect(findRawColors(readFileSync(f, 'utf8')), relative('.', f)).toEqual([]);
    }
  });
  it('has no unguarded motion css', () => {
    for (const f of files) expect(usesMotionUnguarded(readFileSync(f, 'utf8')), relative('.', f)).toBe(false);
  });
  it('has no hover rules', () => {
    for (const f of files) expect(hasHover(readFileSync(f, 'utf8')), relative('.', f)).toBe(false);
  });
  it('has no banned dependencies', () => {
    expect(findBannedDeps(JSON.parse(readFileSync('package.json', 'utf8')))).toEqual([]);
  });
});
