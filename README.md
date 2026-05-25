# CollegeDiscovery

A data-driven college discovery platform for Indian engineering colleges. Search, compare, and analyze placement data, fees, ratings, and ROI across top institutions.

**Live:** [college-discovery-indol.vercel.app](https://college-discovery-indol.vercel.app)

## Features

- **Browse & Filter** — Search colleges by state, type, fee range, rating, course, and sort order
- **College Detail Pages** — Placement trends, branch-wise breakdowns, courses offered, top recruiters, year-wise stats, student reviews
- **Side-by-Side Compare** — Compare up to 3 colleges on fees, placements, rating, and more
- **ROI Calculator** — Payback period and net gain over 5 years for any college
- **Salary Heatmap** — Visual state-wise placement salary comparison across India
- **Smart Insight Badges** — Auto-computed badges: Top ROI, Best Value, Rising Placements, Highest Placed
- **Save Colleges** — Authenticated users can bookmark colleges to a personal list
- **Student Reviews** — Leave and read ratings and reviews per college
- **Dark Mode** — Full system-aware dark mode with manual toggle

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** Neon Serverless Postgres
- **ORM:** Prisma 7 with `@prisma/adapter-pg`
- **Auth:** NextAuth v5 (Google OAuth)
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Dark Mode:** next-themes

## Local Development

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:

   ```env
   DATABASE_URL=your_neon_pooler_url
   NEXTAUTH_SECRET=your_secret
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

3. Push the schema to your database:

   ```bash
   npx prisma db push
   ```

4. Seed the database:

   ```bash
   npx tsx prisma/seed.ts
   ```

5. Run the dev server:

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment

Deployed on Vercel with Neon Postgres. See [DEPLOY.md](DEPLOY.md) for the full deployment guide including environment variable setup and Prisma 7 config notes.

## Project Structure

```text
app/                  # Next.js App Router pages
  colleges/           # Browse and detail pages
  compare/            # Side-by-side comparison
  saved/              # User's saved colleges
  api/                # API routes (reviews, save, auth)
components/
  college/            # CollegeCard, CollegeFilters, charts, reviews
  insights/           # SalaryHeatmap, ROI calculator
  layout/             # Navbar, ThemeProvider
  ui/                 # Badge, Button, Card, Select primitives
lib/                  # prisma client, auth, insights logic, constants
prisma/               # Schema, seed script, migrations
```
