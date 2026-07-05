# Deployment Guide — LCCA-CPPM

This project has two pieces that deploy independently:

| Tier | Target | Output |
| --- | --- | --- |
| Frontend (React + Vite + TanStack Router) | **Vercel** | Static SPA built to `frontend/dist/client` |
| Backend (Django + DRF) | Render / Railway / Fly.io / Heroku / PythonAnywhere | WSGI app + persistent database |

The frontend talks to the backend at the URL provided by `VITE_API_URL`. Deploy the backend first so you know that URL, then point the frontend at it.

---

## 1. Push the repository to GitHub

```bash
cd C:\Users\PJ\Desktop\LCCA-CPPM
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

If the remote isn't set yet:

```bash
git remote add origin https://github.com/<your-user>/LCCA-CPPM.git
git branch -M main
git push -u origin main
```

`.gitignore` already excludes `node_modules/`, `dist/`, `.env*`, `.vercel/`, and `db.sqlite3`, so nothing sensitive should leak.

---

## 2. Deploy the backend (do this first)

Pick any of the following — Render is the quickest free-tier option for a Django app with SQLite/Postgres.

### Render (recommended)

1. New → **Web Service** → connect the GitHub repo.
2. **Root Directory:** `backend`
3. **Build Command:**
   ```
   pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
   ```
4. **Start Command:**
   ```
   gunicorn lifecycle_cost_analysis.wsgi:application
   ```
   (Add `gunicorn>=21.0` to `backend/requirements.txt` first.)
5. **Environment variables:**
   - `DEBUG=False`
   - `SECRET_KEY=<long random string>`
   - `ALLOWED_HOSTS=<your-render-subdomain>.onrender.com`
   - `DATABASE_URL=<copy from Render-provisioned Postgres>`
   - `CORS_ALLOWED_ORIGINS=https://<your-vercel-project>.vercel.app`
6. Deploy. Note the resulting URL, e.g. `https://lcca-cppm.onrender.com`.

### Other options
- **Railway:** Same env vars, set the **service root** to `backend`.
- **Fly.io:** `fly launch --copy-config` from `backend/`, then `fly secrets set …`.
- **PythonAnywhere:** Manual; clone the repo, install requirements, run migrations, set up the WSGI file.

---

## 3. Deploy the frontend to Vercel

### One-time setup

1. Sign in to [vercel.com](https://vercel.com) with your GitHub account.
2. **Add New… → Project** → pick the `LCCA-CPPM` repo.
3. **Framework Preset:** Vite (Vercel auto-detects).
4. **Root Directory:** click *Edit* and set it to `frontend`. ← important; the build commands won't find `package.json` without this.
5. **Build & Output Settings** (already pre-filled by `frontend/vercel.json`):
   - Install Command: `npm install`
   - Build Command: `npm run build`
   - Output Directory: `dist/client`
6. **Environment Variables** → add:
   | Name | Value | Environments |
   | --- | --- | --- |
   | `VITE_API_URL` | `https://lcca-cppm.onrender.com/api` (your backend URL + `/api`) | Production, Preview, Development |
7. Click **Deploy**.

After the first deploy you'll get a URL like `https://lcca-cppm-pj.vercel.app`.

### Re-deploys

Vercel will redeploy automatically on every `git push` to `main`. Every PR also gets a preview URL.

If you change `VITE_API_URL`, you must trigger a redeploy — env vars only get baked into the bundle at build time.

---

## 4. Tell the backend about the frontend URL

Once Vercel gives you a production URL, add it to the backend env:

```
CORS_ALLOWED_ORIGINS=https://lcca-cppm-pj.vercel.app
```

To allow every Vercel preview deploy automatically, also set:

```
CORS_ALLOWED_ORIGIN_REGEXES=^https://.*\.vercel\.app$
```

Redeploy the backend. The frontend should now load data.

---

## 5. Smoke test

Open the Vercel URL and check:

- [ ] Dashboard loads with no "API unreachable" banner.
- [ ] Asset Management shows seeded rows (or is gracefully empty).
- [ ] Reports → click **PDF** on any report → real PDF downloads.
- [ ] Browser DevTools → Network: requests go to `https://<your-backend>/api/...` and return 200.
- [ ] No CORS errors in the console.

---

## Troubleshooting

**"API is unreachable" banner**
- Open DevTools → Network. If you see `(failed) net::ERR_NAME_NOT_RESOLVED`, your `VITE_API_URL` is wrong.
- If requests reach the backend but show *CORS error*, add the Vercel URL to `CORS_ALLOWED_ORIGINS` and redeploy backend.

**Vercel build fails with "vite: not found"**
- The Root Directory probably isn't set to `frontend`. Fix in Project Settings → General.

**Vercel build fails with Cloudflare-related errors**
- `vite.config.ts` should pass `cloudflare: false`. Verify the latest commit includes this.

**Routes work on Vercel but a hard refresh of e.g. `/prioritisation` returns 404**
- The `rewrites` in `frontend/vercel.json` must be present and match all non-asset paths. Confirm the file was committed.

**Backend 400 "DisallowedHost" on production**
- Add the hosting URL's hostname to `ALLOWED_HOSTS` env var (no scheme, no trailing slash). For Render: `<service>.onrender.com`.

---

## File-by-file reference

| Path | Purpose |
| --- | --- |
| `frontend/vite.config.ts` | Strips Cloudflare plugin, enables TanStack Start SPA mode |
| `frontend/vercel.json` | Tells Vercel: Vite framework, output dir, SPA rewrites, asset cache headers |
| `frontend/.env.example` | Documents `VITE_API_URL` |
| `frontend/.gitignore` | Ignores `dist/`, `.env*`, `.vercel/` |
| `backend/.env.example` | Documents `DEBUG`, `SECRET_KEY`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`, `CORS_ALLOWED_ORIGIN_REGEXES` |
| `backend/lifecycle_cost_analysis/settings.py` | Reads CORS origins/regexes from env |
