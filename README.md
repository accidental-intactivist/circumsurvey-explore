# circumsurvey-explore

**explore.circumsurvey.online** — interactive data explorer for *The Accidental Intactivist's Inquiry*.

Companion to [findings.circumsurvey.online](https://findings.circumsurvey.online) (curated Special Report). Where findings tells a story, Explore lets researchers, partners, and curious readers **drive the data themselves** — every question, every pathway, every slice, every view citeable by URL.

## What this is

- **Master Questions Index** — all 355 survey questions, searchable by prompt, filterable by section / pathway / tier / type
- **Per-question detail** — prompt, response distribution, sample size, pathway comparison, optional cross-tab by religion/generation/country
- **URL-addressable state** — every filter and view lives in the URL. Copy a link, send it to someone, they see your exact view. That's what makes it a research tool instead of a dashboard.
- **Shared design language with findings.** Same palette, same fonts, same masthead rhythm. Different layouts because different jobs.

## Tech

- Vite 5 + React 18 (same stack as findings)
- No UI library — uses inline styles with shared tokens from `src/styles/tokens.js`
- Hash-based routing (no server rewrites needed)
- Data from `findings.circumsurvey.online/api/*` — a Cloudflare Worker backed by D1 (501 respondents, 355 questions, 52,786 response rows)

## Local dev

```bash
npm install
npm run dev   # localhost:5174 (findings is on 5173 — run both at once)
```

## Deploy

Full instructions in [EXPLORE-DEPLOY.md](./EXPLORE-DEPLOY.md). Short version:

1. Push to GitHub (`accidental-intactivist/circumsurvey-explore`)
2. Create a Cloudflare Pages project pointing at this repo
3. Set custom domain `explore.circumsurvey.online`
4. Cloudflare auto-creates the DNS record

## Project structure

```
src/
  App.jsx                    — top-level router
  main.jsx                   — React entry
  pages/
    IndexPage.jsx            — Master Questions Index (home)
    QuestionPage.jsx         — Single question detail
    AboutPage.jsx            — Methodology
  components/
    Masthead.jsx             — ★ EXPLORE ★ ribbon + nav
    FilterChips.jsx          — Dismissable active-filter pills
    SampleSizeBadge.jsx      — n=X badge with small-sample warnings
  lib/
    api.js                   — Fetch client w/ in-memory cache
    urlState.js              — Hash parsing + useUrlState React hook
    formatting.js            — n=X, percentages, labels, truncation
  styles/
    tokens.js                — Design tokens (mirrors findings)
    global.css               — Resets + keyframes
```

## First-principles design

This tool is built around six principles, intentionally:

1. **The question is the atomic unit.** URLs are keyed by question id (`#/q/family_politics`). Everything else is querystring.
2. **Three axes always visible.** Every view answers: *which question? which respondents? which visualization?*
3. **URL-addressable state.** Filters, sorts, views — all round-trip through the URL so every view is citeable.
4. **Comparison is first-class.** Every chart has a "compared to what?" affordance (pathway toggle, compare view, cross-tab).
5. **Sample sizes always visible.** Never a percentage without n. Slices below n=30 warn, below n=10 gate behind disclosure.
6. **The Master Index is ground truth.** Home page lists every question. It's how researchers verify we captured everything.

## Extending

To add a new facet filter (e.g. "only questions with free-text responses"):
1. Add it to `parseQuery` / `buildQuery` in `src/lib/urlState.js`
2. Add a UI control in `SearchAndFacets` (IndexPage.jsx)
3. Add the filter predicate to the `filtered = useMemo(...)` in IndexPage.jsx
4. Add a chip in `FilterChips.jsx`

To add a new cross-tab dimension:
1. Extend `/api/aggregate` in the Worker (circumsurvey-deploy repo) to support the new `by=` value
2. Add it to the `byMap` in `CrossTabView` inside QuestionPage.jsx

## License / usage

This is research infrastructure for an ongoing volunteer project. If you want to mirror, fork, or build on it, get in touch via the Report site.
