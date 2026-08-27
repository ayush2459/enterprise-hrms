# HRHub — self-service + manager workspace (schema-corrected, complete)

This REPLACES both earlier zips (`hrhub-selfservice.zip` and
`hrhub-workspaces.zip`). Field names are now fixed against your real
`employees`/`users` schema confirmed from your Docker logs. Use this one.

## Merge — backend

```bash
cd ~/Downloads/enterprise-hrms

cp hrhub-fixed/backend_additions/models/notification.py backend/app/models/
cp hrhub-fixed/backend_additions/schemas/self_service.py backend/app/schemas/
cp hrhub-fixed/backend_additions/repositories/notification_repository.py backend/app/repositories/
cp hrhub-fixed/backend_additions/services/*.py backend/app/services/
cp hrhub-fixed/backend_additions/api/v1/endpoints/*.py backend/app/api/v1/endpoints/
cp hrhub-fixed/backend_additions/alembic/versions/*.py backend/alembic/versions/
```

**Three manual edits still required — these can't be scripted safely:**

1. **`backend/alembic/versions/f1a2b3c4d5e6_add_approval_chain_and_notifications.py`**
   Set `down_revision` to your current head. You already know it:
   `9f2a7c1d4e11` (confirmed from your `alembic history` output earlier).
   ```python
   down_revision = "9f2a7c1d4e11"
   ```

2. **`backend/app/auth/rbac.py`** — merge in the contents of
   `hrhub-fixed/backend_additions/auth/rbac_additions.py` (adds
   `require_role(*roles)`). Don't overwrite the file — append the function.

3. **`backend/app/api/v1/router.py`** — register the two new routers:
   ```python
   from app.api.v1.endpoints import self_service, manager
   api_router.include_router(self_service.router, prefix="/me", tags=["self-service"])
   api_router.include_router(manager.router, prefix="/manager", tags=["manager"])
   ```

4. **Add `Notification` to `backend/app/models/__init__.py`** so Alembic/SQLAlchemy sees it.

## Merge — frontend

```bash
mkdir -p "frontend/app/(dashboard)/my-workspace" "frontend/app/(dashboard)/manager"
mkdir -p frontend/components/workspace

cp "hrhub-fixed/frontend_additions/app/(dashboard)/my-workspace/page.tsx" "frontend/app/(dashboard)/my-workspace/page.tsx"
cp "hrhub-fixed/frontend_additions/app/(dashboard)/manager/page.tsx" "frontend/app/(dashboard)/manager/page.tsx"
cp hrhub-fixed/frontend_additions/components/workspace/*.tsx frontend/components/workspace/
```

Fix the `import api from "@/lib/api"` line in both new pages to match your
actual `frontend/lib/api.ts` export.

## What's now fixed vs. before

- Every backend call that reads "the current employee" now goes through
  `get_employee_for_user(db, user)`, which correctly joins `employees.user_id
  == users.id` — no more incorrect `user.employee_id` assumption.
- `full_name`, `department`, `designation`, `employment_type`, `status`,
  `reporting_manager_id` are used directly — these are confirmed real
  columns, not guesses.
- Manager's `/team` and `/approvals/pending` now resolve the manager's own
  Employee row first, then filter by `reporting_manager_id == manager.id`.

## Still open (need one more file from you: full `employee.py`)

- `employee_status_enum` values — I don't know the full list (saw `OFFBOARDED`
  in a log; need the others to render `status` as a readable label instead
  of the raw enum string).
- Leave balance / attendance / payroll numbers — still `None` in `/me/summary`
  until you share `leave_type.py`, `attendance_record.py`, `payroll_record.py`.
- Who counts as "HR" for the `user_id=0` notification placeholder in
  `leave_approval_service.py` — needs a real role-based lookup once you
  confirm how HR users are identified on `users.role`.

## Test locally

```bash
docker compose restart backend
docker compose logs backend --tail 40    # confirm it starts clean, no import errors

cd frontend
kill -9 $(lsof -ti:3011) 2>/dev/null
npx next dev -p 3011
```

Visit `http://localhost:3011/my-workspace` (log in as an employee with a
manager set) and `http://localhost:3011/manager` (log in as that manager).
