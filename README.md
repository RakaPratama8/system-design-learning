# System Design Learning Platform

A static site that teaches system design by showing systems work. Each lesson pins a diagram at the top of the page and advances it as you scroll through numbered explanation blocks. Five trade-off lessons also have a live "Try it" simulation.

## Run

```bash
npm install
npm run dev      # local site at http://localhost:4321
npm run verify   # typecheck + unit tests + build (the finish condition for any change)
npm run e2e      # Playwright scroll/Try it tests (needs Google Chrome installed)
```

## Adding a lesson

A lesson is text plus a scene file. No UI code is needed.

1. `src/scenes/<slug>.ts`: default-export a `Scene` (see `src/engine/types.ts`). Four types share one player: `graph` (boxes and arrows with a travelling marker), `sequence` (lanes and messages over time), `compare` (two small graphs side by side), `numbers` (bars).
2. `src/content/lessons/<slug>.mdx`: frontmatter `title`, `level` (1-3), `order`, `summary` (quote values that contain a colon), then **one `<Step>` block per scene step**, then a "Key takeaways" section.
3. Run `npm run verify`. `tests/content.test.ts` checks the scene is valid (known node ids, edges and marker paths, layout bounds, label length), that the step count matches, and that the curriculum totals still hold.

For a live Try it topic:

- add `src/sims/<slug>.ts` (default-export a `Sim`: controls plus a pure `run(values)`; the scene must be a `graph` and every node id the sim returns must exist in it);
- add `poke: true` to the frontmatter and a `<TryIt>` block after the last `<Step>`.

Rules the build enforces: no raw colors outside `src/styles/global.css`, no motion CSS without a `prefers-reduced-motion` guard, no `:hover` rules, no animation or diagram libraries. Decisions about lesson content that need the owner's eyes are in `decisions.tsv`.
