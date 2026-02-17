# 🚀 Render Deployment Guide — Wealth Management App

## Stack
- **Backend** → FastAPI (Docker web service)
- **Frontend** → React + Vite → nginx (Docker web service)
- **Celery** → Background worker (Docker worker service)
- **Database** → Neon (PostgreSQL) — already configured
- **Redis** → Upstash — already configured

---

## Step 1 — Push to GitHub

```bash
cd wealth-management-render

git init
git add .
git commit -m "Initial commit — Render-ready"

# Create a new repo on GitHub (e.g. wealth-management), then:
git remote add origin https://github.com/YOUR_USERNAME/wealth-management.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Connect GitHub to Render

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **New → Blueprint**
3. Select your GitHub repo (`wealth-management`)
4. Render will detect `render.yaml` and **auto-create all 3 services**
5. Click **Apply**

---

## Step 3 — Set Environment Variables

After Render creates the services, set secrets manually (they have `sync: false` in render.yaml).

### wealth-backend → Environment tab:
| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon connection string |
| `REDIS_URL` | Your Upstash Redis URL (`rediss://...`) |
| `SECRET_KEY` | Random 64-char string |
| `ALPHA_VANTAGE_API_KEY` | Your Alpha Vantage key |
| `FRONTEND_URL` | *(fill after step 4)* |

### wealth-frontend → Environment tab → Docker Build Args:
| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | Your backend Render URL (e.g. `https://wealth-backend.onrender.com`) |

### wealth-celery → Environment tab:
| Key | Value |
|-----|-------|
| `DATABASE_URL` | Same Neon connection string |
| `REDIS_URL` | Same Upstash Redis URL |
| `ALPHA_VANTAGE_API_KEY` | Your Alpha Vantage key |

---

## Step 4 — Get Your URLs & Update CORS

After first deploy:
1. Copy the **backend URL** (e.g. `https://wealth-backend.onrender.com`)
2. Set it as `VITE_API_BASE_URL` in the **frontend** service → redeploy frontend
3. Copy the **frontend URL** (e.g. `https://wealth-frontend.onrender.com`)
4. Set it as `FRONTEND_URL` in the **backend** service → redeploy backend

---

## Step 5 — Auto-Deploy on Push

Once connected, every `git push` to `main` will automatically redeploy all services.

```bash
git add .
git commit -m "your changes"
git push
```

---

## Free Tier Notes

- Render free services **spin down after 15 min of inactivity** — first request may be slow (~30s)
- Upgrade to **Starter ($7/mo)** for always-on services
- Neon & Upstash free tiers are sufficient for this app

---

## Health Check

Backend health check endpoint: `GET /health` → returns `{"status": "ok"}`  
Render uses this to know when your service is ready.
