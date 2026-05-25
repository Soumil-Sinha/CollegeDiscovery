# CollegeDiscovery — Frontend Design Reference

This document describes the full design system, every page, component, button, and user workflow.
Reference for designers and engineers extending the platform.

---

## Design Philosophy

**Editorial minimalism.** The interface treats data the way a well-designed magazine treats numbers: with reverence. Serif numerals carry the salary figures, sans serif carries the body, and the layout breathes around them. Decoration is subtractive — no gradients, no emoji ornament, no decorative shadows. Animation is short, eased, and exists to confirm interaction, never to perform.

The visual identity is built on three commitments:
- **Sans + Serif pairing** — Geist for UI / body, Instrument Serif for headlines and numerics.
- **Restrained palette** — neutral stone background, near-black text, indigo as the single accent.
- **Iconography, not emoji** — outline SVGs (Heroicons-style, 1.5px stroke) replace decorative emoji throughout.

---

## Typography

### Fonts
| Family | Loaded via | CSS variable | Tailwind class |
|---|---|---|---|
| Geist | `next/font/google` | `--font-geist` | default (sans) |
| Instrument Serif | `next/font/google` (400 + italic) | `--font-serif` | `.font-serif` |

### Type roles
| Role | Class | Use |
|---|---|---|
| **Hero headline** | `font-serif text-5xl–7xl leading-[1.05]` | Page-defining titles (home, dashboard greeting) |
| **Section heading** | `font-serif text-3xl–4xl` | Section openers ("Top rated colleges", "Salary heatmap") |
| **Card title** | `font-serif text-lg–xl` | Card headers in detail/sidebar |
| **Eyebrow** | `text-xs uppercase tracking-widest text-gray-400` | Kicker above all H1s |
| **Numeric** | `.numeric` (`font-serif`, tabular lining numerals) | Salaries, fees, percentages, counts |
| **Body** | default Geist | Paragraphs, descriptions |
| **Caption / label** | `text-[10px] tracking-wider uppercase text-gray-400/500` | Stat labels, metadata |
| **Italic emphasis** | `font-serif italic text-indigo-700` | Pull phrases in hero ("with data-driven clarity.") |

### Numeric utility
```css
.numeric {
  font-family: var(--font-serif), Georgia, serif;
  font-variant-numeric: tabular-nums lining-nums;
  letter-spacing: -0.02em;
}
```
Use on every salary, fee, count, rating, percentage. Tabular nums prevent jitter on hover/transitions.

---

## Design Tokens

### Colors

| Role | Tailwind | Hex |
|---|---|---|
| Page background | stone-50 | `#fafaf9` |
| Card background | white | `#ffffff` |
| Primary action | gray-900 | `#111827` |
| Primary hover | indigo-700 | `#4338ca` |
| Accent | indigo-600 | `#4f46e5` |
| Accent light bg | indigo-50 | `#eef2ff` |
| Border default | gray-200 | `#e5e7eb` |
| Border subtle | gray-200/70 | translucent |
| Text primary | gray-900 | `#111827` |
| Text secondary | gray-600 | `#4b5563` |
| Text muted | gray-500 | `#6b7280` |
| Text whisper | gray-400 | `#9ca3af` |
| Success | emerald-700 | `#047857` |
| Warning | amber-700 | `#b45309` |
| Destructive | red-600 / rose-600 | `#dc2626` |

**No gradients in the new system.** Hero uses solid stone-50 with a subtle radial-dot pattern at 4% opacity. The primary action button uses solid gray-900 with an indigo-700 hover swap.

### Radius
- Cards: `rounded-xl` (12px)
- Tooltip / modal: `rounded-2xl` (16px)
- Buttons: `rounded-lg` (8px); CTAs in hero use `rounded-full` for editorial feel
- Pills / badges: `rounded-full`

### Shadows
- Default: `shadow-sm`
- Hover: `shadow-md`
- Modal: `shadow-2xl`
- Dropdown / tooltip: `shadow-lg` / `shadow-xl`

---

## Animation System

Everything is short, eased, and respects `prefers-reduced-motion`. All utilities defined in `globals.css`.

### Keyframes & utility classes

| Class | Keyframe | Duration | Easing | Use |
|---|---|---|---|---|
| `.tooltip-pop` | scale 0.94→1 + translateY 4→0 + fade | 140ms | ease-out | Map hover tooltip |
| `.modal-pop` | scale 0.96→1 + translateY 8→0 + fade | 220ms | spring (0.16,1,0.3,1) | State detail modal |
| `.overlay-fade` | opacity 0→1 | 180ms | ease-out | Modal backdrop |
| `.fade-in` | opacity 0→1 | 300ms | ease-out | Sections appearing |
| `.fade-in-up` | translateY 6→0 + fade | 350ms | spring | Hero copy, ROI result |
| `.slide-down` | translateY -4→0 + fade | 180ms | ease-out | Search dropdown |
| `.page-enter` | fade-in-up | 400ms | spring | All page mounts (applied on `<main>`) |
| `.stagger-children` | fade-in-up cascaded | 500ms each | spring | Grids of cards (top colleges, stats, ranked list) |
| `.pulse-soft` | opacity 1↔0.6 | 2s | ease-in-out | Subtle attention cues |

### Interaction primitives

| Class | Effect |
|---|---|
| `.press` | `active:scale(0.97)` — tactile button/card press feedback |
| `.link-underline` | Underline draws from right to left on hover (300ms spring) |
| `hover:-translate-y-0.5` | Card lifts ~2px on hover (used by `Card hover` and college cards) |
| Save heart `scale-110` | Heart fills + scales when toggled |

### Group/hover micro-interactions
- Logo: `group-hover:rotate-6` + indigo color swap (300ms)
- Card images: `group-hover:scale-105` (500ms) inside `overflow-hidden`
- Card titles: `group-hover:text-indigo-700` (200ms)
- Arrows: `group-hover:translate-x-1` on CTA arrows (300ms)
- Map state: 2.5px stroke + brightness(1.18) drop-shadow on hover

### Reduced motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## UI Primitives

### Button

**File:** `components/ui/Button.tsx`

5 variants × 3 sizes, with loading spinner and `active:scale-[0.97]` press feedback.

| Variant | bg / text | Hover | Use |
|---|---|---|---|
| `primary` | indigo-600 / white | indigo-700 | Primary CTAs |
| `secondary` | gray-100 / gray-900 | gray-200 | Secondary actions |
| `outline` | transparent + border / gray-700 | gray-50 | Neutral |
| `ghost` | transparent / gray-600 | gray-100 | Inline |
| `destructive` | red-600 / white | red-700 | Delete |

| Size | Padding | Font |
|---|---|---|
| `sm` | px-3 py-1.5 | text-sm |
| `md` | px-4 py-2 | text-sm |
| `lg` | px-6 py-3 | text-base |

**Focus:** `ring-2 ring-offset-1 ring-indigo-500`. **Loading:** spinner + disabled.

**Editorial CTA buttons** (homepage hero) use raw `rounded-full` gray-900 / indigo-700 hover pattern, not the Button primitive — they need the magazine-style pill shape.

### Card

**File:** `components/ui/Card.tsx`

- `Card` — `bg-white rounded-xl border border-gray-200 shadow-sm`
- `Card hover` — adds `hover:shadow-md hover:border-gray-300 hover:-translate-y-0.5` (300ms)
- `CardHeader` — `px-5 py-4 border-b border-gray-100`
- `CardBody` — `px-5 py-4`
- `CardFooter` — `px-5 py-3 border-t border-gray-100 bg-stone-50/40 rounded-b-xl`

### Badge

**File:** `components/ui/Badge.tsx`

Now uses subtle backgrounds (`50` shade) + matching `200/60` border + colored dot bullet. No emoji.

| Variant | Background | Border | Text | Dot |
|---|---|---|---|---|
| `default` | gray-100 | — | gray-700 | gray-400 |
| `success` | emerald-50 | emerald-200/60 | emerald-700 | emerald-500 |
| `warning` | amber-50 | amber-200/60 | amber-700 | amber-500 |
| `info` | sky-50 | sky-200/60 | sky-700 | sky-500 |
| `purple` | violet-50 | violet-200/60 | violet-700 | violet-500 |
| `gold` | amber-50 | amber-200/60 | amber-800 | amber-500 |

**InsightBadge labels** (no emoji, just dot + label):
- Top ROI → gold
- Best Value → success
- Rising Placements → info
- Highest Placed → purple

### College type chips
On cards and search results, type chips are bordered pastel pills (e.g. `text-red-700 border-red-200/60 bg-red-50/60`) for IIT/NIT/IIIT/DEEMED/PRIVATE/STATE/CENTRAL.

### Input / Select / Skeleton
Standard text input — `rounded-lg border border-gray-300 px-3 py-2 text-sm`, focus ring indigo-500.

---

## Navigation

**File:** `components/layout/Navbar.tsx`

Sticky, `bg-white/85 backdrop-blur-md border-b border-gray-200/80`, height 64px.

### Sections
1. **Logo** — 32×32 `bg-gray-900` rounded square with `cd` in serif italic; hovers to indigo-700 + `rotate-6` (300ms). Wordmark "CollegeDiscovery" in serif, hidden on mobile.
2. **Search** — flex-1, max-w-md, gray-50 bg, indigo ring on focus, debounced 300ms, spinner inside while loading.
3. **Nav links** — `Colleges · Compare · Heatmap` (md+ only), hover `bg-gray-100 rounded-lg`.
4. **Auth**:
   - Signed out: primary `sm` Button "Sign in"
   - Signed in: "Dashboard" link + avatar circle (photo or initial in indigo-100)

### Search dropdown
Animates in with `.slide-down`. Three categorized sections:

| Section | Icon | Pattern |
|---|---|---|
| Colleges | type chip | "Type · Name · City, State" → `/colleges/[slug]` |
| Locations | map-pin SVG (sky-500 in sky-50 chip) | label + "state"/"city" → `/colleges?state=` or `?q=` |
| Courses | academic-cap SVG (emerald-600 in emerald-50 chip) | course name → `/colleges?course=` |

Footer row: "See all results for 'query'" link.

---

## Pages

### 1. Home (`/`)

**File:** `app/page.tsx`

#### Editorial hero
- Background: `bg-stone-50 border-b border-gray-200/70` (no gradient)
- Decorative layer: radial-dot pattern at 4% opacity, `pointer-events-none`
- Eyebrow: `— India's College Discovery Platform —` (small caps, tracking-widest, with thin dividers)
- H1: `font-serif text-5xl/6xl/7xl leading-[1.05]` "Find your perfect college," + italic indigo-700 line "with data-driven clarity."
- Subhead: serif numeric `{count}+` inline in Geist body
- CTAs (rounded-full pills):
  - **Primary** — gray-900 bg, indigo-700 on hover, animated arrow (`translate-x-1` on group hover)
  - **Secondary** — outline gray-300, white-bg on hover

#### Stats strip (white, divide-x)
Four columns separated by vertical rules, each a numeric serif figure with eyebrow label. Staggered fade-in-up.

#### Top rated colleges
- Eyebrow "Curated Selection" + H2 "Top rated colleges"
- 3-col grid, `stagger-children`
- Each card: `hover:shadow-md hover:-translate-y-0.5 hover:border-gray-300` (300ms)
- Logo / first-letter (serif, gray-300, 2xl)
- Type chip — `tracking-wider uppercase text-[10px] border border-gray-200 px-1.5 py-0.5`
- Stat row: Fees · Rating · Avg CTC, all in `.numeric`, separated by `border-t border-gray-100`

#### Features section
- `bg-white border-t border-gray-200/70`
- Eyebrow "What You Get" + H2 "Why CollegeDiscovery"
- 4-up grid with `gap-px bg-gray-200` to create hairline dividers
- Each feature: 40px rounded-lg `bg-indigo-50 text-indigo-700` icon (Heroicon outline 1.5px), serif title, gray body
- Icon scales `1.05` on group hover (300ms)

### 2. Colleges (`/colleges`)

**File:** `app/colleges/page.tsx`

- Eyebrow "Discover" + serif H1 "Explore colleges"
- Sidebar `CollegeFilters` (sticky `top-24`)
- Main: `CollegeListClient` grid 1/2/3 cols

#### CollegeFilters
6 Selects: State / Type / Fee Range / Min Rating / Course / Sort by. "Clear all" ghost button (only when active).

### 3. College card

**File:** `components/college/CollegeCard.tsx`

- `Card hover` with `group` for nested hover effects
- Logo: image scales `1.05` over 500ms on hover; fallback is serif first-letter
- Title: hovers indigo-700
- Location row: outline map-pin SVG inline with city/state
- Type chip: bordered pastel matching type color (`bg-rose/blue/violet/orange/teal/emerald/indigo-50/60` + `border-200/60`)
- Star rating (amber-400 / gray-200) + `.numeric` rating
- InsightBadges (dot + label)
- **Sparkline:** SVG polyline, 80×24, indigo-600 if up / red-500 if down, with up/down triangle SVG (not ASCII) + percentage
- Stat row: 3 columns separated by `border-x border-gray-100`, all numbers in `.numeric text-base`
- Footer actions:
  - **Compare** — checkmark SVG when active (no more `✓` ASCII)
  - **Save** — outline heart that fills + scales 1.10 when saved (rose-600), with `.press`

### 4. College detail (`/colleges/[slug]`)

**File:** `app/colleges/[slug]/page.tsx`

#### Hero
- 96×96 logo
- Type chip + NAAC badge + InsightBadges
- **H1: `font-serif text-4xl leading-tight`**
- Sublocation: outline map-pin SVG + city + serif numeric established year
- Actions (vertical stack): SaveCollegeButton (heart SVG), "+ Add to Compare" outline link, "Visit Website ↗" external

#### Quick stats (4 cards)
Each card: eyebrow label + `.numeric text-2xl` value. `hover:border-gray-300`.

#### Main column
All `CardHeader` titles use `font-serif text-xl`:
- **Placement Trends** — Recharts line chart
- **Branch-wise Placement Breakdown** — toggle metric (Avg Salary / Placement %) + year tabs + Recharts BarChart with per-branch `Cell` colors + comparison table with up/down triangle SVGs
- **Courses Offered** — divide-y list
- **Latest News** — NewsFeed component
- **Reviews** — star rating + textarea + review list

#### Sidebar
Cards: Placements 2024, Top Recruiters (gray-100 pill chips), Year-wise Placements (with progress bar).

### 5. Compare (`/compare`)

**File:** `components/compare/ComparePageClient.tsx`

- Eyebrow "Side-by-Side" + serif H1 "Compare colleges"
- College chips bar with debounced search and "Copy link" button (link icon SVG, not emoji)
- Empty state: building-2 SVG in gray-100 circle + "Browse all colleges" link-underline
- CompareTable: 12 rows with green highlight for best-value cells (✓ checkmark in green)

### 6. Dashboard (`/dashboard`)

**File:** `app/dashboard/page.tsx`

- Eyebrow "Dashboard" + serif H1 "Welcome, _[name]_" (italic name)
- Saved count in `.numeric`
- Main (2/3): "Saved Colleges" serif h2, list of saved colleges (rows), "Compare your saved colleges" CTA if 2+
- Empty state: book SVG in gray-100 circle + link-underline
- Sidebar (1/3): ROICalculator + DeadlineTracker stacked

#### ROICalculator
- Card with serif header "ROI Calculator"
- College select + Role select + custom CTC input
- "Calculate ROI" primary full-width with loading state
- Result panel (indigo-50 bg, fade-in-up): serif college name, 2×2 grid of result cards each with `.numeric text-2xl`
- Comparison amber strip

#### DeadlineTracker
- Serif header "Admission Deadlines"
- Add form (collapsible)
- Upcoming list: checkbox + college link + type chip + date + days-left coloring (red overdue, amber ≤7d)
- Delete = inline close SVG (not `✕` ASCII)
- Completed list: collapsible `<details>` with strikethrough rows

### 7. Heatmap (`/heatmap`)

**Files:** `app/heatmap/page.tsx`, `components/insights/SalaryHeatmap.tsx`

- Eyebrow "National Insights" + serif H1 "Salary heatmap"
- Sub: numeric college count inline

#### View toggle
Two-tab segmented control. Active = `bg-gray-900 text-white` (matches primary button language).

#### Color legend
"Low" `[swatch][swatch][swatch][swatch][swatch]` "High", labels in uppercase tracking-wider.

#### Map view
- `react-simple-maps` choropleth, indigo gradient (#e0e7ff → #312e81)
- Empty states `#f1f5f9` (warmer than before)
- On hover: 2.5px stroke + brightness + drop shadow
- **Tooltip:** floating, `pointer-events: none`, follows cursor, `.tooltip-pop` animation
  - State name in semibold
  - Salary as `.numeric text-2xl` in matched fill color
  - Progress bar (animates over 500ms)
  - Institute type micro-chips (uppercase 10px)
  - Top 2 colleges with dot bullets

#### Ranked list view (REDESIGNED)
**Previously:** clicking expanded a card inline, which also pushed the neighboring card down.
**Now:** clicking opens a **centered floating modal**.

- 2-col grid of state buttons (full-width press targets), `.stagger-children` entrance
- Each row: `02` numeric rank (serif, gray-300 → gray-500 on hover) · state name · salary (`.numeric text-lg`, in state color) · college count (uppercase 10px) · chevron arrow (translates 0.5 on hover)
- Hover: `shadow-md`, `border-gray-300`, name turns indigo-700
- Salary progress bar fills over 700ms on mount

##### State detail modal (`StateDetailModal`)
- Backdrop: `bg-gray-900/50 backdrop-blur-sm` with `.overlay-fade`
- Card: white, `rounded-2xl shadow-2xl max-w-md`, `.modal-pop` animation (220ms spring)
- Top bar: 1.5px colored strip matching the state's salary fill
- Close button: 32×32 rounded-full, top-right, `.press`, X icon SVG
- Layout:
  - Eyebrow: "Rank · `#N` nationally" (numeric rank)
  - Serif H2: state name
  - Headline: `.numeric text-5xl` salary in state color + "Avg salary" caption
  - Progress bar
  - Hairline `border-b` divider
  - 2-col meta: Colleges count (numeric text-2xl) | Institute type chips (tinted to state color)
  - Top Colleges list (dot bullets in state color, staggered fade-in)
  - CTA: `bg-gray-900 hover:bg-indigo-700` rounded-full pill "Browse {state} colleges →"
- **Dismissal:** click backdrop, click X button, press Escape (with body scroll lock)

### 8. Auth (`/auth/signin`, `/auth/register`)

Centered cards, email + password, primary submit, cross-links.

---

## Iconography

**No emojis.** All icons are inline SVGs in Heroicons outline style (1.5–1.8 stroke width, 24×24 viewBox). Standard set:

| Icon | Use | Heroicon name |
|---|---|---|
| Map pin | Location | map-pin |
| Academic cap | Course / education | academic-cap |
| Bar chart | Analytics | chart-bar |
| Building columns | Compare / institution | building-columns |
| Arrow trending up | ROI | arrow-trending-up |
| Tag | Smart badges | tag |
| Heart (outline / solid) | Save | heart |
| Check | Compare-on, completed | check |
| Newspaper | News empty state | newspaper |
| Book open | Saved empty state | book-open |
| Link | Share / copy link | link |
| X | Close modal / delete | x-mark |
| Question mark circle | Error / not found | question-mark-circle |
| Triangle (up/down) | Trend indicator | inline custom SVG (5×5) |

Always color icons via `currentColor` and `stroke="currentColor"` so they inherit text color.

---

## Workflows

### Browsing
Home → "Explore Colleges" CTA → `/colleges` → filter via sidebar → card → detail page.

### Comparing
Detail page → "+ Add to Compare" → `/compare?ids=...` → search/add more → reads green-highlighted best-value cells → "Copy link" to share.

### Saving & ROI
Sign in → click heart on card or detail → `/dashboard` → ROICalculator: select college + role + CTC → "Calculate ROI" → reads payback period, net gain, break-even year.

### Deadlines
Dashboard → "+ Add" in DeadlineTracker → college/type/date/note → submit → row appears with day countdown (red overdue, amber ≤7d). Check to complete.

### Heatmap
`/heatmap` → hover states → floating tooltip with salary; OR switch to Ranked List → click any state → centered modal slides in with full state detail and CTA to filtered list.

### Search
Type ≥2 chars in navbar → 300ms debounce → categorized dropdown slides down → click colleges / locations / courses.

---

## Responsive breakpoints

| Breakpoint | Changes |
|---|---|
| Mobile (default) | Single column; nav links + wordmark + Dashboard link hidden; sidebar filters hidden |
| `sm` (640px) | Hero CTAs row; stats 4-col; mobile-hidden text returns |
| `md` (768px) | Detail hero row; nav links visible |
| `lg` (1024px) | Colleges 3-col grid + sidebar; Dashboard / Detail 2/3 + 1/3; Heatmap ranked list 2-col |

---

## API surface

| Endpoint | Purpose |
|---|---|
| `GET /api/colleges` | Paginated college list with filters |
| `GET /api/colleges/[id]` | College details |
| `GET /api/colleges/compare?ids=` | Compare data for ids |
| `GET /api/colleges/search?q=` | Categorized search → `{ colleges, locations, courses }` |
| `GET /api/colleges/news?q=` | NewsAPI articles |
| `GET /api/insights/heatmap` | State-level salary aggregates |
| `GET /api/insights/roi` | ROI calculation |
| `POST /api/user/saved` | Toggle save |
| `GET / POST /api/user/deadlines` | List / create deadlines |
| `PATCH / DELETE /api/user/deadlines/[id]` | Toggle complete / delete |
| `POST /api/colleges/[id]/reviews` | Submit a review |
