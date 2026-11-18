# Node Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every component in every lesson diagram a flat-color icon tile with its label underneath, so learners recognize what each component is at a glance.

**Architecture:** A fixed vocabulary of 32 icon names lives in a pure module (`src/engine/icons.ts`) shared by the validator and the renderers. Icons are inline-SVG React components drawn in a 40×40 box and colored only through CSS variables in `global.css`. Graph nodes and sequence lanes gain an `icon` field; the frame builders pass it through; the renderers draw a tile (icon) plus label. The field is optional while scenes are migrated, then becomes required and the legacy box rendering is deleted.

**Tech Stack:** Existing: Astro 7, React, MDX, TypeScript, Vitest (jsdom), Playwright (system Chrome). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-11-18-node-icons-design.md` (extends `docs/superpowers/specs/2026-11-18-system-design-learning-design.md`)

## Global Constraints

- Flat color icons: small filled illustrations; the text label stays under every icon (spec: "Icon-only nodes" is an anti-goal).
- Static site, no new dependencies; icons are React components rendering inline SVG.
- Scope is all 29 lessons: graph nodes, both sides of compare scenes, and sequence-scene lane headers. Numbers scenes are unchanged.
- No animated icons, no hover or tap behavior, no raster images, no per-lesson custom icons.
- Design rules stay enforced by `tests/rules.test.ts`: no raw color literals outside `src/styles/global.css`, no motion CSS without a `prefers-reduced-motion` guard, no `:hover`, no banned libraries. Icon colors come from CSS variables.
- Green, amber and red are reserved for status; icon hues are slate, blue, violet, teal and pink only.
- Status stays readable: `hot` = amber tile border, `down` = red tile border plus a dimmed icon (readable in grayscale).
- The tile center is the node's `(x, y)`; markers and traffic dots keep running between node centers.
- Viewbox stays `0 0 400 200`. Tile size is uniform across scenes (36); re-lay out a dense scene before shrinking tiles.
- `npm run verify` passes before every commit; `npm run e2e` passes at the end of Tasks 5-9.
- **Commits carry no `Co-Authored-By` or "Generated with Claude" lines** (user instruction).

## Review Focus

1. A node or lane with a missing or unknown icon must fail at test time, not render blank (Tasks 2 and 9).
2. A failed server must read as failed even without color: dimmed icon plus red tile border, in both Watch and Try it (Tasks 4 and 6).
3. Taller nodes must not overlap or fall outside the viewBox; text labels such as "Chat gateway" must fit under the tile (Tasks 2, 6-8).
4. On a 375px phone, tiles inside compare scenes must stay at least 24px wide on screen (Task 9).
5. Icon colors must never reuse the status colors (Task 1) and sequence messages must start below the lane headers (Task 5).

## File Structure

```
src/engine/icons.ts                  ICON_NAMES, IconName, IconFamily, ICON_FAMILY, isIconName (pure)
src/engine/layout.ts                 shared geometry constants (tile, footprint, bounds, sequence rows)
src/components/icons/drawings.tsx    DRAWINGS: one 40x40 drawing per icon name
src/components/icons/Icon.tsx        <Icon name x y size/> positioned SVG group
src/engine/types.ts                  GraphNode.icon, Lane.icon (optional, then required)
src/engine/validate.ts               unknown/missing icon, icon-aware footprint rules
src/engine/frames/{graph,sequence}.ts   pass icon through; sequence rows shift under icon headers
src/components/scenes/{GraphScene,SequenceScene}.tsx   tile rendering
src/styles/global.css                icon palette tokens and tile/status styles
src/scenes/*.ts                      icon on every node and lane; re-spacing where flagged
tests/icons.test.tsx, tests/validate.test.ts, tests/frames-*.test.ts, tests/GraphScene.test.tsx,
tests/SequenceScene.test.tsx, tests/content.test.ts
tests-e2e/icons.spec.ts, tests-e2e/phone.spec.ts
```

## Label to icon mapping (use for every scene)

Roles decide the icon; every label in the current scenes maps as follows.

| Icon | Labels |
|---|---|
| `phone` | Phone |
| `laptop` | Laptop, Client (including the Client lane) |
| `tablet` | Tablet |
| `browser` | Browser |
| `person` | User, Alice, Bob, Poster, Reader |
| `people` | Users, Clients |
| `server` | Server, Server 1-3, Server A-D, Big server, Origin |
| `app` | App, One app |
| `service` | API, Consumer 1, Consumer 2, Producer, Publisher, Post service, Users svc |
| `database` | Database, Msg store, Post store, Session DB, Primary, Replica 1, Replica 2 |
| `cache` | Cache |
| `shard` | Shard 1-4 |
| `search` | Search, Query |
| `document` | Order doc |
| `table` | orders, customers, items (the SQL tables) |
| `key` | Key 1, Key 2, Key service |
| `balancer` | Balancer |
| `gateway` | Gateway, Chat gateway |
| `router` | Router |
| `dns` | DNS, Resolver, Root, .com server, Auth server |
| `cdn-edge` | Edge server |
| `limiter` | Limiter |
| `queue` | Queue |
| `topic` | Topic |
| `push` | Push service |
| `email` | Email |
| `payment` | Payment, Payments |
| `order` | Order, Orders, Orders svc |
| `inventory` | Inventory |
| `analytics` | Analytics |
| `feed` | Feed: Ann, Feed: Bob |
| `node` | Node 1, Node 2, Node A, Node B, Node C |

---

### Task 1: Icon vocabulary, drawings, and palette

**Files:**
- Create: `src/engine/icons.ts`, `src/components/icons/drawings.tsx`, `src/components/icons/Icon.tsx`
- Modify: `src/styles/global.css`
- Test: `tests/icons.test.tsx`

**Interfaces:**
- Produces:
```ts
// src/engine/icons.ts
export const ICON_NAMES: readonly [
  'phone','laptop','tablet','browser','person','people','server','app','service','database','cache',
  'shard','search','document','table','key','balancer','gateway','router','dns','cdn-edge','limiter',
  'queue','topic','push','email','payment','order','inventory','analytics','feed','node',
];
export type IconName = (typeof ICON_NAMES)[number];
export type IconFamily = 'slate' | 'blue' | 'violet' | 'teal' | 'pink';
export const ICON_FAMILY: Record<IconName, IconFamily>;
export function isIconName(x: string): x is IconName;
// src/components/icons/Icon.tsx
export function Icon(props: { name: IconName; x: number; y: number; size: number }): JSX.Element;
```
Families: slate = phone, laptop, tablet, browser, person, people; blue = server, app, service, node, search, analytics; violet = database, cache, shard, table, document, feed, key, order, payment, inventory; teal = balancer, gateway, router, dns, cdn-edge, limiter; pink = queue, topic, push, email.
`Icon` renders `<g data-icon={name} class="icon ic-{family}" transform=...>` centered on `(x, y)` and scaled to `size` from a 40×40 drawing. Drawings use only the classes `m` (main fill), `s` (soft fill) and `l` (line stroke); no color values in `.tsx`.
`global.css` gains root tokens `--ic-slate`, `--ic-slate-soft`, and the same pair for blue, violet, teal and pink, plus `.ic-<family>` classes that set `--ic-main`/`--ic-soft`, and `.icon .m`, `.icon .s`, `.icon .l` rules. Starting colors: slate `#475569`/`#cbd5e1`, blue `#2563eb`/`#bfdbfe`, violet `#7c3aed`/`#ddd6fe`, teal `#0d9488`/`#99f6e4`, pink `#db2777`/`#fbcfe8`.

- [ ] **Step 1: Write failing tests** in `tests/icons.test.tsx`:
  - `ICON_NAMES` has 32 unique names and includes `'cdn-edge'` and `'phone'`.
  - every name has an entry in `ICON_FAMILY` that is one of the five families.
  - for each name, rendering `<svg><Icon name={name} x={20} y={20} size={40} /></svg>` gives a `g[data-icon="<name>"]` that contains at least two shape elements (`path, rect, circle, ellipse, line, polygon`).
  - `isIconName('phone')` is true, `isIconName('toaster')` is false.
  - reading `src/styles/global.css`, no `--ic-*` token value equals the values of `--ok`, `--hot` or `--down`.
- [ ] **Step 2:** Run `npx vitest run tests/icons.test.tsx` → FAIL (modules missing).
- [ ] **Step 3:** Implement the three modules and the CSS. Draw each icon as a simple filled illustration that is recognizable at 24px (reference style: the approved preview, with violet for data and teal for network).
- [ ] **Step 4:** Run `npx vitest run tests/icons.test.tsx` → PASS; run `npm run verify` → passes (the rule scans cover the new `.tsx` and CSS).
- [ ] **Step 5:** Commit `feat: icon vocabulary and drawings`.

---

### Task 2: Types and validator

**Files:**
- Create: `src/engine/layout.ts`
- Modify: `src/engine/types.ts`, `src/engine/validate.ts`
- Test: `tests/validate.test.ts`

**Interfaces:**
- Consumes: `IconName`, `isIconName` from `src/engine/icons.ts`.
- Produces:
```ts
// src/engine/layout.ts
export const TILE = 36;            // icon tile edge, centered on the node (x, y)
export const ICON_NODE_W = 72;     // footprint width of a node with an icon
export const ICON_NODE_H = 52;     // footprint height: tile (36) plus the label under it
export const ICON_Y_MIN = 32;      // room for a state label above the tile
export const ICON_Y_MAX = 160;     // room for the label and load bar under the tile
// types.ts: GraphNode gains `icon?: IconName`; Lane gains `icon?: IconName` (both optional for now)
```
Rules added to `checkGraph` and the sequence branch of `validateScene`: an `icon` that is not a vocabulary name is an error naming the node or lane and the icon. A node that has an icon uses the icon footprint: x within 36..364, y within 32..160, and overlap when `|dx| < 72 && |dy| < 52` (pairs where either node has an icon use the icon footprint; two nodes without icons keep the old 72×32 rules).

- [ ] **Step 1: Write failing tests** (graph helper from the existing validate tests):
  - a node `{ icon: 'toaster' as never }` → error mentioning `toaster`; a lane with an unknown icon → error mentioning it.
  - a node with `icon: 'server'` at `y: 20` → error mentioning `bounds`; at `y: 170` → error mentioning `bounds`; the same node without an icon at `y: 20` is still valid.
  - two icon nodes at `(100, 100)` and `(150, 100)` → `overlap`; at `(100, 60)` and `(100, 120)` (60 apart) → valid; at `(100, 60)` and `(100, 100)` (40 apart) → `overlap`.
  - an icon node and a plain node 40 apart vertically → `overlap`.
- [ ] **Step 2:** Run `npx vitest run tests/validate.test.ts` → FAIL.
- [ ] **Step 3:** Implement the layout constants, the type fields, and the validator rules.
- [ ] **Step 4:** Run `npm run verify` → passes (no scene has an icon yet, so nothing changes for them).
- [ ] **Step 5:** Commit `feat: icon field and icon-aware validation`.

---

### Task 3: Frame builders pass icons through

**Files:**
- Modify: `src/engine/frames/graph.ts`, `src/engine/frames/sequence.ts`
- Test: `tests/frames-graph.test.ts`, `tests/frames-sequence.test.ts`

**Interfaces:**
- Consumes: `IconName`, layout constants.
- Produces: `GraphFrame.nodes[]` gains `icon?: IconName`; `SequenceFrame.lanes[]` gains `icon?: IconName`. In `buildSequenceFrame`, when any lane has an icon the first message row is at `y = 78` and `rowHeight = Math.min(28, 112 / Math.max(1, total))`; otherwise rows are unchanged (first row 56, as today).

- [ ] **Step 1: Write failing tests:** a graph scene whose node has `icon: 'server'` yields `frame.nodes[...].icon === 'server'` and a node without one yields `undefined`; a sequence scene with icon lanes has `lanes[i].icon` set, its first message `y >= 78`, and with 7 messages the last `y <= 190`; the same scene without icons keeps the first message at `y === 56`.
- [ ] **Step 2:** Run `npx vitest run tests/frames-graph.test.ts tests/frames-sequence.test.ts` → FAIL.
- [ ] **Step 3:** Implement the pass-through and the row shift.
- [ ] **Step 4:** Run `npm run verify` → passes.
- [ ] **Step 5:** Commit `feat: frames carry icons`.

---

### Task 4: Graph tile rendering

**Files:**
- Modify: `src/components/scenes/GraphScene.tsx`, `src/styles/global.css`
- Test: `tests/GraphScene.test.tsx`

**Interfaces:**
- Consumes: `GraphFrame` (with `icon?`), `Icon`, `TILE`.
- Produces: `GraphSceneView` keeps its signature. For a node with an icon it renders, inside the existing `g[data-node][data-status]`: a tile `rect.tile` (36×36, `rx` 8) centered on `(x, y)`, an `Icon` of size 26 at the center, the label text centered at `y + 30`, the load bar under the label at `y + 34` (width up to 48), and the state label above the tile at `y - 22`. A node without an icon renders exactly as today (legacy box), so unmigrated scenes keep working.
CSS: `.tile` fill `var(--bg)`, stroke `var(--line)`; highlighted (`.node.on`) fill `var(--accent-soft)`, stroke `var(--accent)`; `[data-status='hot'] .tile` stroke `var(--hot)`; `[data-status='down'] .tile` stroke `var(--down)` and `[data-status='down'] .icon` opacity `0.45`.

- [ ] **Step 1: Write failing tests** (extend `tests/GraphScene.test.tsx`): a frame node with `icon: 'server'` renders a `g[data-icon="server"]` and a `rect.tile` inside `[data-node]`, and its label text; the load bar and state label render for a node with `fill` and `label`; a node without an icon renders no `g[data-icon]` and no `rect.tile`; a node with `status: 'down'` and an icon has `data-status="down"`.
- [ ] **Step 2:** Run `npx vitest run tests/GraphScene.test.tsx` → FAIL.
- [ ] **Step 3:** Implement the tile branch and the CSS.
- [ ] **Step 4:** Run `npm run verify` → passes.
- [ ] **Step 5:** Commit `feat: icon tiles for graph nodes`.

---

### Task 5: Sequence lane headers

**Files:**
- Create: `tests/SequenceScene.test.tsx`
- Modify: `src/components/scenes/SequenceScene.tsx`, `src/styles/global.css`

**Interfaces:**
- Consumes: `SequenceFrame` (lanes with `icon?`), `Icon`, `TILE`.
- Produces: for a lane with an icon the header is a 36×36 tile at the top (`y` 4..40) with the icon centered, the lane label under it at `y = 52`, the state label at `y = 62`, and the dashed lane line starting at `y = 66`; a lane without an icon renders as today.

- [ ] **Step 1: Write failing tests:** a sequence frame with an icon lane renders a `g[data-icon]` in that lane's header and its label; with a frame built by `buildSequenceFrame` from a three-lane icon scene, every message `y` is greater than 66 (below the header); a lane without an icon renders no icon.
- [ ] **Step 2:** Run `npx vitest run tests/SequenceScene.test.tsx` → FAIL.
- [ ] **Step 3:** Implement the header branch and CSS.
- [ ] **Step 4:** Run `npm run verify` and `npm run e2e` → both pass.
- [ ] **Step 5:** Commit `feat: icon lane headers`.

---

### Task 6: Level 1 scenes get icons

**Files:**
- Modify: `src/scenes/{client-server,dns,http-request-lifecycle,apis-rest,sql-vs-nosql,scaling-vertical-horizontal,load-balancers}.ts`
- Modify: `tests/content.test.ts`
- Create: `tests-e2e/icons.spec.ts`

**Interfaces:**
- Consumes: the label→icon mapping above; validator rules from Task 2.
- Produces: in `tests/content.test.ts`, a constant `ICONIZED: string[]` (slugs expected to have an icon on every graph node, compare node and sequence lane) with a test `every node and lane in an iconized scene has an icon`. Level 1 adds these 7 slugs; Tasks 7 and 8 extend it. (`indexes` and `latency-vs-throughput` are numbers scenes and need nothing.)

- [ ] **Step 1: Write failing tests.** Add the `ICONIZED` test with the 7 slugs. In `tests-e2e/icons.spec.ts`: on `/lessons/http-request-lifecycle` every `[data-node]` contains a `g[data-icon]`; on `/lessons/load-balancers` after scrolling to Try it and unchecking `input[name="s3"]`, `[data-node="s3"]` has `data-status="down"`, its `g[data-icon]` computed `opacity` is below 1, and its `rect.tile` computed `stroke` differs from the stroke of `[data-node="s1"] rect.tile`.
- [ ] **Step 2:** Run `npx vitest run tests/content.test.ts` → FAIL (nodes without icons).
- [ ] **Step 3:** Add `icon` to every node and lane of the 7 scenes using the mapping. Run `npx vitest run tests/content.test.ts`; the validator now reports overlap and bounds errors for any icon node that does not fit. Re-space those nodes (keep ≥ 72 apart horizontally or ≥ 52 vertically, y within 32..160) until it passes. Sims reference node ids, so ids must not change.
- [ ] **Step 4:** Run `npm run verify` and `npm run e2e` → both pass.
- [ ] **Step 5:** Spot check by screenshot: `load-balancers` (Try it, one server off), `sql-vs-nosql` (compare) and `dns`; labels readable, nothing overlapping.
- [ ] **Step 6:** Commit `content: icons for level 1 scenes`.

---

### Task 7: Level 2 scenes get icons

**Files:**
- Modify: `src/scenes/{caching,cdn,replication,message-queues,pub-sub,rate-limiting,api-gateway,monolith-vs-microservices,auth-sessions-tokens}.ts`
- Modify: `tests/content.test.ts` (extend `ICONIZED`)

(`estimation` is a numbers scene.)

- [ ] **Step 1:** Extend `ICONIZED` with these 9 slugs. Run `npx vitest run tests/content.test.ts` → FAIL.
- [ ] **Step 2:** Add `icon` to every node and lane using the mapping. Fix overlap and bounds errors the validator reports by re-spacing. Watch `pub-sub` (3 subscribers stacked) and `replication`.
- [ ] **Step 3:** Run `npm run verify` and `npm run e2e` → both pass.
- [ ] **Step 4:** Spot check by screenshot: `caching` (Try it), `message-queues`, `auth-sessions-tokens` (sequence with icon lanes).
- [ ] **Step 5:** Commit `content: icons for level 2 scenes`.

---

### Task 8: Level 3 scenes get icons

**Files:**
- Modify: `src/scenes/{sharding,consistent-hashing,cap-consistency,consensus-raft,sagas,idempotency-retries,observability,case-url-shortener,case-news-feed,case-chat}.ts`
- Modify: `tests/content.test.ts` (extend `ICONIZED`)

- [ ] **Step 1:** Extend `ICONIZED` with these 10 slugs. Run `npx vitest run tests/content.test.ts` → FAIL.
- [ ] **Step 2:** Add `icon` to every node and lane using the mapping. `sharding` stacks four shards, which cannot fit at 52 apart in one column: lay them out in two columns (keep every node id; the sim and the Try it view use the same positions). Check `consistent-hashing` (ring plus keys) and `case-news-feed` (six nodes) and fix whatever the validator flags.
- [ ] **Step 3:** Run `npm run verify` and `npm run e2e` → both pass (the sharding sim sweep and the captions test cover node ids and step captions).
- [ ] **Step 4:** Spot check by screenshot: `sharding` (Try it, hot key on), `consistent-hashing`, `case-chat`.
- [ ] **Step 5:** Commit `content: icons for level 3 scenes`.

---

### Task 9: Make icons required, remove the legacy box, finish

**Files:**
- Modify: `src/engine/types.ts`, `src/engine/validate.ts`, `src/engine/layout.ts`, `src/components/scenes/GraphScene.tsx`, `src/components/scenes/SequenceScene.tsx`, `src/engine/frames/sequence.ts`, `src/styles/global.css`, `tests/content.test.ts`, `tests/validate.test.ts`, `tests/GraphScene.test.tsx`, `README.md`, `tests-e2e/phone.spec.ts`

**Interfaces:**
- Produces: `GraphNode.icon: IconName` and `Lane.icon: IconName` (required). `validateScene` reports `missing icon` for a graph node, a compare node or a lane without one, and the icon footprint rules apply to every node (the 72×32 rules and the legacy box are deleted; sequence rows always use the icon layout).

- [ ] **Step 1: Write failing tests.** `tests/validate.test.ts`: update the shared graph helper so its nodes carry icons, then add a node without an icon → error mentioning `missing icon`, for a graph node, a compare-side node and a lane. `tests/content.test.ts`: replace `ICONIZED` with a check over every scene in `scenes`. `tests-e2e/phone.spec.ts`: at 375px, on `/lessons/sql-vs-nosql` the first `.compare rect.tile` has a rendered width of at least 24px.
- [ ] **Step 2:** Run `npx vitest run` and `npm run e2e` → FAIL on the new assertions.
- [ ] **Step 3:** Make the fields required, add the `missing icon` rules, delete the legacy box branch, the old node constants and the no-icon sequence row, and update tests that built nodes without icons. Update the README "Adding a lesson" section: every node and lane names an `icon` from `src/engine/icons.ts`, with the vocabulary and the 72×52 spacing rule.
- [ ] **Step 4:** Run `npm run verify` and `npm run e2e` → both pass.
- [ ] **Step 5: Prove the checks can fail.** One at a time: remove an `icon` from one scene node; put a node at `y: 20`; place two nodes 40 apart vertically; run `npm run verify` after each and confirm it fails naming the problem; restore each.
- [ ] **Step 6:** Screenshot one scene of each type (graph, compare, sequence) at desktop and at 375px; confirm tiles and labels are readable.
- [ ] **Step 7:** Dispatch a fresh reviewer on the most capable available model over the whole change (spec, this plan, `git diff <commit before Task 1>..HEAD`); fix real defects or log declined findings in `decisions.tsv`; run `npm run verify` and `npm run e2e`.
- [ ] **Step 8:** Commit `feat: icons required on every node and lane`.
