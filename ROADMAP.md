# The Block — Feature Roadmap

v1 shipped the README's **Minimum Bar**, polished and OPENLANE-branded; the build has since grown well past it. This document tracks what's shipped and what's next.

> **Scoping philosophy:** get the core experience genuinely good before adding surface area. Each item is independently shippable, and everything rides one reactive service seam (see *Architecture note*).

---

## Shipped

- **Browse & search** — branded, responsive card grid; free-text search across make / model / trim / year / location / lot
- **Faceted filters** — make, model (dependent on make), body style, title status, and **price / year / odometer** ranges, plus a **Buy It Now available** toggle; cross-filtering counts, removable chips, result counts, tailored empty states
- **Sort** — Featured, Ending soonest, price ↑/↓, year, mileage, most bids, condition best/worst
- **Vehicle detail** — photo gallery, full specs, labeled condition meter, condition report, damage notes, title status, selling dealer
- **Bidding** — tiered increments, validation, persisted updated state, your bid history, "you're the high bidder"
- **Live countdowns** — per-lot auction end normalized to "now", card badge + bid-panel timer with urgency tones; **bidding closes when a lot ends**
- **Buy It Now** — instant purchase on the ~39 eligible lots → "You bought this lot", card *Purchased* badge, excluded from the Buy-It-Now filter
- **Watchlist** — save/favorite (heart on cards, labeled button on detail), persisted, header "saved" pill
- **Scoped views** — `?view=my-bids` and `?view=watchlist` with a clean reset and tailored empty states
- **Rival outbid demo script** — `theBlock.outbidMe()` places a rival bid above yours through the service seam, flipping you to a visible **Outbid** state (see below)
- **Foundations** — bids are an append-only **event log** (`currentBid` / `bidCount` / `isHighBidder` / `purchased` / `outbid` are *derived*); shared reactive `createStore` + `loadJSON`/`saveJSON`; auction and watchlist both ride it

---

## Rival bidding — the approach

Real cross-device multi-user bidding needs a backend (see Phase: Backend). Rather than simulate rivals with timers (nondeterministic, noisy in a demo), the prototype exposes a **manual demo script** that places a rival bid one increment above yours through the same `placeBid(vehicleId, amount, bidder)` seam. That flips you from *high bidder* to *Outbid* on demand — enough to exercise and demo the full **bid → outbid → re-bid** loop.

Fuller versions, all cheap on top of the event-log model:

- **Timer-driven simulated rivals** — lots drift up automatically while you browse
- **Cross-tab live bidding** via `BroadcastChannel` — two windows share state in real time, no server
- **Real backend** — genuine different-people-on-different-devices bidding

---

## Next up

- **Reserve met / not-met** badge (dollar amount hidden, like real auctions)
- **Proxy / max bidding** — set a ceiling, auto-increment
- **Winning vs Outbid** sort/filter and **outbid alerts** inside the my-bids / watchlist views
- **Deal indicator** — how strong the current bid is vs. an estimated market value ("below market")
- **Representative vehicle photos** — bundle permissively-licensed stock images mapped by body style, with a "representative" label + real paint-color swatch and automatic fallback to the styled placeholder; gallery zoom + keyboard nav
- Richer condition display (damage mapped to a vehicle diagram), price/comps context
- Full accessibility pass (axe-clean), reduced-motion, complete keyboard support

## Backend & multi-device *(only if needed)*

The one capability a frontend-only build genuinely cannot provide: real, different-people-on-different-devices bidding.

- Node/Express (or serverless) REST API + WebSocket for shared, real-time, cross-device bidding
- Persistence (SQLite / Postgres), server-side bid validation, optimistic concurrency
- Lightweight identity (needed for real rival bidders and "who's winning")
- **Swap is a one-file change at the service seam** — components already treat bidding as async

---

## Architecture note — why rival/multi-user bidding is a drop-in, not a rewrite

1. **Bids are an append-only event log** per lot; `currentBid`, `bidCount`, `isHighBidder`, `purchased`, and `outbid` are *derived*, never stored. A rival bid is just another entry.
2. **All mutations go through one reactive service/store** — `placeBid(vehicleId, amount, bidder?)` already accepts a bidder identity (defaults to the current buyer). A rival, a second tab, or a server push are all just more callers. (The outbid demo script is exactly this.)
3. **The UI subscribes to the store**, so any new writer re-renders price and outbid state with zero component changes. Cross-tab sync becomes broadcast-on-write in that single layer.

---

## Non-goals (out of scope for this challenge)

Seller workflows · checkout / payments · dealer admin tooling · authentication / user accounts.
