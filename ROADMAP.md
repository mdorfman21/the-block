# The Block — Feature Roadmap

v1 ships the README's **Minimum Bar**, polished and OPENLANE-branded. This document captures everything intentionally deferred, phased by buyer value and effort. The ordering optimizes for the evaluation criteria (product thinking, craft, judgment) and for how real auction buyers actually behave.

> **Scoping philosophy:** get the core experience genuinely good before adding surface area. Each phase is independently shippable.

---

## v1 — Polished Minimum Bar *(current build)*

- Browse inventory — branded, responsive card grid
- Search — free-text across make / model / trim / year / location / lot
- Vehicle detail — specs, condition grade, condition report, damage notes, title status, selling dealership, location, photos
- Bid flow with **persisted, updated visible state** (localStorage, behind an async service seam)
- Usable on desktop **and** mobile
- Clone-and-run README

**Foundations deliberately baked in for what's next:** bids are stored as an append-only **event log**; `currentBid` / `bidCount` / `isHighBidder` are *derived* from it; all mutations flow through one reactive service module. (See *Architecture note* below for why this makes Phase 3 cheap.)

---

## Phase 2 — Navigate the floor *(product thinking)*

200 lots need wayfinding; this is the biggest single jump in buyer usefulness.

- Faceted filters: make, model, body style, province / city, title status, fuel, transmission, drivetrain
- Range filters: price, year, odometer, condition grade
- Sort: ending soon, price ↑ / ↓, year, odometer, most bids, newest listed
- Active-filter chips, result counts, thoughtful empty states
- URL-synced filters (shareable searches, working back button)

## Phase 3 — Make it feel like a live auction *(the "other users" realism)*

This is what makes an auction an *auction*. Cheap to add because of the v1 event-log model.

- Normalize the synthetic `auction_start` times to "now" → **Live / Upcoming / Ended** states with ticking countdowns and "ending soon" urgency
- Seeded synthetic bid history on the 88 already-active lots ("Bidder 4821 · $22,800 · 2h ago")
- **Simulated rival bidders:** lots drift upward, and after you bid a rival can outbid you → "You've been outbid" → re-bid loop
- **Cross-tab live bidding** via `BroadcastChannel`: two windows share auction state in real time, no server — great for the walkthrough

## Phase 4 — Close the deal *(buyer confidence + conversion)*

Mirrors the real auction mechanics buyers rely on to act.

- **Buy Now** on the ~39 eligible lots
- **Reserve met / not-met** badge (dollar amount hidden, like real auctions)
- Proxy / max bidding (set a ceiling, auto-increment)
- **Watchlist** — save/favorite, persisted, "saved only" filter, outbid alerts on saved lots

## Phase 5 — Trust & detail polish

- Richer condition display: damage notes mapped to a vehicle diagram, title-status explainer
- **Representative vehicle photos** *(deferred from v1)*: bundle permissively-licensed stock images mapped by body style, with a "representative" label, the real paint-color swatch, and automatic fallback to the styled placeholder; gallery zoom + keyboard nav
- **Deal indicator**: show how strong the current bid is vs. an estimated market value (e.g. "below market"), so a buyer can judge value at a glance — complements the condition grade
- Price guidance / comparable-sales context
- Full accessibility pass (axe-clean), reduced-motion, complete keyboard support

## Phase 6 — Real backend & multi-device *(only if needed)*

The one capability a frontend-only build genuinely cannot provide: real, different-people-on-different-devices bidding.

- Node/Express (or serverless) REST API + WebSocket for shared, real-time, cross-device bidding
- Persistence (SQLite / Postgres), server-side bid validation, optimistic concurrency
- Lightweight identity (needed for real rival bidders and "who's winning")
- **Swap is a one-file change at the service seam** — components already treat bidding as async

---

## Architecture note — why Phase 3 multi-user is a drop-in, not a rewrite

Three v1 decisions make it cheap:

1. **Bids are an append-only event log** per lot; `currentBid`, `bidCount`, and `isHighBidder` are *derived*, never stored. A rival bid is just another entry.
2. **All mutations go through one reactive service/store** — `placeBid(vehicleId, amount, bidder?)` already accepts a bidder identity (defaults to the current buyer). A rival is simply another caller.
3. **The UI subscribes to the store**, so any new writer — a timer-driven rival, a second tab, or later a server push — re-renders price and "outbid" state with zero component changes. Cross-tab sync becomes broadcast-on-write in that single layer.

---

## Non-goals (out of scope for this challenge)

Seller workflows · checkout / payments · dealer admin tooling · authentication / user accounts.
