# ── Backend Dockerfile ──────────────────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# System deps for psycopg2 (PostgreSQL driver)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (cached layer — only rebuilds if requirements change)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY app/ ./app/

# Render injects PORT automatically; default fallback to 10000
ENV PORT=10000

EXPOSE $PORT

# Start server — uses Render's dynamic $PORT
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1"]
