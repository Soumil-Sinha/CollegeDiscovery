# Deploying to Vercel

Step-by-step guide to deploy CollegeDiscovery to Vercel with Vercel Postgres.

**Stack:** Next.js 16 · Prisma 7 · Vercel Postgres · NextAuth v5
**Estimated time:** 15 minutes

---

## What I've already prepared

- `package.json` — `build` script now runs `prisma generate && next build`; `postinstall` runs `prisma generate` so the client regenerates after every `npm install`
- `.gitignore` — excludes `.env*`, `/.next`, `/node_modules`, `/.vercel`, and the generated Prisma client at `/app/generated`
- `.env.example` — documents the four environment variables
- Initial git commit on branch `main`
- Local production build verified — `npm run build` completes cleanly

---

## Step 1 — Push to GitHub

You don't have a GitHub remote yet. Create the repo and push:

```bash
# Create the repo on GitHub via the web UI (or use the gh CLI):
gh repo create college-discovery --private --source=. --remote=origin

# Or if you'd rather use the web UI, create an empty repo then:
git remote add origin https://github.com/<your-username>/college-discovery.git
git push -u origin main
```

> **Note:** the repo can be private. Vercel will still be able to import it once you grant access during the import step.

---

## Step 2 — Import the project in Vercel

1. Go to **<https://vercel.com/new>**.
2. Click **Import Git Repository** and select your `college-discovery` repo.
3. Vercel auto-detects Next.js. Leave the defaults:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (already wired to run `prisma generate && next build`)
   - **Output Directory:** (auto)
   - **Install Command:** `npm install`
4. **Don't deploy yet** — click *Environment Variables* first and skip to Step 3.

---

## Step 3 — Provision Vercel Postgres

Before the first deploy you need a database.

1. In your new Vercel project, click the **Storage** tab.
2. Click **Create Database** → **Postgres** → **Continue**.
3. Name it `college-discovery-db`, pick a region close to your users (e.g. `bom1` for India).
4. Click **Create & Continue** → on the next screen, click **Connect Project** so Vercel injects the connection env vars into your project automatically.

Vercel will set these variables for you:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`

You need to expose one of these as `DATABASE_URL` because that's what `lib/prisma.ts` reads. See Step 4.

---

## Step 4 — Set environment variables

In **Project Settings → Environment Variables**, add the following (all three environments — Production, Preview, Development):

| Name | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `${POSTGRES_PRISMA_URL}` | Reference the Vercel-injected var. Use `POSTGRES_PRISMA_URL` (pooled, recommended for serverless) |
| `NEXTAUTH_SECRET` | *(your existing secret)* | The JWT signing secret you already have |
| `NEXTAUTH_URL` | `https://<your-project>.vercel.app` | Replace once you know your domain; for Preview deploys leave it blank and NextAuth will infer it |
| `NEWS_API_KEY` | *(optional)* | Skip if you don't need the news feed; the UI degrades gracefully |

> **Why DATABASE_URL = `${POSTGRES_PRISMA_URL}`?**
> Vercel's variable references let one var resolve to another. `POSTGRES_PRISMA_URL` includes `?pgbouncer=true&connect_timeout=15` which is correct for serverless functions hitting a pooled connection.

---

## Step 5 — Deploy

1. Back on the project page, click **Deploy**.
2. Watch the build log — you should see:
   ```
   Running "npm install"
   Running "prisma generate"  ← postinstall hook
   Running "npm run build"
   prisma generate && next build
   ✓ Compiled successfully
   ```
3. First deploy takes ~2 minutes. Subsequent deploys are faster (Vercel caches `node_modules`).

---

## Step 6 — Run migrations + seed against production DB

Vercel doesn't auto-migrate. Apply the schema and seed data from your local machine, pointing at the Vercel Postgres URL:

```bash
# Get the non-pooled connection string from Vercel Storage → .env.local tab
# Copy the POSTGRES_URL_NON_POOLING value (NOT the pooled one — migrations need a direct connection)

# In a fresh terminal:
export DATABASE_URL="postgresql://...your-non-pooling-url..."
npx prisma db push     # creates all tables
npm run db:seed        # inserts 50 colleges, placements, etc.
```

> **Why non-pooling for migrations?** Prisma migrations need a direct connection, not pgbouncer. Once seeded, the app uses the pooled URL via `DATABASE_URL=${POSTGRES_PRISMA_URL}`.

---

## Step 7 — Update NEXTAUTH_URL with the real domain

After the first deploy you'll know your domain. Update `NEXTAUTH_URL` in Vercel Project Settings to the final URL (e.g. `https://college-discovery.vercel.app` or your custom domain). Redeploy or trigger from the dashboard.

---

## Step 8 — Verify

Visit `https://<your-project>.vercel.app` and check:

- [ ] Home page loads with all 50 colleges (`/colleges`)
- [ ] Heatmap renders the India map at `/heatmap`
- [ ] Click a state in the ranked list → floating modal opens
- [ ] Sign up at `/auth/register` works
- [ ] Sign in, save a college, see it in `/dashboard`
- [ ] News feed shows an empty state on detail page (or articles if you set `NEWS_API_KEY`)

---

## Troubleshooting

### `PrismaClientInitializationError: Can't reach database server`
- Confirm `DATABASE_URL` resolves correctly: in Project Settings → Environment Variables, click the value to inspect it. It should look like `postgres://user:pass@host/db?sslmode=require&pgbouncer=true&connect_timeout=15`.
- Run `npx prisma db push` against the **non-pooled** URL first; only the app at runtime uses the pooled URL.

### Build fails with `Cannot find module '@/app/generated/prisma/client'`
- The `postinstall` hook should generate this. Confirm the build log shows `Running prisma generate`.
- Manually trigger a redeploy with cache cleared: Project Settings → General → scroll to **Build & Development Settings** → toggle "Ignore Build Step" off, then redeploy.

### NextAuth session errors / CSRF issues
- `NEXTAUTH_URL` must exactly match the deployed domain (`https://`, no trailing slash).
- `NEXTAUTH_SECRET` must be set; without it NextAuth refuses to issue tokens in production.

### Cold-start latency on first request
- Expected on Vercel Free / Hobby. Server functions sleep after ~5 minutes of inactivity. Upgrade to Pro for warmer functions, or move to a long-running host like Railway / Fly.

---

## Continuous deployment

Once connected, every push to `main` triggers a Production deploy; pushes to any other branch (or PR) create Preview deploys with their own DB-pooled URL. No manual action needed.

---

## Future improvements

- **Prisma Migrate** — switch from `prisma db push` to `prisma migrate deploy` once you want migration history. Wire it into a GitHub Actions workflow that runs against the non-pooling URL before each deploy.
- **Edge functions** — `lib/prisma.ts` uses the Node runtime; if you want edge-runtime routes, swap to `@prisma/adapter-neon` and Prisma's edge client.
- **Monitoring** — enable Vercel Analytics in Project Settings → Analytics for Web Vitals.
- **Custom domain** — Project Settings → Domains → Add. Vercel handles the cert.
