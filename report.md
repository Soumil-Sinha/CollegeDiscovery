# CollegeDiscovery — Project Report

**Author:** Soumil Sinha
**Document date:** 25 May 2026
**Project version:** 0.1.0
**Repository root:** `c:\CodeBases\CollegeDiscovery\college-discovery`

---

## 1. Executive Summary

CollegeDiscovery is a full-stack web application that helps prospective Indian engineering students discover, compare, and analyze top engineering colleges using real placement data, fees, ratings, and computed return-on-investment metrics. The platform distinguishes itself from existing college-listing sites through three differentiators:

1. **Data-driven decision support** — every page surfaces normalized, year-over-year placement statistics rather than marketing claims.
2. **Auto-computed insight badges** — the system tags colleges as *Top ROI*, *Best Value*, *Rising Placements*, or *Highest Placed* based on cross-college percentile calculations.
3. **Editorial, minimalist interface** — a sans + serif typographic pairing (Geist + Instrument Serif), restrained palette, and emoji-free iconography that treats numerical data with editorial reverence.

The application is implemented in **Next.js 16 (App Router)** with **Prisma 7**, **PostgreSQL**, **NextAuth v5**, **TailwindCSS v4**, **Recharts**, and **react-simple-maps**. It currently seeds **50 colleges across 18 Indian states** with three years of placement data, branch-wise placement breakdowns, and admission deadline tracking for authenticated users.

---

## 2. Goals & Non-Goals

### Goals
- Allow users to filter and search the college dataset by state, type, fees, rating, course, and free-text query.
- Provide side-by-side comparison of up to three colleges across twelve dimensions.
- Surface placement trends through sparklines (3-year), full charts, and branch-level breakdowns.
- Help signed-in users save colleges, track admission deadlines, and project their personal ROI for any saved college.
- Visualize national salary geography through a choropleth heatmap of India.
- Aggregate live news per college via NewsAPI.

### Non-Goals (out of scope for v0.1)
- Application submission or fee payment.
- College-side accounts (this is a consumer-only product).
- Mobile native apps — the web is responsive but no React Native target.
- Notification delivery (email, SMS); deadlines surface in-app only.
- Recommendation engine or ML-based matching (planned for v0.2).

---

## 3. Architecture

### 3.1 High-level

```
┌──────────────────┐    ┌──────────────────┐    ┌───────────────┐
│  Next.js 16 App  │    │  PostgreSQL DB   │    │   NewsAPI     │
│  (App Router,    │◄──►│  via Prisma 7    │    │  (external)   │
│   server + RSC)  │    │  (PrismaPg       │    │               │
│                  │    │   adapter)       │    │               │
└────────┬─────────┘    └──────────────────┘    └───────▲───────┘
         │                                              │
         │  ┌───────────────────┐                       │
         ├─►│  NextAuth v5      │                       │
         │  │  (JWT, Credentials)│                      │
         │  └───────────────────┘                       │
         │                                              │
         └──── /api/colleges/news?q= ───────────────────┘
```

### 3.2 Layer breakdown

| Layer | Technology | Responsibility |
|---|---|---|
| **Database** | PostgreSQL | Persistent storage for users, colleges, courses, placement stats, saved colleges, reviews, deadlines |
| **ORM** | Prisma 7.8 with `@prisma/adapter-pg` | Schema, migrations, query API |
| **Server** | Next.js 16 App Router | Route handlers (`/app/api/**`), server components for data fetching |
| **Auth** | NextAuth v5 (beta) | JWT-strategy sessions, credentials provider with bcrypt |
| **Validation** | Zod | Server-side validation of all request bodies / query parameters |
| **Client UI** | React 19, Tailwind v4 | Interactive components, charts, maps, modals |
| **Charts** | Recharts 3 | Line + Bar charts for placement trends and branch breakdowns |
| **Map** | react-simple-maps + India GeoJSON | National salary heatmap choropleth |
| **Fonts** | next/font (Geist, Instrument Serif) | Subset-optimized self-hosted Google Fonts |

### 3.3 Routing model

The application uses Next.js App Router conventions. Every page that reads from the database is marked `export const dynamic = "force-dynamic"` to prevent stale build-time caching.

| Route | Auth | Purpose |
|---|---|---|
| `/` | Public | Editorial hero, stats, top 6 colleges, features grid |
| `/colleges` | Public | Filtered list with sidebar |
| `/colleges/[slug]` | Public | College detail with placements, branches, news, reviews |
| `/compare` | Public | Side-by-side comparison of up to 3 colleges |
| `/heatmap` | Public | National salary choropleth + ranked list |
| `/dashboard` | Required | Saved colleges, ROI calculator, deadline tracker |
| `/auth/signin` | Public | Credentials sign-in |
| `/auth/register` | Public | Account creation |

---

## 4. Data Model

The Prisma schema models 9 entities. Composite uniques and indexes are tuned for the read-heavy access pattern.

| Entity | Cardinality | Key fields |
|---|---|---|
| `User` | many | `id`, `email` (unique), `passwordHash`, `name`, `image` |
| `College` | many | `id`, `slug` (unique), `name`, `state`, `type`, `totalFees`, `rating`, `naacGrade` |
| `Course` | many per college | `name`, `duration`, `fees`, `seats` |
| `PlacementStat` | 3 per college (3 years) | `year`, `avgSalary`, `highestSalary`, `medianSalary`, `placementRate`, `topRecruiters[]` |
| `BranchPlacementStat` | 5 branches × 3 years per college | `branch`, `year`, `avgSalary`, `highestSalary`, `placementRate` |
| `SavedCollege` | join table | `userId`, `collegeId` (composite unique) |
| `Review` | many per college | `rating`, `content`, `userId`, `createdAt` |
| `AdmissionDeadline` | many per user | `deadlineType`, `deadlineDate`, `note`, `isCompleted` |
| NextAuth tables | `Account`, `Session`, `VerificationToken` | Standard NextAuth schema |

Seeded volumes (after `db:seed`):
- **50** colleges across 18 states
- **150** placement stats (50 × 3 years)
- **750** branch placement stats (50 × 5 branches × 3 years)
- **~200** courses
- **~80** reviews

---

## 5. Feature Inventory

### 5.1 Discovery & Search

- **Filtered college list** — sidebar with six independent filters (state, type, fee range, min rating, course, sort by). All filter state mirrored to URL search params; back/forward navigation preserves filters.
- **Smart categorized search** — debounced (300ms) navbar search returns three buckets: matching colleges (with type chips), locations (state/city), and courses. Each bucket has dedicated iconography.
- **Pagination** — server-side via Prisma `take/skip`, with `cursor` fallback for large pages.

### 5.2 College Detail

- **Hero** — serif H1, location, established year (serif numeric), insight badges, save/compare/website actions.
- **Quick stats** — Total Fees, Rating, Avg CTC (2024), Placement Rate — each as a card with serif numeric values.
- **Placement Trends chart** — Recharts LineChart with three lines: avg salary, highest salary, median salary. Indigo, gold, gray.
- **Branch-wise Placement Breakdown** — toggle metric (Avg Salary / Placement %) × select year. Recharts BarChart with per-branch colored bars and a comparison table with up/down trend indicators.
- **Courses Offered** — divided list with duration, seats, and fees per course.
- **Latest News** — server-side proxied NewsAPI fetch, cached 3600 s. Graceful degradation when `NEWS_API_KEY` is unset.
- **Reviews** — read-only list for guests; rating + textarea form for signed-in users.
- **Sidebar** — Placements 2024 detail, Top Recruiters pill chips, Year-wise placement progress bars.

### 5.3 Comparison

- Up to **3 colleges** comparable side-by-side across **12 dimensions**:
  Location · Type · Established · NAAC Grade · Rating · Total Fees · Avg Salary · Highest Package · Placement Rate · Median Package · Courses · Smart Badges.
- **Best-value highlighting** — for numeric metrics, the best cell receives `bg-green-50 text-green-700` with a check icon.
- **Shareable URL** — comparison state encoded as `?ids=id1,id2,id3`; "Copy link" button writes to clipboard.

### 5.4 Dashboard (auth-required)

- **Saved colleges** — list view with quick stats per college, plus a "Compare your saved colleges" CTA once two or more are saved.
- **ROI Calculator** — inputs: college (from saved list), expected role (curated salary presets), or custom annual CTC. Outputs: payback period in months, net gain over five years, break-even year, and comparison against the college's *average* placement ROI.
- **Deadline Tracker** — full CRUD for admission deadlines. Five preset types (Application, Entrance Exam, Counseling, Fee Payment, Document Submission). Urgency colour-coding: red overdue, amber ≤7 days, gray otherwise. Completed deadlines collapse into a `<details>` section.

### 5.5 National Salary Heatmap

- **Choropleth map** — real India GeoJSON rendered via `react-simple-maps`; states fill on a 5-step indigo gradient from `#e0e7ff` to `#312e81` by average graduate salary. Hover surfaces a floating cursor-tracked tooltip with state name, salary, college count, institute types, and top two colleges.
- **Ranked list view** — toggle to a 2-column sorted list; **clicking any row opens a centered floating modal** (introduced in v0.1 redesign) showing full state detail, top colleges, and a CTA to the filtered college list. Dismissed via backdrop click, X button, or Escape; body scroll is locked while open.

### 5.6 Insight Badges (cross-college computed)

Computed in `lib/insights.ts` using percentile thresholds across the full college dataset:

- **Top ROI** — colleges whose `avgSalary / totalFees` ratio is in the top 15%.
- **Best Value** — top quintile when ranked by `(rating × placementRate) / totalFees`.
- **Rising Placements** — year-over-year avg salary growth > 8% across the most recent two years.
- **Highest Placed** — top 10% by latest-year `avgSalary`.

Badges appear on cards, detail hero, and compare table.

---

## 6. Design System

### 6.1 Design philosophy

The interface follows an **editorial-minimalist** approach. The visual identity rests on three commitments:

1. **Sans + serif pairing** — Geist for UI / body, Instrument Serif for headlines and numerics. Numerals use `font-variant-numeric: tabular-nums lining-nums` so figures align in tables and don't jitter on hover.
2. **Restrained palette** — neutral stone background, near-black text, indigo as the single accent. No gradients on the page chrome.
3. **Iconography, not emoji** — outline SVGs (Heroicons style, 1.5–1.8 px stroke) replace decorative emoji throughout. Color via `currentColor` so they inherit text color.

### 6.2 Typography

| Role | Class | Use |
|---|---|---|
| Hero | `font-serif text-5xl–7xl` | Page titles |
| Section | `font-serif text-3xl–4xl` | Section openers |
| Card title | `font-serif text-lg–xl` | CardHeaders, modal heads |
| Eyebrow | `text-xs uppercase tracking-widest text-gray-400` | Kicker labels above H1s |
| Numeric | `.numeric` (`font-serif` + tabular-nums) | Salaries, fees, percentages, counts |
| Body | default Geist sans | Paragraphs |
| Caption | `text-[10px] uppercase tracking-wider text-gray-400` | Stat labels |

### 6.3 Palette

| Role | Tailwind | Hex |
|---|---|---|
| Page bg | stone-50 | `#fafaf9` |
| Card bg | white | `#ffffff` |
| Primary action | gray-900 | `#111827` |
| Primary hover | indigo-700 | `#4338ca` |
| Accent | indigo-600 | `#4f46e5` |
| Border | gray-200 | `#e5e7eb` |
| Text | gray-900 / gray-500 / gray-400 | — |
| Success / Warning / Destructive | emerald-700 / amber-700 / red-600 | — |

### 6.4 Animation system

All keyframes and utility classes are defined in `app/globals.css`. Every animation is short, eased with spring-like cubic-beziers, and respects `prefers-reduced-motion`.

| Class | Duration | Use |
|---|---|---|
| `.tooltip-pop` | 140 ms | Map hover tooltip |
| `.modal-pop` | 220 ms (spring) | State detail modal |
| `.overlay-fade` | 180 ms | Modal backdrop |
| `.fade-in` / `.fade-in-up` | 300–350 ms | Section / element mounts |
| `.slide-down` | 180 ms | Search dropdown |
| `.stagger-children` | 500 ms each | Grids (top colleges, ranked list) |
| `.page-enter` | 400 ms | All page mounts via `<main>` |
| `.press` | 120 ms | Tactile button/card press feedback |
| `.link-underline` | 300 ms | Right-to-left underline draw on hover |

### 6.5 Iconography

| Icon | Use |
|---|---|
| `map-pin` | Location |
| `academic-cap` | Course / education |
| `chart-bar` | Analytics |
| `building-columns` | Institution / compare |
| `arrow-trending-up` | ROI |
| `tag` | Smart badges |
| `heart` (outline / filled) | Save |
| `check` | Comparing, completed |
| `newspaper` / `book-open` | Empty states |
| `link` | Share |
| `x-mark` | Close / delete |
| triangle (5×5 custom) | Trend up/down |

---

## 7. Codebase Layout

```
college-discovery/
├── app/                                 # Next.js App Router
│   ├── layout.tsx                       # Fonts (Geist + Instrument Serif), session provider
│   ├── globals.css                      # Tailwind v4 imports + design tokens + keyframes
│   ├── page.tsx                         # Home (editorial hero)
│   ├── colleges/
│   │   ├── page.tsx                     # List page
│   │   └── [slug]/page.tsx              # Detail page
│   ├── compare/page.tsx
│   ├── heatmap/page.tsx
│   ├── dashboard/page.tsx
│   ├── auth/{signin,register}/page.tsx
│   └── api/
│       ├── colleges/                    # CRUD + search + news + compare
│       ├── insights/{heatmap,roi}/      # Aggregations
│       ├── user/{saved,deadlines}/      # User-specific resources
│       └── auth/[...nextauth]/route.ts  # NextAuth handler
├── components/
│   ├── ui/                              # Primitives (Button, Card, Badge, Input, Select, Skeleton)
│   ├── layout/                          # Navbar, SessionProvider
│   ├── college/                         # CollegeCard, CollegeFilters, CollegeListClient,
│   │                                    # PlacementChart, BranchPlacementChart, NewsFeed,
│   │                                    # ReviewSection, SaveCollegeButton
│   ├── compare/                         # ComparePageClient, CompareTable
│   ├── dashboard/                       # ROICalculator, DeadlineTracker
│   └── insights/                        # SalaryHeatmap (with StateDetailModal)
├── lib/
│   ├── prisma.ts                        # Singleton Prisma client w/ PrismaPg adapter
│   ├── auth.ts                          # NextAuth config
│   ├── insights.ts                      # Insight badge computation, format helpers
│   ├── validations.ts                   # Zod schemas
│   ├── constants.ts                     # STATES, COLLEGE_TYPES, COURSES, FEES_RANGES, POPULAR_ROLES
│   └── utils.ts                         # cn() classname helper
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                          # 50-college seed
├── public/
│   └── india-states.json                # GeoJSON for choropleth
├── frontend.md                          # Detailed frontend design reference
└── report.md                            # (this document)
```

**Source size:** 61 TypeScript / TSX files, ~6,500 lines of application code (excluding generated Prisma client).

---

## 8. Development Workflow

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server (Next.js) |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint over `.ts`/`.tsx` |
| `npm run db:generate` | Prisma client generation |
| `npm run db:migrate` | Apply migrations (dev) |
| `npm run db:push` | Push schema to DB without migration history |
| `npm run db:seed` | Seed 50 colleges |
| `npm run db:studio` | Prisma Studio GUI |

### Environment

`.env.local` must define:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — JWT signing secret
- `NEXTAUTH_URL` — base URL for OAuth callbacks (e.g. `http://localhost:3000`)
- `NEWS_API_KEY` — *optional*; if absent, NewsFeed component degrades gracefully

---

## 9. Engineering Decisions & Trade-offs

### 9.1 Prisma 7 with PrismaPg adapter
Prisma 7 introduced the adapter model and removed `url` from the datasource block. The application explicitly constructs `new PrismaPgAdapter({ connectionString })` to maintain control over the connection. **Trade-off:** more setup code per environment, gained explicit pool sizing.

### 9.2 NextAuth v5 beta
The application uses the v5 beta JWT strategy with the Credentials provider. This was chosen for its first-class App Router integration. **Trade-off:** beta status means API surface may shift; the version is pinned.

### 9.3 Force-dynamic on all DB pages
Every page that reads from the database sets `export const dynamic = "force-dynamic"`. This trades CDN-cache wins for guaranteed freshness on every request — acceptable because (a) the dataset is small (50 colleges) and (b) data freshness matters to users comparing colleges.

### 9.4 react-simple-maps over Leaflet / Mapbox
For the choropleth, `react-simple-maps` was preferred because (a) no external map tiles are needed, (b) projection control is straightforward via `geoMercator`, (c) bundle size is significantly smaller. The India GeoJSON is served from `/public/india-states.json` and downloaded once on first map view. **Trade-off:** no pan/zoom or city-level detail.

### 9.5 Floating modal over inline accordion for ranked list
Previously, clicking a state row in the heatmap's ranked list expanded the row inline. This caused the neighboring (grid-paired) card to also extend down, creating visual asymmetry. v0.1 refactored this to a **centered floating modal** with backdrop blur, scroll lock, and three dismissal paths (backdrop, X, Escape). The neighboring row is no longer affected.

### 9.6 No CSS-in-JS
The application is exclusively Tailwind v4 utility classes with a handful of CSS variables and keyframes in `globals.css`. **Trade-off:** longer class strings in markup, gained zero runtime CSS overhead and predictable cascade.

### 9.7 Recharts over Visx / d3
Recharts gives ready-made `LineChart`, `BarChart`, and `Cell` components that fit the use case without forcing manual SVG. **Trade-off:** larger bundle than a custom d3 chart; gained dramatically faster development.

---

## 10. Code Cleanup Summary (this commit)

The following dead code and unused imports were removed in this cleanup pass:

| File | Removed |
|---|---|
| `app/api/colleges/route.ts` | Unused import `ITEMS_PER_PAGE` |
| `app/dashboard/page.tsx` | Unused import `CardHeader` |
| `components/college/PlacementChart.tsx` | Unused imports `ReferenceLine`, `formatSalary` |
| `components/college/CollegeFilters.tsx` | Unused import `Input` |
| `components/college/BranchPlacementChart.tsx` | Unused `trendData` array (15 lines of dead computation) |
| `components/layout/Navbar.tsx` | Unused `useRouter` import and `router` variable |
| `components/compare/ComparePageClient.tsx` | Unused `isSearching` / `setIsSearching` state and its setter calls |

**Lint impact:** 17 problems → 9 problems (5 errors are pre-existing `react-hooks/set-state-in-effect` patterns that require behavioral refactors out of scope for cleanup; 4 warnings are pre-existing `exhaustive-deps` notices on intentional patterns).

**Type check:** `npx tsc --noEmit` exits clean (exit 0).

---

## 11. Test & Quality Strategy

### Current state
The project currently relies on:
- **TypeScript strict mode** for static guarantees.
- **Zod schemas** at every API boundary (rejecting malformed inputs with `400` + flattened error map).
- **ESLint** with `eslint-config-next` 16.2.6.
- **Manual browser smoke testing** for UI flows.

### Recommended next steps
- Adopt **Vitest** + **React Testing Library** for component unit tests, starting with the ROI calculator (pure logic), `computeInsightBadges`, and `salaryColor`.
- Adopt **Playwright** for E2E coverage of the four critical journeys: filter-and-browse, compare-and-share, save-and-ROI, heatmap-modal.
- Wire a GitHub Actions workflow running `lint` + `tsc --noEmit` + `vitest` on every PR.

---

## 12. Performance Notes

- **Initial JS payload** is dominated by Recharts (~50 KB gzipped) and react-simple-maps (~20 KB gzipped). Both are tree-shaken to only the imported sub-components.
- **Database queries** on the home page use `Promise.all` to parallelize the count + aggregate + top-6 query, keeping the home TTFB under ~250 ms locally.
- **Sparkline data** required removing `take: 1` from the colleges API's `placementStats` include and re-sorting client-side; before this fix the 3-year trend rendered as a flat line.
- **News fetch** uses `next: { revalidate: 3600 }` to cache per query at the edge cache layer.
- **GeoJSON** is loaded once and reused by react-simple-maps; subsequent toggles between map and ranked-list view are instantaneous.

---

## 13. Known Limitations

| Area | Limitation | Mitigation path |
|---|---|---|
| Lint | 5 `set-state-in-effect` errors flagged by React 19 strict lint | Refactor effects in `CollegeListClient`, `ComparePageClient`, `Navbar` to derive state or move to event handlers |
| Auth | Credentials-only; no OAuth | Wire Google / GitHub providers in `lib/auth.ts` |
| Data | Single static seed; no admin UI | Build `/admin` route with role-gated CRUD |
| Map | Pan / zoom not enabled | Adopt react-simple-maps' `ZoomableGroup` |
| Notifications | Deadlines only surface in-app | Add `cron` route + email via Resend |
| Search | Client-side debounce only; no fuzzy / typo tolerance | Move search to Postgres FTS or Meilisearch |

---

## 14. Roadmap

### v0.2 (next iteration)
- Admin CRUD for colleges, courses, and placement stats
- Google + GitHub OAuth providers
- Email notifications for deadlines (7-day, 1-day, day-of)
- Postgres full-text search for the navbar
- Vitest test suite covering insight badges and ROI calculation

### v0.3
- Personalized recommendations (collaborative filtering on saved-colleges signal)
- City-level salary geography (drill-down from state in the heatmap)
- Public profile pages (`/u/[username]`) showing public saved-colleges lists

### v1.0
- Mobile responsiveness audit and PWA manifest
- Full E2E test suite in Playwright with CI gating
- Production deployment to Vercel + managed Postgres

---

## 15. Appendix — API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/colleges` | Paginated list, filtered by query params |
| GET | `/api/colleges/[id]` | Single college |
| GET | `/api/colleges/compare?ids=` | Compare-data shape for 2–3 colleges |
| GET | `/api/colleges/search?q=` | Categorized search → `{ colleges, locations, courses }` |
| GET | `/api/colleges/news?q=` | NewsAPI proxy, cached 1 h |
| POST | `/api/colleges/[id]/reviews` | Submit a review (auth) |
| GET | `/api/insights/heatmap` | State-level salary aggregates |
| GET | `/api/insights/roi` | ROI calculation for a college + package |
| POST | `/api/user/saved` | Toggle save (auth) |
| GET | `/api/user/deadlines` | List user deadlines (auth) |
| POST | `/api/user/deadlines` | Create deadline (auth) |
| PATCH | `/api/user/deadlines/[id]` | Toggle complete (auth, ownership-checked) |
| DELETE | `/api/user/deadlines/[id]` | Delete deadline (auth, ownership-checked) |
| POST | `/api/auth/[...nextauth]` | NextAuth handler — credentials sign-in, session |

---

## 16. Appendix — Companion Documents

- **`frontend.md`** — exhaustive frontend design reference: every page, component, button, animation, and user workflow with class names and behavior.
- **`README.md`** — quick-start and contribution notes.
- **`prisma/schema.prisma`** — authoritative data model.
- **`AGENTS.md`** — repository-level instructions to AI agents working in this codebase.

---

*End of report.*
