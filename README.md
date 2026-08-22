# catalyst.ai

Marketing site at `/`, product dashboard at `/app`. No auth: anyone with a link
can open anything, and a campaign URL is the share mechanism.

The marketing page replays one recorded pipeline run, driven by scroll position.
The dashboard walks a campaign through four states — intake, research, creative,
review — and every backend call is stubbed, so the whole flow runs with the
server off.

```bash
npm install && npm run dev
```

Then open http://localhost:3000.

## Routes

```
/                              marketing
/app                           URL-first intake, two stages
/app/campaigns                 every campaign, newest first
/app/campaigns/:id             live campaign, the shareable URL
/app/campaigns/:id/research    channel research, auto-runs
/app/campaigns/:id/creative    upload or generate
/app/campaigns/:id/review      the only approval gate
/app/audit                     Port event stream across all campaigns
```

The campaign's status decides its route. Opening a route that does not match
redirects to the one that does, so a stale link lands on the truth. Status
advances only when the user takes the terminal action on a step.

## Layout

```
app/            layout, page, globals.css (design tokens), OG image, icon
  app/          dashboard shell and every campaign route
components/
  primitives/   WaterfallRail, PlacementCard, StageCard, ChannelRow,
                StatusPill, MonoValue — no marketing-specific props, these
                lift into the app repo unchanged
  site/         Nav, Hero, ReplayDemo, StageSplit, AuditStream, CachedVsLive,
                ConnectionsStrip, Footer, RunProvider — marketing composition
  ui/           shadcn Button and Textarea, every colour and radius remapped
                to ct- tokens
lib/            campaign, api (typed mock client), store, useStore, types,
                format, replay, scroll, demo-run, connections, utils
fixtures/       demo-run.json — the recorded marketing run
                campaigns.json — two complete campaigns, all values numeric
assets/         TTF fonts used only by the OG image renderer
```

## Design system

`app/globals.css` holds the `--ct-*` tokens as the single source of truth. A
Tailwind v4 `@theme inline` block mirrors them so utilities such as
`bg-ink-100` and `text-violet-base` resolve through the same variables. The
default Tailwind palette is reset, so no stock slate can leak in.

Violet is always Stage 1, sodium amber is always Stage 2. Cached or degraded
data is slate with a dashed border — never a live colour. Every machine-emitted
value renders in JetBrains Mono with tabular figures; human-written labels are
General Sans. Fonts are self-hosted through `next/font`.

## The scroll layer

Acts 1 and 2 pin with `position: sticky` only. Progress is a pure function of
scroll position, written to a `--p` custom property and consumed by transform
and opacity; React state changes only on discrete steps. With JavaScript
disabled, before hydration, or under `prefers-reduced-motion`, every section
renders complete in its finished state and the pins collapse.

Exactly one element glows at any scroll position: the hero rail during Act 1,
the docked rail through the middle, the live card in Cached vs live, and the
done pill at the foot.

## Fixture

`fixtures/demo-run.json` carries spans, the Stage 1 profile with ranked
channels, 12 placements, and the Port audit events. Every value is numeric —
no `"$12–$18"`, no `"500k viewers"`. Formatting happens at render time in
`lib/format.ts`. Types in `lib/types.ts` are shared with the app.

## Notes

- The nav's **Launch app** button routes to `/discover`, which the app repo
  owns; it 404s in this repo alone.
- The connections strip is static. There is no `/api/health` here, because
  adding a route handler would opt the page out of static generation.

## Mock data

`lib/api.ts` is the only place that would talk to a backend. It stubs the Bright
Data page read, the Signal Engine channel scoring, creative generation, and the
Port writes.

`fixtures/site-profiles.json` is what the scraper "reads". Each entry is a host,
the brief a read of that site would fill, and the channel set the Signal Engine
returns for that business, with a rationale written about that buyer rather than
a generic one. Eight are shipped: apple.com, nike.com, netflix.com, spotify.com,
stripe.com, tesla.com, airbnb.com and doordash.com. Subdomains match too. Adding
a company means adding an entry, nothing else.

An unrecognised host degrades honestly: the host name is all the stub can claim
to have read, so only `product_name` and `product_url` are prefilled and a
generic catalogue scores the channels by a B2B-versus-consumer keyword lean.

`fixtures/campaigns.json` ships four campaigns, one per state, so every screen
opens cold from its URL:

| Campaign | State | Route |
| --- | --- | --- |
| Nike | `ACTIVE` | `/app/campaigns/cmp_nike` |
| Netflix | `READY_FOR_REVIEW` | `.../cmp_netflix/review` |
| Spotify | `READY_FOR_CREATIVE` | `.../cmp_spotify/creative` |
| Stripe | `READY_FOR_RESEARCH` | `.../cmp_stripe/research` |

Stripe also carries the partial and cached states, so both render in a demo
rather than only existing in code.

Campaigns created during a session are mirrored to `localStorage` so a refresh
lands where you were. That is state persistence, not ownership: there is no
user, no guest id, and the list shows every campaign.

No company's logo or trade dress is reproduced anywhere. Generated creative is a
proportional wireframe with a text label.
