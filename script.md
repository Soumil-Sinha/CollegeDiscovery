# CollegeDiscovery — Walkthrough Script

**Target runtime:** 8 minutes (range: 5–10)
**Format:** narration + on-screen guidance
**Audience:** technical reviewer / interviewer
**Convention:** `[SHOW]` blocks describe what to display; everything else is what to say.

---

## 0:00 — 0:30 · Opening

> "Hi — I'd like to walk you through CollegeDiscovery, a data-driven platform for helping Indian engineering students discover, compare, and analyze colleges. I'll cover four things: the architecture, the key design decisions, some interesting edge cases I had to handle, and the trade-offs I made along the way."

**[SHOW]** Browser at `http://localhost:3000` — the home page.
Hover briefly so the editorial hero, italic indigo pullquote, and the stats strip are visible.

> "The product is built in Next.js 16 App Router, Prisma 7, PostgreSQL, NextAuth v5, TailwindCSS v4, with Recharts and react-simple-maps for visualization. Roughly 6,500 lines across 61 TypeScript files."

---

## 0:30 — 2:00 · Architecture

**[SHOW]** Open `report.md` in the editor, scroll to *Section 3 — Architecture* (the ASCII diagram).

> "The architecture is a single Next.js app — server components do the data fetching directly through Prisma, client components handle interactivity. There's no separate API tier. NextAuth runs inside the same Next process with JWT-strategy sessions and a credentials provider."

**[SHOW]** Open `lib/prisma.ts` in editor.

> "Prisma 7 was a meaningful upgrade — they removed `url` from the datasource block entirely. Connection URLs now live in `prisma.config.ts` for CLI commands, while the runtime uses a `PrismaPg` adapter constructed explicitly with the connection string. The trade-off is more setup code per environment, but I get explicit pool sizing control and a clean separation between migration config and runtime config."

**[SHOW]** Open `app/colleges/[slug]/page.tsx`, point at `export const dynamic = "force-dynamic"` near the top.

> "Every page that reads from the database is marked `force-dynamic`. With a 50-college dataset, CDN caching wins are negligible, but data freshness matters when users are comparing colleges. This is an explicit trade — I'm giving up cacheability for correctness."

**[SHOW]** Open `app/api/` folder in the file tree to show route structure.

> "API routes follow the App Router convention — `route.ts` files under `/app/api`. Every endpoint validates inputs with Zod and returns flattened error maps on `400`. Dynamic routes use `Promise<params>` and `await params`, which is a Next 15+ breaking change."

---

## 2:00 — 3:00 · Data Model

**[SHOW]** Open `prisma/schema.prisma`, scroll through the models.

> "Nine entities. The interesting ones are `PlacementStat` and `BranchPlacementStat` — three years of stats per college, plus branch-level breakdowns across five engineering branches. That's 50 colleges × 5 branches × 3 years = 750 branch placement records, plus 150 top-level stats. I tuned the composite uniques on `[collegeId, branch, year]` so the seed is idempotent."

**[SHOW]** Run `npm run db:seed` in terminal (or scroll the existing seed output if already run).

> "The seed builds 50 colleges across 18 states, with realistic salary multipliers per branch — CSE at 1.0x, ECE at 0.82x, mechanical at 0.65x, and so on. This is what powers every visualization downstream."

---

## 3:00 — 5:00 · Feature deep-dive

### Heatmap with floating modal (~50s)

**[SHOW]** Navigate to `/heatmap`. Hover a state on the map.

> "The heatmap renders India as a real choropleth via react-simple-maps and a GeoJSON file in `/public`. States fill on a 5-step indigo gradient by avg graduate salary. On hover, a floating tooltip follows the cursor with `pointer-events: none` so it never blocks the map."

**[SHOW]** Click the "Ranked List" toggle. Click any state row.

> "Originally, clicking a row in the ranked list expanded it inline like an accordion — but because the grid is two columns, expanding one card pushed its neighbor down, which looked broken. I refactored this into a centered floating modal with backdrop blur. There are three dismissal paths — backdrop click, the X button, and Escape — and the body scroll is locked while it's open."

### Compare with best-value highlighting (~40s)

**[SHOW]** Navigate to `/compare?ids=...` with 2–3 colleges already pre-selected (or pick them live).

> "Comparison shows 12 dimensions side-by-side. For numeric metrics — fees, salary, placement rate — the best cell is automatically highlighted in green with a checkmark. The logic lives in a small `BestValue` component that takes a `higherIsBetter` flag so fees pick the lowest while salary picks the highest. The comparison URL is shareable — the IDs are encoded in the query string."

### ROI Calculator (~30s)

**[SHOW]** Navigate to `/dashboard` (signed in). Open ROI Calculator on the right, select a college, pick a role, click Calculate.

> "ROI lives on the dashboard. It computes payback period, net gain over five years, and break-even year — and crucially, it shows the user's projected ROI side-by-side with the college's *average* placement ROI, so you can see whether your expected package is above or below the typical outcome."

---

## 5:00 — 6:30 · Edge Cases

**[SHOW]** Open `components/college/CollegeCard.tsx` and scroll to the `PlacementSparkline` component.

> "A few non-obvious bugs I had to chase down. First — the sparkline on college cards was rendering as a flat line. The cause was the colleges API include statement had `take: 1` on `placementStats`, so only the latest year was reaching the client. I removed `take: 1`, switched the order to ascending, and updated `latestStat` to read from the end of the array instead of the front."

**[SHOW]** Open `components/insights/SalaryHeatmap.tsx`, scroll to the `GEO_NAME_MAP` constant near the top.

> "Second — the India GeoJSON has 'Jammu & Kashmir' with an ampersand, but the database uses 'Jammu and Kashmir' spelled out. So I added a `normalizeGeoName` function that maps the geo names to the database names before the lookup, otherwise that state would silently render in grey even though it has colleges."

**[SHOW]** Open `components/college/BranchPlacementChart.tsx`, scroll to the `<Bar>` with `<Cell>` children.

> "Third — Recharts' BarChart by default colors every bar the same. To color each branch differently I had to import `Cell` and map over the data with `<Cell key={entry.branch} fill={BRANCH_COLORS[entry.branch]} />` inside the `<Bar>`. Doing it with a `<rect>` doesn't work — Recharts ignores it."

**[SHOW]** Open `components/college/NewsFeed.tsx`, point at the `NEWS_API_KEY` error branch.

> "Fourth — the news feed depends on a third-party API key. If `NEWS_API_KEY` isn't set, the API returns `{error: 'NEWS_API_KEY not configured'}` and the component renders a graceful 'add a key' empty state instead of a broken card. That matters for first-time setup."

**[SHOW]** Open `components/insights/SalaryHeatmap.tsx`, scroll to the `useEffect` that locks body scroll on modal mount.

> "Last one — when the modal opens I lock body scroll, register an Escape-key listener, and tear both down in the cleanup function. Without this you can scroll the page behind the modal which feels off, and Escape feels expected."

---

## 6:30 — 7:45 · Decisions & Trade-offs

**[SHOW]** Open `report.md`, scroll to *Section 9 — Engineering Decisions & Trade-offs*.

> "Four trade-offs worth calling out."

> "**One — react-simple-maps over Leaflet or Mapbox.** No external tile dependency, smaller bundle, full control over projection. I gave up pan and zoom, which is fine because nothing in the product needs city-level resolution yet."

> "**Two — NextAuth v5 beta.** It has first-class App Router integration that v4 lacks. The risk is that beta APIs shift; I've pinned the version to keep it stable."

**[SHOW]** Open `app/page.tsx`, scroll to the hero section.

> "**Three — typography and color.** The first version had a purple gradient hero with emoji icons. I rebuilt it as an editorial layout — Geist for body, Instrument Serif for headlines and numerics, solid stone background, indigo as a single accent, and Heroicons outline SVGs replacing every emoji. The trade-off is more code per visual element — every icon is now a six-line SVG instead of a one-character emoji — but the result reads like a magazine, which is the brand."

**[SHOW]** Open terminal, run `npx eslint . --ext .ts,.tsx 2>&1 | tail -2` so the "9 problems" summary shows.

> "**Four — there are five lint errors I haven't fixed.** They're all the same pattern: `set-state-in-effect` warnings that React 19's stricter rules flag. Fixing them properly means restructuring three components to derive state instead of synchronizing it inside `useEffect`. I made the call to leave them for a focused refactor pass rather than rushing a behavioral change."

---

## 7:45 — 8:00 · Wrap

**[SHOW]** Pull up `frontend.md` and `report.md` side by side in the editor.

> "I documented everything in two companion files — `frontend.md` is the design-system reference, page-by-page and component-by-component, and `report.md` is the engineering report covering architecture, data model, decisions, and the roadmap. The cleanup pass I just finished took lint from 17 problems down to 9, with `tsc --noEmit` clean. Happy to dig into any layer in more depth."

**[SHOW]** Cursor on `report.md` *Section 14 — Roadmap*, briefly.

> "Next up on the roadmap: admin CRUD, OAuth providers, email notifications, Postgres full-text search, and a real test suite in Vitest plus Playwright. Thanks for watching."

---

## Speaker notes / pacing

- **Total word count:** ~1,250 words → ~7.5–8 min at a comfortable 160 wpm.
- **Tighten to 5 min:** drop the Data Model section (3:00–4:00) and one of the feature deep-dives.
- **Stretch to 10 min:** add a `Section 12 — Performance` walk in the architecture block and demo the Branch Placement chart toggle live.
- **Don't read the SHOW blocks aloud.** They're stage directions.
- **Keep code visible while explaining it** — pause the narration for ~1 second when the file appears on screen so the viewer can register the path.
- **Live demos before code.** Show the working feature first, then drop into the file that implements it.
