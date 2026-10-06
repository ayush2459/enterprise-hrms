#!/usr/bin/env bash
# First-time local setup: copies env templates, builds containers, runs
# migrations. Safe to re-run.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f backend/.env ]; then
  echo "Creating backend/.env from template..."
  cp backend/.env.example backend/.env
  echo "  -> edit backend/.env and set a real SECRET_KEY and POSTGRES_PASSWORD before deploying."
fi

echo "Building containers..."
docker compose build

echo "Starting postgres + redis..."
docker compose up -d postgres redis

echo "Waiting for postgres to be healthy..."
until docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-hrms_user}" >/dev/null 2>&1; do
  sleep 1
done

echo "Running Alembic migrations..."
docker compose run --rm backend alembic upgrade head

echo "Starting the full stack..."
docker compose up -d

cat <<EOF

Setup complete.
  Frontend:  http://localhost:3000
  Backend:   http://localhost:8000/docs
  Via nginx: http://localhost

Next step — create the first System Admin:
  docker compose exec backend python scripts/create_admin.py --email admin@yourcompany.com --password "ChangeMe123!"
EOF
