# Deploying circumsurvey-explore

End-to-end guide: empty folder → live at `explore.circumsurvey.online`.
Follow in order; each step builds on the last.

---

## Prerequisites

- Git installed locally
- A GitHub account with permission to create repos in `accidental-intactivist`
  (or use your personal account if that's how you ship findings)
- `gh` CLI optional but recommended (`winget install --id GitHub.cli` on Windows)
- Cloudflare dashboard access (same account that hosts findings)

## Step 1. Extract the scaffold

```powershell
# Pick a workspace. Suggestion: same parent folder as circumsurvey.
Set-Location C:\work

# Expand the zip
$zipPath = "$HOME\Downloads\explore-v8.0-scaffold.zip"
Expand-Archive -Path $zipPath -DestinationPath .\circumsurvey-explore -Force
Set-Location .\circumsurvey-explore
```

## Step 2. Verify it builds locally

```powershell
npm install
npm run build
```

Expected output:
```
dist/index.html                   1.60 kB │ gzip:  0.71 kB
dist/assets/index-[hash].css      1.09 kB │ gzip:  0.54 kB
dist/assets/index-[hash].js     186 kB    │ gzip: 57 kB
✓ built in ~2s
```

Optionally run the dev server and browse to `http://localhost:5174` to check
that the Master Index loads with live data from the findings Worker.

## Step 3. Initialize git and make the first commit

```powershell
git init
git add .
git commit -m "v8.0.0: initial scaffold — Master Questions Index + Question detail + About

Companion to findings.circumsurvey.online. Identical visual language,
different information architecture (research tool vs curated report).

- React 18 + Vite 5, same stack as findings
- URL-addressable filter state (hash routing, no server rewrites needed)
- Fetches from findings.circumsurvey.online/api/* (D1-backed Worker)
- Master Questions Index with full-text search + 4 facets
- Per-question Distribution / Compare Pathways / Cross-tab views
- Shareable URLs for every slice — every view is citable

Next milestones:
- v8.0.1: Extend /api/aggregate to support politics + age_bracket dimensions
- v8.1: Baseline-ghost overlay ('compared to all respondents') on distributions
- v8.2: Leaflet maps integrated as filter UI"
```

## Step 4. Create the GitHub repo and push

### Option A — with `gh` CLI (recommended)

```powershell
gh repo create accidental-intactivist/circumsurvey-explore `
  --public `
  --source=. `
  --remote=origin `
  --description "Interactive data explorer for The Accidental Intactivist's Inquiry" `
  --push
```

That's it — repo created and code pushed.

### Option B — without `gh` CLI

1. Go to https://github.com/organizations/accidental-intactivist/repositories/new
   (or https://github.com/new if personal account)
2. Name: `circumsurvey-explore`
3. Visibility: Public
4. Don't initialize with README/gitignore/license (we already have them)
5. Create
6. Back in PowerShell:
   ```powershell
   git remote add origin https://github.com/accidental-intactivist/circumsurvey-explore.git
   git branch -M main
   git push -u origin main
   ```

## Step 5. Create the Cloudflare Pages project

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**
2. Select the `circumsurvey-explore` repo
3. **Production branch**: `main`
4. **Framework preset**: Vite
5. **Build command**: `npm run build`
6. **Build output directory**: `dist`
7. **Environment variables**: (none needed)
8. **Save and Deploy**

First build takes 1–2 minutes. When it's done you'll get a `circumsurvey-explore.pages.dev` URL. Visit it and confirm the Master Index loads.

## Step 6. Attach the custom domain

1. In the new Pages project → **Custom domains** tab → **Set up a custom domain**
2. Enter `explore.circumsurvey.online`
3. Click **Continue**

Because `circumsurvey.online` is already on Cloudflare nameservers (findings
works), Cloudflare **automatically creates the CNAME record**. SSL provisioning
takes 1–3 minutes.

After the domain status flips to **Active**, visit https://explore.circumsurvey.online
— the site should load over HTTPS.

## Step 7. Smoke test the deployed site

Visit each of these URLs and confirm they render correctly:

```
https://explore.circumsurvey.online/
https://explore.circumsurvey.online/#/?pathway=intact
https://explore.circumsurvey.online/#/?section=Religion&tier=1
https://explore.circumsurvey.online/#/?search=autonomy
https://explore.circumsurvey.online/#/q/family_politics
https://explore.circumsurvey.online/#/q/family_politics?pathway=intact
https://explore.circumsurvey.online/#/q/family_politics?view=compare
https://explore.circumsurvey.online/#/q/family_politics?view=crosstab&cross=religion.primary_tradition
https://explore.circumsurvey.online/#/about
```

Open browser devtools → Network tab → reload. You should see:
- 1× request to `https://findings.circumsurvey.online/api/questions?counts=1` returning 200 with 355 questions
- On question pages, 1–2 additional requests to `/api/response-distribution` and `/api/aggregate`
- All responses have `Access-Control-Allow-Origin: *` header (CORS working)

If any of those fail, check:
- Is the Worker up? `curl https://findings.circumsurvey.online/api/health` should return `{"ok":true,...}`
- Are the questions in D1? `curl https://findings.circumsurvey.online/api/questions | jq .count` should return 355

## Troubleshooting

### Deploy failed on Cloudflare Pages

Check the build log. Most likely cause: Node version. Pages defaults to Node 20
which Vite 5 supports. If it complains about a different version, set
`NODE_VERSION=20` in Pages project → **Settings** → **Environment variables**.

### `/api/*` requests return 404 from explore but work from findings

The Worker is routed to `findings.circumsurvey.online/api/*`, not a wildcard.
Explore is calling the findings API cross-origin — which works because the
Worker has permissive CORS headers. If you see 404s, confirm the URL in
`src/styles/tokens.js` (`API_BASE = "https://findings.circumsurvey.online/api"`).

### SSL cert stuck "provisioning"

Usually clears in under 3 minutes. If it hangs longer than 15, check for CAA
records in Cloudflare DNS (Rules → DNS → look for CAA). If none exist, wait
another 10 minutes and refresh. If still stuck, remove and re-add the custom
domain in Pages.

### Custom domain says "DNS record already exists"

A stale `explore` CNAME or A record exists in the zone. Go to Cloudflare DNS
for `circumsurvey.online`, find the `explore` entry, delete it, then re-attach
the custom domain in Pages.

## What's deployed now, what's next

**v8.0 ships:**
- Master Index (home)
- Per-question Distribution + Compare + Cross-tab views (pathway, religion, generation, country_born)
- URL-addressable filter state
- About page
- Shared design language with findings

**v8.0.1 (small follow-up):**
- Extend the Worker's `/api/aggregate` to support `by=politics` and `by=age_bracket`
- Deploy the Worker: `cd ../circumsurvey/worker && npx wrangler deploy`

**v8.1 (medium follow-up):**
- Baseline-ghost overlay bars on distributions ("vs all respondents")
- Compound filters (religion × pathway, politics × pathway)
- Small-multiples grid view for cross-tabs

**v8.2 (bigger feature):**
- Leaflet maps integration (`/api/geo` endpoint already exists — needs UI)
- Click a state/country → filter the entire explorer by that location

All iterations push directly to this repo; Cloudflare Pages auto-rebuilds on any commit to `main`.
