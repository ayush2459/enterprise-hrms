# Enterprise HRMS Premium Local V2

Local-only upgrade of the existing Enterprise HRMS.

Important: GitHub and production are untouched.

Frontend:
```bash
cd frontend
npm install
npm run type-check
npm run build
npm run dev
```

Frontend runs on http://localhost:3007

V2 fixes the Next.js 15 build failure caused by useSearchParams() being used outside a Suspense boundary in the manager/employee workspaces and WorkspaceShell.
