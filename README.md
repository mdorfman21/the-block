<p align="center">
  <img src="docs/the_block_repo.png" alt="The Block" width="820" />
</p>

# The Block — OPENLANE buyer auction (prototype)

A buyer-side vehicle auction marketplace built for OPENLANE's **"The Block"** challenge. Browse a 200-vehicle wholesale inventory, dig into each lot's condition, and place bids — styled to feel like a genuine OPENLANE product.

**React + Vite + TypeScript · frontend-only · no backend, no env setup.**

---

## How to run

Requirements: **Node 20.19+** (built on Node 24.16) and npm.

```bash
npm install
npm run dev
```

Then open the printed URL (default **http://localhost:5173**).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc`) and build for production |
| `npm run preview` | Preview the production build |
| `npm test` | Run the unit + component tests once (Vitest) |
| `npm run test:watch` | Run the tests in watch mode |
| `npm run lint` | Lint the codebase with ESLint |
| `npm run typecheck` | Type-check only (no emit) |

No environment variables, no backend, no database — `npm install && npm run dev` is all it takes.

## What I built

The brief's **Minimum Bar**, polished first, then extended beyond it:

- **Browse, search & filter** — a responsive card grid over all 200 lots; instant multi-term search; a faceted filter rail (make, a dependent model list, body style, title status, **price / year / odometer** ranges, and a **Buy It Now** toggle) with **cross-filtering counts**, removable chips, and a "Show more" cap; sort by Featured / ending-soonest / price / year / mileage / bids / condition.
- **Vehicle detail** — photo gallery, full specifications, a labeled **condition meter** (grade out of 5 + plain-language rating), condition report, damage notes, title status, and selling dealer.
- **Bidding** — tiered increments, validation, quick-bid chips, persisted state, your bid history, and a **live countdown** (card badge + bid panel) with urgency cues that **closes bidding when a lot ends**.
- **Buy It Now** — instant purchase on eligible lots (withdrawn once bidding passes the price) → "You bought this lot" + a *Purchased* badge.
- **Watchlist & scoped views** — save/favorite vehicles (heart, persisted); the header "saved" and "active bids" pills open **`?view=watchlist`** / **`?view=my-bids`** views.
- **Rival outbid (demo)** — a console helper, `theBlock.outbidMe()`, places a rival bid through the service seam, flipping you to a visible **Outbid** state (bid → outbid → re-bid).
- **OPENLANE branding** — the real palette and Poppins typeface, pulled from the live OPENLANE Canada marketplace.

## Stack

- **Frontend:** React 19 + Vite + TypeScript, React Router
- **Styling:** CSS Modules + a design-token system (no UI framework)
- **State / data:** a small reactive store via `useSyncExternalStore` (shared by the auction + watchlist services); the dataset is bundled from `data/vehicles.json`
- **Quality:** Vitest (unit **+ React Testing Library** component tests), **ESLint**, and a **GitHub Actions CI** that runs lint → typecheck → test → build on every push
- **Backend / Database:** none — frontend-only (the brief allows this)

## Time & approach

Built in a focused, **AI-assisted** session — I pair-programmed with Claude Code (see *Working with AI*). I worked **minimum-bar-first**: the brief's core loop — browse → inspect → bid, OPENLANE-faithful and polished — before layering on faceted filtering, live countdowns, Buy Now, a watchlist, tests, and tooling. That's more than a hand-built 3–4 hour scope, which the brief's AI allowance makes possible; I optimized for a clean, extensible core over raw feature count, kept each step a logical commit, and tracked the rest on the roadmap. Every decision below is one I can walk through and defend.

## Assumptions & scope

- **Prototype, not production.** Optimized for the core buyer loop — browse → inspect → bid — and for craft.
- **Synthetic data.** VINs and specs are invented, so no real photos of these exact cars exist. The app loads the dataset's own `images` URLs (placehold.co placeholders) and **falls back to a styled, color-tinted placeholder** if an image fails to load (e.g. offline).
- **Auction times are synthetic.** `auction_start` is clustered in the past, so each lot's **end time is normalized relative to page load** (as the brief permits) to drive the live countdowns; they re-anchor on reload.
- **Single-user bidding.** Your bid becomes the leading bid — there are no *automatic* rivals, so a manual **outbid demo script** (`theBlock.outbidMe()`) exists to exercise the outbid flow. Real multi-device bidding needs a backend (roadmap).
- **No authentication, seller tools, checkout, or payments** — explicitly out of scope per the brief.

## Notable decisions

- **Frontend-only behind a service seam.** All bid reads/writes go through one async `auctionService` (`placeBid()` returns a promise) backed by localStorage, via a shared reactive `createStore`. Components treat bidding as if it were a network API, so dropping in a real backend later is a one-file change, not a rewrite.
- **Bids are an append-only event log.** `currentBid`, `bidCount`, `isHighBidder`, `purchased`, and `outbid` are *derived*, never stored. This made **Buy Now** (a `buy-now` event) and the **rival-outbid** script drop-ins rather than rewrites — a rival bid is just another event with a different bidder. Unit-tested, including the outbid path.
- **OPENLANE brand fidelity.** Pulled the real palette (`#0061FF` action blue, `#0A1B5F` navy, `#F5F5F5` surface) and the Poppins typeface from the live site, so the prototype reads as a real product.
- **Condition, clearly labeled.** A bare grade number is ambiguous (a deal score? a seller rating?), so the indicator is always labeled "Condition" with a meter, an `x/5` value, and a word (Good / Average / Rough…).
- **Timezone-safe dates.** The zoneless `auction_start` is rendered as its written wall-clock time (parsed and formatted in UTC) rather than drifting with the viewer's zone. Covered by a test.
- **Faceted counts cross-filter.** Choosing a make recounts body style / title / model; Make and Model are hierarchical, so selecting a model doesn't collapse the make list, and removing a make clears its models.
- **Scales past 200.** A "Show more" cap bounds the DOM today; the correct large-scale answer (server-side paging + list virtualization) is on the roadmap.
- **Resilience & hygiene.** An app-level **error boundary** (friendly fallback, not a blank screen); demo helpers gated to `import.meta.env.DEV`; ESLint + CI as guardrails.

## Testing

`npm test` runs **65 tests** (Vitest):

- **Domain logic (unit):** bid increment tiers, minimum-next-bid, and validation; the event-log auction derivation **including the multi-bidder / outbid path**; filters, cross-filter faceting, and bounds; search (AND-semantics, case-insensitivity); sorting; condition grading; timezone-stable date formatting; title-status and text helpers.
- **Components (React Testing Library):** the bid flow (place a bid → high-bidder state + store updated), filter-chip removal, and the watchlist toggle.

I weighted tests toward the branching domain logic, with component tests over the key interactive flows. **CI** runs lint → typecheck → test → build on every push.

## What I'd do with more time

See **[ROADMAP.md](ROADMAP.md)** for the full plan. Highlights: **automatic / cross-tab rival bidding** (cheap on the event-log model) and a Winning/Outbid filter; **reserve met/not-met** and proxy/max bidding; representative vehicle photos; a price/deal indicator; and a **real backend** for genuine multi-device bidding.

## Working with AI

The brief encourages AI tools, so to be transparent: I built this pair-programming with Claude (Claude Code). I drove every major decision — platform, stack, OPENLANE branding, scope (minimum-bar-first), the frontend-only + service-seam architecture, the filtering model, the image strategy, and the rival-outbid approach — and reviewed and steered the implementation at each step. Every decision and tradeoff above is one I can walk through and defend.

## Project structure

```
src/
  components/   UI: Brand, Header, Footer, Layout, VehicleCard, VehiclePhoto,
                ConditionGrade, Countdown, SearchBar, FilterPanel, FilterChips,
                Gallery, BidPanel, WatchButton, ErrorBoundary, Toast/
  pages/        InventoryPage, VehicleDetailPage, NotFoundPage
  lib/          pure logic (+ tests): bids, filters, sort, search, condition,
                auction, color, format, titleStatus, text, storage, store
  services/     auctionService, watchlistService — the swappable "API" seam
  hooks/        useAuction, useWatchlist, useCountdown, useDebouncedValue
  dev/          rivals.ts — the outbid demo helpers (dev builds only)
  styles/       tokens.css + global.css (the design system)
  data/         vehicles.ts (normalizes data/vehicles.json into a typed model)
  test/         shared fixtures + jest-dom setup
data/           vehicles.json (the provided dataset)
```
