# Wealvix — Wealth Management App

A full-stack wealth management platform with portfolio tracking, investment simulations, financial calculators, AI-powered recommendations, and PDF report generation.
web url - https://wealth-frontend-31d9.onrender.com

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, MUI (Material UI), Recharts |
| Backend | FastAPI (Python), SQLAlchemy, Pydantic |
| Auth | JWT (python-jose + bcrypt) |
| Background Jobs | Celery + Redis (Upstash) |
| Database | PostgreSQL (Neon) |
| Market Data | Alpha Vantage API |
| Reports | ReportLab + Matplotlib |
| Hosting | Render (Docker) |

---

## Project Structure

```
wealvix-main/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app, routes, CORS
│   │   ├── models.py                # SQLAlchemy ORM models
│   │   ├── schemas.py               # Pydantic request/response schemas
│   │   ├── database.py              # DB engine & session
│   │   ├── security.py              # JWT auth, password hashing
│   │   ├── calculators.py           # SIP, retirement, loan calculators
│   │   ├── simulation_engine.py     # Monte Carlo / investment simulations
│   │   ├── recommendation_engine.py # Portfolio recommendation logic
│   │   ├── alpha_vantage_service.py # Market data fetching
│   │   ├── market_service.py        # Market data helpers
│   │   ├── report_generator.py      # PDF report generation
│   │   ├── celery_tasks.py          # Background task definitions
│   │   └── startup.py              # DB initialization on startup
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/                   # Route-level page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Portfolio.jsx
│   │   │   ├── Investments.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── Simulations.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   ├── Calculators.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ForgotPassword.jsx
│   │   ├── components/              # Reusable UI components
│   │   ├── context/                 # React context (auth, state)
│   │   ├── modals/                  # Dialog/modal components
│   │   ├── routes/                  # Route definitions
│   │   ├── theme/                   # MUI theme config
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
├── render.yaml                      # Render Blueprint (3-service deploy)
└── RENDER_DEPLOYMENT.md             # Deployment guide
```

---

## Features

- **Authentication** — Register, login, JWT-protected routes, forgot password
- **Dashboard** — Overview of portfolio value, goals, and recent transactions
- **Portfolio** — Track asset allocation and holdings
- **Investments** — Add and manage individual investments by asset type
- **Transactions** — Log buy/sell/deposit/withdrawal transactions
- **Goals** — Set and monitor financial goals with visual progress
- **Simulations** — Run investment growth simulations (e.g., Monte Carlo)
- **Recommendations** — AI-driven portfolio recommendations based on risk profile
- **Calculators** — SIP, retirement planning, and loan payoff calculators
- **Reports** — Generate and download PDF financial reports
- **Market Data** — Live market data via Alpha Vantage API
- **Background Jobs** — Celery workers for async tasks (data refreshes, report generation)

---

## Getting Started (Local Development)

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL database (or a [Neon](https://neon.tech) free account)
- Redis (or an [Upstash](https://upstash.com) free account)
- [Alpha Vantage API key](https://www.alphavantage.co/support/#api-key) (free tier available)

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create a .env file
cp .env.example .env  # or create manually (see Environment Variables below)

# Run the API server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create a .env file
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Running Celery Worker (optional, for background jobs)

```bash
cd backend
celery -A app.celery_tasks worker --loglevel=info
```

---

## Environment Variables

### Backend (`.env` or Render environment tab)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (e.g. Neon) |
| `REDIS_URL` | Redis connection URL (e.g. `rediss://...` for Upstash) |
| `SECRET_KEY` | Random 64-character string for JWT signing |
| `ALPHA_VANTAGE_API_KEY` | Your Alpha Vantage API key |
| `FRONTEND_URL` | Frontend URL for CORS (e.g. `https://your-app.onrender.com`) |

### Frontend (`.env` or Render Docker build args)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |

---

## API Overview

The backend is a FastAPI app. Interactive API docs are available at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**Key endpoint groups:**

| Group | Prefix |
|-------|--------|
| Auth | `/auth/register`, `/auth/login` |
| User Profile | `/users/me` |
| Goals | `/goals/` |
| Investments | `/investments/` |
| Transactions | `/transactions/` |
| Simulations | `/simulations/` |
| Recommendations | `/recommendations/` |
| Calculators | `/calculators/sip`, `/calculators/retirement`, `/calculators/loan` |
| Reports | `/reports/` |
| Market Data | `/market/` |
| Health | `/health` |

---

## Deployment (Render)

This project is configured for one-click deployment on [Render](https://render.com) using a Blueprint (`render.yaml`) that creates three services:

| Service | Type | Description |
|---------|------|-------------|
| `wealth-backend` | Docker Web Service | FastAPI API |
| `wealth-frontend` | Docker Web Service | React + nginx |
| `wealth-celery` | Docker Worker Service | Celery background worker |

See [`RENDER_DEPLOYMENT.md`](./RENDER_DEPLOYMENT.md) for the full step-by-step guide.

### Quick Deploy Steps

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → **New → Blueprint**
3. Connect your GitHub repo — Render auto-detects `render.yaml`
4. Set the required environment variables (see above) for each service
5. Deploy — every `git push` to `main` will trigger auto-redeploy

> **Note:** Render free tier services spin down after 15 minutes of inactivity. The first request after sleep may take ~30 seconds. Upgrade to Starter ($7/mo) for always-on services.

---

## License

This project is private. All rights reserved.
