# Node Icons: Design

Date: 2026-11-18. Status: draft for approval. Extends `2026-11-18-system-design-learning-design.md` (the platform spec); everything there still applies unless changed here.

## Intent and why

After reading some lessons, Raka found the diagrams hard to read at a glance: every component is the same box and differs only by its text, so "Phone", "Database" and "Cache" look alike. They asked for sprites: if a component is a phone, the diagram shows a phone picture. The goal is that a learner recognizes what each component *is* before reading its label.

## Goals

- Every component in every lesson diagram shows a small flat-color icon of what it is, with its text label kept underneath.
- Applies to graph nodes, both sides of compare scenes, and sequence-scene lane headers (all 29 lessons).
- Highlight, status (ok, hot, down), load bar, and state labels keep working exactly as before, drawn on top of the icon.
- Icons stay legible in the smallest places they appear: the pinned diagram on a 375px phone, and each half of a compare scene.
- Adding a lesson still means writing text and a scene file; a node just names an icon from a fixed vocabulary.

## Non-goals

- No animated icons and no hover or tap behavior (the design rules ban hover effects).
- No raster images or pixel sprites; icons are hand-drawn inline SVG.
- Numbers scenes are unchanged (they have bars, not components).
- No user-uploaded or per-lesson custom icons; the vocabulary is fixed.
- No change to simulations, scroll behavior, or lesson text.

## Anti-goals

- Icons that make a diagram busier or harder to read than the text-only boxes.
- Icon colors that clash with status colors, so that "hot" or "down" is hard to see.
- Two different pictures for the same kind of thing across lessons, or one picture used for unrelated things.
- Icon-only nodes: the label stays, because pictures such as "queue" or "gateway" are ambiguous alone.

## Constraints

- Static site, no new dependencies; icons are React components rendering inline SVG.
- The existing design rules stay enforced by test: no raw color literals outside `src/styles/global.css`, no unguarded motion CSS, no hover rules, no banned libraries. Icon colors therefore come from CSS variables defined in `global.css`.
- `prefers-reduced-motion` is unaffected (nothing animates).
- Marker and traffic-dot paths run between node centers; the tile center must remain the node's `(x, y)`.

## Approaches considered

**A. Icon tile above the label (chosen).** Each node is a rounded tile holding the icon, with the label under it. Highlight is a tinted tile, status is the tile border, the load bar sits under the label. Nodes get taller (about 72 wide by 52 tall instead of 72 by 32), so some scenes need re-spacing; the validator's existing overlap and bounds checks flag exactly which.

**B. Icon inside the current box.** Least layout change, but the icon is about 20px and sits beside the text, so it reads as a bullet and not a sprite; long labels force wider boxes.

**C. Icon only, label on hover or tap.** Cleanest sprite look, but it reintroduces the problem (a learner cannot tell "queue" from "gateway" without interacting) and needs a hover effect the rules forbid.

Raka chose **A** and, after seeing three styles, chose **flat color icons** (over line icons and pixel sprites).

## Decisions made with Raka

- Style: flat color icons, small filled illustrations.
- Approach A: tile with icon, label underneath.
- Scope: all 29 lessons.

## My calls (not yet confirmed by Raka)

- **Icon is required on graph nodes and sequence lanes.** The validator rejects a missing or unknown icon name, so every diagram stays consistent.
- **Hue families by role, not by lesson.** Green, amber and red are reserved for status, so categories use other hues. The preview showed an amber database and a green balancer; those become violet (data) and teal (network). Proposed families: slate for people and devices, blue for compute (servers, apps, services), violet for data stores and caches, teal for network and routing (balancer, gateway, DNS, CDN, limiter), pink for messaging (queue, topic, push, email). Exact shades are the builder's to tune for legibility.
- **Status on top of the icon:** `ok` leaves the icon at full color; `hot` shows an amber tile border; `down` shows a red tile border and dims the icon, so a failed server reads as failed even in grayscale.
- **Icon vocabulary (about 28 kinds), one picture per role:** phone, laptop, tablet, browser, person, people (group of clients), server, app, service, database, cache, shard, search, document, table, key, balancer, gateway, router, dns (globe), cdn-edge, limiter, queue, topic, push, email, payment, order, inventory, analytics, feed, node (generic cluster member). The 81 distinct labels in the current scenes map onto these; labels with the same role share an icon (all "Server n", "Node A-C", "Replica n", "Shard n" reuse the appropriate kind).
- **Sequence lanes** get the icon above the lane label in the header; message rows start a little lower.
- **Tile size is uniform** across scenes, so icons look the same everywhere; if a dense scene cannot fit, re-lay it out (two columns, fewer nodes per column) before shrinking tiles.

## Testing

- Validator tests: missing icon, unknown icon, and the new (taller) overlap and bounds rules.
- A test that every name in the vocabulary has a drawing, every icon used in a scene is in the vocabulary, and each icon renders without error.
- The existing rule scans keep passing, which proves the icons use CSS variables, not raw colors.
- Existing e2e tests (caption follows block for every lesson, phone layout, Try it) keep passing; add a phone-width check that node tiles in a compare scene stay at least a minimum rendered size.
- Screenshot spot check of each scene type before finishing.

## Left to the builder

- The exact drawings, shades, tile corner radius, and label placement.
- The mapping from each of the 81 labels to a vocabulary entry (using the roles above).
- Re-spacing of the scenes the validator flags.
- Whether the tile and its icon are one component or two.
