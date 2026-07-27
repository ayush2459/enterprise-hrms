-- Runs once, on first Postgres container startup (mounted into
-- /docker-entrypoint-initdb.d by docker-compose.yml).
--
-- Table creation is owned by Alembic migrations (backend/alembic), not
-- this file — this only sets up what the DB needs before the app's
-- migrations run: extensions and the initial System Admin seed hook.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Alembic will create the `users`, `employees`, `audit_logs`, and
-- `refresh_tokens` tables (see backend/alembic/versions). After running
-- migrations, create the first System Admin via:
--   docker compose exec backend python scripts/create_admin.py
