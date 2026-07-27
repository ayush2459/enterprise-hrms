# Enterprise HR Portal (HRHub)

A full-stack enterprise HRMS: Next.js frontend, FastAPI backend, PostgreSQL,
Redis, and an nginx reverse proxy — built per the Enterprise HR Portal
specification (see `docs/`).

This is the Sprint 1 foundation: authentication + RBAC, the employee master
profile (CRUD), and the base dashboard shell/navigation. Later sprints
(documents/BGV, insurance, policies, reporting, hardening) build on top of
this scaffold — see the Delivery Roadmap in the spec.

## Stack

| Layer       | Choice                                             |
|-------------|-----------------------------------------------------|
| Frontend    | Next.js 15 (App Router), TypeScript, Tailwind CSS   |
| Backend     | FastAPI (Python), async SQLAlchemy 2.0              |
| Database    | PostgreSQL 16                                        |
| Cache/Store | Redis 7                                              |
| Auth        | JWT (access + refresh), bcrypt, TOTP-based MFA       |
| Proxy       | nginx                                                |
| Deployment  | Docker Compose                                       |

## Quick Start

**Prerequisites:** Docker & Docker Compose.

```bash
git clone <this-repo>
cd enterprise-hrms
./scripts/setup.sh
```

This copies `backend/.env.example` to `backend/.env`, builds every
container, runs Alembic migrations, and starts the stack.

Then create the first System Admin:

```bash
docker compose exec backend python scripts/create_admin.py \
  --email admin@yourcompany.com --password "ChangeMe123!"
```

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8000/docs
- Through nginx: http://localhost

**⚠️ Before any non-local deployment:** change `SECRET_KEY` and
`POSTGRES_PASSWORD` in `backend/.env` — the example values are placeholders,
not defaults you should ship with.

## Local development (without Docker)

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit DATABASE_URL to point at a local Postgres
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
enterprise-hrms/
├── frontend/     # Next.js app (App Router, TS, Tailwind)
├── backend/      # FastAPI app (async SQLAlchemy, Alembic, JWT auth)
├── database/     # init.sql — extensions only; schema is Alembic-owned
├── docker/       # nginx reverse proxy config, postgres overrides
├── docs/         # specification documents
├── scripts/      # setup + admin bootstrap scripts
└── docker-compose.yml
```

## What's implemented (Sprint 1)

- Official email / Employee ID login, bcrypt password hashing
- JWT access (15 min) + refresh (7 day) tokens, role claim embedded
- Server-side RBAC re-validated on every request (not just at login)
- Account lockout after 5 failed attempts, MFA (TOTP) for HR/System Admin
- Full audit log of login attempts and sensitive-field access
- Employee master profile: CRUD with field-level visibility rules
  (sensitive fields only visible to HR Admin/Executive or the employee)
- Dashboard shell, sidebar navigation, employee directory table

## What's next

See Section 9 (Suggested Delivery Roadmap) in the spec: documents/BGV
pipeline, insurance module, HR policies library, reporting, and the
hardening sprint (field-level encryption, DPDP compliance review, load
testing).

## License

See [LICENSE](./LICENSE).
