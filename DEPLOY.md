# Deploying to Vercel

Step-by-step guide to deploy CollegeDiscovery to Vercel with Neon Serverless Postgres.

**Stack:** Next.js 16 · Prisma 7 · Neon Postgres · NextAuth v5
**Live URL:** <https://college-discovery-indol.vercel.app>
**Estimated time:** 15 minutes

---

## What's already prepared

- `package.json` — `build` runs `prisma generate && next build`; `postinstall` runs `prisma generate` so the client regenerates after every `npm install`
- `prisma.config.ts` — Prisma 7 config; reads `DATABASE_URL` from env for CLI commands; no URL fields in `schema.prisma` (Prisma 7 requirement)
- `lib/prisma.ts` — uses `PrismaPg` adapter with `DATABASE_URL` at runtime
- `.npmrc` — `legacy-peer-deps=true` (required for react-simple-maps peer dep with React 19)
- `.gitignore` — excludes `.env*`, `/.next`, `/node_modules`, `/.vercel`, `/app/generated`
- `.env.example` — documents required environment variables
- GitHub remote: `https://github.com/Soumil-Sinha/CollegeDiscovery.git`

---

## Step 1 — Provision Neon Postgres

1. Go to **vercel.com/new** → import `Soumil-Sinha/CollegeDiscovery`
2. Before deploying, go to your Vercel project → **Storage** tab
3. Click **Create Database** → choose **Neon** (Serverless Postgres)
4. Name: `college-discovery-db`, Region: `sin1` (Singapore) or nearest
5. Click **Connect Project** to link it to your Vercel project

Neon injects connection strings automatically. You need the two URLs from **Storage → your DB → Connection Details**:

- **Pooled URL** (for runtime): hostname contains `-pooler`
- **Direct URL** (for CLI): same but without `-pooler` in hostname

---

## Step 2 — Set environment variables

In **Vercel → Project Settings → Environment Variables**, add all four (All Environments):

| Name | Value |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `NEXTAUTH_SECRET` | your JWT secret |
| `NEXTAUTH_URL` | `https://<your-project>.vercel.app` (set after first deploy) |
| `NEWS_API_KEY` | *(optional)* — omit to show graceful empty state |

> **Important:** Set `NEXTAUTH_URL` before deploying or auth routes will return 500. If you don't know the domain yet, deploy once, note the URL, then add this var and redeploy.

---

## Step 3 — Deploy

Click **Deploy** on the project import screen (or push to `main` to trigger auto-deploy).

The build log should show:

```text
Running "npm install"
Running "prisma generate"   ← postinstall hook
Running "npm run build"
prisma generate && next build
✓ Compiled successfully
```

---

## Step 4 — Push schema + seed data to Neon

Vercel doesn't run migrations automatically. Run from your local machine using the **direct** (non-pooler) URL so Prisma can execute DDL:

```powershell
# Windows PowerShell
$env:DATABASE_URL = "postgresql://<user>:<pass>@<host-without-pooler>/<db>?sslmode=require"
npx prisma db push
npm run db:seed
```

This creates all tables and inserts 50 colleges, placement stats, and branch data.

> **Why the direct URL for db push?** pgbouncer (the pooler) doesn't support some DDL operations Prisma needs for schema migrations. The runtime app uses the pooled URL via `DATABASE_URL` in Vercel env vars.

---

## Step 5 — Verify

Visit `https://<your-project>.vercel.app` and check:

- [ ] Home page loads with stats strip
- [ ] `/colleges` shows all 50 colleges with placement sparklines
- [ ] `/heatmap` renders the India choropleth map
- [ ] Click a state in the ranked list → floating modal opens
- [ ] `/auth/register` — sign up works
- [ ] Sign in, save a college, see it in `/dashboard`
- [ ] ROI calculator on `/dashboard` computes payback period
- [ ] News feed on college detail shows graceful empty state (or articles if `NEWS_API_KEY` is set)

---

## Troubleshooting

### `TypeError: Invalid URL, input: 'blank'` on auth routes

`NEXTAUTH_URL` is missing or blank. Set it in Project Settings → Environment Variables to `https://<your-domain>.vercel.app` and redeploy.

### `PrismaClientKnownRequestError: Can't reach database server` (P1001)

`DATABASE_URL` isn't set or is pointing at the wrong host. Confirm it's the Neon **pooled** URL (hostname contains `-pooler`) in Vercel env vars.

### `Cannot find module 'dotenv'` during build

Remove any `import "dotenv/config"` from `prisma.config.ts` — Vercel injects env vars directly, dotenv is not needed.

### Build fails with `datasource property 'url' is no longer supported`

Prisma 7 removed `url` and `directUrl` from `schema.prisma`. Connection URLs must be in `prisma.config.ts` under the `datasource` key.

### `npm install` exits with 1 on peer dep conflict

Ensure `.npmrc` at the project root contains `legacy-peer-deps=true`. This is required for react-simple-maps@3 with React 19.

### Cold-start latency on first request

Expected on Vercel Hobby. Functions sleep after ~5 min of inactivity. Upgrade to Pro for warmer functions.

---

## Continuous deployment

Every push to `main` triggers a Production deploy. PRs and other branches get Preview deploys. No manual action needed after initial setup.

---

## Future improvements

- **Prisma Migrate** — switch from `prisma db push` to `prisma migrate deploy` once migration history is needed
- **Edge functions** — swap `@prisma/adapter-pg` for `@prisma/adapter-neon` to use Neon's HTTP driver on edge routes
- **Monitoring** — enable Vercel Analytics in Project Settings → Analytics
- **Custom domain** — Project Settings → Domains → Add
- **Test suite** — Vitest for unit tests, Playwright for E2E against a test Neon branch
