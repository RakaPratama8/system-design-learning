# System Design Learning Platform: Design

Date: 2026-11-18. Status: draft for approval.

## Intent and why

Raka wants a personal website for learning system design, from general to intermediate to advanced. The reason this is worth building, in their words: they want a visual approach to *how each system design works*, so they (and possibly future users) understand it, not just memorize it. Reading about a load balancer or a cache is easy. Seeing a request travel through a system, see the cache miss, see the DB get hit, and see what changes when a server dies is what makes it click.

The platform is a conventional learning site in shape ("simple system design learning platform as usual"): a curriculum, lessons, progress. What makes it different is that every lesson is built around a diagram that shows the system working.

## Goals

- A three-level curriculum: Foundations, Intermediate, Advanced. Roughly 29 topics at launch (draft list below).
- Every lesson has a **Watch** view: a pinned diagram that advances step by step as the reader scrolls through a numbered explanation.
- A handful of key trade-off topics also have a **Poke** view: the reader toggles things (cache off, kill a server, double the traffic) and the diagram reacts, so the trade-off is felt, not read.
- Simple, calm visual design. The diagram is the hero; text supports it.
- Adding a lesson later means writing text and a scene description, not UI code.
- Works as a static site, so it can be shared later with no backend or accounts.

## Non-goals

- No drag-and-drop "build your own architecture" canvas. Explicitly ruled out.
- No accounts, no server, no database. Progress lives in the browser (localStorage).
- No quizzes, streaks, badges, or other gamification in v1.
- No user-generated content, comments, or community features.
- No real-time or high-fidelity simulation. Poke models are small and illustrative, not accurate performance predictions.

## Anti-goals (would be a failure even if it technically works)

- Lessons that are walls of text with a decorative diagram bolted on.
- Animation for its own sake: movement that does not correspond to a real step in the explanation.
- Inconsistent diagrams, where lesson 20 looks and behaves differently from lesson 2.
- Technically wrong content stated confidently. The content is drafted by Claude and reviewed by Raka later, so factual accuracy matters more than polish.
- Growing into a bigger product (editor, builder, platform) than a personal learning site.

## Constraints

- Static site only: no backend, deployable to any static host. Deployment itself is out of scope unless requested.
- One person maintains it. Per-lesson authoring cost must stay low.
- Must respect `prefers-reduced-motion` (diagram jumps between states instead of animating).
- Desktop is the primary target. The layout should remain usable on a phone, but mobile polish is not a v1 goal.

## Approaches considered

**A. Data-driven static site (chosen).** Astro (or Vite) with React for interactive parts. Each lesson is a markdown/MDX file for the text plus a scene file describing the diagram. One shared player renders every scene. A Poke topic adds one small simulation function. Trade-off: the player must be built once up front; after that, lessons are cheap and consistent.

**B. Plain HTML with hand-drawn SVG per lesson.** No framework, no build step. Simplest to start, but every animation is custom, logic gets copied between lessons, Poke topics get messy, and lessons drift apart visually.

**C. Diagram library (Mermaid or React Flow).** Mermaid does not animate request flow. React Flow animates and is interactive but is built for editors, pulling the project toward the ruled-out "Build" feature, and is heavy for a read-only site.

Raka chose **A**.

## Decisions made with Raka

- **Visual depth:** Watch for all lessons; Poke only for the key trade-off topics: load balancing, caching, replication, sharding, rate limiting. (Candidates to add later if cheap: message-queue backpressure, consistent hashing.)
- **Lesson layout: scroll-driven story.** The diagram stays pinned at the top of the page. The lesson body is a numbered sequence of explanation blocks. As each block scrolls into view, the diagram advances to that step. There is no Next button; going back means scrolling up. (Raka picked this over "diagram on top with Next/Back" and "text left, diagram right".)
- **Content authorship:** Claude drafts the topic list and writes all lessons; Raka reviews later.
- **Simple design:** minimal, calm, diagram-first.
- **One shared player, four scene types**, all sharing the same scroll-driven layout and look. A design-doc reviewer pointed out that not every topic fits boxes and arrows (for example latency vs throughput, estimation, Raft, sagas, retries, observability), so the player supports:
  1. **Graph:** components, links, and a travelling marker. The default.
  2. **Sequence:** vertical lanes with messages over time (Raft, sagas, retries, sessions vs tokens).
  3. **Compare:** two small diagrams side by side (monolith vs microservices).
  4. **Numbers:** a live readout or bar chart (latency vs throughput, estimation).
  The scene format and player are designed for all four from the start, so the "one shared player" promise holds. Each topic uses whichever type fits; a lesson may mix types across its steps.
- **Animation approach** (Raka approved my recommendation):
  - **Scrubbed motion in every Watch lesson:** the marker's position follows scroll progress within a step, and scrolling back reverses it.
  - **State animation in every Watch lesson:** components change visibly between steps (a cache fills, a queue grows, a server turns red and drops out, a load bar rises). Each step carries a state for each component, and the player interpolates between steps.
  - **Live traffic in Poke topics only:** a traffic slider drives a continuous stream of requests, with queues forming and failures appearing, backed by a small simulation loop.
  - **Ambient flow used sparingly:** looping dots only on the links highlighted in the current step, never across the whole diagram.
  - **No decorative animation** (entrance fades, hover effects): it adds nothing and matches the anti-goal above.
  - Every animation must correspond to a real step in the explanation. With `prefers-reduced-motion`, the diagram jumps between states instead of animating.
  - Implementation: SVG animated with CSS or the browser's built-in animation API, with no heavy animation library.

## My calls (not yet confirmed by Raka)

- **Home page:** a simple three-level map (Foundations, Intermediate, Advanced), each listing its topics, with a checkmark on topics the reader has marked done. Checkmarks saved in localStorage.
- **Poke placement:** a Poke topic ends with a "Try it" section. Within it, the pinned diagram gains a small control panel of toggles and sliders.
- **Keyboard:** arrow keys step the diagram forward and back as an accessibility fallback to scrolling.
- **Stack:** Astro + React + MDX, with diagrams rendered as SVG. Scenes are typed data files stored beside each lesson. Scroll detection via IntersectionObserver. No diagram library.

## Draft topic list (Raka to review)

Poke topics marked **[Poke]**.

**Level 1: Foundations**
1. Client and server
2. IP addresses and DNS
3. The life of an HTTP request
4. APIs (REST basics)
5. Databases: SQL vs NoSQL
6. Indexes
7. Vertical vs horizontal scaling
8. Load balancers **[Poke]**
9. Latency vs throughput

**Level 2: Intermediate**
10. Caching **[Poke]**
11. CDNs
12. Database replication **[Poke]**
13. Message queues
14. Pub/sub and event streams
15. Rate limiting **[Poke]**
16. API gateway and reverse proxy
17. Monolith vs microservices
18. Authentication: sessions vs tokens
19. Back-of-envelope estimation

**Level 3: Advanced**
20. Sharding and partitioning **[Poke]**
21. Consistent hashing
22. CAP theorem and consistency models
23. Consensus and leader election (Raft, intuition level)
24. Distributed transactions and sagas
25. Idempotency, retries, and backoff
26. Observability: logs, metrics, traces
27. Case study: URL shortener
28. Case study: news feed
29. Case study: chat system

## What a scene needs to express (shape, not format)

A scene declares its type (graph, sequence, compare, or numbers) and describes its components (and links, lanes, or panels, depending on type) plus an ordered list of steps. For each step it says which parts are highlighted, what marker (for example a request dot) travels where, the state of each component (status such as ok, hot, or down; a fill level; a label), and the caption. Each step is tied to one numbered block in the lesson text so the scroll position selects the step, and scroll progress within the block drives the marker. The player interpolates between step states. A Poke scene additionally names its controls and the simulation function that maps control state, including traffic rate, to diagram state (for example hit rate, queue length, which node is down).

## Left to the builder

- Exact scene file format and the player's internal structure.
- Visual specifics: colors, typography, node shapes, animation timing, as long as they are simple and consistent.
- How the pinned diagram behaves on narrow screens.
- Build order. Suggested: the player plus one Watch lesson and one Poke lesson first, to prove the pattern, then the rest of the content.
- Whether to initialize version control (the folder is not currently a git repo).
