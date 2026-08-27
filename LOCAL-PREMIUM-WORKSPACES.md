# Enterprise HRMS — Local Premium Workspaces

This copy is for local testing only. GitHub and production are untouched.

## Frontend
The frontend runs on port 3007:
- HR: `/dashboard`
- Manager: `/manager`
- Employee: `/my-workspace`

Login now routes users by the role returned by `/auth/me`:
- employee -> `/my-workspace`
- reporting_manager -> `/manager`
- hr_executive / hr_admin / system_admin -> `/dashboard`

The HR dashboard remains the existing full-featured HR dashboard, with its live backend data and existing modules. Its dashboard hero has been upgraded to the premium workspace visual treatment.

Manager and employee workspaces use the existing backend APIs for:
- employee/profile data
- team/org data
- leave requests and approval decisions
- attendance summaries
- payroll
- leave balances/types

They refresh every 20 seconds and immediately refresh after actions.

## Local commands

```bash
cd ~/Downloads/enterprise-hrms-premium-local/frontend
npm install
npm run type-check
npm run build
npm run dev
```

Open:
`http://localhost:3007/login`

If your backend is not already running, start it using the same backend command/configuration you currently use for this project.

Do not push this copy to GitHub until the local test is complete.
