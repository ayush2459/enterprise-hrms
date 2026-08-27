# HRHub — Employee & Manager Workspace UI (matches your preview)

This builds ON TOP of the `hrhub-selfservice.zip` module from earlier — you
still need that one merged in first (models, /me/*, /manager/* base routes,
notifications, approval workflow). This zip adds the **actual UI pages**
styled to match your HTML preview and manager screenshot, plus the extra
backend fields those pages need.

## New in this zip

```
frontend_additions/
  components/workspace/WorkspaceShell.tsx      -> dark indigo sidebar + topbar
  components/workspace/PreviewPrimitives.tsx   -> HeroBanner, MetricCard, PanelCard, Row, Pill
  app/(dashboard)/my-workspace/page.tsx        -> employee dashboard (matches your HTML preview)
  app/(dashboard)/manager/page.tsx             -> manager dashboard (matches your screenshot)

backend_additions/
  api/v1/endpoints/self_service_summary.py     -> new /me/summary endpoint
  api/v1/endpoints/manager_team_updated.py     -> updated /manager/team + /manager/approvals/pending
```

## Still-guessed fields (fix once you share employee.py / payroll_record.py / attendance_record.py)

- `Employee.full_name`, `.designation`, `.department`, `.employee_code`, `.employment_type`, `.status`
- Leave balance calculation — not wired yet, shows "—" in UI
- Attendance present/leave/absent counts — not wired yet
- Latest payslip net pay — not wired yet
- Leave type name (currently shows the raw `leave_type_id`)

None of these missing pieces will crash the page — they render as `—` or
`null` gracefully, so you can see the real layout/UI working immediately
and fill in the data wiring incrementally.

## Merge steps

```bash
cd ~/Downloads/enterprise-hrms

mkdir -p "frontend/app/(dashboard)/my-workspace" "frontend/app/(dashboard)/manager"
mkdir -p frontend/components/workspace

cp hrhub-workspaces/frontend_additions/app/\(dashboard\)/my-workspace/page.tsx "frontend/app/(dashboard)/my-workspace/page.tsx"
cp hrhub-workspaces/frontend_additions/app/\(dashboard\)/manager/page.tsx "frontend/app/(dashboard)/manager/page.tsx"
cp hrhub-workspaces/frontend_additions/components/workspace/*.tsx frontend/components/workspace/

# backend: merge self_service_summary.py's /summary route into your
# existing self_service.py router from the earlier zip (don't overwrite
# the file — add the route). Same for manager_team_updated.py into manager.py.
```

## Fix the import in both pages

Both `my-workspace/page.tsx` and `manager/page.tsx` import:
```ts
import api from "@/lib/api";
```
Check your actual `frontend/lib/api.ts` export name/style and adjust if it
doesn't default-export an axios instance.

## Test locally

```bash
docker compose restart backend
cd frontend && npx next dev -p 3011
```

Visit `http://localhost:3011/my-workspace` logged in as an employee, and
`http://localhost:3011/manager` logged in as a manager. The layout/styling
should now match your provided preview exactly — data gaps are the only
remaining work, not the UI.
