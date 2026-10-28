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
| `npm test` | Run the unit tests (Vitest) |
| `npm run typecheck` | Type-check only |

No environment variables, no backend, no database — `npm install && npm run dev` is all it takes.

## What I built

The brief's **Minimum Bar**, polished first, then extended:

- **Browse & search** — a responsive card grid over all 200 lots with instant, multi-term search (make, model, trim, city, dealer, lot, VIN…).
- **Faceted filters** — make, a dependent model list, body style, price and year ranges, and title status, with **counts that cross-filter** as you narrow, plus a "Show more" incremental load that scales past 200.
- **Vehicle detail** — photo gallery, full specifications, a clearly-labeled **condition meter** (grade out of 5 + plain-language rating), condition report, damage notes, title status, and selling dealer.
- **Bidding** — tiered minimum-increment logic, a bid input with steppers and quick-bid chips, validation, a "you're the high bidder" state, and your bid history. **Bids persist across refresh** (localStorage) and update everywhere reactively (cards, header badge, detail panel).
- **OPENLANE branding** — the real palette and typeface, pulled from the live OPENLANE Canada marketplace (see *Notable decisions*).

Beyond the minimum bar, the build also adds live auction **countdowns**, **Buy It Now**, a **watchlist**, odometer/buy-now filters, more sort options, and scoped `my-bids` / `watchlist` views. See **[ROADMAP.md](ROADMAP.md)** for the full shipped list.

> **Demo — the outbid flow:** the prototype is single-user, so you're always the high bidder. To exercise the outbid → re-bid loop, bid on a lot, then run **`theBlock.outbidMe()`** in the browser console — a rival outbids you and the UI flips to an **Outbid** state.

## Stack

- **Frontend:** React 19 + Vite + TypeScript, React Router
- **Styling:** CSS Modules + a design-token system (no UI framework)
- **State / data:** a small reactive store via `useSyncExternalStore`; the dataset is bundled from `data/vehicles.json`
- **Testing:** Vitest
- **Backend / Database:** none — frontend-only (the brief allows this)

## Time & approach

Built in a single focused, AI-assisted session. Consistent with the brief's 3–4 hour guidance, I spent the majority of the effort getting the **polished minimum bar** right (OPENLANE-faithful UI, the condition UX, and the bid flow) before layering on faceted search and tests. I consciously traded feature breadth for craft and a clean, extensible core.

## Assumptions & scope

- **Prototype, not production.** I optimized for the core buyer loop — browse → inspect → bid — and for craft over feature count.
- **Synthetic data.** VINs and specs are invented, so no real photos of these exact cars exist. The app loads the dataset's own `images` URLs (placehold.co placeholders) and **falls back to a styled, color-tinted placeholder** if an image fails to load (e.g. offline during a walkthrough).
- **Auction times are synthetic.** `auction_start` is clustered in April 2026; I render it as a factual date (see the timezone note below). Live countdowns and open-vs-closed states are a deliberate next step, not part of v1.
- **No authentication, seller tools, checkout, or payments** — explicitly out of scope per the brief.
- **Bidding is single-user:** your bid becomes the leading bid. Rival bidders are intentionally *designed for* but not built — see the roadmap.

## Notable decisions

- **Frontend-only behind a service seam.** All bid reads/writes go through one async `auctionService` (`placeBid()` returns a promise) backed by localStorage. Components treat bidding as if it were a network API, so dropping in a real backend later is a one-file change, not a rewrite.
- **Bids are an append-only event log.** `currentBid`, `bidCount`, and "are you the high bidder" are *derived*, never stored. This keeps the model honest and makes a future **multi-bidder bidding war** (simulated rivals, cross-tab, or a real backend) a drop-in — a rival bid is just another event with a different bidder. There's a unit test for exactly that path.
- **OPENLANE brand fidelity.** I pulled the real palette (`#0061FF` action blue, `#0A1B5F` navy, `#F5F5F5` surface) and the Poppins typeface from the live OPENLANE Canada site, so the prototype reads as a real product rather than a generic theme.
- **Condition, clearly labeled.** A bare grade number is ambiguous (a deal score? a seller rating?), so the condition indicator is always labeled "Condition" with a meter, an `x/5` value, and a word (Good / Average / Rough…).
- **Timezone-safe dates.** `auction_start` carries no timezone, so I render the written wall-clock time as-is (parsed and formatted in UTC) rather than letting it drift with the viewer's zone. Covered by a test.
- **Faceted counts cross-filter.** Choosing a make recounts body style / title / model; Make and Model are treated hierarchically so selecting a model doesn't collapse the make list, and removing a make clears its models.
- **Scales past 200.** The "Show more" cap bounds the DOM today; the correct large-scale answer (server-side paging + list virtualization) is on the roadmap.

## Testing

`npm test` runs **41 unit tests** (Vitest) over the pure domain logic:

- bid increment tiers, minimum-next-bid, and bid validation
- the event-log auction derivation, **including the multi-bidder / outbid path**
- filters, cross-filter faceting, facet counts, and bounds
- search (AND-semantics, case-insensitivity)
- condition grading and the timezone-stable date formatting

I focused tests on the domain logic — the part with real branching and future reuse — rather than on presentational components.

## What I'd do with more time

See **[ROADMAP.md](ROADMAP.md)** for the full phased plan. Highlights: live auction states + countdowns; **simulated rival bidders and cross-tab real-time bidding** (cheap thanks to the event-log model); Buy Now + reserve status; a watchlist; representative stock photos; and a real backend for genuine multi-device bidding.

## Working with AI

The brief encourages AI tools, so to be transparent: I built this pair-programming with Claude (Claude Code). I drove every major decision — platform, stack, OPENLANE branding, scope (minimum-bar-first), the frontend-only + service-seam architecture, the filtering model, and how to handle images — and reviewed and steered the implementation at each step. Every decision and tradeoff above is one I can walk through and defend.

## Project structure

```
src/
  components/   UI: Brand, Header, Footer, Layout, VehicleCard, VehiclePhoto,
                ConditionGrade, SearchBar, FilterPanel, Gallery, BidPanel, Toast/
  pages/        InventoryPage, VehicleDetailPage, NotFoundPage
  lib/          pure logic (+ tests): bids, filters, search, condition, color, format
  services/     auctionService — the swappable bid "API" seam
  hooks/        useAuction (reactive store binding), useDebouncedValue
  styles/       tokens.css + global.css (the design system)
  data/         vehicles.ts (normalizes data/vehicles.json into a typed model)
  test/         shared test fixtures
data/           vehicles.json (the provided dataset)
```
