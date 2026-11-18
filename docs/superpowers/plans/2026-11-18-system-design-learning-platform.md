# System Design Learning Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, scroll-driven system design learning site with 29 lessons across three levels, each with an animated diagram, and live "Try it" simulations on five trade-off topics.

**Architecture:** An Astro static site. Each lesson is an MDX file (numbered `<Step>` blocks) plus a typed scene file (`src/scenes/<slug>.ts`). One React island, `Player`, pins a diagram and, as the reader scrolls, maps scroll position to `(stepIndex, progress)`. It renders the scene through pure "frame builder" functions, one per scene type, so nearly all logic is unit-testable without a browser. Poke topics add a pure simulation (`src/sims/<slug>.ts`) driving a live traffic stream.

**Tech Stack:** Astro, React, MDX, TypeScript, Vitest (+ jsdom, @testing-library/react). SVG animated with CSS and `requestAnimationFrame`; no animation library.

**Spec:** `docs/superpowers/specs/2026-11-18-system-design-learning-design.md`

## Global Constraints

- Static site only: no backend, no accounts, no database. Progress lives in `localStorage`.
- Stack: Astro + React + MDX; diagrams are SVG; no diagram library and no heavy animation library.
- Four scene types share one player and one scroll-driven layout: `graph`, `sequence`, `compare`, `numbers`.
- Lesson layout: diagram pinned at the top; numbered explanation blocks scroll beneath it; scrolling advances the diagram; no Next button; going back is scrolling up. Arrow keys also step.
- Animation: scrubbed marker motion and state animation in every Watch lesson; live traffic only in Poke topics; ambient flow only on links highlighted in the current step; no decorative animation (no entrance fades, no hover effects).
- Must respect `prefers-reduced-motion`: the diagram jumps between states instead of animating.
- 29 lessons at launch; Poke topics exactly: load balancers, caching, replication, rate limiting, sharding.
- Simple, calm, diagram-first visual design. Desktop is the primary target; mobile must remain usable but is not polished.
- Adding a lesson means writing text and a scene file, not UI code.
- Finish condition for every task: `npm run verify` (typecheck + tests + build) passes, and any new behavior has a test, before the task's commit. The task-level test commands below are for fast feedback only. Report the verify result, not just "done".
- Rules are enforced in code, not prose. The design rules (no raw colors outside `global.css`, no motion CSS without a `prefers-reduced-motion` guard, no hover effects, no banned animation or diagram libraries) are scan tests in `tests/rules.test.ts`. If the same mistake happens twice, add a check instead of a note.
- `decisions.tsv` (project root, tab-separated, header row `time	decision	reason	evidence	result`): append one row per non-obvious decision. Lesson simplifications and unresolved factual doubts go here for the owner's review.
- Fresh-reviewer passes (subagent on the most capable model) happen at Checkpoint A (after Task 10), after each content task (accuracy), and at the end.

## Review Focus

Failure modes the spec implies that most likely bite a reader (each is pinned by a test in the task named):

1. A lesson whose `<Step>` count differs from its scene's step count renders a diagram out of sync with the text. (Task 5, content test)
2. `localStorage` unavailable, throwing, or holding corrupt JSON (private browsing) must not break the site; checkmarks just don't persist. (Task 6)
3. Simulations at zero traffic, all servers down, or one shard must never produce `NaN`, `Infinity`, or negative values. (Tasks 10-14)
4. A scene that references a node id, lane id, or edge that doesn't exist must fail at test time, not render a blank diagram. (Task 2)
5. With `prefers-reduced-motion`, nothing animates and the final state of each step is shown immediately. (Task 3, Task 5)

---

## File Structure

```
package.json, astro.config.mjs, tsconfig.json, vitest.config.ts, playwright.config.ts, .gitignore
CLAUDE.md                             short working rules (finish condition, repeat-mistake rule, decisions log)
decisions.tsv                         decision log
tests/rules-lib.ts, tests/rules.test.ts   scan helpers and design-rule scan tests
tests-e2e/lesson-scroll.spec.ts       Playwright smoke test for the scroll-driven player
src/styles/global.css                 design tokens + base styles
src/layouts/Base.astro                page shell
src/pages/index.astro                 home: three-level map
src/pages/lessons/[slug].astro        lesson page: pinned Player + MDX body
src/content.config.ts                 lessons collection schema
src/content/lessons/<slug>.mdx        lesson text (29)
src/components/Step.astro             <section data-step> wrapper
src/components/TryIt.astro            <section data-tryit> marker
src/components/Player.tsx             scroll wiring, keyboard, reduced motion, mode switch
src/components/SceneView.tsx          dispatch by scene.type to a scene component
src/components/scenes/{Graph,Sequence,Compare,Numbers}Scene.tsx   thin SVG renderers
src/components/TryItPanel.tsx         sim controls + readouts
src/components/TrafficStream.tsx      rAF dot stream over the graph
src/engine/types.ts                   Scene, Step, NodeState, Sim types
src/engine/validate.ts                validateScene
src/engine/motion.ts                  lerp, interpolateNodeState, pointAlong, stateEase, markerT
src/engine/scroll.ts                  computeScroll, clampStep
src/engine/frames/{graph,sequence,compare,numbers}.ts   pure frame builders
src/engine/progress.ts                localStorage done-set
src/engine/sim/shared.ts              loadState, pickRoute
src/engine/sim/tokenBucket.ts, shardLoads.ts   pure algorithms
src/scenes/<slug>.ts                  one Scene per lesson (default export); src/scenes/index.ts registry
src/sims/<slug>.ts                    one Sim per Poke lesson (default export); src/sims/index.ts registry
src/scripts/progress-dom.ts           home/lesson DOM wiring for checkmarks
tests/                                Vitest tests mirroring src/engine and content
README.md                             how to add a lesson
```

---

### Task 1: Project scaffold, tooling, design tokens

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `CLAUDE.md`, `decisions.tsv`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/pages/index.astro` (placeholder), `tests/rules-lib.ts`
- Test: `tests/rules.test.ts`

**Interfaces:**
- Produces: `npm run dev|build|test|verify|e2e` scripts (`verify` = `astro check && vitest run && astro build`; `e2e` = `playwright test`); `Base.astro` taking `props: { title: string }` and a default slot; CSS variables listed below; scan helpers:
```ts
// tests/rules-lib.ts
export const BANNED_DEPS: string[];  // framer-motion, motion, gsap, animejs, react-spring, @react-spring/web, lottie-web, react-transition-group, d3, mermaid, reactflow, @xyflow/react
export function findRawColors(text: string): string[];       // hex literals (#rgb, #rrggbb, #rrggbbaa) and rgb(/rgba(/hsl( literals
export function usesMotionUnguarded(text: string): boolean;  // contains @keyframes, `animation:` or `transition:` but no `prefers-reduced-motion`
export function hasHover(text: string): boolean;             // contains `:hover`
export function findBannedDeps(pkg: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }): string[];
```

- [ ] **Step 1:** `git init` in the project root. `.gitignore`: `node_modules`, `dist`, `.astro`, `.superpowers/`, `test-results`, `playwright-report`.
- [ ] **Step 2:** Scaffold Astro (current release, TypeScript strict) with React and MDX integrations in the existing folder; add dev dependencies `vitest`, `jsdom`, `@testing-library/react`, `typescript`, `@astrojs/check`, `@playwright/test` (browser install happens in Task 5). Scripts: `dev`, `build`, `test` (`vitest run`), `verify`, `e2e` as above. Vitest env: jsdom; `include: ['tests/**/*.test.{ts,tsx}']` so Playwright specs in `tests-e2e/` are never picked up.
- [ ] **Step 3:** `src/styles/global.css` defines CSS variables: `--bg:#fafaf9; --text:#1c1917; --muted:#78716c; --line:#d6d3d1; --accent:#2563eb; --accent-soft:#dbeafe; --ok:#16a34a; --hot:#d97706; --down:#dc2626`; system-ui font; text column max-width 680px; no transitions or hover effects.
- [ ] **Step 4:** `Base.astro` imports global.css and renders `<slot/>` inside `<main>`. Placeholder `index.astro` renders an `<h1>System Design`.
- [ ] **Step 5: Write failing rule-scan tests** in `tests/rules.test.ts`.
  - Negative proofs for each helper: `findRawColors('fill="#fff"')` → `['#fff']`; `findRawColors('color: rgb(0,0,0)')` has one hit; `findRawColors('fill: var(--accent)')` → `[]`; `usesMotionUnguarded('a{animation:x 1s}')` → `true`; the same rule wrapped in `@media (prefers-reduced-motion: no-preference){…}` → `false`; `usesMotionUnguarded('a{color:red}')` → `false`; `hasHover('a:hover{}')` → `true`; `findBannedDeps({dependencies:{gsap:'3'}})` → `['gsap']`; `findBannedDeps({dependencies:{astro:'5'}})` → `[]`.
  - Real-file scans: for every `.css`, `.astro`, `.tsx` file under `src`, `usesMotionUnguarded` and `hasHover` are false; `findRawColors` is empty for every such file except `src/styles/global.css` (where the tokens are defined); `findBannedDeps(package.json)` is `[]`.
- [ ] **Step 6:** Run `npx vitest run tests/rules.test.ts` → FAIL (helpers missing); implement `tests/rules-lib.ts`; run again → PASS.
- [ ] **Step 7:** `CLAUDE.md` (under 15 lines): "A task is done only when `npm run verify` passes; report the result, not just 'done'." / "If the same mistake happens twice, add a lint rule, test, or boundary instead of a new note." / "Append one line per non-obvious decision to `decisions.tsv` (time, decision, reason, evidence, result)." / "Design rules live in `tests/rules.test.ts`; lessons are written per `docs/superpowers/specs/…-design.md`." Create `decisions.tsv` containing only the header row.
- [ ] **Step 8:** Run `npm run verify` → passes (typecheck, tests, build).
- [ ] **Step 9:** Commit `chore: scaffold astro site with verify command and rule scans`.

---

### Task 2: Scene types and validator

**Files:**
- Create: `src/engine/types.ts`, `src/engine/validate.ts`
- Test: `tests/validate.test.ts`

**Interfaces:**
- Produces (exact, in `types.ts`):
```ts
export type NodeStatus = 'ok' | 'hot' | 'down';
export interface NodeState { status: NodeStatus; fill?: number; label?: string } // fill 0..1
export interface Point { x: number; y: number }
export interface GraphNode { id: string; label: string; x: number; y: number }   // viewBox 0 0 400 200
export interface GraphEdge { from: string; to: string }                          // edge id = `${from}>${to}`
export interface GraphStep { caption: string; highlight?: string[]; marker?: string[]; states?: Record<string, NodeState> }
export interface GraphScene { type: 'graph'; nodes: GraphNode[]; edges: GraphEdge[]; steps: GraphStep[] }
export interface Lane { id: string; label: string }
export interface SequenceStep { caption: string; message?: { from: string; to: string; label: string }; states?: Record<string, NodeState> }
export interface SequenceScene { type: 'sequence'; lanes: Lane[]; steps: SequenceStep[] }
export type GraphBody = Pick<GraphScene, 'nodes' | 'edges'>;
export type GraphStepBody = Omit<GraphStep, 'caption'>;
export interface CompareScene { type: 'compare'; leftTitle: string; rightTitle: string; left: GraphBody; right: GraphBody;
  steps: { caption: string; left?: GraphStepBody; right?: GraphStepBody }[] }
export interface NumbersItem { id: string; label: string; unit: string; max: number }
export interface NumbersScene { type: 'numbers'; items: NumbersItem[]; steps: { caption: string; values: Record<string, number> }[] }
export type Scene = GraphScene | SequenceScene | CompareScene | NumbersScene;
```
  and `export function validateScene(scene: Scene): string[]` (returns error messages; empty = valid).

Rules `validateScene` enforces: at least one step; graph/compare: unique node ids, edges and highlight ids (node ids or edge ids that exist), `marker` ids exist and each consecutive pair is joined by an edge in either direction, `states` keys exist, `fill` within 0..1; sequence: message `from`/`to` are lane ids, `states` keys are lane ids; numbers: `values` keys are item ids and each value is between 0 and the item's `max`; compare validates both sides.

- [ ] **Step 1: Write failing tests** in `tests/validate.test.ts` using a minimal valid graph (`a`,`b`,`c`; edges `a>b`, `b>c`):
  - valid scene → `[]`
  - zero steps → one error mentioning "step"
  - edge to missing node `z` → error mentioning `z`
  - `marker: ['a','c']` (not adjacent) → error mentioning `a>c`
  - `highlight: ['a>b']` valid; `highlight: ['q']` → error
  - `states: { a: { status: 'ok', fill: 1.5 } }` → error mentioning "fill"
  - sequence message from unknown lane → error; numbers value above `max` → error
  - compare with bad edge on the right side → error mentioning "right"
- [ ] **Step 2:** Run `npx vitest run tests/validate.test.ts` → FAIL (module missing).
- [ ] **Step 3:** Implement `types.ts` as above and `validateScene` in `validate.ts`.
- [ ] **Step 4:** Run the same command → PASS.
- [ ] **Step 5:** Commit `feat: scene types and validator`.

---

### Task 3: Motion and scroll math

**Files:**
- Create: `src/engine/motion.ts`, `src/engine/scroll.ts`
- Test: `tests/motion.test.ts`, `tests/scroll.test.ts`

**Interfaces:**
- Consumes: `NodeState`, `Point` from `types.ts`.
- Produces:
```ts
// motion.ts
export function lerp(a: number, b: number, t: number): number;
export function interpolateNodeState(from: NodeState, to: NodeState, t: number): NodeState;
export function pointAlong(points: Point[], t: number): Point;           // t 0..1 along polyline by arc length
export function stateEase(progress: number, reduced: boolean): number;   // 0..1
export function markerT(progress: number, reduced: boolean): number;     // 0..1
// scroll.ts
export interface BlockRect { top: number; height: number }
export function computeScroll(blocks: BlockRect[], anchorY: number): { step: number; progress: number };
export function clampStep(current: number, delta: number, count: number): number;
```
Semantics: `interpolateNodeState` lerps `fill` (if only one side has fill, use that side's), takes `to.status` and `to.label` once `t >= 0.5`, otherwise `from`'s. `stateEase` finishes the state transition in the first 40% of a block: `min(1, progress / 0.4)`; reduced motion → always `1`. `markerT` is `progress`; reduced motion → `1`. `computeScroll`: active step is the last block whose `top <= anchorY`; `progress = clamp((anchorY - top) / height, 0, 1)`; above the first block → `{step: 0, progress: 0}`; empty `blocks` → `{step: 0, progress: 0}`.

- [ ] **Step 1: Write failing tests.**
  - `lerp(0,10,0.25) === 2.5`
  - `pointAlong([{x:0,y:0},{x:10,y:0},{x:10,y:10}], 0.5)` → `{x:10,y:0}`; `t=0.25` → `{x:5,y:0}`; `t=1` → last point; single point → that point
  - `interpolateNodeState({status:'ok',fill:0},{status:'hot',fill:1},0.25)` → `{status:'ok',fill:0.25}`; at `0.5` status `'hot'`; `from` without fill, `to` fill 0.8 → fill 0.8 at any t
  - `stateEase(0.2,false) === 0.5`, `stateEase(0.4,false) === 1`, `stateEase(0,true) === 1`; `markerT(0.3,false) === 0.3`, `markerT(0.3,true) === 1`
  - `computeScroll([{top:0,height:100},{top:100,height:100}], 150)` → `{step:1,progress:0.5}`; anchor `-20` → `{step:0,progress:0}`; anchor `500` → `{step:1,progress:1}`; `[]` → `{step:0,progress:0}`
  - `clampStep(0,-1,5) === 0`, `clampStep(4,1,5) === 4`, `clampStep(2,1,5) === 3`
- [ ] **Step 2:** Run `npx vitest run tests/motion.test.ts tests/scroll.test.ts` → FAIL.
- [ ] **Step 3:** Implement both modules per the signatures and semantics.
- [ ] **Step 4:** Run the same command → PASS.
- [ ] **Step 5:** Commit `feat: motion and scroll math`.

---

### Task 4: Graph frame builder and GraphScene renderer

**Files:**
- Create: `src/engine/frames/graph.ts`, `src/components/scenes/GraphScene.tsx`
- Test: `tests/frames-graph.test.ts`, `tests/GraphScene.test.tsx`

**Interfaces:**
- Consumes: `GraphScene`, `NodeState`, `Point`, motion functions.
- Produces:
```ts
export interface GraphFrame {
  nodes: { id: string; label: string; x: number; y: number; state: NodeState; highlighted: boolean }[];
  edges: { from: string; to: string; id: string; highlighted: boolean }[];
  marker?: Point;      // present only if the current step has a marker path
  caption: string;
}
export function buildGraphFrame(scene: GraphBodyWithSteps, step: number, progress: number, reduced: boolean): GraphFrame;
// GraphBodyWithSteps = Pick<GraphScene,'nodes'|'edges'|'steps'> (so Compare can reuse it)
// GraphScene.tsx: export function GraphSceneView(props: { frame: GraphFrame }): JSX.Element
```
Rules: node states carry forward — a node's state at step *n* is the last `states` entry for it in steps `0..n`, default `{status:'ok'}`; the displayed state is `interpolateNodeState(stateAtPrevStep, stateAtStep, stateEase(progress, reduced))`. A node is `highlighted` if its id is in `highlight` or it is on the `marker` path. An edge is highlighted if its id is in `highlight` or consecutive on the marker path. `marker` is `pointAlong(marker path node coordinates, markerT(progress, reduced))`. `step` is clamped to the valid range.

- [ ] **Step 1: Write failing tests** in `tests/frames-graph.test.ts` with a 3-node scene:
  - step 0 `states: {b:{status:'ok',fill:0.2}}`, step 1 has no `states` → at step 1, progress 1, `b.state.fill === 0.2` (carry-forward)
  - step 1 `states: {b:{status:'hot',fill:1}}` at progress 0.2 → `b.state.fill === 0.6`, at progress 0.4 → `1` (stateEase)
  - `marker:['a','b']` at progress 0.5 → marker at midpoint of a and b coordinates; `reduced=true` → marker at b
  - highlighted flags for node/edge on marker path; edge `a>b` highlighted
  - `step: 99` clamps to last step caption
  - Component test `tests/GraphScene.test.tsx`: rendering `GraphSceneView` with a frame shows every node label as text; a `<circle data-marker>` exists only when `frame.marker` is set; a node with `status:'down'` has `data-status="down"`.
- [ ] **Step 2:** Run both test files → FAIL.
- [ ] **Step 3:** Implement `buildGraphFrame` and `GraphSceneView` (SVG viewBox `0 0 400 200`; node = rounded rect + label; fill level drawn as a bar inside the node; status colors from CSS variables `--ok/--hot/--down`; highlighted nodes use `--accent-soft` fill and `--accent` stroke; ambient flow = CSS `stroke-dashoffset` animation only on highlighted edges, disabled under `prefers-reduced-motion`).
- [ ] **Step 4:** Run both test files → PASS.
- [ ] **Step 5:** Commit `feat: graph frame builder and renderer`.

---

### Task 5: Player, lesson page, first Watch lesson, content test

**Files:**
- Create: `src/components/Player.tsx`, `src/components/SceneView.tsx`, `src/components/Step.astro`, `src/content.config.ts`, `src/pages/lessons/[slug].astro`, `src/scenes/index.ts`, `src/scenes/http-request-lifecycle.ts`, `src/content/lessons/http-request-lifecycle.mdx`, `tests-e2e/lesson-scroll.spec.ts`
- Modify: `playwright.config.ts`
- Test: `tests/content.test.ts`, `tests-e2e/lesson-scroll.spec.ts`

**Interfaces:**
- Consumes: `computeScroll`, `clampStep`, `buildGraphFrame`, `GraphSceneView`, `Scene`.
- Produces:
```ts
// SceneView.tsx — switch on scene.type; builds that type's frame and renders its view plus the frame's caption in <p data-caption>;
// unsupported types throw Error(`unsupported scene type: ${type}`)
export function SceneView(props: { scene: Scene; step: number; progress: number; reduced: boolean }): JSX.Element;
// Player.tsx
export function Player(props: { slug: string }): JSX.Element;
// scenes/index.ts — built with import.meta.glob('./*.ts', { eager: true }), excluding index.ts
export const scenes: Record<string, Scene>;   // keyed by file name without extension
```
- Lesson frontmatter schema (zod in `content.config.ts`): `{ title: string; level: 1 | 2 | 3; order: number; summary: string; poke?: boolean }`.
- MDX convention: lesson body is a sequence of `<Step>…</Step>` blocks, then a plain-markdown "Key takeaways" section. `Step.astro` renders `<section data-step>` (with `scroll-margin-top` equal to the pinned diagram height). Poke lessons add `<TryIt/>` (Task 10).

Player behavior: lesson page layout is a wrapper with a `position: sticky; top: 0; height: 45vh` pin containing `<Player slug client:load/>`, followed by the article. `Player` on mount queries `document.querySelectorAll('[data-step]')`, reads each block's `getBoundingClientRect()` on scroll (throttled by `requestAnimationFrame`) and on resize, calls `computeScroll(rects, anchorY)` where `anchorY` is the pin's bottom edge plus 24px, and renders `SceneView`. It reads `matchMedia('(prefers-reduced-motion: reduce)')` and listens for changes. Arrow Down/Right scroll the next `[data-step]` into view; Up/Left the previous one (`clampStep`); ignored while an input, textarea or select has focus. Shows a small "step n / N" label. If the slug has no scene, render nothing. The text is fully readable with JavaScript disabled.

First lesson `http-request-lifecycle` (level 1, order 3): graph scene `client → dns → server → db` plus `server → client`, 6 steps (client types URL; DNS lookup; connect to server; server queries DB; DB replies; server sends response), each with a caption, a `marker` path, and at least one `states` change (for example the DB node `fill` rises on step 4). Lesson text: one `<Step>` block per scene step (about 80-120 words each), then "Key takeaways".

- [ ] **Step 1: Write failing content test** in `tests/content.test.ts`: for every `src/content/lessons/*.mdx` file: (a) the slug has a scene in `scenes` and `validateScene(scene)` returns `[]`; (b) the count of `<Step` occurrences equals `scene.steps.length`; (c) frontmatter contains `title:`, `level:`, `order:`, `summary:`. Also: scene files in `src/scenes` each have an MDX file (no orphans), and `scenes/index.ts` rejects nothing else.
- [ ] **Step 2:** Run `npx vitest run tests/content.test.ts` → FAIL (no lesson yet / no registry).
- [ ] **Step 3:** Implement the registry, `Step.astro`, content config, `SceneView` (graph case only), `Player`, the lesson page (`getStaticPaths` from the collection; renders MDX with `Step` available), the first scene and lesson.
- [ ] **Step 4:** Run `npm run verify` → passes.
- [ ] **Step 5: Prove the content test can fail.** One at a time, (a) change an edge in the first scene to point at a missing node, (b) delete one `<Step>` block from the lesson; run `npx vitest run tests/content.test.ts` after each and confirm it fails with a message naming the problem; restore both.
- [ ] **Step 6: Playwright smoke test.** Run `npx playwright install chromium`. `playwright.config.ts`: `testDir: 'tests-e2e'`, `webServer: { command: 'npm run build && npm run preview -- --port 4321', url: 'http://localhost:4321', reuseExistingServer: true }`, `use.baseURL: 'http://localhost:4321'`. In `tests-e2e/lesson-scroll.spec.ts`, on `/lessons/http-request-lifecycle`:
  - at load, `[data-caption]` text equals the scene's first step caption;
  - after scrolling the second `[data-step]` to the pin's bottom edge, `[data-caption]` equals the second step caption; scrolling back up restores the first;
  - pressing `ArrowDown` moves to the next step's caption;
  - in a context with `reducedMotion: 'reduce'`, scrolling to 10% into the second block puts `circle[data-marker]` at the final node of that step's marker path (same `cx`/`cy` as that node's center), whereas in the default context at the same scroll the marker's `cx` differs from that final position.
  Run `npm run e2e` → PASS.
- [ ] **Step 7: Manual look.** Run `npm run dev`, open the lesson; confirm the diagram looks right (pinned, readable captions, DB fill rising on step 4).
- [ ] **Step 8:** Commit `feat: scroll-driven player and first lesson`.

---

### Task 6: Progress store and home map

**Files:**
- Create: `src/engine/progress.ts`, `src/scripts/progress-dom.ts`
- Modify: `src/pages/index.astro`, `src/pages/lessons/[slug].astro`
- Test: `tests/progress.test.ts`

**Interfaces:**
- Produces:
```ts
export const STORAGE_KEY = 'sdl.done.v1';
export function loadDone(storage: Pick<Storage, 'getItem'>): Set<string>;
export function toggleDone(storage: Pick<Storage, 'getItem' | 'setItem'>, slug: string): Set<string>;
// progress-dom.ts
export function initProgress(root: Document): void;   // marks [data-lesson-link] done; wires [data-mark-done] buttons
```
Behavior: stored value is a JSON array of slugs. Any problem (missing, non-JSON, not an array, `getItem` throws) → empty set, never throws. `toggleDone` adds or removes the slug, tries to persist, swallows `setItem` errors, and returns the updated set.

Home page: three sections (Foundations, Intermediate, Advanced) built from the content collection, sorted by `level` then `order`; each row is `<a data-lesson-link data-slug>` with title, summary, and a "Try it" tag when `poke`. A checkmark appears via `data-done`. Lesson page: a "Mark as done" toggle button `[data-mark-done]` after the key takeaways.

- [ ] **Step 1: Write failing tests:** `loadDone` with `getItem → null` → empty; `'{'` → empty; `'{}'` → empty; `'["a","b"]'` → `{a,b}`; `getItem` throws → empty. `toggleDone` adds `a`, then removes it; `setItem` throwing still returns `{a}`; the stored string is the JSON array.
- [ ] **Step 2:** Run `npx vitest run tests/progress.test.ts` → FAIL.
- [ ] **Step 3:** Implement the store and DOM wiring; build home page and the button.
- [ ] **Step 4:** Run `npx vitest run` → PASS; `npm run build` → succeeds. Manually check: mark the lesson done, reload home, checkmark persists; works with storage blocked (no console errors).
- [ ] **Step 5:** Commit `feat: progress checkmarks and home map`.

---

### Task 7: Sequence scene

**Files:**
- Create: `src/engine/frames/sequence.ts`, `src/components/scenes/SequenceScene.tsx`
- Modify: `src/components/SceneView.tsx`
- Test: `tests/frames-sequence.test.ts`

**Interfaces:**
- Produces:
```ts
export interface SequenceFrame {
  lanes: { id: string; label: string; x: number; state: NodeState }[];
  messages: { from: string; to: string; label: string; y: number; progress: number; current: boolean }[];
  caption: string;
}
export function buildSequenceFrame(scene: SequenceScene, step: number, progress: number, reduced: boolean): SequenceFrame;
export function SequenceSceneView(props: { frame: SequenceFrame }): JSX.Element;
```
Rules: lanes are spaced evenly across x; messages from steps `0..step` accumulate in order, one row each (`y` increasing); earlier messages have `progress: 1`; the current step's message has `progress: markerT(progress, reduced)` and `current: true`; lane `state` follows the same carry-forward and interpolation as graph nodes.

- [ ] **Step 1: Write failing tests:** a 3-step scene with messages at steps 0 and 1 and none at step 2: at step 2 both messages appear, each `progress: 1`, none `current`; at step 1 progress 0.5 → message 1 `{progress:0.5,current:true}`, message 0 `progress:1`; `y` strictly increasing; lane x positions evenly spaced.
- [ ] **Step 2:** Run `npx vitest run tests/frames-sequence.test.ts` → FAIL.
- [ ] **Step 3:** Implement frame builder and renderer (lane header, vertical dashed line, arrow growing to the current progress, label); add the `sequence` case to `SceneView`.
- [ ] **Step 4:** Run `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat: sequence scene type`.

---

### Task 8: Compare scene

**Files:**
- Create: `src/engine/frames/compare.ts`, `src/components/scenes/CompareScene.tsx`
- Modify: `src/components/SceneView.tsx`
- Test: `tests/frames-compare.test.ts`

**Interfaces:**
- Consumes: `buildGraphFrame`, `GraphSceneView`.
- Produces:
```ts
export interface CompareFrame { leftTitle: string; rightTitle: string; left: GraphFrame; right: GraphFrame; caption: string }
export function buildCompareFrame(scene: CompareScene, step: number, progress: number, reduced: boolean): CompareFrame;
export function CompareSceneView(props: { frame: CompareFrame }): JSX.Element;   // two GraphSceneViews side by side
```
Rule: each side is built by synthesizing a graph scene from its `GraphBody` and the per-step `left`/`right` bodies (a missing body means "no highlight, no marker, no state change" for that side), so each side keeps its own carry-forward state. The frame's `caption` is the compare step caption.

- [ ] **Step 1: Write failing tests:** step with only `left: { marker:['a','b'] }` → left marker present, right marker undefined, right highlights all false; caption from the compare step; left carry-forward state persists on a later step with no `left` entry.
- [ ] **Step 2:** Run `npx vitest run tests/frames-compare.test.ts` → FAIL.
- [ ] **Step 3:** Implement; add the `compare` case to `SceneView`.
- [ ] **Step 4:** Run `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat: compare scene type`.

---

### Task 9: Numbers scene

**Files:**
- Create: `src/engine/frames/numbers.ts`, `src/components/scenes/NumbersScene.tsx`
- Modify: `src/components/SceneView.tsx`
- Test: `tests/frames-numbers.test.ts`

**Interfaces:**
- Produces:
```ts
export interface NumbersFrame { bars: { id: string; label: string; unit: string; value: number; max: number }[]; caption: string }
export function buildNumbersFrame(scene: NumbersScene, step: number, progress: number, reduced: boolean): NumbersFrame;
export function NumbersSceneView(props: { frame: NumbersFrame }): JSX.Element;   // horizontal bars with value + unit text
```
Rule: each bar's `value` is `lerp(previousStepValue, thisStepValue, stateEase(progress, reduced))`; at step 0 the previous value is 0; an item missing from a step's `values` keeps its previous value.

- [ ] **Step 1: Write failing tests:** two-step scene, item `a` values 10 then 30: step 1 progress 0.2 → value 20; progress 0.4 → 30; reduced → 30 at progress 0; step 0 progress 0.4 → 10; item omitted at step 1 keeps step 0 value.
- [ ] **Step 2:** Run `npx vitest run tests/frames-numbers.test.ts` → FAIL.
- [ ] **Step 3:** Implement; add the `numbers` case to `SceneView`.
- [ ] **Step 4:** Run `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat: numbers scene type`.

---

### Task 10: Poke framework and the load balancer lesson

**Files:**
- Create: `src/engine/sim/shared.ts`, `src/sims/index.ts`, `src/sims/load-balancers.ts`, `src/components/TryIt.astro`, `src/components/TryItPanel.tsx`, `src/components/TrafficStream.tsx`, `src/scenes/load-balancers.ts`, `src/content/lessons/load-balancers.mdx`
- Modify: `src/components/Player.tsx`, `tests/content.test.ts`
- Test: `tests/sim-shared.test.ts`, `tests/sim-load-balancers.test.ts`

**Interfaces:**
- Consumes: `NodeState`, `GraphScene`, `buildGraphFrame`/`GraphSceneView`.
- Produces (add to `types.ts`):
```ts
export interface ControlDef { id: string; label: string; kind: 'toggle' | 'slider'; min?: number; max?: number; step?: number; default: number | boolean }
export type ControlValues = Record<string, number | boolean>;
export interface Route { path: string[]; weight: number; outcome: 'ok' | 'fail' }
export interface SimResult { states: Record<string, NodeState>; readouts: { label: string; value: string }[]; routes: Route[]; trafficRate: number }
export interface Sim { controls: ControlDef[]; run(values: ControlValues): SimResult }
```
```ts
// sim/shared.ts
export function loadState(load: number, capacity: number): NodeState;
export function pickRoute(routes: Route[], r: number): Route | undefined;   // r in [0,1), weighted
// sims/index.ts — import.meta.glob('./*.ts', { eager: true }) excluding index.ts
export const sims: Record<string, Sim>;
```
Rules: `loadState` → `fill = min(1, load/capacity)`; `status = 'hot'` when `fill >= 0.8`, else `'ok'` (overload is `hot`, never `down`; `down` is only for nodes switched off); `capacity <= 0` → `{status: load > 0 ? 'hot' : 'ok', fill: load > 0 ? 1 : 0}`. `pickRoute` chooses by cumulative weight; empty or all-zero weights → `undefined`.

`TryIt.astro` renders `<section data-tryit>` containing a heading "Try it". `Player`: when the `[data-tryit]` section's top is above `anchorY` and the slug has a sim, switch to **live mode**: render the scene's graph (nodes and edges, ignoring steps) with node states taken from `sim.run(values)` and a `TryItPanel` (toggle checkboxes and range sliders from `controls`, plus the readouts) in the pin. `TrafficStream` runs a `requestAnimationFrame` loop spawning dots at `min(trafficRate, 30)` per second; each dot picks a route with `pickRoute(routes, Math.random())`, travels the route's node path, and fades red at the last node if `outcome` is `fail`. Under reduced motion no dots are spawned; static states and readouts still update. Leaving the section scrolls back to Watch mode.

Load balancer sim (`src/sims/load-balancers.ts`, node ids `client`, `lb`, `s1`, `s2`, `s3`): controls `s1`, `s2`, `s3` toggles (default `true`), `traffic` slider 0-400 step 10 (default 150). Each server capacity 100 req/s. With `a` servers alive: each alive server gets `traffic / a` load, state = `loadState(load, 100)`; dead server `{status:'down', label:'off'}`. Readout `Dropped` = `max(0, traffic - a*100) / traffic` as a whole-number percent (`0%` when traffic is 0). `trafficRate` = `traffic`. Routes: one `ok`/`fail` route per alive server (`['client','lb','sN']`, outcome `fail` if that server's load exceeds 100), weights = each server's share; with no server alive a single `fail` route `['client','lb']` with weight 1.

- [ ] **Step 1: Write failing tests.**
  - `sim-shared`: `loadState(50,100)` → `{status:'ok',fill:0.5}`; `(80,100)` → `hot, 0.8`; `(250,100)` → `hot, 1`; `(0,0)` → `ok, 0`; `(10,0)` → `hot, 1`. for two routes with `weight` 1 and 3, `pickRoute(routes, 0.2)` is the first, `0.3` the second, `0.999` the second; `[]` → `undefined`.
  - `sim-load-balancers`: defaults → `s1,s2,s3` each `{status:'ok',fill:0.5}`, `Dropped` `0%`; `s3:false`, traffic 150 → `s1,s2` fill 0.75, `s3.status==='down'`; `s2,s3` off, traffic 250 → `s1` `{status:'hot',fill:1}`, `Dropped` `60%`; traffic 0 → every fill 0, `Dropped` `0%`; all off → one `fail` route `['client','lb']`, `Dropped` `100%`; across every combination of toggles and traffic in `[0,10,100,400]`, no state `fill` or readout contains `NaN`/`Infinity`.
  - `content.test.ts` addition: every lesson with `poke: true` has a sim in `sims`; every sim has a lesson with `poke: true`; `sim.run(defaults)` returns state keys and route node ids that all exist as nodes in the lesson's graph scene (scene type must be `graph`).
- [ ] **Step 2:** Run `npx vitest run` → new tests FAIL.
- [ ] **Step 3:** Implement the types, shared helpers, sim registry, load-balancer sim, `TryIt`, `TryItPanel`, `TrafficStream` and the Player live mode. Write the `load-balancers` scene (5 Watch steps: request arrives, LB picks a server, round robin to the next, a server dies and is skipped, recovers) and lesson (`poke: true`, ends with `<TryIt/>` then "Key takeaways"; lesson text explains the sliders and what to try).
- [ ] **Step 4:** Run `npx vitest run` → PASS; `npm run build` succeeds.
- [ ] **Step 5: Manual verification.** Open `/lessons/load-balancers`; scroll to "Try it". Expected: toggling a server off turns it red and redistributes fill on the survivors; raising traffic past capacity shows red dots failing and `Dropped` rising; with reduced motion no dots appear but states and readouts still change.
- [ ] **Step 6:** Run `npm run verify` → passes.
- [ ] **Step 7:** Commit `feat: poke framework and load balancer lesson`.

---

### Checkpoint A: Independent review of the patterns (after Task 10)

The first Watch lesson, first Poke lesson, scene format, and sim format become the template that 23 more lessons and 4 more sims copy, so a flaw here is copied everywhere.

- [ ] **Step 1:** Run `npm run verify` and `npm run e2e` → both pass.
- [ ] **Step 2:** Dispatch a fresh reviewer subagent on the most capable model with: the spec path, this plan path, and the diff of Tasks 1-10. Ask it to check, in priority order: (a) whether the scene file, lesson MDX, and sim shapes are easy to copy correctly and hard to copy wrongly; (b) spec compliance (layout, animation rules, reduced motion, keyboard); (c) anything in the Review Focus list not actually pinned by a test; (d) places where a later author could plausibly introduce a silent mismatch.
- [ ] **Step 2b:** Fix every finding that is a real defect, or record it in `decisions.tsv` with the reason it was declined. If the same kind of mistake shows up twice, add a check for it (a test or a scan rule) instead of a note.
- [ ] **Step 3:** Run `npm run verify` → passes; commit `chore: address checkpoint A review`.

---

### Task 11: Caching lesson and sim

**Files:**
- Create: `src/sims/caching.ts`, `src/scenes/caching.ts`, `src/content/lessons/caching.mdx`
- Test: `tests/sim-caching.test.ts`

**Interfaces:**
- Consumes: `Sim`, `loadState`.
- Produces: default export `Sim` from `src/sims/caching.ts`; scene nodes `client`, `app`, `cache`, `db`.

Sim: controls `cacheOn` toggle (default `true`), `cacheSize` slider 0-100 step 5 (default 50, percent of the dataset cached), `traffic` slider 0-400 step 10 (default 200). `hitRate = cacheOn ? 0.95 * Math.sqrt(cacheSize / 100) : 0`. `dbLoad = traffic * (1 - hitRate)`; `db` state `loadState(dbLoad, 100)`; `cache` state `{status:'ok', fill: cacheSize/100}` when on, `{status:'down', label:'off'}` when off; `app` and `client` `{status:'ok'}`. Readouts: `Hit rate` (whole-number percent), `DB load` (`"<n> req/s"`, rounded). `trafficRate = traffic`. Routes: hit `['client','app','cache']` weight `hitRate`, outcome `ok`; miss `['client','app','cache','db']` (or `['client','app','db']` when cache off) weight `1 - hitRate`, outcome `fail` if `dbLoad > 100`, else `ok`.

- [ ] **Step 1: Write failing tests:** cache off, traffic 200 → `Hit rate` `0%`, `db` `{status:'hot',fill:1}`, `cache.status==='down'`, miss route skips `cache`; cache on, size 100, traffic 200 → `Hit rate` `95%`, `DB load` `10 req/s`, `db.fill` 0.1, status `ok`; size 0 → `Hit rate` `0%`; traffic 0 → no `NaN`/`Infinity` anywhere, `DB load` `0 req/s`; miss route outcome `fail` exactly when `dbLoad > 100`.
- [ ] **Step 2:** Run `npx vitest run tests/sim-caching.test.ts` → FAIL.
- [ ] **Step 3:** Implement the sim. Write the scene (6 Watch steps: miss then fill, hit on repeat, cache fills, eviction, stale data, why hit rate matters; states animate cache fill and DB load) and lesson (`poke: true`).
- [ ] **Step 4:** Run `npx vitest run` → PASS (including the content test).
- [ ] **Step 5:** Commit `feat: caching lesson with live sim`.

---

### Task 12: Replication lesson and sim

**Files:**
- Create: `src/sims/replication.ts`, `src/scenes/replication.ts`, `src/content/lessons/replication.mdx`
- Test: `tests/sim-replication.test.ts`

**Interfaces:**
- Produces: default export `Sim`; scene nodes `app`, `primary`, `r1`, `r2`.

Sim: controls `primaryUp` toggle (default `true`), `failover` toggle (default `false`), `r1Up`, `r2Up` toggles (default `true`), `lag` slider 0-500 step 10 (default 50, ms), `readTraffic` slider 0-300 step 10 (default 100). Writer: `primary` if `primaryUp`; else if `failover`, the first up replica (labelled `new primary`); else none. Readers: up replicas that are not the writer; if no readers, the writer (if any) serves reads. Each node capacity 100 req/s; readers share `readTraffic` equally, state `loadState(load, 100)`. Down nodes `{status:'down', label:'off'}`. Readouts: `Writes` (`available`/`unavailable`), `Stale read window` (`"<lag> ms"`), `Reads served` (whole-number percent served, `100%` when `readTraffic` is 0). Routes: write route `['app', writerId]` ok (none if no writer; weight 1 and outcome `fail` route `['app']` instead), read routes per reader with weight equal to its share; with no node able to read, one `fail` route `['app']`. `trafficRate = readTraffic`.

- [ ] **Step 1: Write failing tests:** defaults → `Writes` `available`, `r1` and `r2` `{status:'ok',fill:0.5}`, `Stale read window` `50 ms`; `primaryUp:false, failover:false` → `primary.status==='down'`, `Writes` `unavailable`; `primaryUp:false, failover:true` → `r1.label==='new primary'`, `Writes` `available`, `r2.fill===1`; every node down → `Reads served` `0%`, no `NaN`/`Infinity`; `readTraffic:0` → all fills 0, `Reads served` `100%`; `lag:300` → `Stale read window` `300 ms`.
- [ ] **Step 2:** Run `npx vitest run tests/sim-replication.test.ts` → FAIL.
- [ ] **Step 3:** Implement the sim. Write the scene (6 Watch steps: write hits primary, change copied to replicas, reads spread across replicas, replica lags (stale read), primary dies, failover promotes a replica) and lesson (`poke: true`).
- [ ] **Step 4:** Run `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat: replication lesson with live sim`.

---

### Task 13: Rate limiting lesson and sim

**Files:**
- Create: `src/engine/sim/tokenBucket.ts`, `src/sims/rate-limiting.ts`, `src/scenes/rate-limiting.ts`, `src/content/lessons/rate-limiting.mdx`
- Test: `tests/tokenBucket.test.ts`, `tests/sim-rate-limiting.test.ts`

**Interfaces:**
- Produces:
```ts
export function tokenBucket(opts: { rate: number; burst: number; arrivals: number[] }): { allowed: number[]; rejected: number[] };
```
Algorithm (one tick = 1 second): bucket starts full (`burst` tokens); each tick, `allowed = min(arrival, floor(tokens))`, `rejected = arrival - allowed`, `tokens -= allowed`, then `tokens = min(burst, tokens + rate)`.

Sim (scene nodes `client`, `limiter`, `api`): controls `rate` slider 1-50 (default 10), `burst` slider 1-100 (default 20), `traffic` slider 0-100 (default 15). Arrival pattern over 10 ticks: `traffic` each tick, except tick 4 which is `4 * traffic`. `limiter` state `{status: rejectedTotal > 0 ? 'hot' : 'ok', fill: totalArrivals === 0 ? 0 : rejectedTotal / totalArrivals}`; `api` `{status:'ok'}`. Readouts: `Allowed` and `Rejected (429)` as integer totals. Routes: allowed `['client','limiter','api']` ok weight = allowed total; rejected `['client','limiter']` fail weight = rejected total. `trafficRate = traffic`.

- [ ] **Step 1: Write failing tests:** `tokenBucket({rate:2,burst:4,arrivals:[10,10,10]})` → `allowed [4,2,2]`, `rejected [6,8,8]`; `arrivals:[0,0]` → all zeros; `arrivals:[1]` with burst 4 → `allowed [1]`. Sim defaults (rate 10, burst 20, traffic 15) → `Allowed` `110`, `Rejected (429)` `85`; `traffic:0` → `Allowed` `0`, `Rejected (429)` `0`, `limiter.fill===0`, no `NaN`.
- [ ] **Step 2:** Run `npx vitest run tests/tokenBucket.test.ts tests/sim-rate-limiting.test.ts` → FAIL.
- [ ] **Step 3:** Implement. Write the scene (5 Watch steps: bucket full, requests spend tokens, bucket refills over time, burst empties it, requests rejected with 429; `limiter.fill` shows bucket level) and lesson (`poke: true`).
- [ ] **Step 4:** Run `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat: rate limiting lesson with live sim`.

---

### Task 14: Sharding lesson and sim

**Files:**
- Create: `src/engine/sim/shardLoads.ts`, `src/sims/sharding.ts`, `src/scenes/sharding.ts`, `src/content/lessons/sharding.mdx`
- Test: `tests/shardLoads.test.ts`, `tests/sim-sharding.test.ts`

**Interfaces:**
- Produces:
```ts
export function shardLoads(shards: number, traffic: number, hotKey: boolean): number[];
```
Uniform: each shard `traffic / shards`. With `hotKey`: shard 0 gets `0.5 * traffic + 0.5 * traffic / shards`; every other shard `0.5 * traffic / shards`.

Sim (scene nodes `client`, `router`, `shard1`..`shard4`): controls `shards` slider 1-4 (default 4), `hotKey` toggle (default `false`), `traffic` slider 0-400 step 10 (default 200). Shard capacity 100. Active shards: `loadState(load, 100)`; shards beyond `shards`: `{status:'ok', fill:0, label:'unused'}`. Readouts: `Busiest shard` (`"<n>%"` of capacity, can exceed 100) and `Total capacity` (`"<shards*100> req/s"`). Routes: one per active shard `['client','router','shardN']`, weight = its load, outcome `fail` if its load exceeds 100. `trafficRate = traffic`.

- [ ] **Step 1: Write failing tests:** `shardLoads(4,400,false)` → `[100,100,100,100]`; `(4,400,true)` → `[250,50,50,50]`; `(1,100,true)` → `[100]`; `(4,0,true)` → `[0,0,0,0]`. Sim defaults → each shard `{status:'ok',fill:0.5}`; `hotKey:true` → `shard1` `{status:'hot',fill:1}`, `shard2.fill` 0.25, `Busiest shard` `125%`; `shards:2` → `shard3.label==='unused'`; `traffic:0` → no `NaN`, `Busiest shard` `0%`.
- [ ] **Step 2:** Run `npx vitest run tests/shardLoads.test.ts tests/sim-sharding.test.ts` → FAIL.
- [ ] **Step 3:** Implement. Write the scene (6 Watch steps: one DB overloaded, split data across shards, router picks by key, even load, a hot key overloads one shard, why choosing the shard key matters) and lesson (`poke: true`).
- [ ] **Step 4:** Run `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat: sharding lesson with live sim`.

---

### Task 15: Level 1 lessons (7 remaining)

**Files:**
- Create: `src/scenes/<slug>.ts` and `src/content/lessons/<slug>.mdx` for each slug below.
- Test: existing `tests/content.test.ts` (validates scene, step count, frontmatter for every lesson).

**Authoring rules (apply to every content task):** frontmatter `level`, `order` per the draft topic list in the spec; 4-7 `<Step>` blocks, each 80-120 words, calm plain English, one idea per block; every scene step has a caption (one sentence), at least one `highlight` or `marker`, and every second step changes at least one component state; end with a "Key takeaways" list of 3-4 bullets. Facts must be correct and standard (this content is reviewed by the owner later; prefer well-established explanations over clever ones). Scene coordinates fit the `0 0 400 200` viewBox with at least 60px between nodes.

| order | slug | scene type | what the diagram shows |
|---|---|---|---|
| 1 | `client-server` | graph | browser sends a request to a server and receives a response; server load rises with several clients |
| 2 | `dns` | graph | browser → resolver → root → TLD → authoritative → IP returned and cached |
| 4 | `apis-rest` | graph | client calls `GET/POST/PUT/DELETE` on an API in front of a database; the DB node changes as data is created, updated, deleted |
| 5 | `sql-vs-nosql` | compare | left: tables joined by foreign keys; right: documents stored whole; step through the same "load an order" query |
| 6 | `indexes` | numbers | rows scanned with and without an index for the same lookup, as table size grows |
| 7 | `scaling-vertical-horizontal` | compare | left: one server upgraded to a bigger one (ceiling); right: more servers behind a load balancer |
| 9 | `latency-vs-throughput` | numbers | latency per request vs requests per second as a pipe fills; shows they are different quantities |

- [ ] **Step 1:** Write each scene and lesson in the table (order of rows). Reuse existing scene and lesson files as the format reference.
- [ ] **Step 2:** Run `npm run verify` → passes.
- [ ] **Step 3:** Open each new lesson in the dev server and confirm the diagram follows the text and nothing overlaps.
- [ ] **Step 4: Decision log.** Append one `decisions.tsv` row for each lesson simplification or claim that depends on a convention (for example typical numbers used in an example), with the reason.
- [ ] **Step 5: Accuracy review.** Dispatch a fresh reviewer subagent on the most capable model to check these lessons for factual errors, misleading simplifications, and captions that don't match their scene step. Fix real errors; record anything unresolved in `decisions.tsv` with result `needs owner review`.
- [ ] **Step 6:** Run `npm run verify` → passes; commit `content: level 1 lessons`.

---

### Task 16: Level 2 lessons (7 remaining)

**Files:** as Task 15; follow the same authoring rules.

| order | slug | scene type | what the diagram shows |
|---|---|---|---|
| 11 | `cdn` | graph | user far from origin; request hits the nearest edge node; first miss fetches from origin, later hits are served at the edge |
| 13 | `message-queues` | graph | producer → queue → consumers; queue `fill` rises when consumers are slow, falls when one is added |
| 14 | `pub-sub` | graph | one publisher → topic → multiple independent subscribers each receiving a copy |
| 16 | `api-gateway` | graph | clients → gateway (auth, routing, rate limit) → separate services |
| 17 | `monolith-vs-microservices` | compare | left: one deployable with modules inside; right: separate services talking over the network; step through "one slow module" and "deploy a change" |
| 18 | `auth-sessions-tokens` | sequence | client, server, session store: login, session cookie lookup vs signed token verification; side by side as consecutive step groups |
| 19 | `estimation` | numbers | back-of-envelope: users → requests/s → storage/day → bandwidth, one bar per derived quantity |

(The Level 2 orders 10, 12, 15 are the Poke lessons already built.)

- [ ] **Step 1:** Write each scene and lesson.
- [ ] **Step 2:** Run `npm run verify` → passes.
- [ ] **Step 3:** Open each new lesson in the dev server and confirm the diagram follows the text.
- [ ] **Step 4: Decision log.** Append one `decisions.tsv` row for each lesson simplification or convention-dependent claim (for example the assumptions in the estimation lesson), with the reason.
- [ ] **Step 5: Accuracy review.** Dispatch a fresh reviewer subagent on the most capable model to check these lessons for factual errors, misleading simplifications, and captions that don't match their scene step. Fix real errors; record anything unresolved in `decisions.tsv` with result `needs owner review`.
- [ ] **Step 6:** Run `npm run verify` → passes; commit `content: level 2 lessons`.

---

### Task 17: Level 3 lessons (9 remaining)

**Files:** as Task 15; follow the same authoring rules. Raft stays at intuition level (leader, followers, term, majority vote), no log-compaction detail.

| order | slug | scene type | what the diagram shows |
|---|---|---|---|
| 21 | `consistent-hashing` | graph | keys and servers on a ring; adding or removing a server moves only nearby keys |
| 22 | `cap-consistency` | sequence | two replicas and a client during a network partition: choose to answer (available, maybe stale) or refuse (consistent) |
| 23 | `consensus-raft` | sequence | follower times out, becomes candidate, requests votes, wins a majority, becomes leader, replicates an entry |
| 24 | `sagas` | sequence | order, payment, inventory services; a failure in the last step triggers compensating actions in reverse |
| 25 | `idempotency-retries` | sequence | client retries after a timeout; with an idempotency key the server does not double-charge; backoff spacing grows |
| 26 | `observability` | sequence | one request traced across services as spans on lanes; logs and metrics shown as readouts on the lanes |
| 27 | `case-url-shortener` | graph | write path (generate key, store) and read path (cache, redirect) |
| 28 | `case-news-feed` | graph | post fan-out to followers' feeds on write vs assembling on read |
| 29 | `case-chat` | graph | two clients over websockets through a gateway, message store, and delivery to an offline user on reconnect |

(Level 3 order 20 is the Poke lesson `sharding`.)

- [ ] **Step 1:** Write each scene and lesson.
- [ ] **Step 2:** Run `npm run verify` → passes.
- [ ] **Step 3:** Open each new lesson in the dev server and confirm the diagram follows the text.
- [ ] **Step 4: Decision log.** Append one `decisions.tsv` row for each lesson simplification (especially the intuition-level Raft, CAP, and saga explanations and the case-study design choices), with the reason.
- [ ] **Step 5: Accuracy review.** Dispatch a fresh reviewer subagent on the most capable model to check these lessons for factual errors, misleading simplifications, and captions that don't match their scene step. Fix real errors; record anything unresolved in `decisions.tsv` with result `needs owner review`.
- [ ] **Step 6:** Run `npm run verify` → passes; commit `content: level 3 lessons`.

---

### Task 18: Completeness check, README, final verification

**Files:**
- Modify: `tests/content.test.ts`
- Create: `README.md`

- [ ] **Step 1: Write failing test additions in `tests/content.test.ts`:** exactly 29 lesson files; 9 with `level: 1`, 10 with `level: 2`, 10 with `level: 3`; `order` values are unique within each level; exactly the slugs `load-balancers`, `caching`, `replication`, `rate-limiting`, `sharding` have `poke: true`; each of the four scene types appears in at least one scene.
- [ ] **Step 2:** Run `npx vitest run tests/content.test.ts` → fails only if something is missing; fix any gap found.
- [ ] **Step 3:** `README.md`: how to run (`npm install`, `npm run dev`, `npm test`, `npm run build`) and "Adding a lesson": create `src/scenes/<slug>.ts` and `src/content/lessons/<slug>.mdx` with one `<Step>` per scene step, plus `src/sims/<slug>.ts` and `<TryIt/>` and `poke: true` for a Poke topic; tests validate the result.
- [ ] **Step 4: Prove the checks can fail.** One at a time, (a) add a raw `#ffffff` color to a component, (b) add a `:hover` rule to a stylesheet, (c) delete one lesson file; run `npm run verify` after each and confirm it fails with a message naming the problem; restore all three.
- [ ] **Step 5: Poke accuracy review.** Dispatch a fresh reviewer subagent on the most capable model to check the five Poke lessons (`load-balancers`, `caching`, `replication`, `rate-limiting`, `sharding`) for factual errors and for sims whose behavior contradicts what the lesson text claims. Fix real errors; record anything unresolved in `decisions.tsv` with result `needs owner review`.
- [ ] **Step 6: Final verification.** Run `npm run verify` and `npm run e2e`; both pass. In the dev server, walk one lesson of each scene type (`http-request-lifecycle`, `consensus-raft`, `sql-vs-nosql`, `indexes`) and all five Poke lessons; confirm pinned diagram, scrubbed marker, state animation, arrow-key stepping, reduced-motion behavior, and that the home page checkmarks persist after reload.
- [ ] **Step 7: Whole-branch review.** Dispatch a fresh reviewer subagent on the most capable model over the full diff against the spec and this plan; fix real defects or log declined findings in `decisions.tsv`.
- [ ] **Step 8:** Run `npm run verify` → passes; commit `chore: completeness test, readme, final review`.
